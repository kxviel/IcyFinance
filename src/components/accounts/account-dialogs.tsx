import AccountEditor from "@/components/accounts/account-editor";
import ReconcileDialog from "@/components/accounts/reconcile-dialog";
import ScheduleEditor from "@/components/accounts/schedule-editor";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import WorkspaceDialog from "@/components/workspace-dialog";
import type { useAccounts } from "@/hooks/use-accounts";
import { repeats } from "@/lib/accounts";
import { shortDate } from "@/lib/dates";
import { message } from "@/lib/errors";

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
						<DialogFooter className="mt-1 border-t border-border pt-6">
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
						</DialogFooter>
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
						<DialogFooter className="mt-1 border-t border-border pt-6">
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
						</DialogFooter>
					</div>
				</WorkspaceDialog>
			)}
		</>
	);
};
export default AccountDialogs;
