import { Download } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useReports } from "@/hooks/use-reports";
import { monthLabel } from "@/lib/dates";
import { downloadFile } from "@/lib/download";
import { message } from "@/lib/errors";

export default function Reports() {
	const {
		doc,
		month,
		notify,
		view,
		setView,
		report,
		money,
		largest,
		worthMin,
		worthMax,
		points,
		spending,
		categoryTotal,
		savingsRate,
	} = useReports();
	return (
		<>
			<PageHeading
				index="05"
				title="A little perspective."
				description="Step back. See the patterns. Decide what comes next."
				actions={
					<>
						<MonthPicker />
						<Button
							variant="outline"
							onClick={async () => {
								try {
									const saved = await downloadFile(
										`IcyFinance-report-${month}.json`,
										JSON.stringify(
											{ budget: doc.name, currency: doc.currency, ...report },
											null,
											2,
										),
									);
									if (saved) notify("Monthly report saved.");
								} catch (error) {
									notify(message(error), true);
								}
							}}
						>
							<Download size={16} /> Report
						</Button>
					</>
				}
			/>
			<div className="grid grid-cols-3 mt-6 border-t border-b border-border [&+.section-top]:mt-10 max-[680px]:grid-cols-1">
				<Stat
					label="Money in"
					value={money(report.income)}
					note="Income into your envelope accounts"
				/>
				<Stat
					label="Money out"
					value={money(report.expenses)}
					note="Spending after category refunds"
				/>
				<Stat
					label="Kept for what comes next"
					value={money(report.net)}
					negative={report.net < 0}
					note={
						savingsRate === null
							? "Add income to see your savings rate"
							: `${savingsRate}% of this month's income`
					}
				/>
			</div>
			<section className="mt-15.5 max-[680px]:mt-10.5 border-b border-border pb-5">
				<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80">
					<div>
						<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
							01 / SIX MONTHS IN VIEW
						</span>
						<h2>
							{view === "flow"
								? "The rhythm of your money."
								: "Your bigger picture."}
						</h2>
					</div>
					<ToggleGroup
						aria-label="Report view"
						value={[view]}
						onValueChange={([value]) => {
							if (value) setView(value);
						}}
						variant="outline"
						size="sm"
						className="flex-wrap"
					>
						{(
							[
								["flow", "Cash flow"],
								["worth", "Net worth"],
							] as const
						).map(([value, label]) => (
							<ToggleGroupItem
								key={value}
								value={value}
								className="rounded-full px-4 text-[10px] uppercase tracking-wide data-pressed:bg-primary data-pressed:text-primary-foreground"
							>
								{label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
				{view === "flow" ? (
					<>
						<div className="flex justify-end gap-5.5 mt-7 mr-0 mb-0 ml-0 text-[11px] text-muted-foreground [&_span]:flex [&_span]:items-center [&_span]:gap-1.75 [&_i]:w-2.75 [&_i]:h-2.75 [&_i]:inline-block">
							<span>
								<i className="bg-foreground" /> Income
							</span>
							<span>
								<i className="bg-[repeating-linear-gradient(_90deg,_var(--foreground)_0_1px,_transparent_1px_3px_)]" />{" "}
								Expenses
							</span>
						</div>
						<div
							className="grid grid-cols-[repeat(6,_1fr)] gap-6.25 pt-7.5 pr-8.75 pb-3.75 pl-8.75 bg-[repeating-linear-gradient(_0deg,_transparent_0px_59px,_var(--border)_59px_60px_)] [background-size:100%_calc(100%_-_42px)] [background-repeat:no-repeat] max-[680px]:pt-6.25 max-[680px]:pr-0 max-[680px]:pb-2.5 max-[680px]:pl-0 max-[680px]:gap-3"
							role="img"
							aria-label="Six month income and expenses comparison. Exact figures in the table below."
						>
							{report.history.map((item) => (
								<div
									className="min-w-0 flex items-center flex-col [&>span]:mt-5.5 [&>span]:text-[11px] [&>span]:text-muted-foreground max-[680px]:[&>span]:text-[10px]"
									key={item.month}
								>
									<div className="flex items-end gap-2.25 h-57.5 w-[70%] max-[680px]:h-45 max-[680px]:w-[76%] max-[680px]:gap-1.25">
										<div
											className="flex-1 min-h-0.25 max-w-9.5 bg-foreground opacity-87"
											style={{
												height: `${(Math.max(0, item.income) / largest) * 100}%`,
											}}
											title={`Income: ${money(item.income)}`}
										/>
										<div
											className="flex-1 min-h-0.25 max-w-9.5 bg-[repeating-linear-gradient(_90deg,_var(--foreground)_0_1px,_transparent_1px_4px_)]"
											style={{
												height: `${(Math.abs(item.expenses) / largest) * 100}%`,
											}}
											title={`Expenses: ${money(item.expenses)}`}
										/>
									</div>
									<span>
										{new Date(`${item.month}-15T12:00:00`).toLocaleDateString(
											undefined,
											{ month: "short" },
										)}
									</span>
								</div>
							))}
						</div>
					</>
				) : (
					<div className="relative pt-7.5 pr-0 pb-2.5 pl-0 [&>strong]:text-[40px] [&>strong]:tracking-[-0.06em] [&>strong]:block [&>strong]:font-[450] [&>svg]:w-full [&>svg]:h-77.5 [&>svg]:mt-2.5 [&>svg]:text-foreground max-[680px]:[&>svg]:h-52.5">
						<strong>{money(report.netWorth)}</strong>
						<span className="text-muted-foreground small text-[12px]">
							All accounts, including tracking accounts
						</span>
						<svg
							viewBox="0 0 740 285"
							role="img"
							aria-label="Six month net worth trend. Exact figures in the table below."
						>
							<defs>
								<pattern
									id="worth-lines"
									width="6"
									height="6"
									patternUnits="userSpaceOnUse"
								>
									<path
										d="M0 0V6"
										stroke="currentColor"
										strokeWidth=".5"
										opacity=".22"
									/>
								</pattern>
							</defs>
							<path
								d={`M40 260 L${points.replaceAll(" ", " L")} L700 260 Z`}
								fill="url(#worth-lines)"
							/>
							<polyline
								points={points}
								stroke="currentColor"
								strokeWidth="2"
								fill="none"
							/>
							{report.history.map((item, index) => (
								<g key={item.month}>
									<circle
										cx={40 + index * 132}
										cy={
											240 -
											((item.netWorth - worthMin) / (worthMax - worthMin)) * 190
										}
										r="4"
										fill="var(--background)"
										stroke="currentColor"
									/>
									<text
										x={40 + index * 132}
										y="280"
										textAnchor="middle"
										fill="currentColor"
										fontSize="12"
									>
										{new Date(`${item.month}-15T12:00:00`).toLocaleDateString(
											undefined,
											{ month: "short" },
										)}
									</text>
								</g>
							))}
						</svg>
					</div>
				)}
				<details className="mt-5.5 text-[11px] text-muted-foreground [&_summary]:cursor-pointer [&_summary]:w-[fit-content] [&_summary]:px-0 [&_summary]:py-2 [&_.table-scroll]:mt-3.75">
					<summary>View the numbers</summary>
					<div className="table-scroll w-full overflow-x-auto">
						<Table className="text-xs [&_td]:py-4 [&_th]:px-3 [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-wide [&_thead]:border-t max-[680px]:min-w-157.5">
							<TableHeader>
								<TableRow>
									<TableHead scope="col">Month</TableHead>
									<TableHead scope="col">Income</TableHead>
									<TableHead scope="col">Expenses</TableHead>
									<TableHead scope="col">Net worth</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{report.history.map((item) => (
									<TableRow key={item.month}>
										<TableHead scope="row">{monthLabel(item.month)}</TableHead>
										<TableCell className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
											{money(item.income)}
										</TableCell>
										<TableCell className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
											{money(item.expenses)}
										</TableCell>
										<TableCell className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
											{money(item.netWorth)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</details>
			</section>
			<section className="mt-15.5 max-[680px]:mt-10.5 grid grid-cols-[1fr_1.15fr] gap-17.5 [&_h2]:mt-3.75 [&_h2]:mr-0 [&_h2]:mb-5 [&_h2]:ml-0 [&_p]:text-[13px] [&_p]:leading-[1.8] max-[960px]:gap-10 max-[680px]:grid-cols-1 max-[680px]:gap-7.5">
				<div>
					<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
						02 / WHERE IT WENT
					</span>
					<h2>The things you made room for.</h2>
					<p className="text-muted-foreground">
						Categorized spending in {monthLabel(month)}.<br />
						Refunds reduce each category’s total.
					</p>
					<div
						className="w-60 h-60 rounded-full grid place-items-center mt-9.5 mr-auto mb-0 ml-auto border border-border [&>div]:w-[72%] [&>div]:h-[72%] [&>div]:rounded-full [&>div]:bg-background [&>div]:flex [&>div]:items-center [&>div]:justify-center [&>div]:flex-col [&>div]:gap-2.25 [&_strong]:text-[27px] [&_strong]:tracking-[-0.05em] [&_.eyebrow]:text-[8px]"
						style={{
							background:
								categoryTotal > 0
									? "repeating-conic-gradient(var(--foreground) 0deg 1deg, transparent 1deg 3deg)"
									: undefined,
						}}
					>
						<div>
							<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
								CATEGORIZED
							</span>
							<strong>{money(categoryTotal)}</strong>
						</div>
					</div>
				</div>
				<div>
					{spending.length ? (
						<div className="spending-list">
							{spending.map((item, index) => (
								<div
									className="px-0 py-5 border-b border-border [&>div:first-child]:flex [&>div:first-child]:gap-3.75 [&>div:first-child]:items-center [&>div:first-child]:text-[12px] [&>div:first-child>:last-child]:ml-auto [&_.progress-track]:mt-3.25 [&_.progress-track]:mr-0 [&_.progress-track]:mb-1.75 [&_.progress-track]:ml-0 [&_.progress-track]:h-0.5 [&>.small]:text-[10px]"
									key={item.id}
								>
									<div>
										<span className="text-muted-foreground small text-[12px]">
											{String(index + 1).padStart(2, "0")}
										</span>
										<strong>{item.name}</strong>
										<span className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
											{money(item.spent)}
										</span>
									</div>
									<div className="progress-track h-0.5 w-full bg-border overflow-hidden [&>span]:block [&>span]:h-full [&>span]:bg-foreground [&>span]:max-w-full [&>span]:[transition:width_0.4s_ease]">
										<span
											style={{
												width: `${categoryTotal > 0 ? (item.spent / categoryTotal) * 100 : 0}%`,
											}}
										/>
									</div>
									<span className="text-muted-foreground small text-[12px]">
										{categoryTotal > 0
											? Math.round((item.spent / categoryTotal) * 100)
											: 0}
										% of categorized spending
									</span>
								</div>
							))}
						</div>
					) : (
						<EmptyState
							title="A pattern is taking shape."
							description="Categorize your transactions to see where your money goes."
						/>
					)}
				</div>
			</section>
			<p className="text-subtle text-[11px] leading-[1.75] mt-6.25 max-w-200">
				Internal transfers do not count as income or spending. Transfers to or
				from tracking accounts affect envelope cash flow. Net worth includes
				opening balances.
			</p>
		</>
	);
}
