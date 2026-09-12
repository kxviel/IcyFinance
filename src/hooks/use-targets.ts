import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { targetProgress } from "@/lib/budget";
import type { Category } from "@/lib/budget-types";

export const useTargets = () => {
	const { doc, month } = useWorkspace();
	const navigate = useNavigate();
	const [editor, setEditor] = useState<Category | "new" | null>(null);
	const [filter, setFilter] = useState("all");
	const targets = doc.categories.filter((item) => item.target && !item.hidden);
	const total = targets.reduce(
		(sum, item) => sum + targetProgress(doc, item.id, month).needed,
		0,
	);
	const complete = targets.filter(
		(item) => targetProgress(doc, item.id, month).percentage >= 100,
	).length;
	const visible = targets.filter(
		(item) => filter === "all" || item.target?.cadence === filter,
	);
	return {
		doc,
		month,
		navigate,
		editor,
		setEditor,
		filter,
		setFilter,
		targets,
		total,
		complete,
		visible,
	};
};
