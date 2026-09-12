import { Check } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import WorkspaceDialog from "@/components/WorkspaceDialog";
import { shortDate, today } from "@/lib/dates";
import { useReconcileDialog } from "@/modules/Accounts/useReconcileDialog";

const ReconcileDialog = ({
	accountId,
	onClose,
}: {
	accountId: string;
	onClose: () => void;
}) => {
	const fieldId = useId();

	const {
		doc,
		account,
		cleared,
		statement,
		setStatement,
		consent,
		setConsent,
		error,
		statementBalance,
		difference,
		fingerprint,
		pending,
		money,
		save,
	} = useReconcileDialog({ accountId, onClose });
	return (
		<WorkspaceDialog
			title="Make the numbers meet."
			description={`Reconcile ${account.name} against its cleared bank balance as of today. Mark settled entries cleared in the register first.`}
			onClose={onClose}
		>
			<form className="form-stack grid gap-5.5" onSubmit={save}>
				<Field>
					<FieldLabel
						htmlFor={`${fieldId}-1`}
					>{`Bank's cleared balance (${doc.currency})`}</FieldLabel>
					<Input
						id={`${fieldId}-1`}
						aria-describedby={`${fieldId}-1-hint`}
						autoFocus
						required
						inputMode="decimal"
						value={statement}
						onChange={(event) => {
							setStatement(event.target.value);
							setConsent("");
						}}
					/>
					<FieldDescription id={`${fieldId}-1-hint`}>
						{"Exclude pending card payments and future entries."}
					</FieldDescription>
				</Field>
				<div
					className="bg-card p-5 grid gap-3 [&>div]:flex [&>div]:[align-items:baseline] [&>div]:justify-between [&>div]:gap-4.5 [&>div]:text-[12px] [&>div:last-child]:border-t [&>div:last-child]:border-border [&>div:last-child]:pt-3"
					aria-live="polite"
				>
					<div>
						<span className="text-muted-foreground">Opening balance</span>
						<strong className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
							{money(account.openingBalance)}
						</strong>
					</div>
					<div>
						<span className="text-muted-foreground">
							Cleared entries through today
						</span>
						<strong className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
							{money(cleared.balance - account.openingBalance)}
						</strong>
					</div>
					<div>
						<span>IcyFinance cleared balance</span>
						<strong className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
							{money(cleared.balance)}
						</strong>
					</div>
					<div>
						<span>Bank's cleared balance</span>
						<strong className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
							{statementBalance === null ? "—" : money(statementBalance)}
						</strong>
					</div>
					<div className={difference ? "text-destructive!" : ""}>
						<span>
							{difference === 0
								? "Difference · all matched"
								: "Adjustment needed"}
						</span>
						<strong className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
							{difference === null ? "—" : money(difference)}
						</strong>
					</div>
				</div>
				<p className="text-muted-foreground small text-[12px]">
					{pending.length} cleared{" "}
					{pending.length === 1 ? "entry will" : "entries will"} be locked as
					reconciled in this account. Uncleared and future entries stay as they
					are. Each side of a transfer is reconciled separately.
				</p>
				{difference !== null && difference !== 0 && (
					<>
						<p className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
							First check for missing or duplicate transactions. Continuing adds
							a {money(difference)} reconciliation adjustment dated{" "}
							{shortDate(today())}.
							{account.kind !== "tracking" &&
								" This changes your budget's Ready to assign balance. Review its category in the register."}
						</p>
						<FieldLabel className="check-label inline-flex items-center gap-2.25 text-[11px] text-muted-foreground">
							<Checkbox
								checked={consent === fingerprint}
								onCheckedChange={(checked) =>
									setConsent(checked ? fingerprint : "")
								}
							/>{" "}
							Add this adjustment and reconcile the account
						</FieldLabel>
					</>
				)}
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
					<Button
						variant="default"
						type="submit"
						disabled={
							statementBalance === null ||
							(difference !== 0 && consent !== fingerprint)
						}
					>
						<Check size={16} />{" "}
						{difference === 0 ? "Reconcile account" : "Adjust & reconcile"}
					</Button>
				</div>
			</form>
		</WorkspaceDialog>
	);
};

export default ReconcileDialog;
