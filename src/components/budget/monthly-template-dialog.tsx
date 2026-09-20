import { useId } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useMonthlyTemplate } from "@/hooks/use-monthly-template";
import { monthLabel } from "@/lib/dates";

const MonthlyTemplateDialog = ({ onClose }: { onClose: () => void }) => {
	const fieldId = useId();
	const {
		doc,
		month,
		values,
		setValues,
		error,
		money,
		preview,
		needed,
		ready,
		above,
		canApply,
		hasChanges,
		saveTemplate,
		copyCurrentMonth,
		applyTemplate,
	} = useMonthlyTemplate(onClose);
	return (
		<WorkspaceDialog
			title="Monthly budget template"
			description="Set your normal category assignments once, then apply them to a month."
			onClose={onClose}
		>
			<div className="grid gap-4">
				<p className="text-sm text-muted-foreground">
					Monthly assignments in {doc.currency}
				</p>
				<div className="max-h-72 overflow-y-auto divide-y border-y">
					{doc.categories.map((category) => (
						<div
							key={category.id}
							className="flex items-center justify-between gap-4 py-2.5"
						>
							<label
								htmlFor={`${fieldId}-${category.id}`}
								className="min-w-0 wrap-anywhere text-sm"
							>
								<span className="block font-medium">{category.name}</span>
								<span className="text-muted-foreground">{category.group}</span>
							</label>
							<Input
								id={`${fieldId}-${category.id}`}
								className="w-28 shrink-0 text-right tabular-nums sm:w-36"
								inputMode="decimal"
								placeholder="0.00"
								value={values[category.id] ?? ""}
								onChange={(event) =>
									setValues((current) => ({
										...current,
										[category.id]: event.target.value,
									}))
								}
							/>
						</div>
					))}
					{!doc.categories.length && (
						<p className="py-4 text-sm text-muted-foreground">
							Add categories first.
						</p>
					)}
				</div>
				<p className="text-sm text-muted-foreground">
					Leave an amount blank or enter zero to exclude that category. Applying
					tops up this month’s assignments to these amounts. Higher manual
					assignments stay unchanged; applying again adds nothing once they are
					met.
				</p>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						onClick={saveTemplate}
						disabled={!doc.categories.length}
					>
						Save template
					</Button>
					<Button
						variant="ghost"
						onClick={copyCurrentMonth}
						disabled={!doc.categories.length}
						className="h-auto min-h-10 whitespace-normal"
					>
						Copy {monthLabel(month)} assignments
					</Button>
				</div>
				{hasChanges && (
					<p role="status" className="text-sm text-muted-foreground">
						Unsaved changes. Save the template before applying it.
					</p>
				)}
				<div className="rounded-md border bg-card px-4 py-3 text-sm">
					<p className="font-medium">
						Apply saved template to {monthLabel(month)}
					</p>
					<p className="mt-1 text-muted-foreground">
						{preview.length} categories · {money(needed)} additional assignment
						· {money(ready)} Ready to assign
					</p>
					{above > 0 && (
						<p className="mt-1 text-muted-foreground">
							{above} assignments already exceed their template amounts and will
							stay unchanged.
						</p>
					)}
					{needed > ready && (
						<p className="mt-1 text-destructive">
							{money(needed - ready)} more Ready to assign is needed. No
							assignments will change until the full top-up is funded.
						</p>
					)}
					{preview.length === 0 && (
						<p className="mt-1 text-muted-foreground">
							Save at least one positive amount to create a template.
						</p>
					)}
					{preview.length > 0 && needed === 0 && (
						<p className="mt-1 text-muted-foreground">
							All template amounts are already met.
						</p>
					)}
				</div>
				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}
				<DialogFooter className="border-t pt-4">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
					<Button onClick={applyTemplate} disabled={!canApply}>
						Apply saved template
					</Button>
				</DialogFooter>
			</div>
		</WorkspaceDialog>
	);
};

export default MonthlyTemplateDialog;
