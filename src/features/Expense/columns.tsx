import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

type GetExpenseColumn = {
  id: string;
  expense_name: string;
  expense_amount: number;
  budget_id: string | null;
  budget: {
    id: string;
    budget_name: string;
  } | null;
};

export const columns: ColumnDef<GetExpenseColumn>[] = [
  {
    accessorKey: "expense_title",
    header: ({ table }) => (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <p>Name</p>
      </div>
    ),
    cell: ({ row }) => {
      const kev = row.getValue("expense_title") as string | null;

      return (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />{" "}
          {kev ? kev : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "expense_amount",
    header: "Amount",
  },
  {
    accessorKey: "budget",
    header: "Part of Budget",
    cell: ({ row }) => {
      const kev = row.getValue("budget") as GetExpenseColumn["budget"] | null;

      return <div className="">{kev ? kev.budget_name : "-"}</div>;
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit</Button>

          <Button variant="destructive">Delete</Button>
        </div>
      );
    },
  },
];
