import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { monthReport } from "@/modules/Workspace/budget.utils";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

export const useReports = () => {
	const { doc, month, notify } = useWorkspace();
	const [view, setView] = useState<"flow" | "worth">("flow");
	const report = monthReport(doc, month);
	const money = (amount: number) => formatMoney(amount, doc.currency);
	const largest = Math.max(
		1,
		...report.history.flatMap((item) => [item.income, Math.abs(item.expenses)]),
	);
	const worthMin = Math.min(0, ...report.history.map((item) => item.netWorth));
	const worthMax = Math.max(1, ...report.history.map((item) => item.netWorth));
	const points = report.history
		.map(
			(item, index) =>
				`${40 + index * 132},${240 - ((item.netWorth - worthMin) / (worthMax - worthMin)) * 190}`,
		)
		.join(" ");
	const spending = report.categories.filter((item) => item.spent > 0);
	const categoryTotal = spending.reduce((sum, item) => sum + item.spent, 0);
	const savingsRate =
		report.income > 0
			? Math.round(((report.income - report.expenses) / report.income) * 100)
			: null;
	return {
		doc,
		month,
		notify,
		view,
		setView,
		report,
		money,
		largest,
		worthMin,
		worthMax,
		points,
		spending,
		categoryTotal,
		savingsRate,
	};
};
