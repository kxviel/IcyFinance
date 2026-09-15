import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useMonthlyTemplate } from "@/hooks/use-monthly-template";

const MonthlyTemplateDialog = ({ onClose }: { onClose: () => void }) => {
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
		saveTemplate,
		saveCurrentMonth,
		applyTemplate,
	} = useMonthlyTemplate(onClose);
	return (
		<WorkspaceDialog
			title="Monthly budget template"
			description="Set your normal category assignments once, then apply them to a month."
			onClose={onClose}
		>
			<div className="grid gap-4">
				<div className="max-h-72 overflow-y-auto divide-y border-y">
					{doc.categories.map((category) => (
						<div
							key={category.id}
							className="flex items-center justify-between gap-4 py-2.5"
						>
							<label
								htmlFor={`template-${category.id}`}
								className="min-w-0 text-sm"
							>
								<span className="block font-medium">{category.name}</span>
								<span className="text-muted-foreground">{category.group}</span>
							</label>
							<Input
								id={`template-${category.id}`}
								className="w-28 text-right tabular-nums"
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
					Leave an amount blank or enter zero to exclude that category. Save the
					edited amounts before applying.
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
						onClick={saveCurrentMonth}
						disabled={!doc.categories.length}
					>
						Use {month} assignments
					</Button>
				</div>
				<div className="rounded-md border bg-card px-4 py-3 text-sm">
					<p className="font-medium">Apply saved template to {month}</p>
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
							The full template needs more Ready to assign.
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
