import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/components/icon-button";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useWorkspace } from "@/hooks/use-workspace";
import { monthLabel, shiftMonth } from "@/lib/dates";

const MIN_MONTH = new Date(1900, 5, 1);
const MAX_MONTH = new Date(9999, 11, 1);

const dateFromMonth = (month: string) => {
	const [year, index] = month.split("-").map(Number);
	return new Date(year, index - 1, 1);
};

const monthFromDate = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export function MonthPicker() {
	const { month, setMonth } = useWorkspace();
	const [open, setOpen] = useState(false);
	const [calendarMonth, setCalendarMonth] = useState(() =>
		dateFromMonth(month),
	);
	const label = monthLabel(month);
	const selectedMonth = dateFromMonth(month);

	return (
		<div className="month-picker inline-flex shrink-0 items-center gap-2">
			<IconButton
				label="Previous month"
				disabled={month <= "1900-06"}
				onClick={() => setMonth(shiftMonth(month, -1))}
			>
				<ArrowLeft />
			</IconButton>
			<Popover
				open={open}
				onOpenChange={(nextOpen) => {
					setOpen(nextOpen);
					if (nextOpen) setCalendarMonth(selectedMonth);
				}}
			>
				<PopoverTrigger
					render={
						<Button
							variant="ghost"
							className="min-w-34 px-3 text-sm font-medium tracking-normal normal-case"
						/>
					}
					aria-label={`Choose budget month, currently ${label}`}
				>
					{label}
				</PopoverTrigger>
				<PopoverContent className="w-auto gap-0 p-0" align="center">
					<Calendar
						mode="single"
						required
						selected={selectedMonth}
						month={calendarMonth}
						onMonthChange={setCalendarMonth}
						onSelect={(date) => {
							setMonth(monthFromDate(date));
							setOpen(false);
						}}
						startMonth={MIN_MONTH}
						endMonth={MAX_MONTH}
						showOutsideDays={false}
					/>
				</PopoverContent>
			</Popover>
			<IconButton
				label="Next month"
				disabled={month === "9999-12"}
				onClick={() => setMonth(shiftMonth(month, 1))}
			>
				<ArrowRight />
			</IconButton>
		</div>
	);
}
