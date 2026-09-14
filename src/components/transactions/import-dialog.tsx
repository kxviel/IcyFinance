import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useWorkspace } from "@/hooks/use-workspace";
import { message } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { parseTransactionCsv } from "@/lib/transaction-csv";

function ImportDialog({ onClose }: { onClose: () => void }) {
	const fieldId = useId();

	const { doc, update, notify } = useWorkspace();
	const [account, setAccount] = useState(
		doc.accounts.find((item) => !item.closed)?.id || "",
	);
	const [source, setSource] = useState("");
	const [filename, setFilename] = useState("");
	const [error, setError] = useState("");
	const fileRead = useRef(0);
	let parsed: ReturnType<typeof parseTransactionCsv> | null = null;
	try {
		if (source && account) parsed = parseTransactionCsv(source, account, doc);
	} catch (error) {
		parsed = { transactions: [], errors: [message(error)], duplicates: 0 };
	}
	return (
		<WorkspaceDialog
			title="Import transactions"
			description="Import transactions from a CSV file. Review the preview before anything is added."
			onClose={onClose}
			wide
		>
			<div className="form-stack grid gap-4">
				<Field>
					<FieldLabel htmlFor={`${fieldId}-1`}>
						{"Import into account"}
					</FieldLabel>
					<NativeSelect
						id={`${fieldId}-1`}
						value={account}
						onChange={(event) => setAccount(event.target.value)}
					>
						<option value="">Choose an account</option>
						{doc.accounts
							.filter((item) => !item.closed)
							.map((item) => (
								<option key={item.id} value={item.id}>
									{item.name}
								</option>
							))}
					</NativeSelect>
				</Field>
				<Field>
					<FieldLabel htmlFor={`${fieldId}-2`}>CSV file</FieldLabel>
					<Input
						id={`${fieldId}-2`}
						aria-describedby={`${fieldId}-2-hint`}
						type="file"
						accept=".csv,text/csv"
						onChange={async (event) => {
							const file = event.target.files?.[0];
							const request = ++fileRead.current;
							setSource("");
							setFilename("");
							setError("");
							if (!file) return;
							try {
								if (file.size > 5 * 1024 * 1024)
									throw new Error("Use a CSV smaller than 5 MB.");
								const contents = await file.text();
								if (request !== fileRead.current) return;
								setFilename(file.name);
								setSource(contents);
								setError("");
							} catch (error) {
								if (request !== fileRead.current) return;
								setError(message(error));
							}
						}}
					/>
					<FieldDescription id={`${fieldId}-2-hint`}>
						{
							"Use Date, Payee, Amount, Category, Memo headers. Dates: YYYY-MM-DD. Signed decimal amounts: negative for spending."
						}
					</FieldDescription>
				</Field>
				{parsed && (
					<>
						<div className="flex flex-col gap-1.5">
							<strong>{parsed.transactions.length} ready to import</strong>
							<span className="text-muted-foreground">
								{parsed.duplicates} possible duplicates skipped · {filename}
							</span>
						</div>
						{parsed.errors.length > 0 && (
							<div className="notice px-5 py-4 border border-border bg-card text-sm leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
								<p>Resolve these rows before importing:</p>
								<ul>
									{parsed.errors.slice(0, 10).map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</div>
						)}
						<div className="[&>div]:grid [&>div]:grid-cols-[90px_1fr_auto] [&>div]:gap-3.5 [&>div]:px-0 [&>div]:py-3 [&>div]:border-b [&>div]:border-border [&>div]:text-sm">
							{parsed.transactions.slice(0, 6).map((item) => (
								<div key={item.id}>
									<span>{item.date}</span>
									<strong>{item.payee}</strong>
									<span className="numeric tabular-nums whitespace-nowrap">
										{formatMoney(item.amount, doc.currency)}
									</span>
								</div>
							))}
						</div>
					</>
				)}
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
					<Button
						variant="default"
						disabled={
							!parsed?.transactions.length ||
							Boolean(parsed?.errors.length) ||
							Boolean(error)
						}
						onClick={() => {
							try {
								if (!parsed) return;
								const transactions = parsed.transactions;
								update((current) => ({
									...current,
									transactions: [...current.transactions, ...transactions],
								}));
								notify(`${transactions.length} transactions imported.`);
								onClose();
							} catch (error) {
								setError(message(error));
							}
						}}
					>
						Import transactions
					</Button>
				</DialogFooter>
			</div>
		</WorkspaceDialog>
	);
}

export default ImportDialog;
