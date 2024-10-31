import { MoreVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useDialogStore } from "../../lib/DialogStore";
import { useDeleteBudget } from "./api/useDeleteBudget";
import { GetBudgetColumn } from "./columns";

const BudgetMenu = ({ props }: { props: GetBudgetColumn }) => {
  const { setDialog } = useDialogStore();
  const deleteBudget = useDeleteBudget();

  const handleDelete = () => {
    deleteBudget.mutate({ body: { id: props.id } });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setDialog(true, props)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BudgetMenu;
