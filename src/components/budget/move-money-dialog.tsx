import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useWorkspace } from "@/hooks/use-workspace";
import { categorySummary, moveMoney } from "@/lib/budget";
import { message } from "@/lib/errors";
import { formatMoney, parseMoney } from "@/lib/money";

function MoveMoneyDialog({ onClose }: { onClose: () => void }) {
	const fieldId = useId();

	const { doc, month, update, notify } = useWorkspace();
	const [from, setFrom] = useState(doc.categories[0]?.id || "");
	const [to, setTo] = useState(doc.categories[1]?.id || "");
	const [amount, setAmount] = useState("");
	const [error, setError] = useState("");
	return (
		<WorkspaceDialog
			title="Move money"
			description="Move available money between envelopes without changing your total plan."
			onClose={onClose}
		>
			<form
				className="form-stack grid gap-4"
				onSubmit={(event) => {
					event.preventDefault();
					try {
						update((current) =>
							moveMoney(current, from, to, month, parseMoney(amount)),
						);
						notify("Money moved.");
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
						className="text-destructive text-sm px-0 py-3 leading-[1.7]"
					>
						{error}
					</p>
				)}
				<DialogFooter className="mt-1 border-t border-border pt-6">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="default">
						Move money
					</Button>
				</DialogFooter>
			</form>
		</WorkspaceDialog>
	);
}

export default MoveMoneyDialog;
