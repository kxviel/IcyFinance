import { Plus } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";
import { Stat } from "@/components/Stat";
import { Button } from "@/components/ui/button";
import AccountDialogs from "@/modules/Accounts/AccountDialogs";
import AccountList from "@/modules/Accounts/AccountList";
import ScheduleList from "@/modules/Accounts/ScheduleList";
import { useAccounts } from "@/modules/Accounts/useAccounts";

const Accounts = () => {
	const state = useAccounts();
	const { setAccountEditor, money, budgetCash, trackingCash } = state;
	return (
		<>
			<PageHeading
				index="03"
				title="Places for possibilities."
				description="A collection of accounts. One clear picture of your money."
				actions={
					<Button variant="default" onClick={() => setAccountEditor("new")}>
						<Plus size={16} /> Account
					</Button>
				}
			/>
			<div className="grid grid-cols-3 mt-6 border-t border-b border-border [&+.section-top]:mt-10 max-[680px]:grid-cols-1">
				<Stat
					label="In your budget"
					value={money(budgetCash)}
					note="Checking, savings & cash"
					negative={budgetCash < 0}
				/>
				<Stat
					label="Outside your budget"
					value={money(trackingCash)}
					note="Tracking accounts · included in net worth"
					negative={trackingCash < 0}
				/>
				<Stat
					label="All account balances"
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
};

export default Accounts;
