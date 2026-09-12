import { ArrowDownLeft, ArrowRight, Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { SectionLink } from "@/components/section-link";
import { Shape } from "@/components/shape";
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
			<section className="grid grid-cols-[1.08fr_1fr] items-center min-h-137.5 pt-17 pr-0 pb-14.5 pl-0 gap-x-12.5 min-[1700px]:min-h-162.5 max-[1200px]:gap-x-5 max-[1200px]:min-h-120 max-[960px]:px-0 max-[960px]:py-13 max-[680px]:grid-cols-1 max-[680px]:pt-11.5 max-[680px]:pr-0 max-[680px]:pb-7.5 max-[680px]:pl-0 max-[680px]:gap-7.5">
				<div className="[&_h1]:text-[clamp(72px,_7.3vw,_112px)] [&_h1]:leading-[0.96] [&_h1]:font-[560] [&_h1]:mx-0 [&_h1]:my-7.5 [&_p]:text-[clamp(16px,_1.5vw,_21px)] [&_p]:leading-[1.5] [&_p]:tracking-[-0.025em] min-[1700px]:[&_h1]:text-[130px] max-[1200px]:[&_h1]:text-[85px] max-[1200px]:[&>.eyebrow]:text-[8px] max-[960px]:[&_h1]:text-[74px] max-[960px]:[&_p]:text-[16px] max-[680px]:[&>.eyebrow]:text-[8px] max-[680px]:[&_h1]:text-[clamp(64px,_15vw,_90px)] max-[680px]:[&_h1]:mx-0 max-[680px]:[&_h1]:my-6.25 max-[680px]:[&_p]:text-[18px]">
					<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
						<span className="inline-block w-1.25 h-1.25 rounded-full bg-current shrink-0" />{" "}
						A PERSONAL BOOK OF POSSIBILITIES
					</span>
					<h1>
						Money, in
						<br />
						good shape.
					</h1>
					<p>
						A little intention. A little structure.
						<br />
						<span className="text-muted-foreground">
							More room for the life you want.
						</span>
					</p>
					<div className="flex items-center gap-3 mt-8.5 max-[1200px]:gap-1 max-[1200px]:[&_[data-slot=button]]:text-[11px] max-[1200px]:[&_[data-slot=button]]:px-3.75 max-[1200px]:[&_[data-slot=button]]:py-2.5 max-[960px]:flex-wrap max-[960px]:gap-2 max-[680px]:mt-7">
						<Button
							variant="default"
							onClick={() => navigate({ to: "/budget" })}
						>
							Shape your month <ArrowRight size={17} />
						</Button>
						<Button variant="ghost" onClick={() => openTransaction()}>
							<Plus size={17} /> Add transaction
						</Button>
					</div>
				</div>
				<div className="[align-self:stretch] flex flex-col justify-center min-w-0 [&>.shape]:w-full [&>.shape]:max-h-97.5 [&>.shape]:[transform:scale(0.95)] [&>.shape]:text-[#babcaf] min-[1700px]:[&>.shape]:max-h-115 max-[960px]:[&>.shape]:w-[110%] max-[960px]:[&>.shape]:ml-[-5%] max-[680px]:h-62.5 max-[680px]:mt-3.75 max-[680px]:[&>.shape]:w-full max-[680px]:[&>.shape]:h-56.25 max-[680px]:[&>.shape]:m-0">
					<Shape />
					<span className="flex justify-between mt-6.5 gap-2.5 text-subtle text-[8px] tracking-[0.11em] max-[1200px]:text-[7px] max-[960px]:flex-col max-[960px]:text-right max-[680px]:mt-2 max-[680px]:flex-row max-[680px]:text-[6px]">
						<span>FIG. 01 — BUILDING BLOCKS</span>
						<span>EVERY LITTLE BIT ADDS UP.</span>
					</span>
				</div>
			</section>
			<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80">
				<div className="pill inline-flex items-center gap-1.75 border border-border px-3.5 py-1.75 rounded-full text-[10px] text-muted-foreground tracking-[0.04em]">
					<span className="inline-block w-1.25 h-1.25 rounded-full bg-current shrink-0" />{" "}
					{doc.name}
				</div>
				<MonthPicker />
			</div>
			<div className="grid grid-cols-3 mt-6 border-t border-b border-border [&+.section-top]:mt-10 max-[680px]:grid-cols-1">
				<Stat
					label="Ready to assign"
					value={money(summary.readyToAssign)}
					note={
						summary.readyToAssign < 0
							? "Your plan needs a little rebalancing"
							: "Give these funds a purpose"
					}
					negative={summary.readyToAssign < 0}
				/>
				<Stat
					label="Available in envelopes"
					value={money(summary.available)}
					note="Your category balances, including rollover"
				/>
				<Stat
					label="Spent this month"
					value={money(summary.expenses)}
					note={`${money(summary.income)} came in this month`}
				/>
			</div>
			<section className="mt-15.5 max-[680px]:mt-10.5">
				<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80">
					<div>
						<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
							01 / THINGS YOU'RE BUILDING
						</span>
						<h2>Small steps. Real possibilities.</h2>
					</div>
					<SectionLink onClick={() => navigate({ to: "/targets" })}>
						All targets
					</SectionLink>
				</div>
				{featured.length ? (
					<div className="grid grid-cols-3 gap-7 mt-7 max-[960px]:gap-5 max-[680px]:grid-cols-1 max-[680px]:gap-7.5">
						{featured.map((category, index) => {
							const values = targetProgress(doc, category.id, month);
							const progress = values.percentage / 100;
							return (
								<button
									type="button"
									className="text-left min-w-0 p-0 [&:hover_.shape]:[transform:scale(1.045)_rotate(2deg)] print:break-inside-avoid"
									key={category.id}
									onClick={() => navigate({ to: "/targets" })}
								>
									<div className="relative aspect-[1.4] bg-card flex items-center justify-center overflow-hidden [&>.shape]:w-[85%] [&>.shape]:h-[85%] [&>.shape]:[transition:transform_0.55s_cubic-bezier(0.2,_0.8,_0.2,_1)] max-[680px]:aspect-[1.5]">
										<span className="absolute top-4 left-4.25 text-[9px] text-subtle tabular-nums">
											0{index + 1}
										</span>
										<Shape variant={index + 1} progress={progress} />
										<span className="absolute bottom-3.5 right-4 text-muted-foreground text-[8px] tracking-[0.11em]">
											{Math.round(progress * 100)}% IN PLACE
										</span>
									</div>
									<div className="collection-caption flex items-center justify-between gap-3 pt-5 pr-0 pb-4.25 pl-0 [&_h3]:mb-1.25 [&>svg]:text-muted-foreground max-[960px]:[&_h3]:text-[16px] max-[960px]:[&_.small]:text-[10px] max-[680px]:[&_h3]:text-[20px] max-[680px]:[&_.small]:text-[12px]">
										<div>
											<h3>{category.name}</h3>
											<span className="text-muted-foreground small text-[12px]">
												{money(values.current)} of {money(values.target)}
											</span>
										</div>
										<ArrowRight size={19} />
									</div>
									<div className="progress-track h-0.5 w-full bg-border overflow-hidden [&>span]:block [&>span]:h-full [&>span]:bg-foreground [&>span]:max-w-full [&>span]:[transition:width_0.4s_ease]">
										<span style={{ width: `${progress * 100}%` }} />
									</div>
								</button>
							);
						})}
					</div>
				) : (
					<EmptyState
						title="Make room for something good."
						description="Add a target to start putting money toward what matters."
						action={
							<Button
								variant="outline"
								onClick={() => navigate({ to: "/targets" })}
							>
								Create a target <Plus size={16} />
							</Button>
						}
					/>
				)}
			</section>
			<div className="grid grid-cols-[1.7fr_1fr] gap-16.25 mt-17.5 max-[1200px]:gap-8.75 max-[960px]:grid-cols-1 max-[680px]:mt-12">
				<section>
					<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80">
						<div>
							<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
								02 / IN MOTION
							</span>
							<h2>The latest little things.</h2>
						</div>
						<SectionLink onClick={() => navigate({ to: "/transactions" })}>
							View activity
						</SectionLink>
					</div>
					{recent.length ? (
						<div className="mt-6">
							{recent.map((transaction) => (
								<button
									type="button"
									className="w-full flex items-center gap-3.75 text-left px-0 py-4.25 border-b border-border [&:hover_.activity-name_strong]:underline [&:hover_.activity-name_strong]:underline-offset-0.75 max-[680px]:gap-2.5 max-[680px]:[&>strong]:text-[12px]"
									key={transaction.id}
									onClick={() => openTransaction(transaction)}
								>
									<span className="w-9.25 h-9.25 flex items-center justify-center border border-border rounded-full text-muted-foreground">
										<ArrowDownLeft size={18} />
									</span>
									<span className="activity-name flex flex-col gap-0.75 flex-1 [&_strong]:text-[13px] max-[680px]:[&_strong]:text-[12px] max-[680px]:[&_.small]:text-[10px]">
										<strong>{transaction.payee}</strong>
										<span className="text-muted-foreground small text-[12px]">
											{transaction.transferAccountId
												? "Account transfer"
												: doc.categories.find(
														(category) =>
															category.id === transaction.categoryId,
													)?.name ||
													(transaction.amount >= 0
														? "Ready to assign"
														: "Uncategorized")}
										</span>
									</span>
									<span className="text-muted-foreground small text-[12px] mr-2 max-[680px]:hidden">
										{shortDate(transaction.date)}
									</span>
									<strong className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
										{money(transaction.amount)}
									</strong>
								</button>
							))}
						</div>
					) : (
						<EmptyState
							title="A clean page."
							description="Your transactions for this month will appear here."
						/>
					)}
				</section>
				<aside className="border-l border-border pl-9.5 [&_h2]:mt-3 max-[1200px]:pl-6.25 max-[960px]:border-l-0 max-[960px]:border-t max-[960px]:border-border max-[960px]:pt-7.5 max-[960px]:pr-0 max-[960px]:pb-0 max-[960px]:pl-0 max-[960px]:[&_.mini-accounts]:max-w-125">
					<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
						03 / THE BIGGER PICTURE
					</span>
					<h2>All together.</h2>
					<strong className="text-[43px] font-[450] tracking-[-0.065em] block mt-8 leading-[1.3]">
						{money(summary.netWorth)}
					</strong>
					<span className="text-muted-foreground small text-[12px]">
						Net worth as of {shortDate(throughDate)}
					</span>
					<div className="mini-accounts mt-7.25 mr-0 mb-4.25 ml-0 [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:gap-3.75 [&>div]:px-0 [&>div]:py-3 [&>div]:border-t [&>div]:border-border [&>div]:text-[12px]">
						{doc.accounts
							.filter((account) => !account.closed)
							.slice(0, 4)
							.map((account) => (
								<div key={account.id}>
									<span>{account.name}</span>
									<span className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
										{money(accountBalance(doc, account.id, throughDate))}
									</span>
								</div>
							))}
					</div>
					<SectionLink onClick={() => navigate({ to: "/accounts" })}>
						Your accounts
					</SectionLink>
				</aside>
			</div>
		</>
	);
}
