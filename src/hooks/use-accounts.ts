import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { belongsTo } from "@/lib/accounts";
import { accountBalance, postScheduled } from "@/lib/budget";
import type { Account, ScheduledTransaction } from "@/lib/budget-types";
import { today } from "@/lib/dates";
import { message } from "@/lib/errors";
import { formatMoney } from "@/lib/money";

export const useAccounts = () => {
	const { doc, update, notify, openTransaction } = useWorkspace();
	const navigate = useNavigate();
	const [accountEditor, setAccountEditor] = useState<Account | "new" | null>(
		null,
	);
	const [scheduleEditor, setScheduleEditor] = useState<
		ScheduledTransaction | "new" | null
	>(null);
	const [reconciling, setReconciling] = useState<string | null>(null);
	const [closing, setClosing] = useState<string | null>(null);
	const [deletingSchedule, setDeletingSchedule] = useState<string | null>(null);
	const [showClosed, setShowClosed] = useState(false);
	const [scheduleFilter, setScheduleFilter] = useState<
		"active" | "due" | "paused" | "all"
	>("active");
	const [dialogError, setDialogError] = useState("");
	const activeAccounts = doc.accounts.filter((item) => !item.closed);
	const visibleAccounts = doc.accounts.filter(
		(item) => showClosed || !item.closed,
	);
	const closedCount = doc.accounts.length - activeAccounts.length;
	const money = (amount: number) => formatMoney(amount, doc.currency);
	const budgetCash = doc.accounts
		.filter((item) => item.kind !== "tracking")
		.reduce((total, item) => total + accountBalance(doc, item.id), 0);
	const trackingCash = doc.accounts
		.filter((item) => item.kind === "tracking")
		.reduce((total, item) => total + accountBalance(doc, item.id), 0);
	const dueCount = doc.schedules.filter(
		(item) => !item.paused && item.nextDate <= today(),
	).length;
	const schedules = [...doc.schedules]
		.filter(
			(item) =>
				scheduleFilter === "all" ||
				(scheduleFilter === "active" && !item.paused) ||
				(scheduleFilter === "paused" && item.paused) ||
				(scheduleFilter === "due" && !item.paused && item.nextDate <= today()),
		)
		.sort(
			(a, b) =>
				a.nextDate.localeCompare(b.nextDate) || a.payee.localeCompare(b.payee),
		);
	const closeAccount = doc.accounts.find((item) => item.id === closing);
	const closeBalance = closeAccount ? accountBalance(doc, closeAccount.id) : 0;
	const closeSchedules = closeAccount
		? doc.schedules.filter(
				(item) => item.accountId === closeAccount.id && !item.paused,
			).length
		: 0;
	const closeFutureEntries = closeAccount
		? doc.transactions.filter(
				(tx) => belongsTo(closeAccount.id, tx) && tx.date > today(),
			).length
		: 0;
	const deleteSchedule = doc.schedules.find(
		(item) => item.id === deletingSchedule,
	);
	function setClosed(id: string, closed: boolean) {
		try {
			update((current) => {
				if (!current.accounts.some((item) => item.id === id))
					throw new Error("This account no longer exists.");
				if (closed && accountBalance(current, id) !== 0)
					throw new Error(
						"Bring the account balance to zero before closing it.",
					);
				if (
					closed &&
					current.schedules.some(
						(item) => item.accountId === id && !item.paused,
					)
				)
					throw new Error(
						"Pause or remove this account's active schedules before closing it.",
					);
				if (
					closed &&
					current.transactions.some(
						(tx) => belongsTo(id, tx) && tx.date > today(),
					)
				)
					throw new Error(
						"Resolve future-dated entries before closing this account.",
					);
				return {
					...current,
					accounts: current.accounts.map((item) =>
						item.id === id ? { ...item, closed } : item,
					),
				};
			});
			setClosing(null);
			notify(
				closed
					? "Account closed. Its history stays in your budget."
					: "Account reopened. Its schedules remain paused.",
			);
		} catch (error) {
			if (closed) setDialogError(message(error));
			else notify(message(error), true);
		}
	}
	function toggleSchedule(id: string) {
		try {
			update((current) => {
				const schedule = current.schedules.find((item) => item.id === id);
				if (!schedule) throw new Error("This schedule no longer exists.");
				if (
					schedule.paused &&
					current.accounts.find((item) => item.id === schedule.accountId)
						?.closed
				)
					throw new Error("Reopen this schedule's account before resuming it.");
				return {
					...current,
					schedules: current.schedules.map((item) =>
						item.id === id ? { ...item, paused: !item.paused } : item,
					),
				};
			});
		} catch (error) {
			notify(message(error), true);
		}
	}
	function post(id: string) {
		try {
			update((current) => postScheduled(current, id));
			notify("One occurrence posted as uncleared. Review it in Transactions.");
		} catch (error) {
			notify(message(error), true);
		}
	}
	return {
		doc,
		update,
		notify,
		navigate,
		openTransaction,
		accountEditor,
		setAccountEditor,
		scheduleEditor,
		setScheduleEditor,
		reconciling,
		setReconciling,
		setClosing,
		setDeletingSchedule,
		showClosed,
		setShowClosed,
		scheduleFilter,
		setScheduleFilter,
		dialogError,
		setDialogError,
		activeAccounts,
		visibleAccounts,
		closedCount,
		money,
		budgetCash,
		trackingCash,
		dueCount,
		schedules,
		closeAccount,
		closeBalance,
		closeSchedules,
		closeFutureEntries,
		deleteSchedule,
		setClosed,
		toggleSchedule,
		post,
	};
};
