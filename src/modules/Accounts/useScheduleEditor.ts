import { type FormEvent, useState } from "react";
import { addFrequency, today, validDate } from "@/lib/dates";
import { inputMoney, parseMoney } from "@/lib/money";
import { message, uid } from "@/lib/utils";
import type { ScheduledTransaction } from "@/modules/Workspace/budget.types";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

export const useScheduleEditor = ({
	schedule,
	onClose,
}: {
	schedule?: ScheduledTransaction;
	onClose: () => void;
}) => {
	const { doc, update, notify } = useWorkspace();
	const [accountId, setAccountId] = useState(
		schedule?.accountId ?? doc.accounts.find((item) => !item.closed)?.id ?? "",
	);
	const [payee, setPayee] = useState(schedule?.payee ?? "");
	const [memo, setMemo] = useState(schedule?.memo ?? "");
	const [amount, setAmount] = useState(
		inputMoney(Math.abs(schedule?.amount ?? 0)),
	);
	const [direction, setDirection] = useState<"expense" | "income">(
		(schedule?.amount ?? -1) < 0 ? "expense" : "income",
	);
	const [categoryId, setCategoryId] = useState(schedule?.categoryId ?? "");
	const [nextDate, setNextDate] = useState(schedule?.nextDate ?? today());
	const [repeat, setRepeat] = useState<ScheduledTransaction["repeat"]>(
		schedule?.repeat ?? "monthly",
	);
	const [paused, setPaused] = useState(schedule?.paused ?? false);
	const [error, setError] = useState("");
	const account = doc.accounts.find((item) => item.id === accountId);
	const anchorDay =
		nextDate === schedule?.nextDate
			? (schedule.anchorDay ?? Number(nextDate.slice(8)))
			: Number(nextDate.slice(8));
	const dates: string[] = [];
	try {
		if (validDate(nextDate)) {
			dates.push(nextDate);
			if (repeat !== "once")
				for (let index = 0; index < 2; index += 1)
					dates.push(addFrequency(dates[dates.length - 1], repeat, anchorDay));
		}
	} catch {
		/* Dates at the supported boundary still allow a single occurrence. */
	}
	function save(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try {
			if (!payee.trim())
				throw new Error("Add a payee for this scheduled entry.");
			const parsedAmount = parseMoney(amount);
			if (parsedAmount <= 0)
				throw new Error(
					"Enter a positive amount and choose expense or income.",
				);
			if (!validDate(nextDate)) throw new Error("Choose a valid next date.");
			if (repeat !== "once") addFrequency(nextDate, repeat, anchorDay);
			const scheduleId = schedule?.id ?? uid();
			update((current) => {
				const latestAccount = current.accounts.find(
					(item) => item.id === accountId,
				);
				if (!latestAccount)
					throw new Error("Choose an account for this scheduled entry.");
				if (latestAccount.closed && !paused)
					throw new Error("Reopen this account or keep the schedule paused.");
				if (
					schedule &&
					!current.schedules.some((item) => item.id === scheduleId)
				)
					throw new Error("This schedule no longer exists.");
				const next: ScheduledTransaction = {
					id: scheduleId,
					accountId,
					payee: payee.trim(),
					memo: memo.trim(),
					amount: direction === "expense" ? -parsedAmount : parsedAmount,
					categoryId:
						latestAccount.kind === "tracking" ? null : categoryId || null,
					nextDate,
					repeat,
					paused,
					anchorDay,
				};
				return {
					...current,
					schedules: schedule
						? current.schedules.map((item) =>
								item.id === scheduleId ? next : item,
							)
						: [...current.schedules, next],
				};
			});
			notify(schedule ? "Schedule updated." : "Scheduled entry added.");
			onClose();
		} catch (error) {
			setError(message(error));
		}
	}
	return {
		doc,
		accountId,
		setAccountId,
		payee,
		setPayee,
		memo,
		setMemo,
		amount,
		setAmount,
		direction,
		setDirection,
		categoryId,
		setCategoryId,
		nextDate,
		setNextDate,
		repeat,
		setRepeat,
		paused,
		setPaused,
		error,
		account,
		dates,
		save,
	};
};
