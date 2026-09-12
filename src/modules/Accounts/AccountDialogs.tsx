import { Button } from "@/components/ui/button";
import WorkspaceDialog from "@/components/WorkspaceDialog";
import { shortDate } from "@/lib/dates";
import { message } from "@/lib/utils";
import AccountEditor from "@/modules/Accounts/AccountEditor";
import { repeats } from "@/modules/Accounts/accountUtils";
import ReconcileDialog from "@/modules/Accounts/ReconcileDialog";
import ScheduleEditor from "@/modules/Accounts/ScheduleEditor";
import type { useAccounts } from "@/modules/Accounts/useAccounts";

type Props = Pick<
	ReturnType<typeof useAccounts>,
	| "doc"
	| "update"
	| "notify"
	| "accountEditor"
	| "setAccountEditor"
	| "scheduleEditor"
	| "setScheduleEditor"
	| "reconciling"
	| "setReconciling"
	| "setClosing"
	| "setDeletingSchedule"
	| "dialogError"
	| "setDialogError"
	| "money"
	| "closeAccount"
	| "closeBalance"
	| "closeSchedules"
	| "closeFutureEntries"
	| "deleteSchedule"
	| "setClosed"
>;
const AccountDialogs = ({
	doc,
	update,
	notify,
	accountEditor,
	setAccountEditor,
	scheduleEditor,
	setScheduleEditor,
	reconciling,
	setReconciling,
	setClosing,
	setDeletingSchedule,
	dialogError,
	setDialogError,
	money,
	closeAccount,
	closeBalance,
	closeSchedules,
	closeFutureEntries,
	deleteSchedule,
	setClosed,
}: Props) => {
	return (
		<>
			{accountEditor && (
				<AccountEditor
					account={accountEditor === "new" ? undefined : accountEditor}
					onClose={() => setAccountEditor(null)}
				/>
			)}
			{scheduleEditor && (
				<ScheduleEditor
					schedule={scheduleEditor === "new" ? undefined : scheduleEditor}
					onClose={() => setScheduleEditor(null)}
				/>
			)}
			{reconciling && doc.accounts.some((item) => item.id === reconciling) && (
				<ReconcileDialog
					accountId={reconciling}
					onClose={() => setReconciling(null)}
				/>
			)}
			{closeAccount && (
				<WorkspaceDialog
					title={`Close ${closeAccount.name}?`}
					description="Your transaction history and budget remain available. You can reopen the account whenever you need it."
					onClose={() => setClosing(null)}
				>
					<div className="form-stack grid gap-5.5">
						<div className="bg-card p-5 grid gap-3 [&>div]:flex [&>div]:[align-items:baseline] [&>div]:justify-between [&>div]:gap-4.5 [&>div]:text-[12px] [&>div:last-child]:border-t [&>div:last-child]:border-border [&>div:last-child]:pt-3">
							<div>
								<span>Current balance</span>
								<strong className="numeric tabular-nums tracking-[-0.025em] whitespace-nowrap">
									{money(closeBalance)}
								</strong>
							</div>
							<div>
								<span>Active schedules</span>
								<strong>{closeSchedules}</strong>
							</div>
							<div>
								<span>Future-dated entries</span>
								<strong>{closeFutureEntries}</strong>
							</div>
						</div>
						{closeBalance !== 0 && (
							<p className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
								Transfer or spend the remaining balance, or correct it through
								reconciliation. Accounts must have a zero balance before
								closing.
							</p>
						)}
						{closeSchedules > 0 && (
							<p className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
								Pause or remove this account's active schedules before closing
								it.
							</p>
						)}
						{closeFutureEntries > 0 && (
							<p className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
								Resolve the future-dated entries in your register before closing
								this account.
							</p>
						)}
						{dialogError && (
							<p
								className="text-destructive text-[12px] px-0 py-3 leading-[1.7]"
								role="alert"
							>
								{dialogError}
							</p>
						)}
						<div className="flex justify-end items-center gap-2.5 border-t border-border pt-5.75 mt-0.75 flex-wrap [&.spread]:justify-between max-[680px]:[&_[data-slot=button]]:text-[11px] max-[680px]:[&_[data-slot=button]]:px-4 max-[680px]:[&_[data-slot=button]]:py-2.5 max-[680px]:[&.spread]:gap-4.5">
							<Button variant="outline" onClick={() => setClosing(null)}>
								Keep open
							</Button>
							<Button
								variant="default"
								disabled={
									closeBalance !== 0 ||
									closeSchedules > 0 ||
									closeFutureEntries > 0
								}
								onClick={() => setClosed(closeAccount.id, true)}
							>
								Close account
							</Button>
						</div>
					</div>
				</WorkspaceDialog>
			)}
			{deleteSchedule && (
				<WorkspaceDialog
					title="Remove this rhythm?"
					description={`Delete the schedule for ${deleteSchedule.payee}. Its previously posted transactions will stay in your register.`}
					onClose={() => setDeletingSchedule(null)}
				>
					<div className="form-stack grid gap-5.5">
						<p className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
							{money(deleteSchedule.amount)} · {repeats[deleteSchedule.repeat]}{" "}
							· Next {shortDate(deleteSchedule.nextDate)}
						</p>
						{dialogError && (
							<p
								className="text-destructive text-[12px] px-0 py-3 leading-[1.7]"
								role="alert"
							>
								{dialogError}
							</p>
						)}
						<div className="flex justify-end items-center gap-2.5 border-t border-border pt-5.75 mt-0.75 flex-wrap [&.spread]:justify-between max-[680px]:[&_[data-slot=button]]:text-[11px] max-[680px]:[&_[data-slot=button]]:px-4 max-[680px]:[&_[data-slot=button]]:py-2.5 max-[680px]:[&.spread]:gap-4.5">
							<Button
								variant="outline"
								onClick={() => setDeletingSchedule(null)}
							>
								Keep schedule
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									try {
										update((current) => {
											if (
												!current.schedules.some(
													(item) => item.id === deleteSchedule.id,
												)
											)
												throw new Error("This schedule no longer exists.");
											return {
												...current,
												schedules: current.schedules.filter(
													(item) => item.id !== deleteSchedule.id,
												),
											};
										});
										setDeletingSchedule(null);
										notify("Schedule removed. Posted entries were kept.");
									} catch (error) {
										setDialogError(message(error));
									}
								}}
							>
								Delete schedule
							</Button>
						</div>
					</div>
				</WorkspaceDialog>
			)}
		</>
	);
};
export default AccountDialogs;
