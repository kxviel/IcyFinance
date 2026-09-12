import { type ReactNode, useCallback, useState } from "react";
import { toast } from "sonner";
import { currentMonth } from "@/lib/dates";
import TransactionEditor from "@/modules/Transactions/TransactionEditor";
import { useBudgetStore } from "@/modules/Workspace/BudgetProvider";
import type { Transaction } from "@/modules/Workspace/budget.types";
import { WorkspaceContext } from "@/modules/Workspace/useWorkspace";
import WorkspaceStatus from "@/modules/Workspace/WorkspaceStatus";

const notify = (text: string, error = false) => {
	if (error) toast.error(text, { duration: 9000 });
	else toast.success(text);
};

const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
	const store = useBudgetStore();
	const [month, setMonth] = useState(currentMonth);
	const [editor, setEditor] = useState<Transaction | "new" | null>(null);
	const openTransaction = useCallback((transaction?: Transaction) => {
		setEditor(transaction ?? "new");
	}, []);

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
