import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { useSettings } from "@/modules/Settings/useSettings";

type Props = Pick<
	ReturnType<typeof useSettings>,
	"database" | "setDatabaseAttempt" | "busy"
>;
const StorageSettings = ({ database, setDatabaseAttempt, busy }: Props) => {
	return (
		<Card className="min-w-0 rounded-xl border border-border bg-background py-6 shadow-none ring-0">
			<CardHeader>
				<div className="section-top flex items-center justify-between gap-5 [&_h2]:mt-3 max-[680px]:flex-wrap max-[680px]:gap-3.75 max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-80">
					<div>
						<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
							02 / DATABASE
						</span>
						<h2>Local storage.</h2>
					</div>
					<Database size={22} />
				</div>
			</CardHeader>
			<CardContent className="grid gap-5">
				<p className="text-muted-foreground">
					Your budget saves automatically to SQLite.
				</p>
				<div className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
					<strong>SQLite</strong>
					<p
						className={
							database.failed
								? "wrap-anywhere text-destructive"
								: "wrap-anywhere text-muted-foreground"
						}
						role={database.failed ? "alert" : "status"}
					>
						{database.text}
					</p>
				</div>
				<div className="button-row flex items-center gap-2.5 flex-wrap">
					<Button
						variant="outline"
						onClick={() => setDatabaseAttempt((attempt) => attempt + 1)}
						disabled={Boolean(busy) || database.pending}
					>
						<RefreshCw size={15} /> Check database
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
export default StorageSettings;
