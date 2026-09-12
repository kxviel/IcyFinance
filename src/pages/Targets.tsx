import { ArrowUpRight, Plus } from "lucide-react";
import CategoryEditor from "@/components/budget/category-editor";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import { Shape } from "@/components/shape";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
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
	return (
		<>
			<PageHeading
				index="04"
				title="Make room for someday."
				description="The everyday things. The once-in-a-lifetime things. A place for both."
				actions={
					<>
						<MonthPicker />
						<Button variant="default" onClick={() => setEditor("new")}>
							<Plus size={16} /> Target
						</Button>
					</>
				}
			/>
			<div className="grid grid-cols-3 mt-6 border-t border-b border-border [&+.section-top]:mt-10 max-[680px]:grid-cols-1">
				<Stat
					label="Things you're building"
					value={String(targets.length).padStart(2, "0")}
					note="A little progress is still progress"
				/>
				<Stat
					label="Targets in place"
					value={String(complete).padStart(2, "0")}
					note="Fully funded for this month"
				/>
				<Stat
					label="Suggested this month"
					value={formatMoney(total, doc.currency)}
					note="To keep every target on track"
				/>
			</div>
			<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80 mt-15.5 max-[680px]:mt-10.5">
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
					{(
						[
							["all", "The whole collection"],
							["monthly", "Every month"],
							["balance", "Something bigger"],
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
				<Button variant="ghost" onClick={() => navigate({ to: "/budget" })}>
					Assign money <ArrowUpRight size={16} />
				</Button>
			</div>
			<div className="grid grid-cols-3 gap-7 mt-7 max-[960px]:gap-5 max-[680px]:grid-cols-1 max-[680px]:gap-7.5 gap-y-10.5">
				{visible.map((category, index) => {
					const progress = targetProgress(doc, category.id, month);
					return (
						<button
							type="button"
							className="text-left min-w-0 p-0 [&:hover_.shape]:[transform:scale(1.045)_rotate(2deg)] print:break-inside-avoid flex flex-col [&>*]:w-full [&_.collection-caption]:items-end [&_.collection-caption]:pb-3 [&_.collection-caption_h3]:mt-2.25 [&_.collection-caption_h3]:mr-0 [&_.collection-caption_h3]:mb-0 [&_.collection-caption_h3]:ml-0 [&_.collection-caption_.eyebrow]:text-[9px]"
							key={category.id}
							onClick={() => setEditor(category)}
						>
							<div className="relative aspect-[1.4] bg-card flex items-center justify-center overflow-hidden [&>.shape]:w-[85%] [&>.shape]:h-[85%] [&>.shape]:[transition:transform_0.55s_cubic-bezier(0.2,_0.8,_0.2,_1)] max-[680px]:aspect-[1.5]">
								<span className="absolute top-4 left-4.25 text-[9px] text-subtle tabular-nums">
									{String(index + 1).padStart(2, "0")}
								</span>
								<Shape
									variant={index + 1}
									progress={progress.percentage / 100}
								/>
								<span className="absolute bottom-3.5 right-4 text-muted-foreground text-[8px] tracking-[0.11em]">
									{progress.percentage >= 100
										? "IN GOOD SHAPE"
										: `${Math.round(progress.percentage)}% IN PLACE`}
								</span>
							</div>
							<div className="collection-caption flex items-center justify-between gap-3 pt-5 pr-0 pb-4.25 pl-0 [&_h3]:mb-1.25 [&>svg]:text-muted-foreground max-[960px]:[&_h3]:text-[16px] max-[960px]:[&_.small]:text-[10px] max-[680px]:[&_h3]:text-[20px] max-[680px]:[&_.small]:text-[12px]">
								<div>
									<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
										{category.group}
									</span>
									<h3>{category.name}</h3>
								</div>
								<ArrowUpRight size={18} />
							</div>
							<div className="flex [align-items:baseline] gap-2 mt-1.25 mr-0 mb-4.5 ml-0 [&_strong]:text-[24px] [&_strong]:tracking-[-0.045em] [&>span]:text-[11px]">
								<strong>{formatMoney(progress.current, doc.currency)}</strong>
								<span className="text-muted-foreground">
									of {formatMoney(progress.target, doc.currency)}
								</span>
							</div>
							<div className="progress-track h-0.5 w-full bg-border overflow-hidden [&>span]:block [&>span]:h-full [&>span]:bg-foreground [&>span]:max-w-full [&>span]:[transition:width_0.4s_ease]">
								<span style={{ width: `${progress.percentage}%` }} />
							</div>
							<div className="flex justify-between gap-2 text-muted-foreground text-[10px] mt-3.25">
								<span>
									{category.target?.cadence === "monthly"
										? "Every month"
										: category.target?.dueDate
											? `By ${shortDate(category.target.dueDate)} ${category.target.dueDate.slice(0, 4)}`
											: "At your own pace"}
								</span>
								<span>
									{progress.needed > 0
										? `${formatMoney(progress.needed, doc.currency)} to add`
										: "All set"}
								</span>
							</div>
							{category.note && (
								<p className="text-muted-foreground small mt-3.5 mr-0 mb-0 ml-0 text-[11px]">
									{category.note}
								</p>
							)}
						</button>
					);
				})}
			</div>
			{!visible.length && (
				<EmptyState
					title="What are you looking forward to?"
					description="A target turns a possibility into a little monthly practice."
					action={
						<Button variant="outline" onClick={() => setEditor("new")}>
							Create a target <Plus size={15} />
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
