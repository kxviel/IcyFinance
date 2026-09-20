import { type ReactNode, useCallback, useState } from "react";
import { toast } from "sonner";
import { useBudgetStore } from "@/components/budget-provider";
import TransactionEditor from "@/components/transactions/transaction-editor";
import WorkspaceStatus from "@/components/workspace-status";
import { WorkspaceContext } from "@/hooks/use-workspace";
import type { Transaction } from "@/lib/budget-types";
import { currentMonth } from "@/lib/dates";

const notify = (text: string, error = false) => {
	if (error) toast.error(text, { duration: 9000 });
	else toast.success(text);
};

const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
	const store = useBudgetStore();
	const [month, setMonth] = useState(currentMonth);
	const [editor, setEditor] = useState<Transaction | "new" | null>(null);
	const openTransaction = useCallback(
		(transaction?: Transaction) => {
			if (
				!transaction &&
				!store.document?.accounts.some((account) => !account.closed)
			) {
				toast.error("Create or reopen an account before adding a transaction.");
				return;
			}
			setEditor(transaction ?? "new");
		},
		[store.document],
	);

	if (!store.ready || !store.document) return <WorkspaceStatus />;

	return (
		<WorkspaceContext.Provider
			value={{
				doc: store.document,
				month,
				setMonth,
				update: store.update,
				openTransaction,
				notify,
			}}
		>
			{children}
			{editor && (
				<TransactionEditor
					transaction={editor === "new" ? undefined : editor}
					onClose={() => setEditor(null)}
				/>
			)}
		</WorkspaceContext.Provider>
	);
};

export default WorkspaceProvider;
