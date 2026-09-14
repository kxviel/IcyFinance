import { useWorkspace } from "@/hooks/use-workspace";
import { monthReport } from "@/lib/budget";
import { formatMoney } from "@/lib/money";

export const useReports = () => {
	const { doc, month, notify } = useWorkspace();
	const report = monthReport(doc, month);
	const money = (amount: number) => formatMoney(amount, doc.currency);
	const spending = report.categories.filter((item) => item.spent > 0);
	const categoryTotal = spending.reduce((sum, item) => sum + item.spent, 0);
	const savingsRate =
		report.income > 0 ? Math.round((report.net / report.income) * 100) : null;
	return {
		doc,
		month,
		notify,
		report,
		money,
		spending,
		categoryTotal,
		savingsRate,
	};
};
