import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { useSettings } from "@/modules/Settings/useSettings";

type Props = Pick<
	ReturnType<typeof useSettings>,
	"isDirty" | "busy" | "prepareReset"
>;
const ResetSettings = ({ isDirty, busy, prepareReset }: Props) => {
	return (
		<Card className="min-w-0 rounded-xl border border-border bg-background py-6 shadow-none ring-0">
			<CardHeader>
				<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80">
					<div>
						<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
							04 / TURN THE PAGE
						</span>
						<h2>Space for something new.</h2>
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid gap-5">
				<p className="text-muted-foreground">
					Start with an empty collection or explore a fictional sample. Your
					current budget is backed up first.
				</p>
				<div className="button-row flex items-center gap-2.5 flex-wrap">
					<Button
						variant="outline"
						onClick={() => prepareReset("empty")}
						disabled={Boolean(busy) || isDirty}
					>
						Start an empty budget
					</Button>
					<Button
						variant="ghost"
						onClick={() => prepareReset("sample")}
						disabled={Boolean(busy) || isDirty}
					>
						Load sample budget
					</Button>
				</div>
				{isDirty && (
					<p className="text-muted-foreground small text-[12px]">
						Finish saving your changes before replacing this budget.
					</p>
				)}
			</CardContent>
		</Card>
	);
};
export default ResetSettings;
