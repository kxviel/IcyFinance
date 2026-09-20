import { type FormEvent, useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { belongsTo } from "@/lib/accounts";
import type { Account, AccountKind, AccountPurpose } from "@/lib/budget-types";
import { message } from "@/lib/errors";
import { inputMoney, parseMoney } from "@/lib/money";

export const useAccountEditor = ({
	account,
	onClose,
}: {
	account?: Account;
	onClose: () => void;
}) => {
	const { doc, update, notify } = useWorkspace();
	const [name, setName] = useState(account?.name ?? "");
	const [kind, setKind] = useState<AccountKind>(account?.kind ?? "checking");
	const [purpose, setPurpose] = useState<AccountPurpose | "">(
		account?.purpose ?? "",
	);
	const [opening, setOpening] = useState(
		inputMoney(account?.openingBalance ?? 0),
	);
	const [note, setNote] = useState(account?.note ?? "");
	const [error, setError] = useState("");
	const locked = Boolean(
		account &&
			(account.closed ||
				doc.transactions.some((tx) => belongsTo(account.id, tx))),
	);
	function save(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try {
			if (!name.trim()) throw new Error("Give this account a name.");
			const openingBalance = parseMoney(opening);
			const accountId = account?.id ?? crypto.randomUUID();
			update((current) => {
				const previous = current.accounts.find((item) => item.id === accountId);
				if (account && !previous)
					throw new Error(
						"This account no longer exists. Close this form and try again.",
					);
				if (
					previous?.closed &&
					(kind !== previous.kind || openingBalance !== previous.openingBalance)
				)
					throw new Error(
						"Reopen this account before changing its kind or opening balance.",
					);
				if (
					previous &&
					current.transactions.some((tx) => belongsTo(accountId, tx)) &&
					(kind !== previous.kind || openingBalance !== previous.openingBalance)
				)
					throw new Error(
						"This account has transactions. Use reconciliation to correct its balance; its opening balance and kind are locked.",
					);
				const next: Account = {
					...previous,
					id: accountId,
					name: name.trim(),
					kind,
					purpose: purpose || undefined,
					openingBalance,
					note: note.trim(),
					closed: previous?.closed ?? false,
				};
				return {
					...current,
					accounts: previous
						? current.accounts.map((item) =>
								item.id === accountId ? next : item,
							)
						: [...current.accounts, next],
				};
			});
			notify(account ? "Account updated." : "Account added.");
			onClose();
		} catch (error) {
			setError(message(error));
		}
	}
	return {
		doc,
		name,
		setName,
		kind,
		setKind,
		purpose,
		setPurpose,
		opening,
		setOpening,
		note,
		setNote,
		error,
		locked,
		save,
	};
};
