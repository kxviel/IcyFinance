import { type FormEvent, useState } from "react";
import { today } from "@/lib/dates";
import { inputMoney, parseMoney } from "@/lib/money";
import { message, uid } from "@/lib/utils";
import type { Transaction } from "@/modules/Workspace/budget.types";
import { upsertTransaction } from "@/modules/Workspace/budget.utils";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

export const useTransactionEditor = ({
	transaction,
	onClose,
}: {
	transaction?: Transaction;
	onClose: () => void;
}) => {
	const { doc, update, notify } = useWorkspace();
	const [kind, setKind] = useState(
		transaction?.transferAccountId
			? "transfer"
			: (transaction?.amount || -1) < 0
				? "expense"
				: "income",
	);
	const [date, setDate] = useState(transaction?.date || today());
	const [accountId, setAccountId] = useState(
		transaction?.accountId ||
			doc.accounts.find((account) => !account.closed)?.id ||
			"",
	);
	const [destination, setDestination] = useState(
		transaction?.transferAccountId || "",
	);
	const [payee, setPayee] = useState(transaction?.payee || "");
	const [amount, setAmount] = useState(
		transaction ? inputMoney(Math.abs(transaction.amount)) : "",
	);
	const [category, setCategory] = useState(transaction?.categoryId || "");
	const [memo, setMemo] = useState(transaction?.memo || "");
	const [cleared, setCleared] = useState(transaction?.cleared ?? true);
	const [split, setSplit] = useState(Boolean(transaction?.splits.length));
	const [splits, setSplits] = useState(
		transaction?.splits.map((item) => ({
			id: item.id,
			categoryId: item.categoryId || "",
			amount: inputMoney(
				item.amount * ((transaction?.amount || -1) < 0 ? -1 : 1),
			),
		})) || [
			{ id: uid(), categoryId: "", amount: "" },
			{ id: uid(), categoryId: "", amount: "" },
		],
	);
	const [transferCleared, setTransferCleared] = useState(
		transaction?.transferCleared ?? false,
	);
	const locked = Boolean(
		transaction?.reconciled || transaction?.transferReconciled,
	);
	const [error, setError] = useState("");
	const [deleting, setDeleting] = useState(false);
	const categories = doc.categories.filter(
		(item) => !item.hidden || item.id === category,
	);
	function save(event: FormEvent) {
		event.preventDefault();
		try {
			const cents = parseMoney(amount);
			if (cents <= 0) throw new Error("Enter an amount greater than zero.");
			if (!accountId)
				throw new Error("Create an account before adding a transaction.");
			const sign = kind === "income" ? 1 : -1;
			const next: Transaction = {
				id: transaction?.id || uid(),
				date,
				accountId,
				payee:
					kind === "transfer"
						? `Transfer to ${doc.accounts.find((item) => item.id === destination)?.name || "account"}`
						: payee.trim(),
				amount: cents * sign,
				categoryId: split && kind !== "transfer" ? null : category || null,
				transferAccountId: kind === "transfer" ? destination || null : null,
				memo: memo.trim(),
				cleared,
				reconciled: transaction?.reconciled || false,
				...(kind === "transfer"
					? {
							transferCleared,
							transferReconciled: transaction?.transferReconciled ?? false,
						}
					: {}),
				splits:
					split && kind !== "transfer"
						? splits.map((item) => ({
								id: item.id,
								categoryId: item.categoryId || null,
								amount: parseMoney(item.amount) * sign,
							}))
						: [],
			};
			if (kind === "transfer" && !destination)
				throw new Error("Choose a destination account.");
			update((current) => upsertTransaction(current, next));
			notify(transaction ? "Transaction updated." : "Transaction added.");
			onClose();
		} catch (error) {
			setError(message(error));
		}
	}
	return {
		doc,
		update,
		notify,
		kind,
		setKind,
		date,
		setDate,
		accountId,
		setAccountId,
		destination,
		setDestination,
		payee,
		setPayee,
		amount,
		setAmount,
		category,
		setCategory,
		memo,
		setMemo,
		cleared,
		setCleared,
		split,
		setSplit,
		splits,
		setSplits,
		transferCleared,
		setTransferCleared,
		locked,
		error,
		setError,
		deleting,
		setDeleting,
		categories,
		save,
	};
};
