import { invoke, isTauri } from "@tauri-apps/api/core";
import type { BudgetDocument } from "@/modules/Workspace/budget.types";
import { validateBudget } from "@/modules/Workspace/budget.validation";

let writeQueue: Promise<void> = Promise.resolve();

function requireDesktop() {
	if (!isTauri()) {
		throw new Error(
			"SQLite storage is available through the IcyFinance desktop app. Start it with pnpm desktop.",
		);
	}
}

export async function loadBudget(): Promise<BudgetDocument | null> {
	requireDesktop();
	await writeQueue;
	const contents = await invoke<string | null>("load_budget");
	if (contents === null) return null;
	try {
		return validateBudget(JSON.parse(contents));
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(
			`The saved SQLite budget could not be opened. Its row has been left unchanged. ${detail}`,
		);
	}
}

export function saveBudget(document: BudgetDocument): Promise<void> {
	requireDesktop();
	const contents = JSON.stringify(validateBudget(document));
	const write = writeQueue.then(() =>
		invoke<void>("save_budget", { contents }),
	);
	writeQueue = write.catch(() => undefined);
	return write;
}

export async function getDatabaseStatus(): Promise<string> {
	requireDesktop();
	return invoke<string>("database_status");
}
