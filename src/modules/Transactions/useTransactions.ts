import { useRef, useState } from "react";
import { message } from "@/lib/utils";
import type { Transaction } from "@/modules/Workspace/budget.types";
import {
	isTransactionCleared,
	isTransactionReconciled,
	upsertTransaction,
} from "@/modules/Workspace/budget.utils";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

export const useTransactions = () => {
	const { doc, month, openTransaction, update, notify } = useWorkspace();
	const [query, setQuery] = useState("");
	const [account, setAccount] = useState("all");
	const [status, setStatus] = useState("all");
	const [allDates, setAllDates] = useState(false);
	const [importing, setImporting] = useState(false);
	const [unlock, setUnlock] = useState<Transaction | null>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const side = (item: Transaction) =>
		account === "all" ? item.accountId : account;
	const rows = [...doc.transactions]
		.filter(
			(item) =>
				(allDates || item.date.startsWith(month)) &&
				(account === "all" ||
					item.accountId === account ||
					item.transferAccountId === account) &&
				(status === "all" ||
					(status === "uncleared" && !isTransactionCleared(item, side(item))) ||
					(status === "uncategorized" &&
						item.amount < 0 &&
						!item.transferAccountId &&
						((!item.categoryId && !item.splits.length) ||
							item.splits.some((split) => !split.categoryId)))) &&
				`${item.payee} ${item.memo} ${doc.categories.find((category) => category.id === item.categoryId)?.name || ""}`
					.toLowerCase()
					.includes(query.toLowerCase()),
		)
		.sort((a, b) => b.date.localeCompare(a.date));
	function toggleCleared(item: Transaction) {
		try {
			if (isTransactionReconciled(item, side(item))) {
				setUnlock(item);
				return;
			}
			update((current) =>
				upsertTransaction(current, {
					...item,
					...(side(item) === item.accountId
						? { cleared: !item.cleared }
						: { transferCleared: !isTransactionCleared(item, side(item)) }),
				}),
			);
		} catch (error) {
			notify(message(error), true);
		}
	}
	return {
		doc,
		openTransaction,
		update,
		notify,
		query,
		setQuery,
		account,
		setAccount,
		status,
		setStatus,
		allDates,
		setAllDates,
		importing,
		setImporting,
		unlock,
		setUnlock,
		searchRef,
		side,
		rows,
		toggleCleared,
	};
};
