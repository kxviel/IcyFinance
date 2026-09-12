import { createContext, useContext } from "react";
import type {
	BudgetDocument,
	Transaction,
} from "@/modules/Workspace/budget.types";

export interface WorkspaceContextValue {
	doc: BudgetDocument;
	month: string;
	setMonth: (month: string) => void;
	update: (mutator: (doc: BudgetDocument) => BudgetDocument) => void;
	openTransaction: (transaction?: Transaction) => void;
	notify: (text: string, error?: boolean) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(
	null,
);

export function useWorkspace() {
	const value = useContext(WorkspaceContext);
	if (!value) throw new Error("Workspace provider is missing.");
	return value;
}
