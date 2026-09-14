import {
	Check,
	Download,
	LockKeyhole,
	Plus,
	Search,
	Upload,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import ImportDialog from "@/components/transactions/import-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { isTransactionCleared, isTransactionReconciled } from "@/lib/budget";
import { shortDate } from "@/lib/dates";
import { downloadFile } from "@/lib/download";
import { message } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { exportTransactionsCsv } from "@/lib/transaction-csv";

export default function Transactions() {
	const {
		doc,
		openTransaction,
		update,
		notify,
		query,
		setQuery,
		account,
		setAccount,
		status,
		setStatus,
		allDates,
		setAllDates,
		importing,
		setImporting,
		unlock,
		setUnlock,
		searchRef,
		side,
		rows,
		toggleCleared,
	} = useTransactions();
	return (
		<>
			<PageHeading
				title="Transactions"
				actions={
					<Button variant="outline" onClick={() => setImporting(true)}>
						<Upload size={16} /> Import
					</Button>
				}
			/>
			<div className="section-top my-4">
				<div className="flex items-center gap-3 text-muted-foreground w-[min(480px,_60%)] [&_input]:pl-0 [&_input]:border-0 [&_input]:text-sm max-[680px]:w-full">
					<Search size={17} />
					<Input
						ref={searchRef}
						type="search"
						aria-label="Search transactions"
						placeholder="Find a payee, category, or note…"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
				</div>
				<MonthPicker />
			</div>
			<div className="section-top my-4">
				<div className="button-row flex items-center gap-2.5 flex-wrap">
					<NativeSelect
						aria-label="Filter by account"
						value={account}
						onChange={(event) => setAccount(event.target.value)}
					>
						<option value="all">All accounts</option>
						{doc.accounts.map((item) => (
							<option key={item.id} value={item.id}>
								{item.name}
							</option>
						))}
					</NativeSelect>
					<NativeSelect
						aria-label="Filter by status"
						value={status}
						onChange={(event) => setStatus(event.target.value)}
					>
						<option value="all">All transactions</option>
						<option value="uncleared">Uncleared</option>
						<option value="uncategorized">Needs a category</option>
					</NativeSelect>
					<FieldLabel className="check-label inline-flex items-center gap-2.25 text-sm text-muted-foreground">
						<Checkbox
							checked={allDates}
							onCheckedChange={(checked) => setAllDates(checked)}
						/>{" "}
						All dates
					</FieldLabel>
				</div>
				<Button
					variant="ghost"
					onClick={async () => {
						try {
							const saved = await downloadFile(
								"IcyFinance-transactions.csv",
								exportTransactionsCsv(doc),
								"text/csv;charset=utf-8",
							);
							if (saved) notify("Transaction export saved.");
						} catch (error) {
							notify(message(error), true);
						}
					}}
				>
					<Download size={15} /> Export all
				</Button>
			</div>
			<div className="table-scroll w-full overflow-x-auto">
				<Table className="text-base [&_td]:py-3.5 [&_thead]:border-t max-[680px]:min-w-157.5">
					<TableHeader>
						<TableRow>
							<TableHead className="w-9.5" scope="col">
								C
							</TableHead>
							<TableHead scope="col">Date</TableHead>
							<TableHead scope="col">Payee / memo</TableHead>
							<TableHead scope="col">Category</TableHead>
							<TableHead scope="col">Account</TableHead>
							<TableHead scope="col" className="text-right!">
								Amount
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((item) => (
							<TableRow key={item.id}>
								<TableCell>
									<button
										type="button"
										className={`w-4.75 h-4.75 border border-subtle rounded-full flex items-center justify-center p-0 [&.is-cleared]:bg-foreground [&.is-cleared]:text-background [&.is-cleared]:border-foreground ${isTransactionCleared(item, side(item)) ? "is-cleared" : ""}`}
										aria-label={
											isTransactionReconciled(item, side(item))
												? "Remove reconciliation"
												: isTransactionCleared(item, side(item))
													? "Mark uncleared"
													: "Mark cleared"
										}
										onClick={() => toggleCleared(item)}
									>
										{isTransactionReconciled(item, side(item)) ? (
											<LockKeyhole size={12} />
										) : isTransactionCleared(item, side(item)) ? (
											<Check size={13} />
										) : null}
									</button>
								</TableCell>
								<TableCell className="text-muted-foreground whitespace-nowrap">
									{shortDate(item.date)}
								</TableCell>
								<TableCell>
									<button
										type="button"
										className="text-left flex flex-col gap-1 p-0 min-w-32.5 [&:hover_strong]:underline [&:hover_strong]:underline-offset-1 [&_.small]:text-sm [&_.small]:max-w-62.5"
										onClick={() => openTransaction(item)}
									>
										<strong>{item.payee}</strong>
										{item.memo && (
											<span className="text-muted-foreground small text-sm">
												{item.memo}
											</span>
										)}
									</button>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{item.transferAccountId
										? "Transfer"
										: item.splits.length
											? `${item.splits.length} split categories`
											: doc.categories.find(
													(category) => category.id === item.categoryId,
												)?.name ||
												(item.amount >= 0 ? (
													"Ready to assign"
												) : (
													<span className="text-destructive!">
														Uncategorized
													</span>
												))}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{
										doc.accounts.find(
											(account) => account.id === item.accountId,
										)?.name
									}
									{item.transferAccountId && (
										<span className="small text-sm">
											{" "}
											→{" "}
											{
												doc.accounts.find(
													(account) => account.id === item.transferAccountId,
												)?.name
											}
										</span>
									)}
								</TableCell>
								<TableCell className="text-right! numeric tabular-nums whitespace-nowrap">
									{formatMoney(
										account !== "all" && item.transferAccountId === account
											? -item.amount
											: item.amount,
										doc.currency,
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			{!rows.length && (
				<EmptyState
					title="No transactions"
					description="Add a transaction or adjust your filters to see more."
					action={
						<Button variant="outline" onClick={() => openTransaction()}>
							Add transaction <Plus size={15} />
						</Button>
					}
				/>
			)}
			<div className="flex flex-wrap justify-between gap-2 py-3 text-sm text-muted-foreground">
				<span>
					{rows.length} {rows.length === 1 ? "transaction" : "transactions"}
				</span>
				<span>C = cleared · Lock = reconciled</span>
			</div>
			{importing && <ImportDialog onClose={() => setImporting(false)} />}
			{unlock && (
				<WorkspaceDialog
					title="Reopen this entry?"
					description="Removing reconciliation lets you edit this transaction. Your next reconciliation may need an adjustment."
					onClose={() => setUnlock(null)}
				>
					<DialogFooter className="mt-1 border-t border-border pt-6">
						<Button variant="outline" onClick={() => setUnlock(null)}>
							Keep reconciled
						</Button>
						<Button
							variant="default"
							onClick={() => {
								update((current) => ({
									...current,
									transactions: current.transactions.map((item) =>
										item.id === unlock.id
											? {
													...item,
													...(side(item) === item.accountId
														? { reconciled: false }
														: { transferReconciled: false }),
												}
											: item,
									),
								}));
								setUnlock(null);
								notify("Reconciliation removed for this entry.");
							}}
						>
							Reopen entry
						</Button>
					</DialogFooter>
				</WorkspaceDialog>
			)}
		</>
	);
}
