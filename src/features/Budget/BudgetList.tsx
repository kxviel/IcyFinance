import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { budgetColumns } from "./columns";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { BudgetResponse, useGetBudgets } from "./api/useGetBudgets";
import { useDialogStore } from "../../lib/DialogStore";
import { Input } from "../../components/ui/input";
import AddBudget from "./AddBudget";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableCaption>A list of your recent activities.</TableCaption>
      <TableHeader className="bg-background">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

const BudgetList = ({
  list,
  sortBy,
  setSortBy,
}: {
  list: BudgetResponse;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const sortOptions = [
    {
      name: "Name",
      value: "budget_name",
    },
    {
      name: "Amount",
      value: "budget_amount",
    },
    {
      name: "Created At",
      value: "created_at",
    },
    {
      name: "Updated At",
      value: "updated_at",
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-5">
          <Select
            onValueChange={(v) => {
              setSortBy(v);
            }}
            defaultValue={""}
            value={sortBy}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DataTable columns={budgetColumns} data={list ? list : []} />
      </div>
    </div>
  );
};

function Budget() {
  const [sortBy, setSortBy] = useState("budget_name");

  const { data: budgetList } = useGetBudgets(sortBy);
  const { setDialog } = useDialogStore();

  return (
    <main className="flex h-full w-full flex-col items-center gap-[48px] p-8">
      <h1 className="self-start text-3xl font-bold">Budget</h1>

      <div className="flex w-full items-center justify-between gap-2">
        <Input placeholder="Search" type="search" className="w-[50%]" />
        <Button onClick={() => setDialog(true)}>Create Budget</Button>
      </div>

      <BudgetList
        list={budgetList ? budgetList : []}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <AddBudget />
    </main>
  );
}

export default Budget;
