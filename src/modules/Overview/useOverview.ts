import { useNavigate } from "@tanstack/react-router";
import { endOfMonth, today } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { budgetSummary } from "@/modules/Workspace/budget.utils";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

export const useOverview = () => {
	const { doc, month, openTransaction } = useWorkspace();
	const navigate = useNavigate();
	const summary = budgetSummary(doc, month);
	const throughDate = endOfMonth(month) < today() ? endOfMonth(month) : today();
	const money = (amount: number) => formatMoney(amount, doc.currency);
	const featured = doc.categories
		.filter((category) => !category.hidden && category.target)
		.slice(0, 3);
	const recent = [...doc.transactions]
		.filter((transaction) => transaction.date.startsWith(month))
		.sort((a, b) => b.date.localeCompare(a.date))
		.slice(0, 5);
	return {
		doc,
		month,
		navigate,
		openTransaction,
		summary,
		throughDate,
		money,
		featured,
		recent,
	};
};
