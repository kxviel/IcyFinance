import {
	ArrowDownLeft,
	ArrowUpRight,
	Check,
	CirclePause,
	Clock3,
	Pencil,
	Play,
	Plus,
	Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { IconButton } from "@/components/IconButton";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { shortDate, today } from "@/lib/dates";
import { repeats } from "@/modules/Accounts/accountUtils";
import type { useAccounts } from "@/modules/Accounts/useAccounts";

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
			<div className="section-top max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80 flex items-center justify-between gap-5 mt-15 mr-0 mb-6 ml-0 [&_h2]:mt-2.5">
				<div>
					<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
						02 / THE REPEATING THINGS
					</span>
					<h2>A familiar rhythm.</h2>
					<p className="text-muted-foreground">
						Bills and paydays, one occurrence at a time.{" "}
						{dueCount
							? `${dueCount} ready to post.`
							: "Everything has its time."}
					</p>
				</div>
				<Button
					variant="outline"
					onClick={() => setScheduleEditor("new")}
					disabled={!activeAccounts.length}
				>
					<Plus size={16} /> Schedule
				</Button>
			</div>
			<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80">
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
							className="rounded-full px-4 text-[10px] uppercase tracking-wide data-pressed:bg-primary data-pressed:text-primary-foreground"
						>
							{label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<span className="text-muted-foreground small text-[12px]">
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
							className={`flex items-center gap-5 px-0 py-5.75 border-b border-border max-[1200px]:gap-3 max-[1200px]:flex-wrap max-[680px]:gap-3.25 ${schedule.paused ? "is-paused" : ""}`}
							key={schedule.id}
						>
							<span
								className="w-9 h-9 grid place-items-center border border-border rounded-full text-muted-foreground max-[680px]:hidden"
								role="img"
								aria-label={schedule.amount < 0 ? "Expense" : "Income"}
							>
								{schedule.amount < 0 ? (
									<ArrowUpRight size={22} />
								) : (
									<ArrowDownLeft size={22} />
								)}
							</span>
							<div className="flex-1 min-w-30 flex flex-col gap-1.5 [&_h3]:text-[14px] [&_.small]:text-[10px]">
								<button
									type="button"
									className="text-left flex flex-col gap-1 p-0 min-w-32.5 [&:hover_strong]:underline [&:hover_strong]:underline-offset-1 [&_.small]:text-[10px] [&_.small]:max-w-62.5"
									onClick={() => setScheduleEditor(schedule)}
								>
									<strong>{schedule.payee}</strong>
									<span className="text-muted-foreground small text-[12px]">
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
									<span className="small text-[11px] text-muted-foreground">
										{schedule.memo}
									</span>
								)}
							</div>
							<div className="min-w-26.25 flex flex-col gap-1.25 text-[12px] max-[680px]:min-w-22.5 max-[680px]:text-[11px]">
								<strong>
									<time dateTime={schedule.nextDate}>
										{shortDate(schedule.nextDate)}
									</time>
								</strong>
								<span className="text-muted-foreground small text-[12px]">
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
							<strong className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap min-w-25 text-right text-[14px] max-[680px]:min-w-18.75 max-[680px]:text-[12px]">
								{money(schedule.amount)}
							</strong>
							<div className="flex items-center gap-1 [&_[data-slot=button]]:text-[10px] [&_[data-slot=button]]:px-3 [&_[data-slot=button]]:py-2 [&_[data-slot=button]]:min-h-8.25 max-[1200px]:ml-auto max-[680px]:w-full max-[680px]:justify-end">
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
					title={
						scheduleFilter === "due"
							? "Nothing waiting on you."
							: "Leave room for a rhythm."
					}
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
			<div className="flex justify-between px-0 py-5 text-[9px] text-subtle tracking-[0.07em] max-[680px]:text-[8px] max-[680px]:gap-3.75">
				<span>SCHEDULES ARE POSTED MANUALLY</span>
				<button
					type="button"
					className="inline-flex items-center gap-2 text-[12px] px-0 py-1.25 text-muted-foreground no-underline hover:text-foreground"
					disabled={!activeAccounts.length}
					onClick={() => openTransaction()}
				>
					Record something else <ArrowUpRight size={14} />
				</button>
			</div>
		</>
	);
};
export default ScheduleList;
