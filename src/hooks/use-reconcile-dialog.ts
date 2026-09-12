import { type FormEvent, useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { clearedState } from "@/lib/accounts";
import { isTransactionReconciled, reconcileAccount } from "@/lib/budget";
import { message } from "@/lib/errors";
import { assertCents, formatMoney, inputMoney, parseMoney } from "@/lib/money";

export const useReconcileDialog = ({
	accountId,
	onClose,
}: {
	accountId: string;
	onClose: () => void;
}) => {
	const { doc, update, notify } = useWorkspace();
	const account = doc.accounts.find((item) => item.id === accountId);
	const cleared = clearedState(doc, accountId);
	const [statement, setStatement] = useState(inputMoney(cleared.balance));
	const [consent, setConsent] = useState("");
	const [error, setError] = useState("");
	if (!account) throw new Error("This account no longer exists.");
	let statementBalance: number | null = null;
	let difference: number | null = null;
	try {
		const parsed = parseMoney(statement);
		const adjustment = assertCents(parsed - cleared.balance);
		statementBalance = parsed;
		difference = adjustment;
	} catch {
		/* Keep incomplete or out-of-range input editable. */
	}
	const fingerprint = `${statementBalance}:${cleared.fingerprint}`;
	const pending = cleared.eligible.filter(
		(tx) => !isTransactionReconciled(tx, accountId),
	);
	const money = (amount: number) => formatMoney(amount, doc.currency);
	function save(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try {
			const balance = parseMoney(statement);
			if (difference !== 0 && consent !== fingerprint)
				throw new Error(
					"Confirm the adjustment before reconciling this account.",
				);
			update((current) => {
				const latest = current.accounts.find((item) => item.id === accountId);
				if (!latest || latest.closed)
					throw new Error("Reopen this account before reconciling it.");
				if (
					clearedState(current, accountId).fingerprint !== cleared.fingerprint
				)
					throw new Error(
						"Account entries changed. Review the updated calculation and try again.",
					);
				return reconcileAccount(current, accountId, balance);
			});
			notify(
				difference === 0
					? "Account reconciled. Everything lines up."
					: "Account reconciled with an adjustment.",
			);
			onClose();
		} catch (error) {
			setError(message(error));
		}
	}
	return {
		doc,
		account,
		cleared,
		statement,
		setStatement,
		consent,
		setConsent,
		error,
		statementBalance,
		difference,
		fingerprint,
		pending,
		money,
		save,
	};
};
