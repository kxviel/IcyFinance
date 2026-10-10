import { tableFeatures, useTable, type ColumnDef, type RowData } from "@tanstack/react-table";
import { cn } from "cn";
import type * as React from "react";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="border-border bg-card relative w-full overflow-x-auto rounded-lg border"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-[13px]", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors duration-150 hover:bg-muted/40 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-11 bg-muted/60 px-5 text-left align-middle text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-5 py-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };

const ledgerFeatures = tableFeatures({});

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  className?: string;
  align?: "left" | "right";
};

/** Rendering only: callers retain their existing filtering, ordering and actions. */
export function DataTable<T extends RowData>({
  tableKey,
  data,
  columns,
  getRowId,
  rowClassName,
  className,
  label,
}: {
  tableKey: string;
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (item: T) => string;
  rowClassName?: (item: T) => string | undefined;
  className?: string;
  label: string;
}) {
  const definitions: ColumnDef<typeof ledgerFeatures, T>[] = columns.map((column) => ({
    id: column.id,
    header: () => column.header,
    cell: ({ row }) => column.cell(row.original),
  }));
  const table = useTable({
    key: tableKey,
    features: ledgerFeatures,
    columns: definitions,
    data,
    getRowId,
  });
  const presentation = new Map(columns.map((column) => [column.id, column]));

  return (
    <Table aria-label={label} className={className}>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead
                key={header.id}
                scope="col"
                className={cn(
                  presentation.get(header.column.id)?.align === "right" && "text-right",
                )}
              >
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className={rowClassName?.(row.original)}>
            {row.getAllCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  presentation.get(cell.column.id)?.className,
                  presentation.get(cell.column.id)?.align === "right" && "text-right tabular-nums",
                )}
              >
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
