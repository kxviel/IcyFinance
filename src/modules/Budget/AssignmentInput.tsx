import { useState } from "react";
import { Input } from "@/components/ui/input";
import { inputMoney, parseMoney } from "@/lib/money";
import { message } from "@/lib/utils";
import type { Category } from "@/modules/Workspace/budget.types";
import { setAssignment } from "@/modules/Workspace/budget.utils";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

function AssignmentInput({
	category,
	amount,
}: {
	category: Category;
	amount: number;
}) {
	const { month, update, notify } = useWorkspace();
	const [value, setValue] = useState(inputMoney(amount));
	function commit() {
		try {
			const next = parseMoney(value);
			if (next !== amount)
				update((doc) => setAssignment(doc, category.id, month, next));
			setValue(inputMoney(next));
		} catch (error) {
			setValue(inputMoney(amount));
			notify(message(error), true);
		}
	}
	return (
		<Input
			className="w-29.5 min-h-8.75 justify-self-end px-2.5 py-1.75 text-right text-[12px] tabular-nums border-transparent bg-transparent hover:border-border hover:bg-card focus:border-border focus:bg-card max-[680px]:w-20.5 max-[680px]:pr-1.25"
			aria-label={`Assigned to ${category.name}`}
			inputMode="decimal"
			value={value}
			onChange={(event) => setValue(event.target.value)}
			onBlur={commit}
			onKeyDown={(event) => {
				if (event.key === "Enter") event.currentTarget.blur();
				if (event.key === "Escape") {
					setValue(inputMoney(amount));
					event.currentTarget.blur();
				}
			}}
		/>
	);
}

export default AssignmentInput;
