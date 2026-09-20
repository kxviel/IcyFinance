import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import {
	applyMonthlyTemplate,
	budgetSummary,
	monthlyTemplateFromMonth,
	templatePreview,
} from "@/lib/budget";
import { message } from "@/lib/errors";
import { formatMoney, inputMoney, parseMoney } from "@/lib/money";

export const useMonthlyTemplate = (onClose: () => void) => {
	const { doc, month, update, notify } = useWorkspace();
	const [values, setValues] = useState<Record<string, string>>(() =>
		Object.fromEntries(
			doc.categories.map((category) => [
				category.id,
				Object.hasOwn(doc.monthlyTemplate, category.id)
					? inputMoney(doc.monthlyTemplate[category.id])
					: "",
			]),
		),
	);
	const [error, setError] = useState("");
	const money = (amount: number) => formatMoney(amount, doc.currency);
	const preview = templatePreview(doc, month);
	const needed = preview.reduce((total, row) => total + row.increase, 0);
	const ready = budgetSummary(doc, month).readyToAssign;
	const above = preview.filter((row) => row.assigned > row.template).length;
	const hasChanges = doc.categories.some((category) => {
		try {
			const raw = values[category.id]?.trim() ?? "";
			const saved = Object.hasOwn(doc.monthlyTemplate, category.id)
				? doc.monthlyTemplate[category.id]
				: 0;
			return (raw ? parseMoney(raw) : 0) !== saved;
		} catch {
			return true;
		}
	});
	const canApply =
		!hasChanges && preview.length > 0 && needed > 0 && needed <= ready;

	function saveTemplate() {
		try {
			const entries = doc.categories.flatMap((category) => {
				const raw = values[category.id]?.trim() ?? "";
				if (!raw) return [];
				const amount = parseMoney(raw);
				if (amount < 0) throw new Error("Template amounts cannot be negative.");
				return amount > 0 ? [[category.id, amount] as const] : [];
			});
			update((current) => ({
				...current,
				monthlyTemplate: Object.fromEntries(entries),
			}));
			setError("");
			notify("Monthly template saved.");
		} catch (cause) {
			setError(message(cause));
		}
	}

	function copyCurrentMonth() {
		try {
			const template = monthlyTemplateFromMonth(doc, month);
			setValues(
				Object.fromEntries(
					doc.categories.map((category) => [
						category.id,
						Object.hasOwn(template, category.id)
							? inputMoney(template[category.id])
							: "",
					]),
				),
			);
			setError("");
		} catch (cause) {
			setError(message(cause));
		}
	}

	function applyTemplate() {
		try {
			if (hasChanges)
				throw new Error("Save your template changes before applying.");
			update((current) => applyMonthlyTemplate(current, month));
			notify("Monthly template applied.");
			onClose();
		} catch (cause) {
			setError(message(cause));
		}
	}

	return {
		doc,
		month,
		values,
		setValues,
		error,
		money,
		preview,
		needed,
		ready,
		above,
		canApply,
		hasChanges,
		saveTemplate,
		copyCurrentMonth,
		applyTemplate,
	};
};
