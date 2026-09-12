import { type FormEvent, useState } from "react";
import { inputMoney, parseMoney } from "@/lib/money";
import { message, uid } from "@/lib/utils";
import { belongsTo } from "@/modules/Accounts/accountUtils";
import type { Account, AccountKind } from "@/modules/Workspace/budget.types";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

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
			const accountId = account?.id ?? uid();
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
					id: accountId,
					name: name.trim(),
					kind,
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
			notify(
				account ? "Account updated." : "Account added to your collection.",
			);
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
		opening,
		setOpening,
		note,
		setNote,
		error,
		locked,
		save,
	};
};
