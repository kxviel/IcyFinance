import { Download } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/table";
import { useReports } from "@/hooks/use-reports";
import { monthLabel } from "@/lib/dates";
import { downloadFile } from "@/lib/download";
import { message } from "@/lib/errors";

export default function Reports() {
  const { doc, month, notify, report, money, spending, categoryTotal, savingsRate } = useReports();
  const historyColumns: DataTableColumn<(typeof report.history)[number]>[] = [
    { id: "month", header: "Month", cell: (item) => <>{monthLabel(item.month)}</> },
    { id: "income", header: "Income", align: "right", cell: (item) => <>{money(item.income)}</> },
    {
      id: "expenses",
      header: "Expenses",
      align: "right",
      cell: (item) => <>{money(item.expenses)}</>,
    },
    {
      id: "net",
      header: "Net income",
      align: "right",
      cell: (item) => (
        <>
          <span className={item.net < 0 ? "text-destructive" : ""}>{money(item.net)}</span>
        </>
      ),
    },
    {
      id: "netWorth",
      header: "Net worth",
      align: "right",
      cell: (item) => <>{money(item.netWorth)}</>,
    },
  ];

  const spendingColumns: DataTableColumn<(typeof spending)[number]>[] = [
    { id: "category", header: "Category", cell: (item) => <>{item.name}</> },
    { id: "group", header: "Group", cell: (item) => <>{item.group}</> },
    { id: "spent", header: "Spent", align: "right", cell: (item) => <>{money(item.spent)}</> },
    {
      id: "share",
      header: "Share",
      align: "right",
      cell: (item) => (
        <>
          <div className="flex items-center justify-end gap-3">
            <progress
              className="funding-meter w-20"
              max={100}
              value={(item.spent / categoryTotal) * 100}
              aria-label={`${item.name} share of spending`}
            />
            <span>{Math.round((item.spent / categoryTotal) * 100)}%</span>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="Reports"
        actions={
          <>
            <MonthPicker />
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const saved = await downloadFile(
                    `IcyFinance-report-${month}.json`,
                    JSON.stringify(
                      { budget: doc.name, currency: doc.currency, ...report },
                      null,
                      2,
                    ),
                  );
                  if (saved) notify("Report exported.");
                } catch (error) {
                  notify(message(error), true);
                }
              }}
            >
              <Download size={15} /> Export report
            </Button>
          </>
        }
      />
      <div className="stats-row">
        <Stat label="Income" value={money(report.income)} />
        <Stat label="Expenses" value={money(report.expenses)} />
        <Stat
          label="Net income"
          value={money(report.net)}
          negative={report.net < 0}
          note={savingsRate === null ? undefined : `${savingsRate}% savings rate`}
        />
      </div>
      <section className="mt-8">
        <h2 className="mb-5">Monthly summary</h2>
        <DataTable
          tableKey="history"
          label="Monthly summary"
          data={report.history}
          columns={historyColumns}
          getRowId={(item) => item.month}
        />
      </section>
      <section className="mt-9">
        <div className="section-top my-4">
          <h2>Spending by category</h2>
          <span className="text-sm tabular-nums">{money(categoryTotal)} total</span>
        </div>
        {spending.length ? (
          <DataTable
            tableKey="spending"
            label="Spending by category"
            data={spending}
            columns={spendingColumns}
            getRowId={(item) => item.id}
          />
        ) : (
          <EmptyState
            title="No categorized spending"
            description="Categorize transactions to see spending totals."
          />
        )}
        {report.expenses !== categoryTotal && (
          <p className="text-muted-foreground mt-2 text-sm">
            Category totals exclude uncategorized spending. Refunds reduce expenses.
          </p>
        )}
      </section>
    </>
  );
}
