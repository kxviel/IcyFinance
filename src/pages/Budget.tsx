import { ArrowRightLeft, Check, ChevronDown, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";

import AssignmentInput from "@/components/budget/assignment-input";
import CategoryDeleteDialog from "@/components/budget/category-delete-dialog";
import CategoryEditor from "@/components/budget/category-editor";
import MonthlyTemplateDialog from "@/components/budget/monthly-template-dialog";
import MoveMoneyDialog from "@/components/budget/move-money-dialog";
import { EmptyState } from "@/components/empty-state";
import { IconButton } from "@/components/icon-button";
import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useBudget } from "@/hooks/use-budget";
import { autoAssign, categorySummary } from "@/lib/budget";
import { message } from "@/lib/errors";
import { cn } from "@/lib/utils";

export default function Budget() {
  const {
    doc,
    month,
    update,
    notify,
    filter,
    setFilter,
    editor,
    setEditor,
    deleting,
    setDeleting,
    moving,
    setMoving,
    templateOpen,
    setTemplateOpen,
    collapsed,
    setCollapsed,
    summary,
    money,
    visible,
    groups,
    neededByGroup,
  } = useBudget();
  return (
    <>
      <PageHeading
        title="Budget"
        actions={
          <>
            <MonthPicker />
            <Button variant="outline" onClick={() => setEditor("new")}>
              <Plus size={16} /> Add category
            </Button>
          </>
        }
      />
      <div className="stats-row">
        <Stat
          label="Ready to assign"
          value={money(summary.readyToAssign)}
          negative={summary.readyToAssign < 0}
          note={summary.readyToAssign === 0 ? "All funds assigned" : "After future assignments"}
        />
        <Stat label="Assigned this month" value={money(summary.assigned)} />
        <Stat label="Available to spend" value={money(summary.available)} />
      </div>
      {summary.uncategorized > 0 && (
        <p className="notice">
          {money(summary.uncategorized)} in spending needs a category. Categorize it in
          Transactions.
        </p>
      )}
      <div className="section-top my-4">
        <ToggleGroup
          aria-label="Filter categories"
          value={[filter]}
          onValueChange={([value]) => {
            if (value) setFilter(value);
          }}
          variant="outline"
          size="sm"
          className="flex-wrap"
        >
          {(
            [
              ["all", "All categories"],
              ["needs", "Needs funding"],
              ["overspent", "Overspent"],
            ] as const
          ).map(([value, label]) => (
            <ToggleGroupItem key={value} value={value} className="px-4 text-xs">
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="button-row">
          <Button variant="ghost" onClick={() => setTemplateOpen(true)}>
            Monthly template
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMoving(true)}
            disabled={doc.categories.length < 2}
          >
            <ArrowRightLeft size={15} /> Move money
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              try {
                update((current) => autoAssign(current, month));
                notify("Available money assigned toward your targets.");
              } catch (error) {
                notify(message(error), true);
              }
            }}
            disabled={summary.readyToAssign <= 0}
          >
            <Check size={15} /> Fund targets
          </Button>
        </div>
      </div>
      <div className="budget-table">
        <div className="budget-grid budget-head">
          <span>Category</span>
          <span>Assigned</span>
          <span>Activity</span>
          <span>Available</span>
        </div>
        {groups.map((group) => (
          <section className="min-w-0" key={group}>
            <button
              type="button"
              className="budget-grid budget-group"
              aria-expanded={!collapsed.includes(group)}
              onClick={() =>
                setCollapsed((current) =>
                  current.includes(group)
                    ? current.filter((item) => item !== group)
                    : [...current, group],
                )
              }
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <ChevronDown
                  size={15}
                  className={cn("shrink-0", collapsed.includes(group) && "-rotate-90")}
                />
                <span className="truncate">{group}</span>
                <span className="text-foreground shrink-0 tabular-nums">
                  {money(neededByGroup[group])}
                </span>
              </span>
            </button>
            {!collapsed.includes(group) &&
              visible
                .filter((item) => item.group === group)
                .map((category) => {
                  const values = categorySummary(doc, category.id, month);
                  const progress =
                    values.target > 0
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            ((category.target?.cadence === "monthly"
                              ? values.assigned
                              : values.available) /
                              values.target) *
                              100,
                          ),
                        )
                      : 0;
                  return (
                    <div className="budget-grid budget-row" key={category.id}>
                      <div className="flex min-w-0 items-center gap-1">
                        <button
                          type="button"
                          className="budget-category"
                          onClick={() => setEditor(category)}
                        >
                          <span>
                            <strong className="flex items-center gap-1.5">
                              <span className="truncate">{category.name}</span>
                              {values.overspendingPolicy === "deduct-from-next-ready" && (
                                <span
                                  className="text-muted-foreground inline-flex shrink-0"
                                  title="Negative balances reset next month and reduce Ready to Assign"
                                >
                                  <RotateCcw size={12} aria-hidden="true" />
                                  <span className="sr-only">
                                    Resets negative balances next month
                                  </span>
                                </span>
                              )}
                            </strong>
                            <span className="text-muted-foreground small text-sm">
                              {values.needed > 0
                                ? `${money(values.needed)} to go`
                                : category.target
                                  ? "Funded"
                                  : category.note || ""}
                            </span>
                            {values.rtaAdjustment < 0 && (
                              <span className="small text-destructive text-sm">
                                {money(-values.rtaAdjustment)} deducted from next month’s Ready to
                                Assign
                              </span>
                            )}
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center gap-0.5 print:hidden">
                          <IconButton
                            size="icon-xs"
                            label={`Edit ${category.name}`}
                            onClick={() => setEditor(category)}
                          >
                            <Pencil size={14} />
                          </IconButton>
                          <IconButton
                            size="icon-xs"
                            label={`Delete ${category.name}`}
                            className="hover:text-destructive"
                            onClick={() => setDeleting(category)}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </div>
                      </div>
                      <AssignmentInput
                        key={`${category.id}-${month}-${values.assigned}`}
                        category={category}
                        amount={values.assigned}
                      />
                      <span className="numeric text-muted-foreground whitespace-nowrap tabular-nums">
                        {money(values.activity)}
                      </span>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`bg-success/8 rounded-sm px-2 py-1 text-sm whitespace-nowrap tabular-nums ${values.available < 0 ? "text-destructive!" : ""}`}
                        >
                          {money(values.available)}
                        </span>
                        {category.target && (
                          <progress
                            className="funding-meter max-w-20"
                            value={progress}
                            max={100}
                            aria-label={`${category.name} funding progress`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
          </section>
        ))}
      </div>
      {!visible.length && (
        <EmptyState
          title={doc.categories.length ? "No matching categories" : "No categories"}
          description={
            doc.categories.length
              ? "No categories match this filter."
              : "Add a category to start assigning money."
          }
          action={
            !doc.categories.length && (
              <Button variant="outline" onClick={() => setEditor("new")}>
                Create category
              </Button>
            )
          }
        />
      )}
      <p className="text-subtle mt-6.25 max-w-200 text-sm leading-[1.75]">
        Available = opening balance + assigned + activity. Positive balances always carry forward.
        Negative balances either carry or reset and reduce the next month’s Ready to Assign,
        according to their policy.
      </p>
      {editor && (
        <CategoryEditor
          category={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
        />
      )}
      {deleting && <CategoryDeleteDialog category={deleting} onClose={() => setDeleting(null)} />}
      {moving && <MoveMoneyDialog onClose={() => setMoving(false)} />}
      {templateOpen && <MonthlyTemplateDialog onClose={() => setTemplateOpen(false)} />}
    </>
  );
}
