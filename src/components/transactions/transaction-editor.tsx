import { Plus, Trash2 } from "lucide-react";
import { useId, useRef } from "react";
import { IconButton } from "@/components/icon-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useTransactionEditor } from "@/hooks/use-transaction-editor";
import { deleteTransaction } from "@/lib/budget";
import type { Transaction } from "@/lib/budget-types";
import { message } from "@/lib/errors";

const TransactionEditor = ({
	transaction,
	onClose,
}: {
	transaction?: Transaction;
	onClose: () => void;
}) => {
	const fieldId = useId();
	const amountRef = useRef<HTMLInputElement>(null);

	const {
		doc,
		update,
		notify,
		kind,
		setKind,
		date,
		setDate,
		accountId,
		setAccountId,
		destination,
		setDestination,
		payee,
		setPayee,
		amount,
		setAmount,
		category,
		setCategory,
		memo,
		setMemo,
		cleared,
		setCleared,
		split,
		setSplit,
		splits,
		setSplits,
		transferCleared,
		setTransferCleared,
		locked,
		error,
		setError,
		deleting,
		setDeleting,
		categories,
		save,
	} = useTransactionEditor({ transaction, onClose });
	return (
		<WorkspaceDialog
			title={transaction ? "Edit transaction" : "Add transaction"}
			description={
				locked
					? "This entry is reconciled. Remove reconciliation for both sides in the account-filtered register before editing."
					: ""
			}
			onClose={onClose}
			wide
			initialFocus={amountRef}
		>
			<form onSubmit={save} className="form-stack grid gap-5">
				<fieldset disabled={locked}>
					<ToggleGroup
						aria-label="Transaction type"
						value={[kind]}
						onValueChange={([value]) => {
							if (value) {
								setKind(value);
								setSplit(false);
								setCategory("");
							}
						}}
						variant="outline"
						size="sm"
						className="flex-wrap"
						disabled={locked}
					>
						{(
							[
								["expense", "Expense"],
								["income", "Income"],
								["transfer", "Transfer"],
							] as const
						).map(([value, label]) => (
							<ToggleGroupItem
								key={value}
								value={value}
								className="rounded-md px-3 text-sm data-pressed:bg-primary data-pressed:text-primary-foreground"
							>
								{label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
					<div className="form-grid grid grid-cols-2 gap-5 max-[680px]:grid-cols-1 max-[680px]:gap-4.5">
						<Field>
							<FieldLabel
								htmlFor={`${fieldId}-1`}
							>{`Amount (${doc.currency})`}</FieldLabel>
							<Input
								id={`${fieldId}-1`}
								ref={amountRef}
								className="text-base tabular-nums"
								required
								inputMode="decimal"
								value={amount}
								onChange={(event) => setAmount(event.target.value)}
								placeholder="0.00"
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={`${fieldId}-2`}>Date</FieldLabel>
							<Input
								id={`${fieldId}-2`}
								required
								type="date"
								value={date}
								onChange={(event) => setDate(event.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={`${fieldId}-3`}>
								{kind === "transfer" ? "From account" : "Account"}
							</FieldLabel>
							<NativeSelect
								id={`${fieldId}-3`}
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
										</option>
									))}
							</NativeSelect>
						</Field>
						{kind === "transfer" ? (
							<Field>
								<FieldLabel htmlFor={`${fieldId}-4`}>To account</FieldLabel>
								<NativeSelect
									id={`${fieldId}-4`}
									required
									value={destination}
									onChange={(event) => setDestination(event.target.value)}
								>
									<option value="">Choose destination</option>
									{doc.accounts
										.filter((item) => !item.closed && item.id !== accountId)
										.map((item) => (
											<option key={item.id} value={item.id}>
												{item.name}
											</option>
										))}
								</NativeSelect>
							</Field>
						) : (
							<Field>
								<FieldLabel htmlFor={`${fieldId}-5`}>Payee</FieldLabel>
								<Input
									id={`${fieldId}-5`}
									required
									maxLength={160}
									list="known-payees"
									value={payee}
									onChange={(event) => setPayee(event.target.value)}
									placeholder={
										kind === "income" ? "Income source" : "Payee name"
									}
								/>
								<datalist id="known-payees">
									{[
										...new Set(
											doc.transactions
												.filter((item) => !item.transferAccountId)
												.map((item) => item.payee),
										),
									]
										.slice(0, 100)
										.map((item) => (
											<option key={item} value={item} />
										))}
								</datalist>
							</Field>
						)}
					</div>
					{!split && (
						<Field>
							<FieldLabel htmlFor={`${fieldId}-6`}>Category</FieldLabel>
							<NativeSelect
								id={`${fieldId}-6`}
								aria-describedby={`${fieldId}-6-hint`}
								value={category}
								onChange={(event) => setCategory(event.target.value)}
							>
								<option value="">
									{kind === "income"
										? "Ready to assign"
										: kind === "transfer"
											? "No category · between accounts"
											: "Uncategorized"}
								</option>
								{categories.map((item) => (
									<option key={item.id} value={item.id}>
										{item.group} / {item.name}
									</option>
								))}
							</NativeSelect>
							<FieldDescription id={`${fieldId}-6-hint`}>
								{kind === "transfer"
									? "Only choose a category for a transfer between an envelope account and a tracking account."
									: kind === "income"
										? "Choose Ready to assign for income, or an envelope for a refund."
										: "You can categorize this later, too."}
							</FieldDescription>
						</Field>
					)}
					{split && (
						<div className="border-t border-border pt-4 [&>.field-hint]:mt-3.5">
							<div className="section-top my-4">
								<span className="text-sm font-medium text-muted-foreground">
									Split categories
								</span>
								<Button
									variant="ghost"
									onClick={() =>
										setSplits((current) => [
											...current,
											{ id: crypto.randomUUID(), categoryId: "", amount: "" },
										])
									}
								>
									<Plus size={14} /> Line
								</Button>
							</div>
							{splits.map((item, index) => (
								<div
									className="grid grid-cols-[1fr_120px_28px] gap-2.5 mx-0 my-3 items-center [&_select]:text-sm [&_input]:text-sm max-[680px]:grid-cols-[1fr_80px_24px] max-[680px]:gap-1.5 max-[680px]:[&_input]:px-2 max-[680px]:[&_input]:py-2.5 max-[680px]:[&_select]:px-2 max-[680px]:[&_select]:py-2.5"
									key={item.id}
								>
									<NativeSelect
										aria-label={`Split ${index + 1} category`}
										value={item.categoryId}
										onChange={(event) =>
											setSplits((current) =>
												current.map((row) =>
													row.id === item.id
														? { ...row, categoryId: event.target.value }
														: row,
												),
											)
										}
									>
										<option value="">
											{kind === "income" ? "Ready to assign" : "Uncategorized"}
										</option>
										{categories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</NativeSelect>
									<Input
										aria-label={`Split ${index + 1} amount`}
										inputMode="decimal"
										required
										placeholder="0.00"
										value={item.amount}
										onChange={(event) =>
											setSplits((current) =>
												current.map((row) =>
													row.id === item.id
														? { ...row, amount: event.target.value }
														: row,
												),
											)
										}
									/>
									<IconButton
										label="Remove split"
										disabled={splits.length <= 2}
										onClick={() =>
											setSplits((current) =>
												current.filter((row) => row.id !== item.id),
											)
										}
									>
										<Trash2 size={16} />
									</IconButton>
								</div>
							))}
							<p className="field-hint text-sm leading-[1.7] text-muted-foreground">
								Split amounts must total the transaction. Use a negative split
								for money moving opposite to the selected direction.
							</p>
						</div>
					)}
					<div className="flex justify-between flex-wrap gap-3">
						{kind !== "transfer" && (
							<FieldLabel className="check-label inline-flex items-center gap-2.25 text-sm text-muted-foreground">
								<Checkbox
									checked={split}
									onCheckedChange={(checked) => setSplit(checked)}
								/>{" "}
								Split transaction
							</FieldLabel>
						)}
						<FieldLabel className="check-label inline-flex items-center gap-2.25 text-sm text-muted-foreground">
							<Checkbox
								checked={cleared}
								onCheckedChange={(checked) => setCleared(checked)}
							/>{" "}
							Cleared in source account
						</FieldLabel>
						{kind === "transfer" && (
							<FieldLabel className="check-label inline-flex items-center gap-2.25 text-sm text-muted-foreground">
								<Checkbox
									checked={transferCleared}
									onCheckedChange={(checked) => setTransferCleared(checked)}
								/>{" "}
								Cleared in destination account
							</FieldLabel>
						)}
					</div>
					<Field>
						<FieldLabel htmlFor={`${fieldId}-7`}>Memo</FieldLabel>
						<Textarea
							className="min-h-16"
							id={`${fieldId}-7`}
							rows={2}
							maxLength={1000}
							value={memo}
							onChange={(event) => setMemo(event.target.value)}
							placeholder="Optional note"
						/>
					</Field>
				</fieldset>
				{error && (
					<p
						className="text-destructive text-sm px-0 py-3 leading-[1.7]"
						role="alert"
					>
						{error}
					</p>
				)}
				<DialogFooter className="mt-1 border-t border-border pt-4 sm:justify-between">
					{transaction && !locked ? (
						<Button variant="destructive" onClick={() => setDeleting(true)}>
							<Trash2 size={15} /> Delete
						</Button>
					) : (
						<span />
					)}
					<div className="button-row flex items-center gap-2.5 flex-wrap">
						<Button variant="outline" onClick={onClose}>
							Close
						</Button>
						<Button type="submit" variant="default" disabled={locked}>
							Save transaction
						</Button>
					</div>
				</DialogFooter>
			</form>
			{deleting && (
				<div
					className="bg-card p-5 border border-border mt-6 text-sm [&_.button-row]:mt-4"
					role="alert"
				>
					<p>
						Delete this transaction and update its account and envelope
						balances?
					</p>
					<div className="button-row flex items-center gap-2.5 flex-wrap">
						<Button variant="outline" onClick={() => setDeleting(false)}>
							Keep it
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (!transaction) return;
								try {
									update((current) =>
										deleteTransaction(current, transaction.id),
									);
									notify("Transaction deleted. You can undo this.");
									onClose();
								} catch (error) {
									setError(message(error));
								}
							}}
						>
							Delete transaction
						</Button>
					</div>
				</div>
			)}
		</WorkspaceDialog>
	);
};

export default TransactionEditor;
