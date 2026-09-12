import { useState } from "react";
import { formatMoney } from "@/lib/money";
import type { Category } from "@/modules/Workspace/budget.types";
import {
	budgetSummary,
	categorySummary,
} from "@/modules/Workspace/budget.utils";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

export const useBudget = () => {
	const { doc, month, update, notify } = useWorkspace();
	const [filter, setFilter] = useState("all");
	const [editor, setEditor] = useState<Category | "new" | null>(null);
	const [moving, setMoving] = useState(false);
	const [collapsed, setCollapsed] = useState<string[]>([]);
	const summary = budgetSummary(doc, month);
	const money = (amount: number) => formatMoney(amount, doc.currency);
	const visible = doc.categories.filter((item) => {
		if (item.hidden) return false;
		const values = categorySummary(doc, item.id, month);
		return (
			filter === "all" ||
			(filter === "needs" && values.needed > 0) ||
			(filter === "overspent" && values.available < 0)
		);
	});
	const groups = [...new Set(visible.map((item) => item.group))];
	return {
		doc,
		month,
		update,
		notify,
		filter,
		setFilter,
		editor,
		setEditor,
		moving,
		setMoving,
		collapsed,
		setCollapsed,
		summary,
		money,
		visible,
		groups,
	};
};
