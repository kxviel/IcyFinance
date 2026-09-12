import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { createDemoBudget } from "@/lib/budget-seed";
import type { BudgetDocument } from "@/lib/budget-types";
import { validateBudget } from "@/lib/budget-validation";
import { loadBudget, saveBudget } from "@/lib/storage";

export type SaveStatus = "loading" | "saving" | "saved" | "error";

interface BudgetView {
	document: BudgetDocument | null;
	ready: boolean;
	error: string | null;
	saveStatus: SaveStatus;
	isDirty: boolean;
	canUndo: boolean;
}

interface BudgetStore extends BudgetView {
	update: (mutator: (document: BudgetDocument) => BudgetDocument) => void;
	replace: (document: BudgetDocument) => void;
	undo: () => void;
	retrySave: () => Promise<void>;
	retryLoad: () => void;
}

interface PendingWrite {
	document: BudgetDocument;
	generation: number;
}

const BudgetContext = createContext<BudgetStore | null>(null);
const HISTORY_LIMIT = 50;

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export function BudgetProvider({ children }: { children: ReactNode }) {
	const [view, setView] = useState<BudgetView>({
		document: null,
		ready: false,
		error: null,
		saveStatus: "loading",
		isDirty: false,
		canUndo: false,
	});
	const [loadAttempt, setLoadAttempt] = useState(0);
	const mounted = useRef(false);
	const loaded = useRef(false);
	const current = useRef<BudgetDocument | null>(null);
	const history = useRef<BudgetDocument[]>([]);
	const generation = useRef(0);
	const pending = useRef<PendingWrite | null>(null);
	const writer = useRef<{ generation: number; promise: Promise<void> } | null>(
		null,
	);

	const flush = useCallback((): Promise<void> => {
		const job = pending.current;
		if (!job) return Promise.resolve();
		if (writer.current?.generation === job.generation)
			return writer.current.promise;
		if (mounted.current)
			setView((previous) => ({ ...previous, saveStatus: "saving" }));
		// Register each committed snapshot with the shared save queue immediately.
		// This also makes a provider remount wait for all outstanding writes.
		const operation = (async () => {
			try {
				await saveBudget(job.document);
				if (generation.current === job.generation) {
					pending.current = null;
					if (mounted.current) {
						setView((previous) => ({
							...previous,
							saveStatus: "saved",
							error: null,
							isDirty: false,
						}));
					}
				}
			} catch (error) {
				// A newer queued edit takes precedence over a failed older write.
				if (mounted.current && generation.current === job.generation) {
					setView((previous) => ({
						...previous,
						saveStatus: "error",
						error: `Changes are still in memory. ${errorMessage(error)}`,
						isDirty: true,
					}));
				}
			}
		})();
		writer.current = { generation: job.generation, promise: operation };
		void operation.finally(() => {
			if (writer.current?.promise === operation) writer.current = null;
		});
		return operation;
	}, []);

	// Retry requests deliberately trigger a fresh database read.
	useEffect(() => {
		mounted.current = true;
		let cancelled = false;
		loaded.current = false;
		setView((previous) => ({
			...previous,
			ready: false,
			error: null,
			saveStatus: "loading",
		}));

		void loadBudget()
			.then((saved) => {
				if (cancelled) return;
				const document = saved ?? validateBudget(createDemoBudget());
				current.current = document;
				loaded.current = true;
				history.current = [];
				setView({
					document,
					ready: true,
					error: null,
					saveStatus: saved ? "saved" : "saving",
					isDirty: !saved,
					canUndo: false,
				});
				if (!saved) {
					generation.current += 1;
					pending.current = { document, generation: generation.current };
					void flush();
				}
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				setView({
					document: null,
					ready: true,
					error: errorMessage(error),
					saveStatus: "error",
					isDirty: false,
					canUndo: false,
				});
			});

		return () => {
			cancelled = true;
			mounted.current = false;
		};
	}, [flush, loadAttempt]);

	useEffect(() => {
		if (!view.isDirty) return;
		const beforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", beforeUnload);
		return () => window.removeEventListener("beforeunload", beforeUnload);
	}, [view.isDirty]);

	useEffect(() => {
		if (!isTauri()) return;
		let disposed = false;
		// Tauri window close events do not rely on the webview's beforeunload.
		// Wait for the latest save, keeping the window open if saving fails.
		const listener = getCurrentWindow().onCloseRequested(async (event) => {
			if (!disposed && pending.current) await flush();
			if (disposed || pending.current) event.preventDefault();
		});
		void listener.catch((error: unknown) => {
			console.error(
				"Could not register the desktop save-on-close handler:",
				error,
			);
		});
		return () => {
			disposed = true;
			void listener.then(
				(unlisten) => unlisten(),
				() => undefined,
			);
		};
	}, [flush]);

	const commit = useCallback(
		(next: BudgetDocument, remember: boolean) => {
			if (!loaded.current)
				throw new Error("Wait for the saved budget to finish loading.");
			const previous = current.current;
			const timestamp = Math.max(
				Date.now(),
				previous ? Date.parse(previous.updatedAt) + 1 : 0,
			);
			const document = validateBudget({
				...structuredClone(next),
				updatedAt: new Date(timestamp).toISOString(),
			});
			if (remember && previous) {
				history.current = [
					...history.current.slice(-(HISTORY_LIMIT - 1)),
					previous,
				];
			}
			current.current = document;
			generation.current += 1;
			pending.current = { document, generation: generation.current };
			setView({
				document,
				ready: true,
				error: null,
				saveStatus: "saving",
				isDirty: true,
				canUndo: history.current.length > 0,
			});
			void flush();
		},
		[flush],
	);

	const update = useCallback(
		(mutator: (document: BudgetDocument) => BudgetDocument) => {
			if (!current.current) throw new Error("Open a budget first.");
			commit(mutator(structuredClone(current.current)), true);
		},
		[commit],
	);

	const replace = useCallback(
		(document: BudgetDocument) => commit(document, true),
		[commit],
	);
	const undo = useCallback(() => {
		const previous = history.current.pop();
		if (previous) commit(previous, false);
	}, [commit]);
	const retryLoad = useCallback(() => {
		if (current.current)
			throw new Error("A budget is already open; retry saving it instead.");
		setLoadAttempt((attempt) => attempt + 1);
	}, []);

	return (
		<BudgetContext.Provider
			value={{ ...view, update, replace, undo, retrySave: flush, retryLoad }}
		>
			{children}
		</BudgetContext.Provider>
	);
}

export function useBudgetStore(): BudgetStore {
	const context = useContext(BudgetContext);
	if (!context)
		throw new Error("useBudgetStore must be used inside BudgetProvider.");
	return context;
}
