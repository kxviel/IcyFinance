import { type FormEvent, useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { deleteCategory } from "@/lib/budget";
import type { Category } from "@/lib/budget-types";
import { message } from "@/lib/errors";
import { inputMoney, parseMoney } from "@/lib/money";

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
	const [confirmDelete, setConfirmDelete] = useState(false);
	function remove() {
		if (!category) return;
		try {
			update((current) => deleteCategory(current, category.id));
			notify("Category deleted.");
			onClose();
		} catch (cause) {
			setError(message(cause));
			setConfirmDelete(false);
		}
	}
	function save(event: FormEvent) {
		event.preventDefault();
		try {
			if (!name.trim() || !group.trim())
				throw new Error("Give the category a name and group.");
			const amount = target.trim() ? parseMoney(target) : null;
			if (amount !== null && amount <= 0)
				throw new Error("A target must be greater than zero.");
			const next: Category = {
				...category,
				id: category?.id || crypto.randomUUID(),
				name: name.trim(),
				group: group.trim(),
				note,
				hidden: category?.hidden || false,
				target:
					amount === null
						? null
						: {
								...category?.target,
								amount,
								cadence,
								dueDate: dueDate && cadence === "balance" ? dueDate : undefined,
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
			notify(category ? "Category updated." : "Category added.");
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
		confirmDelete,
		setConfirmDelete,
		remove,
		save,
	};
};
