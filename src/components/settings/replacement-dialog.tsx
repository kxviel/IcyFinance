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
							? "Start empty budget"
							: "Import budget"
					}
					description="This replaces the active SQLite budget after exporting a JSON backup of the current version."
					onClose={() => {
						if (!busy) setReplacement(null);
					}}
				>
					<div className="form-stack grid gap-4">
						<span className="text-sm font-medium text-muted-foreground">
							REPLACE WITH
						</span>
						<BudgetDetails document={replacement.document} />
						{error && (
							<p
								role="alert"
								className="text-destructive text-sm px-0 py-3 leading-[1.7]"
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
