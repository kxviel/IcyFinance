import { ArrowRightLeft, ChevronDown, Plus, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { MonthPicker } from "@/components/MonthPicker";
import { PageHeading } from "@/components/PageHeading";
import { Stat } from "@/components/Stat";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { message } from "@/lib/utils";
import AssignmentInput from "@/modules/Budget/AssignmentInput";
import CategoryEditor from "@/modules/Budget/CategoryEditor";
import MoveMoneyDialog from "@/modules/Budget/MoveMoneyDialog";
import { useBudget } from "@/modules/Budget/useBudget";
import { autoAssign, categorySummary } from "@/modules/Workspace/budget.utils";

const Budget = () => {
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
				index="01"
				title="A place for every penny."
				description="Give your money a purpose. Make room for what matters."
				actions={
					<>
						<MonthPicker />
						<Button variant="outline" onClick={() => setEditor("new")}>
							<Plus size={16} /> Category
						</Button>
					</>
				}
			/>
			<div className="grid grid-cols-3 mt-6 border-t border-b border-border [&+.section-top]:mt-10 max-[680px]:grid-cols-1 budget-stats">
				<Stat
					label="Ready to assign"
					value={money(summary.readyToAssign)}
					negative={summary.readyToAssign < 0}
					note={
						summary.readyToAssign === 0
							? "Everything has a place. Nicely done."
							: "Your unassigned money, after future plans"
					}
				/>
				<Stat label="Assigned this month" value={money(summary.assigned)} />
				<Stat label="Available to spend" value={money(summary.available)} />
			</div>
			{summary.uncategorized > 0 && (
				<p className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
					{money(summary.uncategorized)} in spending needs a category. Visit
					Activity to put it in the right envelope.
				</p>
			)}
			<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80 mt-8.75 mr-0 mb-6.25 ml-0 max-[1200px]:flex-wrap max-[680px]:[&_.pill-tabs]:gap-1.25">
				<ToggleGroup
					aria-label="Filter envelopes"
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
							["all", "All envelopes"],
							["needs", "Needs funding"],
							["overspent", "Overspent"],
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
				<div className="button-row flex items-center gap-2.5 flex-wrap">
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
						<Sparkles size={15} /> Fund targets
					</Button>
				</div>
			</div>
			<div className="border-b border-border max-[680px]:overflow-x-auto">
				<div className="grid grid-cols-[minmax(190px,_1fr)_150px_150px_160px] items-center gap-4 px-5 py-3.5 text-[9px] tracking-[0.1em] text-muted-foreground border-t border-b border-border [&>:not(:first-child)]:text-right max-[1200px]:grid-cols-[minmax(190px,_1fr)_110px_115px_120px] max-[1200px]:gap-2.5 max-[680px]:grid-cols-[minmax(155px,_1fr)_85px_85px_100px] max-[680px]:min-w-128.75 max-[680px]:pl-2.25 max-[680px]:pr-2.25 max-[680px]:gap-1.5">
					<span>ENVELOPE</span>
					<span>ASSIGNED</span>
					<span>ACTIVITY</span>
					<span>AVAILABLE</span>
				</div>
				{groups.map((group) => (
					<section className="mt-1.25 max-[680px]:min-w-128.75" key={group}>
						<button
							type="button"
							className="flex w-full items-center gap-2.5 px-3.5 py-4.75 text-muted-foreground text-[11px] tracking-[0.025em] bg-card [&>:last-child]:ml-auto [&>:last-child]:text-[10px] [&_svg]:[transition:transform_0.15s]"
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
											className="grid grid-cols-[minmax(190px,_1fr)_150px_150px_160px] items-center gap-4 min-h-21.25 px-5 py-3.5 border-b border-border [&:last-child]:border-b-0 [&>.numeric]:text-right [&>.numeric]:text-[12px] max-[1200px]:grid-cols-[minmax(190px,_1fr)_110px_115px_120px] max-[1200px]:gap-2.5 max-[680px]:grid-cols-[minmax(155px,_1fr)_85px_85px_100px] max-[680px]:min-w-128.75 max-[680px]:pl-2.25 max-[680px]:pr-2.25 max-[680px]:gap-1.5 max-[680px]:[&>.numeric]:text-[10px] print:break-inside-avoid"
											key={category.id}
										>
											<button
												type="button"
												className="flex items-center gap-4 p-0 text-left min-w-0 [&>span:last-child]:flex [&>span:last-child]:flex-col [&>span:last-child]:gap-1.25 [&_strong]:text-[13px] [&_.small]:text-[10px] [&:hover_strong]:underline [&:hover_strong]:underline-offset-1 max-[680px]:[&_strong]:text-[12px] max-[680px]:[&_.small]:text-[9px]"
												onClick={() => setEditor(category)}
											>
												<span
													className={`w-5 h-5 block border border-subtle shrink-0 bg-[repeating-linear-gradient(_90deg,_transparent_0px_3px,_var(--muted)_3px_4px_)] max-[680px]:hidden symbol-${doc.categories.indexOf(category) % 4}`}
												/>
												<span>
													<strong>{category.name}</strong>
													<span className="text-muted-foreground small text-[12px]">
														{values.needed > 0
															? `${money(values.needed)} to go`
															: category.target
																? "Target in place"
																: category.note || "A little room to breathe"}
													</span>
												</span>
											</button>
											<AssignmentInput
												key={`${category.id}-${month}-${values.assigned}`}
												category={category}
												amount={values.assigned}
											/>
											<span className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap text-muted-foreground">
												{money(values.activity)}
											</span>
											<div className="flex items-end flex-col gap-2.25 [&_.progress-track]:max-w-18 [&_.progress-track]:h-0.25 [&_.progress-track]:opacity-60">
												<span
													className={`bg-accent rounded-full px-3 py-1.25 text-[11px] tabular-nums whitespace-nowrap max-[680px]:text-[10px] max-[680px]:px-2 max-[680px]:py-1.25 ${values.available < 0 ? "text-destructive!" : ""}`}
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
						doc.categories.length
							? "Everything looks clear."
							: "Your first envelope."
					}
					description={
						doc.categories.length
							? "No envelopes match this filter."
							: "Create a few categories, then give each one a little money."
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
			<p className="text-subtle text-[11px] leading-[1.75] mt-6.25 max-w-200">
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
		</>
	);
};

export default Budget;
