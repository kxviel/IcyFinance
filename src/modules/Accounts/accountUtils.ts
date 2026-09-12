import { today } from "@/lib/dates";
import { assertCents } from "@/lib/money";
import type {
	AccountKind,
	BudgetDocument,
	ScheduledTransaction,
} from "@/modules/Workspace/budget.types";
import {
	isTransactionCleared,
	isTransactionReconciled,
} from "@/modules/Workspace/budget.utils";

export const accountKinds: Record<AccountKind, string> = {
	checking: "Checking",
	savings: "Savings",
	cash: "Cash",
	tracking: "Tracking",
};

export const repeats: Record<ScheduledTransaction["repeat"], string> = {
	once: "Once",
	weekly: "Every week",
	monthly: "Every month",
	yearly: "Every year",
};

export const belongsTo = (
	accountId: string,
	tx: BudgetDocument["transactions"][number],
) => tx.accountId === accountId || tx.transferAccountId === accountId;

export function clearedState(doc: BudgetDocument, accountId: string) {
	const account = doc.accounts.find((item) => item.id === accountId);
	if (!account) throw new Error("This account no longer exists.");
	const eligible = doc.transactions.filter(
		(tx) =>
			belongsTo(accountId, tx) &&
			isTransactionCleared(tx, accountId) &&
			tx.date <= today(),
	);
	const balance = assertCents(
		eligible.reduce(
			(total, tx) =>
				total + (tx.accountId === accountId ? tx.amount : -tx.amount),
			account.openingBalance,
		),
	);
	return {
		balance,
		eligible,
		fingerprint: JSON.stringify([
			balance,
			eligible.map((tx) => [
				tx.id,
				tx.amount,
				tx.date,
				isTransactionReconciled(tx, accountId),
			]),
		]),
	};
}
