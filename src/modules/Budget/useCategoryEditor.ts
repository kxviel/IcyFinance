import { type FormEvent, useState } from "react";
import { inputMoney, parseMoney } from "@/lib/money";
import { message, uid } from "@/lib/utils";
import type { Category } from "@/modules/Workspace/budget.types";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

export const useCategoryEditor = ({
	category,
	onClose,
}: {
	category?: Category;
	onClose: () => void;
}) => {
	const { doc, update, notify } = useWorkspace();
	const [name, setName] = useState(category?.name || "");
	const [group, setGroup] = useState(category?.group || "Everyday living");
	const [note, setNote] = useState(category?.note || "");
	const [target, setTarget] = useState(
		category?.target ? inputMoney(category.target.amount) : "",
	);
	const [cadence, setCadence] = useState<"monthly" | "balance">(
		category?.target?.cadence || "monthly",
	);
	const [dueDate, setDueDate] = useState(category?.target?.dueDate || "");
	const [error, setError] = useState("");
	function save(event: FormEvent) {
		event.preventDefault();
		try {
			if (!name.trim() || !group.trim())
				throw new Error("Give the category a name and group.");
			const amount = target.trim() ? parseMoney(target) : null;
			if (amount !== null && amount <= 0)
				throw new Error("A target must be greater than zero.");
			const next: Category = {
				id: category?.id || uid(),
				name: name.trim(),
				group: group.trim(),
				note,
				hidden: category?.hidden || false,
				target:
					amount === null
						? null
						: {
								amount,
								cadence,
								...(dueDate && cadence === "balance" ? { dueDate } : {}),
							},
			};
			update((current) => ({
				...current,
				categories: category
					? current.categories.map((item) =>
							item.id === category.id ? next : item,
						)
					: [...current.categories, next],
			}));
			notify(category ? "Category updated." : "A new possibility added.");
			onClose();
		} catch (error) {
			setError(message(error));
		}
	}
	return {
		doc,
		name,
		setName,
		group,
		setGroup,
		note,
		setNote,
		target,
		setTarget,
		cadence,
		setCadence,
		dueDate,
		setDueDate,
		error,
		save,
	};
};
