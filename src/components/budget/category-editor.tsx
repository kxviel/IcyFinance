import { useId } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useCategoryEditor } from "@/hooks/use-category-editor";
import type { Category } from "@/lib/budget-types";

const CategoryEditor = ({
	category,
	onClose,
}: {
	category?: Category;
	onClose: () => void;
}) => {
	const fieldId = useId();

	const {
		doc,
		name,
		setName,
		group,
		setGroup,
		note,
		setNote,
		target,
		setTarget,
		cadence,
		setCadence,
		dueDate,
		setDueDate,
		error,
		confirmDelete,
		setConfirmDelete,
		remove,
		save,
	} = useCategoryEditor({ category, onClose });
	return (
		<WorkspaceDialog
			title={category ? "Edit category" : "Add category"}
			onClose={onClose}
		>
			<form onSubmit={save} className="form-stack grid gap-4">
				<div className="form-grid grid grid-cols-2 gap-4 max-[680px]:grid-cols-1 max-[680px]:gap-4.5">
					<Field>
						<FieldLabel htmlFor={`${fieldId}-1`}>Category name</FieldLabel>
						<Input
							id={`${fieldId}-1`}
							required
							maxLength={80}
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="A weekend away"
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor={`${fieldId}-2`}>Group</FieldLabel>
						<Input
							id={`${fieldId}-2`}
							required
							list="category-groups"
							maxLength={80}
							value={group}
							onChange={(event) => setGroup(event.target.value)}
						/>
						<datalist id="category-groups">
							{[...new Set(doc.categories.map((item) => item.group))].map(
								(item) => (
									<option key={item} value={item} />
								),
							)}
						</datalist>
					</Field>
				</div>
				<div className="form-grid grid grid-cols-2 gap-4 max-[680px]:grid-cols-1 max-[680px]:gap-4.5">
					<Field>
						<FieldLabel
							htmlFor={`${fieldId}-3`}
						>{`Target (${doc.currency})`}</FieldLabel>
						<Input
							id={`${fieldId}-3`}
							aria-describedby={`${fieldId}-3-hint`}
							inputMode="decimal"
							value={target}
							onChange={(event) => setTarget(event.target.value)}
							placeholder="0.00"
						/>
						<FieldDescription id={`${fieldId}-3-hint`}>
							{"Optional. Leave blank for a simple envelope."}
						</FieldDescription>
					</Field>
					<Field>
						<FieldLabel htmlFor={`${fieldId}-4`}>Target type</FieldLabel>
						<NativeSelect
							id={`${fieldId}-4`}
							value={cadence}
							onChange={(event) =>
								setCadence(event.target.value as typeof cadence)
							}
						>
							<option value="monthly">Assign this much each month</option>
							<option value="balance">Build up to a balance</option>
						</NativeSelect>
					</Field>
				</div>
				{cadence === "balance" && (
					<Field>
						<FieldLabel htmlFor={`${fieldId}-5`}>
							{"Aim to get there by"}
						</FieldLabel>
						<Input
							id={`${fieldId}-5`}
							aria-describedby={`${fieldId}-5-hint`}
							type="date"
							value={dueDate}
							onChange={(event) => setDueDate(event.target.value)}
						/>
						<FieldDescription id={`${fieldId}-5-hint`}>
							{
								"Optional. We’ll divide the remaining amount across the months left."
							}
						</FieldDescription>
					</Field>
				)}
				<Field>
					<FieldLabel htmlFor={`${fieldId}-6`}>
						{"A note to yourself"}
					</FieldLabel>
					<Textarea
						id={`${fieldId}-6`}
						rows={3}
						maxLength={1000}
						value={note}
						onChange={(event) => setNote(event.target.value)}
						placeholder="Optional note"
					/>
				</Field>
				{error && (
					<p
						role="alert"
						className="text-destructive text-sm px-0 py-3 leading-[1.7]"
					>
						{error}
					</p>
				)}
				{confirmDelete && (
					<p role="status" className="text-sm text-muted-foreground">
						Delete this unused category and remove it from the monthly template
						and Safe to Spend? Categories with financial history cannot be
						deleted.
					</p>
				)}
				<DialogFooter className="mt-1 border-t border-border pt-6">
					{category && (
						<Button
							variant={confirmDelete ? "destructive" : "ghost"}
							onClick={confirmDelete ? remove : () => setConfirmDelete(true)}
						>
							{confirmDelete ? "Confirm delete" : "Delete category"}
						</Button>
					)}
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="default">
						Save category
					</Button>
				</DialogFooter>
			</form>
		</WorkspaceDialog>
	);
};

export default CategoryEditor;
