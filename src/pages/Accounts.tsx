import { Plus } from "lucide-react";
import AccountDialogs from "@/components/accounts/account-dialogs";
import AccountList from "@/components/accounts/account-list";
import ScheduleList from "@/components/accounts/schedule-list";
import { PageHeading } from "@/components/page-heading";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/use-accounts";

export default function Accounts() {
	const state = useAccounts();
	const { setAccountEditor, money, budgetCash, trackingCash } = state;
	return (
		<>
			<PageHeading
				title="Accounts"
				actions={
					<Button variant="default" onClick={() => setAccountEditor("new")}>
						<Plus size={16} /> Add account
					</Button>
				}
			/>
			<div className="stats-row">
				<Stat
					label="Budget accounts"
					value={money(budgetCash)}
					note="Checking, savings & cash"
					negative={budgetCash < 0}
				/>
				<Stat
					label="Tracking accounts"
					value={money(trackingCash)}
					note="Tracking accounts · included in net worth"
					negative={trackingCash < 0}
				/>
				<Stat
					label="Net worth"
					value={money(budgetCash + trackingCash)}
					note="Opening balances + posted entries through today"
					negative={budgetCash + trackingCash < 0}
				/>
			</div>
			<AccountList {...state} />
			<ScheduleList {...state} />
			<AccountDialogs {...state} />
		</>
	);
}
