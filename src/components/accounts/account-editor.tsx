import { ArrowUpRight } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useAccountEditor } from "@/hooks/use-account-editor";
import { accountKinds, accountPurposes } from "@/lib/accounts";
import type { Account, AccountKind, AccountPurpose } from "@/lib/budget-types";

const AccountEditor = ({
	account,
	onClose,
}: {
	account?: Account;
	onClose: () => void;
}) => {
	const fieldId = useId();

	const {
		doc,
		name,
		setName,
		kind,
		setKind,
		purpose,
		setPurpose,
		opening,
		setOpening,
		note,
		setNote,
		error,
		locked,
		save,
	} = useAccountEditor({ account, onClose });
	return (
		<WorkspaceDialog
			title={account ? "Edit account" : "Add account"}
			description={
				account
					? "Update the details of your account."
					: "Start with the balance before your first transaction in IcyFinance."
			}
			onClose={onClose}
		>
			<form className="form-stack grid gap-4" onSubmit={save}>
				<Field>
					<FieldLabel htmlFor={`${fieldId}-1`}>Account name</FieldLabel>
					<Input
						id={`${fieldId}-1`}
						autoFocus
						required
						maxLength={100}
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Everyday account"
					/>
				</Field>
				<div className="form-grid grid grid-cols-2 gap-4 max-[680px]:grid-cols-1 max-[680px]:gap-4.5">
					<Field>
						<FieldLabel htmlFor={`${fieldId}-2`}>Account kind</FieldLabel>
						<NativeSelect
							id={`${fieldId}-2`}
							disabled={locked}
							value={kind}
							onChange={(event) => setKind(event.target.value as AccountKind)}
						>
							{Object.entries(accountKinds).map(([value, label]) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</NativeSelect>
					</Field>
					<Field>
						<FieldLabel
							htmlFor={`${fieldId}-3`}
						>{`Opening balance (${doc.currency})`}</FieldLabel>
						<Input
							id={`${fieldId}-3`}
							aria-describedby={`${fieldId}-3-hint`}
							required
							disabled={locked}
							inputMode="decimal"
							value={opening}
							onChange={(event) => setOpening(event.target.value)}
						/>
						<FieldDescription id={`${fieldId}-3-hint`}>
							{"Use a minus sign for money owed."}
						</FieldDescription>
					</Field>
				</div>
				<Field>
					<FieldLabel htmlFor={`${fieldId}-purpose`}>
						Purpose (optional)
					</FieldLabel>
					<NativeSelect
						id={`${fieldId}-purpose`}
						aria-describedby={`${fieldId}-purpose-hint`}
						value={purpose}
						onChange={(event) =>
							setPurpose(event.target.value as AccountPurpose | "")
						}
					>
						<option value="">No purpose</option>
						{Object.entries(accountPurposes).map(([value, label]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</NativeSelect>
					<FieldDescription id={`${fieldId}-purpose-hint`}>
						Describes how you use the account; its kind controls budgeting.
					</FieldDescription>
				</Field>
				<p className="notice px-5 py-4 border border-border bg-card text-sm leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
					{kind === "tracking"
						? "Tracking accounts count toward net worth, but their balances stay outside your budget envelopes. Use them for investments, assets, or liabilities."
						: "This account contributes to your budget. Its opening balance is available to assign across your envelopes."}
				</p>
				{locked && (
					<p className="text-muted-foreground small text-sm">
						{account?.closed
							? "Reopen this account before changing its kind or opening balance."
							: "Kind and opening balance are locked because this account has entries. Reconcile the account to correct its current balance."}
					</p>
				)}
				<Field>
					<FieldLabel htmlFor={`${fieldId}-4`}>Note (optional)</FieldLabel>
					<Textarea
						id={`${fieldId}-4`}
						rows={3}
						maxLength={2000}
						value={note}
						onChange={(event) => setNote(event.target.value)}
						placeholder="What this account is for…"
					/>
				</Field>
				{error && (
					<p
						className="text-destructive text-sm px-0 py-3 leading-[1.7]"
						role="alert"
					>
						{error}
					</p>
				)}
				<DialogFooter className="mt-1 border-t border-border pt-6">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="default">
						{account ? "Save account" : "Add account"}
						<ArrowUpRight size={16} />
					</Button>
				</DialogFooter>
			</form>
		</WorkspaceDialog>
	);
};

export default AccountEditor;
