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
import { columns } from "./columns";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { X as Close } from "lucide-react";
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
      <TableHeader className="bg-white">
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
      <TableBody className="border-b border-slate-200">
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

const BudgetList = ({ list }: { list: BudgetResponse }) => {
  const [modified, setModified] = useState("");

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1">
            <Select
              onValueChange={(v) => {
                setModified(v);
              }}
              defaultValue={""}
              value={modified}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Modified" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>

            {modified && (
              <Button
                onClick={() => setModified("")}
                variant={"outline"}
                className="bg-[#f9f9f9]"
              >
                <Close className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Select
            onValueChange={(v) => {
              setModified(v);
            }}
            defaultValue={modified}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Modified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={list ? list : []} />
      </div>
    </div>
  );
};

function Budget() {
  const { data: budgetList } = useGetBudgets();
  const { setDialog } = useDialogStore();

  return (
    <main className="flex h-full w-full flex-col items-center gap-[48px] p-8">
      <h1 className="self-start text-3xl font-bold">Budget</h1>

      <div className="flex w-full items-center justify-between gap-2">
        <Input placeholder="Search" type="search" className="w-[50%]" />
        <Button onClick={() => setDialog(true)}>Create Budget</Button>
      </div>

      <BudgetList list={budgetList ? budgetList : []} />
      <AddBudget />
    </main>
  );
}

export default Budget;
