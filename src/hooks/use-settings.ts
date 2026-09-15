import {
	type ChangeEvent,
	type FormEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { useBudgetStore } from "@/components/budget-provider";
import { useWorkspace } from "@/hooks/use-workspace";
import {
	exportDocument,
	hasAmounts,
	maximumImportBytes,
	type Replacement,
} from "@/lib/backups";
import { createEmptyBudget } from "@/lib/budget-seed";
import { validateBudget } from "@/lib/budget-validation";
import { message } from "@/lib/errors";
import { getDatabaseStatus } from "@/lib/storage";

export const useSettings = () => {
	const { doc, update, notify } = useWorkspace();
	const { replace, isDirty } = useBudgetStore();
	const [name, setName] = useState(doc.name);
	const [currency, setCurrency] = useState(doc.currency);
	const [database, setDatabase] = useState({
		text: "Checking SQLite…",
		pending: true,
		failed: false,
	});
	const [databaseAttempt, setDatabaseAttempt] = useState(0);
	const [busy, setBusy] = useState("");
	const [error, setError] = useState("");
	const [status, setStatus] = useState("");
	const [replacement, setReplacement] = useState<Replacement | null>(null);
	const fileInput = useRef<HTMLInputElement>(null);
	const current = useRef(doc);
	const dirty = useRef(isDirty);
	const operation = useRef(false);
	const mounted = useRef(false);
	current.current = doc;
	dirty.current = isDirty;
	const currencyLocked = hasAmounts(doc);

	useEffect(() => {
		setName(doc.name);
		setCurrency(doc.currency);
	}, [doc.id, doc.name, doc.currency]);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		setDatabase({ text: "Checking SQLite…", pending: true, failed: false });
		void getDatabaseStatus().then(
			(text) => {
				if (!cancelled) setDatabase({ text, pending: false, failed: false });
			},
			(error: unknown) => {
				if (!cancelled)
					setDatabase({ text: message(error), pending: false, failed: true });
			},
		);
		return () => {
			cancelled = true;
		};
	}, [databaseAttempt]);

	async function run(label: string, action: () => Promise<void>) {
		if (operation.current) return;
		operation.current = true;
		setBusy(label);
		setError("");
		setStatus("");
		try {
			await action();
		} catch (error) {
			if (mounted.current) setError(message(error));
		} finally {
			operation.current = false;
			if (mounted.current) setBusy("");
		}
	}

	function saveProfile(event: FormEvent) {
		event.preventDefault();
		setError("");
		try {
			if (!name.trim()) throw new Error("Give this budget a name.");
			update((document) => {
				if (currency !== document.currency && hasAmounts(document))
					throw new Error(
						"Start an empty budget before choosing another currency. Existing amounts are never converted.",
					);
				return { ...document, name: name.trim(), currency };
			});
			notify("Budget details updated.");
		} catch (error) {
			setError(message(error));
		}
	}

	function exportLocal() {
		void run("Exporting budget…", async () => {
			await exportDocument(current.current, "backup");
			if (mounted.current)
				setStatus("JSON backup exported. Keep it somewhere private.");
		});
	}

	function importFile(event: ChangeEvent<HTMLInputElement>) {
		const file = event.currentTarget.files?.[0];
		event.currentTarget.value = "";
		if (!file) return;
		void run("Reading backup…", async () => {
			const baseline = current.current;
			if (file.size > maximumImportBytes)
				throw new Error(
					"Choose an IcyFinance JSON backup no larger than 32 MiB.",
				);
			const imported = validateBudget(JSON.parse(await file.text()) as unknown);
			if (!mounted.current) return;
			if (current.current !== baseline)
				throw new Error(
					"Your budget changed while the backup was being read. Try again.",
				);
			setReplacement({ kind: "import", document: imported, baseline });
		});
	}

	function prepareReset() {
		setError("");
		setReplacement({
			kind: "empty",
			document: createEmptyBudget(current.current.currency),
			baseline: current.current,
		});
	}

	function confirmReplacement() {
		if (!replacement) return;
		const plan = replacement;
		void run("Backing up & replacing…", async () => {
			if (dirty.current)
				throw new Error(
					"Finish saving your changes before replacing this budget.",
				);
			if (current.current !== plan.baseline)
				throw new Error("Your budget changed. Review the replacement again.");
			await exportDocument(plan.baseline, "before-replace");
			if (!mounted.current) return;
			if (current.current !== plan.baseline)
				throw new Error(
					"Your budget changed during export. Nothing was replaced.",
				);
			replace(plan.document);
			setReplacement(null);
			setStatus("Budget replaced.");
		});
	}
	return {
		doc,
		isDirty,
		name,
		setName,
		currency,
		setCurrency,
		database,
		setDatabaseAttempt,
		busy,
		error,
		status,
		replacement,
		setReplacement,
		fileInput,
		currencyLocked,
		saveProfile,
		exportLocal,
		importFile,
		prepareReset,
		confirmReplacement,
	};
};
