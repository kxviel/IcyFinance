import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { useSettings } from "@/hooks/use-settings";

type Props = Pick<
	ReturnType<typeof useSettings>,
	"isDirty" | "busy" | "prepareReset"
>;
const ResetSettings = ({ isDirty, busy, prepareReset }: Props) => {
	return (
		<Card className="min-w-0 rounded-md border border-border bg-background py-4 shadow-none ring-0">
			<CardHeader>
				<div className="section-top my-4">
					<div>
						<h2>Reset budget</h2>
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid gap-3">
				<p className="text-muted-foreground">
					Start an empty budget. Your current budget is backed up first.
				</p>
				<div className="button-row flex items-center gap-2.5 flex-wrap">
					<Button
						variant="outline"
						onClick={prepareReset}
						disabled={Boolean(busy) || isDirty}
					>
						Start an empty budget
					</Button>
				</div>
				{isDirty && (
					<p className="text-muted-foreground small text-sm">
						Finish saving your changes before replacing this budget.
					</p>
				)}
			</CardContent>
		</Card>
	);
};
export default ResetSettings;
