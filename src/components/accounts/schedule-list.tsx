import {
	ArrowUpRight,
	Check,
	CirclePause,
	Clock3,
	Pencil,
	Play,
	Plus,
	Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { IconButton } from "@/components/icon-button";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { useAccounts } from "@/hooks/use-accounts";
import { repeats } from "@/lib/accounts";
import { shortDate, today } from "@/lib/dates";

type Props = Pick<
	ReturnType<typeof useAccounts>,
	| "doc"
	| "openTransaction"
	| "setAccountEditor"
	| "setScheduleEditor"
	| "setDeletingSchedule"
	| "scheduleFilter"
	| "setScheduleFilter"
	| "setDialogError"
	| "activeAccounts"
	| "money"
	| "dueCount"
	| "schedules"
	| "toggleSchedule"
	| "post"
>;
const ScheduleList = ({
	doc,
	openTransaction,
	setAccountEditor,
	setScheduleEditor,
	setDeletingSchedule,
	scheduleFilter,
	setScheduleFilter,
	setDialogError,
	activeAccounts,
	money,
	dueCount,
	schedules,
	toggleSchedule,
	post,
}: Props) => {
	return (
		<>
			<div className="section-top my-4">
				<div>
					<h2>Scheduled transactions</h2>
					<p className="text-sm text-muted-foreground">
						{dueCount ? `${dueCount} ready to post.` : "No payments due."}
					</p>
				</div>
				<Button
					variant="outline"
					onClick={() => setScheduleEditor("new")}
					disabled={!activeAccounts.length}
				>
					<Plus size={16} /> Add schedule
				</Button>
			</div>
			<div className="section-top my-4">
				<ToggleGroup
					aria-label="Filter schedules"
					value={[scheduleFilter]}
					onValueChange={([value]) => {
						if (value) setScheduleFilter(value);
					}}
					variant="outline"
					size="sm"
					className="flex-wrap"
				>
					{(
						[
							["active", "Active"],
							["due", `Due (${dueCount})`],
							["paused", "Paused"],
							["all", "All"],
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
				<span className="text-muted-foreground small text-sm">
					Post adds an uncleared entry on its scheduled date.
				</span>
			</div>
			<div className="border-t border-border mt-5">
				{schedules.map((schedule) => {
					const account = doc.accounts.find(
						(item) => item.id === schedule.accountId,
					);
					if (!account) return null;
					const due = !schedule.paused && schedule.nextDate <= today();
					return (
						<article
							className={`flex items-center gap-5 px-0 py-3 border-b border-border max-[1200px]:gap-3 max-[1200px]:flex-wrap max-[680px]:gap-3.25 ${schedule.paused ? "is-paused" : ""}`}
							key={schedule.id}
						>
							<div className="flex-1 min-w-30 flex flex-col gap-1.5 [&_h3]:text-[14px] [&_.small]:text-sm">
								<button
									type="button"
									className="text-left flex flex-col gap-1 p-0 min-w-32.5 [&:hover_strong]:underline [&:hover_strong]:underline-offset-1 [&_.small]:text-sm [&_.small]:max-w-62.5"
									onClick={() => setScheduleEditor(schedule)}
								>
									<strong>{schedule.payee}</strong>
									<span className="text-muted-foreground small text-sm">
										{account.name} ·{" "}
										{account.kind === "tracking"
											? "Outside the budget"
											: (doc.categories.find(
													(item) => item.id === schedule.categoryId,
												)?.name ??
												(schedule.amount < 0
													? "Uncategorized"
													: "Ready to assign"))}
									</span>
								</button>
								{schedule.memo && (
									<span className="small text-sm text-muted-foreground">
										{schedule.memo}
									</span>
								)}
							</div>
							<div className="min-w-26.25 flex flex-col gap-1.25 text-sm max-[680px]:min-w-22.5 max-[680px]:text-sm">
								<strong>
									<time dateTime={schedule.nextDate}>
										{shortDate(schedule.nextDate)}
									</time>
								</strong>
								<span className="text-muted-foreground small text-sm">
									{repeats[schedule.repeat]} ·{" "}
									{schedule.paused
										? "Paused"
										: account.closed
											? "Account closed"
											: due
												? schedule.nextDate < today()
													? "Overdue"
													: "Due today"
												: "Upcoming"}
								</span>
							</div>
							<strong className="numeric tabular-nums whitespace-nowrap min-w-25 text-right text-[14px] max-[680px]:min-w-18.75 max-[680px]:text-sm">
								{money(schedule.amount)}
							</strong>
							<div className="flex items-center gap-1 [&_[data-slot=button]]:text-sm [&_[data-slot=button]]:px-3 [&_[data-slot=button]]:py-2 [&_[data-slot=button]]:min-h-8.25 max-[1200px]:ml-auto max-[680px]:w-full max-[680px]:justify-end">
								<Button
									variant={due ? "default" : "outline"}
									disabled={!due || account.closed}
									title={
										schedule.paused
											? "Resume or edit this schedule first"
											: !due
												? "Available on the scheduled date"
												: "Post one occurrence"
									}
									onClick={() => post(schedule.id)}
								>
									<Check size={14} /> Post
								</Button>
								{schedule.paused && schedule.repeat === "once" ? (
									<IconButton
										label={`Edit next occurrence of ${schedule.payee}`}
										onClick={() => setScheduleEditor(schedule)}
									>
										<Pencil size={15} />
									</IconButton>
								) : (
									<IconButton
										label={`${schedule.paused ? "Resume" : "Pause"} ${schedule.payee}`}
										onClick={() => toggleSchedule(schedule.id)}
									>
										{schedule.paused ? (
											<Play size={15} />
										) : (
											<CirclePause size={15} />
										)}
									</IconButton>
								)}
								<IconButton
									label={`Delete schedule for ${schedule.payee}`}
									onClick={() => {
										setDeletingSchedule(schedule.id);
										setDialogError("");
									}}
								>
									<Trash2 size={15} />
								</IconButton>
							</div>
						</article>
					);
				})}
			</div>
			{!schedules.length && (
				<EmptyState
					title={scheduleFilter === "due" ? "No schedules due" : "No schedules"}
					description={
						scheduleFilter === "due"
							? "Your active schedules are up to date. Upcoming entries appear when their date arrives."
							: "Add a schedule for income, a bill, or a subscription. Paused schedules stay here until you need them again."
					}
					action={
						activeAccounts.length > 0 ? (
							<Button
								variant="outline"
								onClick={() => setScheduleEditor("new")}
							>
								<Clock3 size={16} /> Create schedule
							</Button>
						) : (
							<Button variant="outline" onClick={() => setAccountEditor("new")}>
								Add an account first
							</Button>
						)
					}
				/>
			)}
			<div className="flex flex-wrap justify-between gap-2 py-3 text-sm text-muted-foreground">
				<span>Schedules are posted manually.</span>
				<button
					type="button"
					className="inline-flex items-center gap-2 text-sm px-0 py-1.25 text-muted-foreground no-underline hover:text-foreground"
					disabled={!activeAccounts.length}
					onClick={() => openTransaction()}
				>
					Add transaction <ArrowUpRight size={14} />
				</button>
			</div>
		</>
	);
};
export default ScheduleList;
