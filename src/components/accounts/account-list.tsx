import { Pencil, Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { IconButton } from "@/components/icon-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@/components/ui/field";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { useAccounts } from "@/hooks/use-accounts";
import { accountKinds, clearedState } from "@/lib/accounts";
import { accountBalance } from "@/lib/budget";

type Props = Pick<
	ReturnType<typeof useAccounts>,
	| "doc"
	| "navigate"
	| "setAccountEditor"
	| "setReconciling"
	| "setClosing"
	| "showClosed"
	| "setShowClosed"
	| "setDialogError"
	| "visibleAccounts"
	| "closedCount"
	| "money"
	| "setClosed"
>;
const AccountList = ({
	doc,
	navigate,
	setAccountEditor,
	setReconciling,
	setClosing,
	showClosed,
	setShowClosed,
	setDialogError,
	visibleAccounts,
	closedCount,
	money,
	setClosed,
}: Props) => {
	return (
		<>
			<div className="section-top my-4">
				<h2>Account balances</h2>
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate({ to: "/transactions" })}
					>
						Transactions
					</Button>
					{closedCount > 0 && (
						<FieldLabel className="inline-flex items-center gap-2 text-sm">
							<Checkbox checked={showClosed} onCheckedChange={setShowClosed} />
							Show closed ({closedCount})
						</FieldLabel>
					)}
				</div>
			</div>
			{visibleAccounts.length ? (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Account</TableHead>
							<TableHead className="text-right">Balance</TableHead>
							<TableHead className="text-right">Cleared</TableHead>
							<TableHead className="text-right">Uncleared</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{visibleAccounts.map((account) => {
							const balance = accountBalance(doc, account.id);
							const cleared = clearedState(doc, account.id);
							return (
								<TableRow
									key={account.id}
									className={account.closed ? "opacity-60" : undefined}
								>
									<TableCell>
										<button
											type="button"
											className="text-left hover:underline"
											onClick={() => setAccountEditor(account)}
										>
											<span className="block font-medium">{account.name}</span>
											<span className="text-sm text-muted-foreground">
												{accountKinds[account.kind]}
												{account.closed ? " · Closed" : ""}
											</span>
										</button>
									</TableCell>
									<TableCell
										className={`text-right tabular-nums font-medium ${balance < 0 ? "text-destructive" : ""}`}
									>
										{money(balance)}
									</TableCell>
									<TableCell className="text-right tabular-nums text-muted-foreground">
										{money(cleared.balance)}
									</TableCell>
									<TableCell className="text-right tabular-nums text-muted-foreground">
										{money(balance - cleared.balance)}
									</TableCell>
									<TableCell>
										<div className="flex justify-end gap-1">
											<IconButton
												label={`Edit ${account.name}`}
												onClick={() => setAccountEditor(account)}
											>
												<Pencil size={14} />
											</IconButton>
											{account.closed ? (
												<Button
													size="sm"
													variant="outline"
													onClick={() => setClosed(account.id, false)}
												>
													Reopen
												</Button>
											) : (
												<>
													<Button
														size="sm"
														variant="outline"
														onClick={() => setReconciling(account.id)}
													>
														Reconcile
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => {
															setClosing(account.id);
															setDialogError("");
														}}
													>
														Close
													</Button>
												</>
											)}
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			) : (
				<EmptyState
					title="No accounts"
					description="Add an account and its opening balance."
					action={
						<Button variant="outline" onClick={() => setAccountEditor("new")}>
							<Plus size={15} /> Add account
						</Button>
					}
				/>
			)}
		</>
	);
};
export default AccountList;
