import type { BudgetDocument } from "@/modules/Workspace/budget.types";

function BudgetDetails({ document }: { document: BudgetDocument }) {
	return (
		<div className="form-stack grid gap-5.5">
			<strong>{document.name}</strong>
			<span className="text-muted-foreground small text-[12px]">
				{document.currency} · {document.accounts.length} accounts ·{" "}
				{document.categories.length} envelopes · {document.transactions.length}{" "}
				transactions
			</span>
			<span className="text-muted-foreground small text-[12px]">
				Last edited {new Date(document.updatedAt).toLocaleString()}
			</span>
		</div>
	);
}

export default BudgetDetails;
