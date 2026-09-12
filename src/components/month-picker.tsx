import { ArrowLeft, ArrowRight } from "lucide-react";
import { useId } from "react";
import { IconButton } from "@/components/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/hooks/use-workspace";
import { monthLabel, shiftMonth, validMonth } from "@/lib/dates";

export function MonthPicker() {
	const monthId = useId();
	const { month, setMonth } = useWorkspace();
	return (
		<div className="month-picker inline-flex shrink-0 items-center gap-2">
			<IconButton
				label="Previous month"
				disabled={month <= "1900-06"}
				onClick={() => setMonth(shiftMonth(month, -1))}
			>
				<ArrowLeft />
			</IconButton>
			<Label
				htmlFor={monthId}
				className="relative min-w-31 justify-center text-xs focus-within:outline focus-within:outline-ring focus-within:outline-offset-4"
			>
				{monthLabel(month)}
				<Input
					id={monthId}
					type="month"
					min="1900-06"
					max="9999-12"
					aria-label="Choose budget month"
					value={month}
					className="absolute inset-0 h-full min-h-0 w-full cursor-pointer p-0 opacity-0"
					onChange={(event) => {
						if (
							validMonth(event.target.value) &&
							event.target.value >= "1900-06"
						)
							setMonth(event.target.value);
					}}
				/>
			</Label>
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
