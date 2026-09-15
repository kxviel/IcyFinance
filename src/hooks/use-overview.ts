import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { budgetSummary, safeToSpendSummary } from "@/lib/budget";
import { endOfMonth, today } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export const useOverview = () => {
	const { doc, month, openTransaction } = useWorkspace();
	const navigate = useNavigate();
	const summary = budgetSummary(doc, month);
	const [safeSettingsOpen, setSafeSettingsOpen] = useState(false);
	const safe = safeToSpendSummary(doc, month);
	const actualMonth = today().slice(0, 7);
	const safeMonthKind =
		month < actualMonth ? "past" : month > actualMonth ? "future" : "current";
	const daysRemaining =
		safeMonthKind === "current"
			? Number(endOfMonth(month).slice(8)) - Number(today().slice(8)) + 1
			: 0;
	const paceable = Math.max(0, safe.available);
	const perDay = daysRemaining > 0 ? Math.round(paceable / daysRemaining) : 0;
	const perWeek =
		daysRemaining > 0 ? Math.round((paceable * 7) / daysRemaining) : 0;
	const throughDate = endOfMonth(month) < today() ? endOfMonth(month) : today();
	const money = (amount: number) => formatMoney(amount, doc.currency);
	const featured = doc.categories
		.filter((category) => !category.hidden && category.target)
		.slice(0, 3);
	const recent = [...doc.transactions]
		.filter((transaction) => transaction.date.startsWith(month))
		.sort((a, b) => b.date.localeCompare(a.date))
		.slice(0, 8);
	return {
		doc,
		month,
		navigate,
		openTransaction,
		summary,
		safe,
		safeMonthKind,
		daysRemaining,
		perDay,
		perWeek,
		safeSettingsOpen,
		setSafeSettingsOpen,
		throughDate,
		money,
		featured,
		recent,
	};
};
