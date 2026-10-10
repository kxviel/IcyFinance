import { Plus } from "lucide-react";

import CategoryEditor from "@/components/budget/category-editor";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTargets } from "@/hooks/use-targets";
import { targetProgress } from "@/lib/budget";
import { shortDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export default function Targets() {
  const {
    doc,
    month,
    navigate,
    editor,
    setEditor,
    filter,
    setFilter,
    targets,
    total,
    complete,
    visible,
  } = useTargets();
  const money = (amount: number) => formatMoney(amount, doc.currency);
  const targetRows = visible.map((category) => ({
    category,
    progress: targetProgress(doc, category.id, month),
  }));
  const columns: DataTableColumn<(typeof targetRows)[number]>[] = [
    {
      id: "category",
      header: "Category",
      cell: ({ category }) => (
        <>
          <button
            type="button"
            onClick={() => setEditor(category)}
            className="text-left hover:underline"
          >
            <span className="block font-medium">{category.name}</span>
            <span className="text-muted-foreground text-sm">{category.group}</span>
          </button>
        </>
      ),
    },
    {
      id: "frequency",
      header: "Frequency / due date",
      cell: ({ progress }) => (
        <>
          {progress.cadence === "monthly"
            ? "Monthly"
            : progress.dueDate
              ? `${shortDate(progress.dueDate)} ${progress.dueDate.slice(0, 4)}`
              : "No deadline"}
        </>
      ),
    },
    {
      id: "funded",
      header: "Funded",
      align: "right",
      cell: ({ progress }) => <>{money(progress.current)}</>,
    },
    {
      id: "target",
      header: "Target",
      align: "right",
      cell: ({ progress }) => <>{money(progress.target)}</>,
    },
    {
      id: "needed",
      header: "Needed this month",
      align: "right",
      cell: ({ progress }) => (
        <>
          <span className={progress.needed > 0 ? "text-warning" : "text-success"}>
            {money(progress.needed)}
          </span>
        </>
      ),
    },
    {
      id: "progress",
      header: "Progress",
      align: "right",
      cell: ({ category, progress }) => (
        <>
          <div className="flex min-w-28 items-center justify-end gap-3">
            <progress
              className="funding-meter w-20"
              value={Math.max(0, Math.min(100, progress.percentage))}
              max={100}
              aria-label={`${category.name} funding progress`}
            />
            <span className="min-w-9">{Math.round(progress.percentage)}%</span>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="Targets"
        actions={
          <>
            <MonthPicker />
            <Button variant="outline" onClick={() => setEditor("new")}>
              <Plus size={15} /> Add target
            </Button>
          </>
        }
      />
      <div className="stats-row">
        <Stat label="Active targets" value={String(targets.length)} />
        <Stat label="Fully funded" value={String(complete)} />
        <Stat label="Needed this month" value={money(total)} />
      </div>
      <div className="section-top my-4">
        <ToggleGroup
          aria-label="Filter targets"
          value={[filter]}
          onValueChange={([value]) => {
            if (value) setFilter(value);
          }}
          variant="outline"
          size="sm"
          className="flex-wrap"
        >
          {[
            ["all", "All"],
            ["monthly", "Monthly"],
            ["balance", "Balance"],
          ].map(([value, label]) => (
            <ToggleGroupItem key={value} value={value}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/budget" })}>
          Assign money
        </Button>
      </div>
      {visible.length ? (
        <DataTable
          tableKey="targets"
          label="Funding targets"
          data={targetRows}
          columns={columns}
          getRowId={({ category }) => category.id}
        />
      ) : (
        <EmptyState
          title="No targets"
          description="Add a funding target to a category."
          action={
            <Button variant="outline" onClick={() => setEditor("new")}>
              Add target
            </Button>
          }
        />
      )}
      {editor && (
        <CategoryEditor
          category={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
        />
      )}
    </>
  );
}
