import { ArrowRightLeft, Check, ChevronDown, Plus } from "lucide-react";
import AssignmentInput from "@/components/budget/assignment-input";
import CategoryEditor from "@/components/budget/category-editor";
import MonthlyTemplateDialog from "@/components/budget/monthly-template-dialog";
import MoveMoneyDialog from "@/components/budget/move-money-dialog";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useBudget } from "@/hooks/use-budget";
import { autoAssign, categorySummary } from "@/lib/budget";
import { message } from "@/lib/errors";

export default function Budget() {
	const {
		doc,
		month,
		update,
		notify,
		filter,
		setFilter,
		editor,
		setEditor,
		moving,
		setMoving,
		templateOpen,
		setTemplateOpen,
		collapsed,
		setCollapsed,
		summary,
		money,
		visible,
		groups,
	} = useBudget();
	return (
		<>
			<PageHeading
				title="Budget"
				actions={
					<>
						<MonthPicker />
						<Button variant="outline" onClick={() => setEditor("new")}>
							<Plus size={16} /> Add category
						</Button>
					</>
				}
			/>
			<div className="stats-row">
				<Stat
					label="Ready to assign"
					value={money(summary.readyToAssign)}
					negative={summary.readyToAssign < 0}
					note={
						summary.readyToAssign === 0
							? "All funds assigned"
							: "After future assignments"
					}
				/>
				<Stat label="Assigned this month" value={money(summary.assigned)} />
				<Stat label="Available to spend" value={money(summary.available)} />
			</div>
			{summary.uncategorized > 0 && (
				<p className="notice px-5 py-4 border border-border bg-card text-sm leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
					{money(summary.uncategorized)} in spending needs a category.
					Categorize it in Transactions.
				</p>
			)}
			<div className="section-top my-4">
				<ToggleGroup
					aria-label="Filter categories"
					value={[filter]}
					onValueChange={([value]) => {
						if (value) setFilter(value);
					}}
					variant="outline"
					size="sm"
					className="flex-wrap"
				>
					{(
						[
							["all", "All categories"],
							["needs", "Needs funding"],
							["overspent", "Overspent"],
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
				<div className="button-row flex items-center gap-2.5 flex-wrap">
					<Button variant="ghost" onClick={() => setTemplateOpen(true)}>
						Monthly template
					</Button>
					<Button
						variant="ghost"
						onClick={() => setMoving(true)}
						disabled={doc.categories.length < 2}
					>
						<ArrowRightLeft size={15} /> Move money
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							try {
								update((current) => autoAssign(current, month));
								notify("Available money assigned toward your targets.");
							} catch (error) {
								notify(message(error), true);
							}
						}}
						disabled={summary.readyToAssign <= 0}
					>
						<Check size={15} /> Fund targets
					</Button>
				</div>
			</div>
			<div className="border-b border-border max-[680px]:overflow-x-auto">
				<div className="grid grid-cols-[minmax(190px,_1fr)_150px_150px_160px] items-center gap-4 px-3 py-2 text-sm font-medium text-muted-foreground border-t border-b border-border [&>:not(:first-child)]:text-right max-[1200px]:grid-cols-[minmax(190px,_1fr)_110px_115px_120px] max-[1200px]:gap-2.5 max-[680px]:grid-cols-[minmax(155px,_1fr)_85px_85px_100px] max-[680px]:min-w-128.75 max-[680px]:pl-2.25 max-[680px]:pr-2.25 max-[680px]:gap-1.5">
					<span>Category</span>
					<span>Assigned</span>
					<span>Activity</span>
					<span>Available</span>
				</div>
				{groups.map((group) => (
					<section className="mt-1.25 max-[680px]:min-w-128.75" key={group}>
						<button
							type="button"
							className="flex w-full items-center gap-2.5 px-4 py-3 text-muted-foreground text-sm bg-card [&>:last-child]:ml-auto [&>:last-child]:text-sm [&_svg]:[transition:transform_0.15s]"
							aria-expanded={!collapsed.includes(group)}
							onClick={() =>
								setCollapsed((current) =>
									current.includes(group)
										? current.filter((item) => item !== group)
										: [...current, group],
								)
							}
						>
							<ChevronDown
								size={15}
								style={{
									transform: collapsed.includes(group)
										? "rotate(-90deg)"
										: undefined,
								}}
							/>
							<span>{group}</span>
							<span className="text-muted-foreground">
								{visible.filter((item) => item.group === group).length}
							</span>
						</button>
						{!collapsed.includes(group) &&
							visible
								.filter((item) => item.group === group)
								.map((category) => {
									const values = categorySummary(doc, category.id, month);
									const progress =
										values.target > 0
											? Math.min(
													100,
													Math.max(
														0,
														((category.target?.cadence === "monthly"
															? values.assigned
															: values.available) /
															values.target) *
															100,
													),
												)
											: 0;
									return (
										<div
											className="grid grid-cols-[minmax(190px,_1fr)_150px_150px_160px] items-center gap-4 min-h-16 px-3 py-2 border-b border-border [&:last-child]:border-b-0 [&>.numeric]:text-right [&>.numeric]:text-sm max-[1200px]:grid-cols-[minmax(190px,_1fr)_110px_115px_120px] max-[1200px]:gap-2.5 max-[680px]:grid-cols-[minmax(155px,_1fr)_85px_85px_100px] max-[680px]:min-w-128.75 max-[680px]:pl-2.25 max-[680px]:pr-2.25 max-[680px]:gap-1.5 max-[680px]:[&>.numeric]:text-sm print:break-inside-avoid"
											key={category.id}
										>
											<button
												type="button"
												className="flex items-center gap-4 p-0 text-left min-w-0 [&>span:last-child]:flex [&>span:last-child]:flex-col [&>span:last-child]:gap-1.25 [&_strong]:text-sm [&_.small]:text-sm [&:hover_strong]:underline [&:hover_strong]:underline-offset-1 max-[680px]:[&_strong]:text-sm max-[680px]:[&_.small]:text-sm"
												onClick={() => setEditor(category)}
											>
												<span>
													<strong>{category.name}</strong>
													<span className="text-muted-foreground small text-sm">
														{values.needed > 0
															? `${money(values.needed)} to go`
															: category.target
																? "Funded"
																: category.note || ""}
													</span>
												</span>
											</button>
											<AssignmentInput
												key={`${category.id}-${month}-${values.assigned}`}
												category={category}
												amount={values.assigned}
											/>
											<span className="numeric tabular-nums whitespace-nowrap text-muted-foreground">
												{money(values.activity)}
											</span>
											<div className="flex items-end flex-col gap-2.25 [&_.progress-track]:max-w-18 [&_.progress-track]:h-0.25 [&_.progress-track]:opacity-60">
												<span
													className={`px-1 py-1 text-sm tabular-nums whitespace-nowrap max-[680px]:text-sm max-[680px]:px-2 max-[680px]:py-1.25 ${values.available < 0 ? "text-destructive!" : ""}`}
												>
													{money(values.available)}
												</span>
												{category.target && (
													<div className="progress-track h-0.5 w-full bg-border overflow-hidden [&>span]:block [&>span]:h-full [&>span]:bg-foreground [&>span]:max-w-full [&>span]:[transition:width_0.4s_ease]">
														<span style={{ width: `${progress}%` }} />
													</div>
												)}
											</div>
										</div>
									);
								})}
					</section>
				))}
			</div>
			{!visible.length && (
				<EmptyState
					title={
						doc.categories.length ? "No matching categories" : "No categories"
					}
					description={
						doc.categories.length
							? "No categories match this filter."
							: "Add a category to start assigning money."
					}
					action={
						!doc.categories.length && (
							<Button variant="outline" onClick={() => setEditor("new")}>
								Create category
							</Button>
						)
					}
				/>
			)}
			<p className="text-subtle text-sm leading-[1.75] mt-6.25 max-w-200">
				Available = money carried forward + assigned + activity. Negative
				balances carry forward until you cover them.
			</p>
			{editor && (
				<CategoryEditor
					category={editor === "new" ? undefined : editor}
					onClose={() => setEditor(null)}
				/>
			)}
			{moving && <MoveMoneyDialog onClose={() => setMoving(false)} />}
			{templateOpen && (
				<MonthlyTemplateDialog onClose={() => setTemplateOpen(false)} />
			)}
		</>
	);
}
