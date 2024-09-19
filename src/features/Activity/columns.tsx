import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

export type Activity = {
  id: number;
  activity_title: string;
  activity_amount: number;
  budget: {
    id: number;
    title: string;
  } | null;
};

export const columns: ColumnDef<Activity>[] = [
  {
    accessorKey: "activity_title",
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
      const kev = row.getValue("activity_title") as string | null;

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
    accessorKey: "activity_amount",
    header: "Amount",
  },
  {
    accessorKey: "budget",
    header: "Part of Budget",
    cell: ({ row }) => {
      const kev = row.getValue("budget") as {
        id: number;
        title: string;
      } | null;

      return <div className="">{kev ? kev.title : "-"}</div>;
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit</Button>

          <Button variant="outline">Delete</Button>
        </div>
      );
    },
  },
];
