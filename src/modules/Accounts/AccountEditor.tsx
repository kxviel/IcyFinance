import { ArrowUpRight } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceDialog from "@/components/WorkspaceDialog";
import { accountKinds } from "@/modules/Accounts/accountUtils";
import { useAccountEditor } from "@/modules/Accounts/useAccountEditor";
import type { Account, AccountKind } from "@/modules/Workspace/budget.types";

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
			title={account ? "A place for your money." : "Give your money a home."}
			description={
				account
					? "Update the details of your account."
					: "Start with the balance before your first transaction in IcyFinance."
			}
			onClose={onClose}
		>
			<form className="form-stack grid gap-5.5" onSubmit={save}>
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
				<div className="form-grid grid grid-cols-2 gap-5 max-[680px]:grid-cols-1 max-[680px]:gap-4.5">
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
				<p className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
					{kind === "tracking"
						? "Tracking accounts count toward net worth, but their balances stay outside your budget envelopes. Use them for investments, assets, or liabilities."
						: "This account contributes to your budget. Its opening balance is available to assign across your envelopes."}
				</p>
				{locked && (
					<p className="text-muted-foreground small text-[12px]">
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
						{account ? "Save account" : "Add account"}
						<ArrowUpRight size={16} />
					</Button>
				</div>
			</form>
		</WorkspaceDialog>
	);
};

export default AccountEditor;
