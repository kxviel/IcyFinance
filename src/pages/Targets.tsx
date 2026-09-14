import { Plus } from "lucide-react";
import CategoryEditor from "@/components/budget/category-editor";
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
import { useTargets } from "@/hooks/use-targets";
import { targetProgress } from "@/lib/budget";
import { shortDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export default function Targets() {
	const {
		doc,
		month,
		navigate,
		editor,
		setEditor,
		filter,
		setFilter,
		targets,
		total,
		complete,
		visible,
	} = useTargets();
	const money = (amount: number) => formatMoney(amount, doc.currency);
	return (
		<>
			<PageHeading
				title="Targets"
				actions={
					<>
						<MonthPicker />
						<Button variant="outline" onClick={() => setEditor("new")}>
							<Plus size={15} /> Add target
						</Button>
					</>
				}
			/>
			<div className="stats-row">
				<Stat label="Active targets" value={String(targets.length)} />
				<Stat label="Fully funded" value={String(complete)} />
				<Stat label="Needed this month" value={money(total)} />
			</div>
			<div className="section-top my-4">
				<ToggleGroup
					aria-label="Filter targets"
					value={[filter]}
					onValueChange={([value]) => {
						if (value) setFilter(value);
					}}
					variant="outline"
					size="sm"
					className="flex-wrap"
				>
					{[
						["all", "All"],
						["monthly", "Monthly"],
						["balance", "Balance"],
					].map(([value, label]) => (
						<ToggleGroupItem key={value} value={value}>
							{label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate({ to: "/budget" })}
				>
					Assign money
				</Button>
			</div>
			{visible.length ? (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Category</TableHead>
							<TableHead>Frequency / due date</TableHead>
							<TableHead className="text-right">Funded</TableHead>
							<TableHead className="text-right">Target</TableHead>
							<TableHead className="text-right">Needed this month</TableHead>
							<TableHead className="text-right">Progress</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{visible.map((category) => {
							const progress = targetProgress(doc, category.id, month);
							return (
								<TableRow key={category.id}>
									<TableCell>
										<button
											type="button"
											onClick={() => setEditor(category)}
											className="text-left hover:underline"
										>
											<span className="block font-medium">{category.name}</span>
											<span className="text-sm text-muted-foreground">
												{category.group}
											</span>
										</button>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{progress.cadence === "monthly"
											? "Monthly"
											: progress.dueDate
												? `${shortDate(progress.dueDate)} ${progress.dueDate.slice(0, 4)}`
												: "No deadline"}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{money(progress.current)}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{money(progress.target)}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{money(progress.needed)}
									</TableCell>
									<TableCell className="text-right tabular-nums text-muted-foreground">
										{Math.round(progress.percentage)}%
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			) : (
				<EmptyState
					title="No targets"
					description="Add a funding target to a category."
					action={
						<Button variant="outline" onClick={() => setEditor("new")}>
							Add target
						</Button>
					}
				/>
			)}
			{editor && (
				<CategoryEditor
					category={editor === "new" ? undefined : editor}
					onClose={() => setEditor(null)}
				/>
			)}
		</>
	);
}
