import type { BudgetDocument } from "@/lib/budget-types";
import { validateBudget } from "@/lib/budget-validation";
import { downloadFile } from "@/lib/download";

export const currencies = [
	"EUR",
	"USD",
	"GBP",
	"CHF",
	"CAD",
	"AUD",
	"NZD",
	"SEK",
	"NOK",
	"DKK",
	"PLN",
	"CZK",
	"INR",
	"BRL",
	"SGD",
	"HKD",
	"ZAR",
];

export const maximumImportBytes = 32 * 1024 * 1024;

export interface Replacement {
	kind: "import" | "empty" | "sample";
	document: BudgetDocument;
	baseline: BudgetDocument;
}

export function hasAmounts(document: BudgetDocument) {
	return (
		document.accounts.some((account) => account.openingBalance !== 0) ||
		document.transactions.length > 0 ||
		document.allocations.some((allocation) => allocation.amount !== 0) ||
		document.schedules.some((schedule) => schedule.amount !== 0) ||
		document.categories.some((category) => (category.target?.amount ?? 0) !== 0)
	);
}

export function backupName(kind: string) {
	return `IcyFinance-${kind}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
}

export async function exportDocument(document: BudgetDocument, kind: string) {
	const saved = await downloadFile(
		backupName(kind),
		JSON.stringify(validateBudget(document), null, 2),
	);
	if (!saved)
		throw new Error(
			"The export was cancelled. Your budget has not been replaced.",
		);
}
