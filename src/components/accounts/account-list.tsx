import { ArrowUpRight, Check, Pencil, Plus, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { IconButton } from "@/components/icon-button";
import { Shape } from "@/components/shape";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@/components/ui/field";
import type { useAccounts } from "@/hooks/use-accounts";
import { accountKinds, belongsTo, clearedState } from "@/lib/accounts";
import { accountBalance, isTransactionReconciled } from "@/lib/budget";
import { shortDate } from "@/lib/dates";

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
			<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80">
				<div>
					<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
						01 / THE ACCOUNTS
					</span>
					<h2>Your money lives here.</h2>
				</div>
				<div className="button-row flex items-center gap-2.5 flex-wrap">
					<Button
						variant="ghost"
						onClick={() => navigate({ to: "/transactions" })}
					>
						Open register
						<ArrowUpRight size={16} />
					</Button>
					{closedCount > 0 && (
						<FieldLabel className="check-label inline-flex items-center gap-2.25 text-[11px] text-muted-foreground">
							<Checkbox
								checked={showClosed}
								onCheckedChange={(checked) => setShowClosed(checked)}
							/>{" "}
							Show {closedCount} closed
						</FieldLabel>
					)}
				</div>
			</div>
			<div className="grid grid-cols-3 gap-6 mt-7 max-[960px]:grid-cols-2 max-[680px]:grid-cols-1">
				{visibleAccounts.map((account, index) => {
					const balance = accountBalance(doc, account.id);
					const cleared = clearedState(doc, account.id);
					const transactions = doc.transactions.filter((tx) =>
						belongsTo(account.id, tx),
					);
					const lastReconciled = transactions
						.filter((tx) => isTransactionReconciled(tx, account.id))
						.sort((a, b) => b.date.localeCompare(a.date))[0];
					return (
						<article
							className={`border border-border p-6 min-w-0 [&.is-closed]:opacity-65 max-[1200px]:p-5 max-[680px]:p-6 print:break-inside-avoid ${account.closed ? "is-closed" : ""}`}
							key={account.id}
						>
							<div className="flex items-center justify-between gap-3 [&_.pill]:text-[9px] [&_.pill]:px-2.25 [&_.pill]:py-1.25">
								<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
									{String(index + 1).padStart(2, "0")} /{" "}
									{accountKinds[account.kind]}
								</span>
								<IconButton
									label={`Edit ${account.name}`}
									onClick={() => setAccountEditor(account)}
								>
									<Pencil size={16} />
								</IconButton>
							</div>
							<Shape
								variant={index + 1}
								className="w-full h-37.5 mt-3 text-muted-foreground"
							/>
							<div className="flex items-center justify-between gap-2.5 mt-4.5 mr-0 mb-3 ml-0 text-[20px]">
								<h3>{account.name}</h3>
								<span className="text-muted-foreground border border-border rounded-[20px] px-2.25 py-0.75 text-[9px] whitespace-nowrap">
									{account.closed
										? "Closed"
										: account.kind === "tracking"
											? "Tracking"
											: "On budget"}
								</span>
							</div>
							<strong
								className={`text-[34px] font-[450] max-[1200px]:text-[30px] max-[680px]:text-[37px] numeric tabular-nums tracking-[-0.025em] whitespace-nowrap ${balance < 0 ? "text-destructive!" : ""}`}
							>
								{money(balance)}
							</strong>
							<div className="pt-5 pr-0 pb-0 pl-0 text-[11px] grid gap-2 [&>div]:flex [&>div]:justify-between [&>div]:gap-3">
								<div>
									<span className="text-muted-foreground">
										Cleared through today
									</span>
									<span className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
										{money(cleared.balance)}
									</span>
								</div>
								<div>
									<span className="text-muted-foreground">
										Uncleared through today
									</span>
									<span className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
										{money(balance - cleared.balance)}
									</span>
								</div>
							</div>
							{account.note && (
								<p className="text-[11px] min-h-9.5 mx-0 my-5 text-muted-foreground">
									{account.note}
								</p>
							)}
							<p className="text-muted-foreground small text-[12px]">
								{transactions.length}{" "}
								{transactions.length === 1 ? "entry" : "entries"}
								{lastReconciled
									? ` · Latest reconciled entry ${shortDate(lastReconciled.date)}`
									: " · Ready for a first reconciliation"}
							</p>
							<div className="flex flex-wrap gap-1.5 pt-4.5 mt-3.75 border-t border-border [&_[data-slot=button]]:px-3 [&_[data-slot=button]]:py-2 [&_[data-slot=button]]:min-h-8.25 [&_[data-slot=button]]:text-[10px]">
								{account.closed ? (
									<Button
										variant="outline"
										onClick={() => setClosed(account.id, false)}
									>
										<RefreshCw size={15} /> Reopen account
									</Button>
								) : (
									<>
										<Button
											variant="outline"
											onClick={() => setReconciling(account.id)}
										>
											<Check size={15} /> Reconcile
										</Button>
										<Button
											variant="ghost"
											onClick={() => {
												setClosing(account.id);
												setDialogError("");
											}}
										>
											Close account
										</Button>
									</>
								)}
							</div>
						</article>
					);
				})}
			</div>
			{!visibleAccounts.length && (
				<EmptyState
					title="Every collection starts somewhere."
					description="Add a checking, savings, cash, or tracking account and enter its opening balance."
					action={
						<Button variant="outline" onClick={() => setAccountEditor("new")}>
							<Plus size={16} /> Add your first account
						</Button>
					}
				/>
			)}
		</>
	);
};
export default AccountList;
