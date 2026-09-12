import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import WorkspaceDialog from "@/components/WorkspaceDialog";
import { formatMoney, parseMoney } from "@/lib/money";
import { message } from "@/lib/utils";
import { categorySummary, moveMoney } from "@/modules/Workspace/budget.utils";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

function MoveMoneyDialog({ onClose }: { onClose: () => void }) {
	const fieldId = useId();

	const { doc, month, update, notify } = useWorkspace();
	const [from, setFrom] = useState(doc.categories[0]?.id || "");
	const [to, setTo] = useState(doc.categories[1]?.id || "");
	const [amount, setAmount] = useState("");
	const [error, setError] = useState("");
	return (
		<WorkspaceDialog
			title="Plans can change."
			description="Move available money between envelopes without changing your total plan."
			onClose={onClose}
		>
			<form
				className="form-stack grid gap-5.5"
				onSubmit={(event) => {
					event.preventDefault();
					try {
						update((current) =>
							moveMoney(current, from, to, month, parseMoney(amount)),
						);
						notify("Money moved. A little more room.");
						onClose();
					} catch (error) {
						setError(message(error));
					}
				}}
			>
				<Field>
					<FieldLabel htmlFor={`${fieldId}-1`}>Move from</FieldLabel>
					<NativeSelect
						id={`${fieldId}-1`}
						value={from}
						onChange={(event) => setFrom(event.target.value)}
					>
						{doc.categories.map((item) => (
							<option value={item.id} key={item.id}>
								{item.name} ·{" "}
								{formatMoney(
									categorySummary(doc, item.id, month).available,
									doc.currency,
								)}
							</option>
						))}
					</NativeSelect>
				</Field>
				<Field>
					<FieldLabel htmlFor={`${fieldId}-2`}>Move to</FieldLabel>
					<NativeSelect
						id={`${fieldId}-2`}
						value={to}
						onChange={(event) => setTo(event.target.value)}
					>
						{doc.categories.map((item) => (
							<option value={item.id} key={item.id}>
								{item.name}
							</option>
						))}
					</NativeSelect>
				</Field>
				<Field>
					<FieldLabel
						htmlFor={`${fieldId}-3`}
					>{`Amount (${doc.currency})`}</FieldLabel>
					<Input
						id={`${fieldId}-3`}
						required
						inputMode="decimal"
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
						placeholder="0.00"
					/>
				</Field>
				{error && (
					<p
						role="alert"
						className="text-destructive text-[12px] px-0 py-3 leading-[1.7]"
					>
						{error}
					</p>
				)}
				<div className="flex justify-end items-center gap-2.5 border-t border-border pt-5.75 mt-0.75 flex-wrap [&.spread]:justify-between max-[680px]:[&_[data-slot=button]]:text-[11px] max-[680px]:[&_[data-slot=button]]:px-4 max-[680px]:[&_[data-slot=button]]:py-2.5 max-[680px]:[&.spread]:gap-4.5">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="default">
						Move money
					</Button>
				</div>
			</form>
		</WorkspaceDialog>
	);
}

export default MoveMoneyDialog;
