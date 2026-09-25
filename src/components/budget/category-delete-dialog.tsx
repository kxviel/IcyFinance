import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useWorkspace } from "@/hooks/use-workspace";
import { deleteCategory } from "@/lib/budget";
import type { Category } from "@/lib/budget-types";
import { message } from "@/lib/errors";

const CategoryDeleteDialog = ({
	category,
	onClose,
}: {
	category: Category;
	onClose: () => void;
}) => {
	const { update, notify } = useWorkspace();
	const [error, setError] = useState("");

	const remove = () => {
		try {
			update((current) => deleteCategory(current, category.id));
			notify("Category deleted.");
			onClose();
		} catch (cause) {
			setError(message(cause));
		}
	};

	return (
		<WorkspaceDialog
			title="Delete category"
			description={`Delete ${category.name}?`}
			onClose={onClose}
		>
			<p className="text-sm leading-relaxed text-muted-foreground">
				This also removes the category from the monthly template and Safe to
				Spend. Categories with assignments, transactions, or schedules cannot be
				deleted.
			</p>
			{error && (
				<p role="alert" className="text-sm leading-relaxed text-destructive">
					{error}
				</p>
			)}
			<DialogFooter className="border-t border-border pt-5">
				<Button variant="outline" onClick={onClose}>
					Cancel
				</Button>
				<Button variant="destructive" onClick={remove}>
					<Trash2 size={15} /> Delete category
				</Button>
			</DialogFooter>
		</WorkspaceDialog>
	);
};

export default CategoryDeleteDialog;
