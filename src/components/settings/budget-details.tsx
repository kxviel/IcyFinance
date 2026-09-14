import type { BudgetDocument } from "@/lib/budget-types";

function BudgetDetails({ document }: { document: BudgetDocument }) {
	return (
		<div className="form-stack grid gap-4">
			<strong>{document.name}</strong>
			<span className="text-muted-foreground small text-sm">
				{document.currency} · {document.accounts.length} accounts ·{" "}
				{document.categories.length} envelopes · {document.transactions.length}{" "}
				transactions
			</span>
			<span className="text-muted-foreground small text-sm">
				Last edited {new Date(document.updatedAt).toLocaleString()}
			</span>
		</div>
	);
}

export default BudgetDetails;
