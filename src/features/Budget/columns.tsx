import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import BudgetMenu from "./BudgetMenu";

export type GetBudgetColumn = {
  budget_amount: number;
  budget_available: number;
  budget_expenses: number;
  budget_name: string;
  created_at: string;
  updated_at: string;
  id: string;
};

const columnHelper = createColumnHelper<GetBudgetColumn>();

export const budgetColumns = [
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
  columnHelper.accessor("updated_at", {
    id: "updated_at",
    header: "Last Modified",
    cell: (props) => (
      <div className="flex items-center gap-2">
        {dayjs(props.row.original.updated_at).format("DD MMM YYYY HH:mm a")}
      </div>
    ),
    // enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      console.log(rowA, rowB, columnId);
      return 0;
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (props) => <BudgetMenu props={props.row.original} />,
  }),
];
