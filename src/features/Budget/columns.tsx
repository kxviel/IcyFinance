import { createColumnHelper } from "@tanstack/react-table";
import { formatRelative, subDays } from "date-fns";
import { MoreVerticalIcon } from "lucide-react";
import { Button } from "../../components/ui/button";

type GetBudgetColumn = {
  budget_amount: number;
  budget_available: number;
  budget_expenses: number;
  budget_name: string;
  created_at: string;
  updated_at: string;
  id: string;
};

const columnHelper = createColumnHelper<GetBudgetColumn>();

export const columns = [
  columnHelper.display({
    id: "budget_name",
    header: "Name",
    cell: (props) => (
      <div className="flex items-center gap-2">
        {props.row.original.budget_name}
      </div>
    ),
  }),
  columnHelper.display({
    id: "budget_amount",
    header: "Amount",
    cell: (props) => (
      <div className="flex items-center gap-2">
        {props.row.original.budget_amount}
      </div>
    ),
  }),
  columnHelper.display({
    id: "budget_expenses",
    header: "Expenses",
    cell: (props) => (
      <div className="flex items-center gap-2">
        {props.row.original.budget_expenses}
      </div>
    ),
  }),
  columnHelper.display({
    id: "budget_available",
    header: "Available",
    cell: (props) => (
      <div className="flex items-center gap-2">
        {props.row.original.budget_available}
      </div>
    ),
  }),
  columnHelper.display({
    id: "updatedAt",
    header: "Last Modified",
    cell: (props) => (
      <div className="flex items-center gap-2">
        {formatRelative(subDays(props.row.original.created_at, 3), new Date())}
      </div>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: () => (
      <Button variant="ghost">
        <MoreVerticalIcon />
      </Button>
    ),
  }),
];
