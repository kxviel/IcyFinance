import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import { SectionLink } from "@/components/section-link";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { useOverview } from "@/hooks/use-overview";
import { accountBalance, targetProgress } from "@/lib/budget";
import { shortDate } from "@/lib/dates";

export default function Overview() {
	const {
		doc,
		month,
		navigate,
		openTransaction,
		summary,
		throughDate,
		money,
		featured,
		recent,
	} = useOverview();
	return (
		<>
			<PageHeading title="Overview" actions={<MonthPicker />} />
			<div className="stats-row">
				<Stat
					label="Ready to assign"
					value={money(summary.readyToAssign)}
					negative={summary.readyToAssign < 0}
				/>
				<Stat
					label="Available in categories"
					value={money(summary.available)}
					negative={summary.available < 0}
				/>
				<Stat label="Spent this month" value={money(summary.expenses)} />
			</div>
			{summary.uncategorized > 0 && (
				<div className="my-4 flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
					<span>
						{money(summary.uncategorized)} in spending needs a category.
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate({ to: "/transactions" })}
					>
						Review transactions
					</Button>
				</div>
			)}
			<div className="mt-5 grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
				<section>
					<div className="section-top">
						<h2>Recent transactions</h2>
						<SectionLink onClick={() => navigate({ to: "/transactions" })}>
							View all
						</SectionLink>
					</div>
					<div className="mt-3 divide-y border-y">
						{recent.map((tx) => (
							<button
								key={tx.id}
								type="button"
								className="flex w-full items-center gap-3 px-2 py-3.5 text-left text-base hover:bg-muted/50"
								onClick={() => openTransaction(tx)}
							>
								<time
									dateTime={tx.date}
									className="w-14 shrink-0 text-sm text-muted-foreground"
								>
									{shortDate(tx.date)}
								</time>
								<span className="min-w-0 flex-1">
									<span className="block truncate font-medium">{tx.payee}</span>
									<span className="block truncate text-sm text-muted-foreground">
										{tx.transferAccountId
											? "Transfer"
											: tx.splits.length
												? "Split transaction"
												: (doc.categories.find(
														(category) => category.id === tx.categoryId,
													)?.name ??
													(tx.amount >= 0 ? "Income" : "Uncategorized"))}
									</span>
								</span>
								<span className="shrink-0 tabular-nums">
									{money(tx.amount)}
								</span>
							</button>
						))}
						{!recent.length && (
							<p className="py-5 text-sm text-muted-foreground">
								No transactions this month.
							</p>
						)}
					</div>
				</section>
				<section>
					<div className="section-top">
						<h2>Accounts</h2>
						<SectionLink onClick={() => navigate({ to: "/accounts" })}>
							Manage
						</SectionLink>
					</div>
					<div className="mt-3 divide-y border-y">
						{doc.accounts
							.filter((account) => !account.closed)
							.map((account) => (
								<div
									key={account.id}
									className="flex items-center justify-between gap-3 py-3 text-base"
								>
									<span>{account.name}</span>
									<span className="shrink-0 tabular-nums">
										{money(accountBalance(doc, account.id, throughDate))}
									</span>
								</div>
							))}
						{!doc.accounts.some((account) => !account.closed) && (
							<p className="py-5 text-sm text-muted-foreground">
								No open accounts.
							</p>
						)}
					</div>
					<div className="mt-3 flex items-center justify-between text-sm">
						<span>Net worth</span>
						<strong className="tabular-nums">{money(summary.netWorth)}</strong>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						As of {shortDate(throughDate)}
					</p>
					<section className="mt-6">
						<div className="section-top">
							<h2>Targets</h2>
							<SectionLink onClick={() => navigate({ to: "/targets" })}>
								View all
							</SectionLink>
						</div>
						<div className="mt-3 divide-y border-y">
							{featured.map((category) => {
								const progress = targetProgress(doc, category.id, month);
								return (
									<button
										key={category.id}
										type="button"
										className="grid w-full grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-2 py-3.5 text-left text-base hover:bg-muted/50"
										onClick={() => navigate({ to: "/targets" })}
									>
										<span className="font-medium">{category.name}</span>
										<span className="tabular-nums">
											{money(progress.current)} / {money(progress.target)}
										</span>
										<span className="text-sm text-muted-foreground">
											{progress.needed > 0
												? `${money(progress.needed)} needed this month`
												: "Funded"}
										</span>
										<span className="text-right text-sm text-muted-foreground tabular-nums">
											{Math.round(progress.percentage)}%
										</span>
									</button>
								);
							})}
							{!featured.length && (
								<p className="py-5 text-sm text-muted-foreground">
									No targets. Add one to a budget category.
								</p>
							)}
						</div>
					</section>
				</section>
			</div>
		</>
	);
}
