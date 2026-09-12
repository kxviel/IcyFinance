import BudgetDetails from "@/components/settings/budget-details";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import WorkspaceDialog from "@/components/workspace-dialog";
import type { useSettings } from "@/hooks/use-settings";

type Props = Pick<
	ReturnType<typeof useSettings>,
	| "isDirty"
	| "busy"
	| "error"
	| "replacement"
	| "setReplacement"
	| "confirmReplacement"
>;
const ReplacementDialog = ({
	isDirty,
	busy,
	error,
	replacement,
	setReplacement,
	confirmReplacement,
}: Props) => {
	return (
		<>
			{replacement && (
				<WorkspaceDialog
					busy={Boolean(busy)}
					title={
						replacement.kind === "empty"
							? "A clean sheet."
							: replacement.kind === "sample"
								? "Explore a little possibility."
								: "Bring this collection home."
					}
					description="This replaces the active SQLite budget after exporting a JSON backup of the current version."
					onClose={() => {
						if (!busy) setReplacement(null);
					}}
				>
					<div className="form-stack grid gap-5.5">
						<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
							REPLACE WITH
						</span>
						<BudgetDetails document={replacement.document} />
						{replacement.kind === "sample" && (
							<p className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
								All sample names, accounts and transactions are fictional.
								Sample data uses EUR.
							</p>
						)}
						{error && (
							<p
								role="alert"
								className="text-destructive text-[12px] px-0 py-3 leading-[1.7]"
							>
								{error}
							</p>
						)}
						<DialogFooter className="mt-1 border-t border-border pt-6">
							<Button
								variant="outline"
								onClick={() => setReplacement(null)}
								disabled={Boolean(busy)}
							>
								Keep current budget
							</Button>
							<Button
								variant="destructive"
								onClick={confirmReplacement}
								disabled={Boolean(busy) || isDirty}
							>
								{busy || "Back up & replace budget"}
							</Button>
						</DialogFooter>
					</div>
				</WorkspaceDialog>
			)}
		</>
	);
};
export default ReplacementDialog;
