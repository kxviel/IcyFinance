import { ArrowUpRight } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceDialog from "@/components/WorkspaceDialog";
import { shortDate } from "@/lib/dates";
import { repeats } from "@/modules/Accounts/accountUtils";
import { useScheduleEditor } from "@/modules/Accounts/useScheduleEditor";
import type { ScheduledTransaction } from "@/modules/Workspace/budget.types";

const ScheduleEditor = ({
	schedule,
	onClose,
}: {
	schedule?: ScheduledTransaction;
	onClose: () => void;
}) => {
	const fieldId = useId();

	const {
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
	} = useScheduleEditor({ schedule, onClose });
	return (
		<WorkspaceDialog
			title={schedule ? "Keep your rhythm." : "Give the everyday a rhythm."}
			description="Plan recurring income and bills. Post each due occurrence when you're ready; scheduled amounts do not change your budget until posted."
			onClose={onClose}
		>
			<form className="form-stack grid gap-5.5" onSubmit={save}>
				<Field>
					<FieldLabel htmlFor={`${fieldId}-1`}>Payee</FieldLabel>
					<Input
						id={`${fieldId}-1`}
						autoFocus
						required
						maxLength={300}
						value={payee}
						onChange={(event) => setPayee(event.target.value)}
						placeholder="Rent, salary, a familiar subscription…"
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor={`${fieldId}-2`}>Account</FieldLabel>
					<NativeSelect
						id={`${fieldId}-2`}
						required
						value={accountId}
						onChange={(event) => setAccountId(event.target.value)}
					>
						<option value="">Choose an account</option>
						{doc.accounts
							.filter((item) => !item.closed || item.id === accountId)
							.map((item) => (
								<option key={item.id} value={item.id}>
									{item.name}
									{item.closed ? " (closed)" : ""}
								</option>
							))}
					</NativeSelect>
				</Field>
				<div className="form-grid grid grid-cols-2 gap-5 max-[680px]:grid-cols-1 max-[680px]:gap-4.5">
					<Field>
						<FieldLabel htmlFor={`${fieldId}-3`}>Direction</FieldLabel>
						<NativeSelect
							id={`${fieldId}-3`}
							value={direction}
							onChange={(event) =>
								setDirection(event.target.value as "expense" | "income")
							}
						>
							<option value="expense">Expense · money out</option>
							<option value="income">Income · money in</option>
						</NativeSelect>
					</Field>
					<Field>
						<FieldLabel
							htmlFor={`${fieldId}-4`}
						>{`Amount (${doc.currency})`}</FieldLabel>
						<Input
							id={`${fieldId}-4`}
							aria-describedby={`${fieldId}-4-hint`}
							required
							inputMode="decimal"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
						/>
						<FieldDescription id={`${fieldId}-4-hint`}>
							{"Positive amount; direction sets the sign."}
						</FieldDescription>
					</Field>
				</div>
				<Field>
					<FieldLabel htmlFor={`${fieldId}-5`}>Category</FieldLabel>
					<NativeSelect
						id={`${fieldId}-5`}
						aria-describedby={`${fieldId}-5-hint`}
						disabled={account?.kind === "tracking"}
						value={account?.kind === "tracking" ? "" : categoryId}
						onChange={(event) => setCategoryId(event.target.value)}
					>
						<option value="">
							{account?.kind === "tracking"
								? "Outside the budget"
								: direction === "income"
									? "Ready to assign"
									: "Uncategorized"}
						</option>
						{doc.categories
							.filter((item) => !item.hidden || item.id === categoryId)
							.map((item) => (
								<option key={item.id} value={item.id}>
									{item.group} / {item.name}
									{item.hidden ? " (hidden)" : ""}
								</option>
							))}
					</NativeSelect>
					<FieldDescription id={`${fieldId}-5-hint`}>
						{account?.kind === "tracking"
							? "Tracking entries stay outside your budget envelopes."
							: direction === "income"
								? "Choose Ready to assign for income, or a category for a refund."
								: "Uncategorized expenses reduce Ready to assign until you categorize them."}
					</FieldDescription>
				</Field>
				<div className="form-grid grid grid-cols-2 gap-5 max-[680px]:grid-cols-1 max-[680px]:gap-4.5">
					<Field>
						<FieldLabel htmlFor={`${fieldId}-6`}>Next date</FieldLabel>
						<Input
							id={`${fieldId}-6`}
							type="date"
							required
							min="1900-01-01"
							max="9999-12-31"
							value={nextDate}
							onChange={(event) => setNextDate(event.target.value)}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor={`${fieldId}-7`}>Repeat</FieldLabel>
						<NativeSelect
							id={`${fieldId}-7`}
							value={repeat}
							onChange={(event) =>
								setRepeat(event.target.value as ScheduledTransaction["repeat"])
							}
						>
							{Object.entries(repeats).map(([value, label]) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</NativeSelect>
					</Field>
				</div>
				{dates.length > 0 && (
					<div className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
						<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
							{repeat === "once" ? "Planned occurrence" : "Next occurrences"}
						</span>
						<p>{dates.map((date) => shortDate(date)).join(" → ")}</p>
						{(repeat === "monthly" || repeat === "yearly") && (
							<span className="text-muted-foreground small text-[12px]">
								Short months use their last day. Later occurrences return to the
								original day when it exists.
							</span>
						)}
					</div>
				)}
				<Field>
					<FieldLabel htmlFor={`${fieldId}-8`}>Memo (optional)</FieldLabel>
					<Textarea
						id={`${fieldId}-8`}
						rows={2}
						maxLength={4000}
						value={memo}
						onChange={(event) => setMemo(event.target.value)}
					/>
				</Field>
				<FieldLabel className="check-label inline-flex items-center gap-2.25 text-[11px] text-muted-foreground">
					<Checkbox
						checked={paused}
						onCheckedChange={(checked) => setPaused(checked)}
					/>{" "}
					Keep this schedule paused
				</FieldLabel>
				{error && (
					<p
						className="text-destructive text-[12px] px-0 py-3 leading-[1.7]"
						role="alert"
					>
						{error}
					</p>
				)}
				<div className="flex justify-end items-center gap-2.5 border-t border-border pt-5.75 mt-0.75 flex-wrap [&.spread]:justify-between max-[680px]:[&_[data-slot=button]]:text-[11px] max-[680px]:[&_[data-slot=button]]:px-4 max-[680px]:[&_[data-slot=button]]:py-2.5 max-[680px]:[&.spread]:gap-4.5">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="default">
						Save schedule
						<ArrowUpRight size={16} />
					</Button>
				</div>
			</form>
		</WorkspaceDialog>
	);
};

export default ScheduleEditor;
