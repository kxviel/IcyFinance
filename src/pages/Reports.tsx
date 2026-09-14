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
import { useReports } from "@/hooks/use-reports";
import { monthLabel } from "@/lib/dates";
import { downloadFile } from "@/lib/download";
import { message } from "@/lib/errors";

export default function Reports() {
	const {
		doc,
		month,
		notify,
		report,
		money,
		spending,
		categoryTotal,
		savingsRate,
	} = useReports();
	return (
		<>
			<PageHeading
				title="Reports"
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
									if (saved) notify("Report exported.");
								} catch (error) {
									notify(message(error), true);
								}
							}}
						>
							<Download size={15} /> Export report
						</Button>
					</>
				}
			/>
			<div className="stats-row">
				<Stat label="Income" value={money(report.income)} />
				<Stat label="Expenses" value={money(report.expenses)} />
				<Stat
					label="Net income"
					value={money(report.net)}
					negative={report.net < 0}
					note={
						savingsRate === null ? undefined : `${savingsRate}% savings rate`
					}
				/>
			</div>
			<section className="mt-5">
				<h2 className="mb-3">Monthly summary</h2>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Month</TableHead>
							<TableHead className="text-right">Income</TableHead>
							<TableHead className="text-right">Expenses</TableHead>
							<TableHead className="text-right">Net income</TableHead>
							<TableHead className="text-right">Net worth</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{report.history.map((item) => (
							<TableRow key={item.month}>
								<TableCell>{monthLabel(item.month)}</TableCell>
								<TableCell className="text-right tabular-nums">
									{money(item.income)}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{money(item.expenses)}
								</TableCell>
								<TableCell
									className={`text-right tabular-nums ${item.net < 0 ? "text-destructive" : ""}`}
								>
									{money(item.net)}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{money(item.netWorth)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</section>
			<section className="mt-6">
				<div className="section-top my-4">
					<h2>Spending by category</h2>
					<span className="text-sm tabular-nums">
						{money(categoryTotal)} total
					</span>
				</div>
				{spending.length ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Category</TableHead>
								<TableHead>Group</TableHead>
								<TableHead className="text-right">Spent</TableHead>
								<TableHead className="text-right">Share</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{spending.map((item) => (
								<TableRow key={item.id}>
									<TableCell>{item.name}</TableCell>
									<TableCell className="text-muted-foreground">
										{item.group}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{money(item.spent)}
									</TableCell>
									<TableCell className="text-right tabular-nums text-muted-foreground">
										{Math.round((item.spent / categoryTotal) * 100)}%
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<EmptyState
						title="No categorized spending"
						description="Categorize transactions to see spending totals."
					/>
				)}
				{report.expenses !== categoryTotal && (
					<p className="mt-2 text-sm text-muted-foreground">
						Category totals exclude uncategorized spending. Refunds reduce
						expenses.
					</p>
				)}
			</section>
		</>
	);
}
