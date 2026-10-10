import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import SafeToSpendDialog from "@/components/safe-to-spend-dialog";
import { SectionLink } from "@/components/section-link";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { useOverview } from "@/hooks/use-overview";
import { accountBalance, targetProgress } from "@/lib/budget";
import { shortDate } from "@/lib/dates";

export default function Overview() {
  const {
    doc,
    month,
    navigate,
    openTransaction,
    summary,
    safe,
    safeSettingsOpen,
    setSafeSettingsOpen,
    throughDate,
    money,
    featured,
    recent,
  } = useOverview();
  return (
    <>
      <PageHeading title="Overview" actions={<MonthPicker />} />
      <section className="balance-panel" aria-label="Safe to Spend summary">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="pixel-label">Safe to Spend</h2>
            <p className={`balance-amount ${safe.available < 0 ? "text-destructive" : ""}`}>
              {safe.categoryCount > 0 ? money(safe.available) : "—"}
            </p>
            <p className="text-muted-foreground text-sm">
              {safe.categoryCount === 0
                ? "Choose the categories that count as day-to-day spending."
                : safe.monthKind === "future"
                  ? `${safe.categoryCount} selected categories · Planned balance`
                  : `${safe.categoryCount} selected categories · ${money(safe.spent)} net spent ${safe.monthKind === "past" ? "in that month" : "this month"}`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="balance-action"
            onClick={() => setSafeSettingsOpen(true)}
          >
            Choose categories
          </Button>
        </div>
        {safe.categoryCount > 0 && safe.monthKind === "current" && (
          <p className="balance-detail text-muted-foreground text-xs">
            {safe.daysRemaining} {safe.daysRemaining === 1 ? "day" : "days"} left including today ·
            About {money(safe.perDay)} per day · {money(safe.perWeek)} over{" "}
            {safe.weekDays === 7
              ? "the next 7 days"
              : `the remaining ${safe.weekDays} ${safe.weekDays === 1 ? "day" : "days"}`}
          </p>
        )}
        {safe.overspentCount > 0 && (
          <p className="text-destructive mt-2 text-sm">
            {safe.overspentCount} selected{" "}
            {safe.overspentCount === 1 ? "category is" : "categories are"} overspent. Their deficits
            reduce this total; move money to cover them.
          </p>
        )}
        {safe.categoryCount > 0 && safe.monthKind === "past" && (
          <p className="balance-detail text-muted-foreground text-xs">
            Historical category balance at month end.
          </p>
        )}
        {safe.categoryCount > 0 && safe.monthKind === "future" && (
          <p className="balance-detail text-muted-foreground text-xs">
            Planned category balance; no spending pace yet.
          </p>
        )}
      </section>
      <div className="stats-row">
        <Stat
          label="Ready to assign"
          value={money(summary.readyToAssign)}
          negative={summary.readyToAssign < 0}
        />
        <Stat
          label="Available in categories"
          value={money(summary.available)}
          negative={summary.available < 0}
        />
        <Stat label="Spent this month" value={money(summary.expenses)} />
      </div>
      {summary.uncategorized > 0 && (
        <div className="notice flex flex-wrap items-center justify-between gap-3">
          <span>{money(summary.uncategorized)} in spending needs a category.</span>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/transactions" })}>
            Review transactions
          </Button>
        </div>
      )}
      <div className="overview-grid">
        <section className="ledger-panel">
          <div className="section-top">
            <h2>
              <span className="section-number" aria-hidden="true">
                01
              </span>{" "}
              Recent transactions
            </h2>
            <SectionLink onClick={() => navigate({ to: "/transactions" })}>View all</SectionLink>
          </div>
          <div className="min-w-0">
            {recent.map((tx) => (
              <button
                key={tx.id}
                type="button"
                className="ledger-row recent-row"
                onClick={() => openTransaction(tx)}
              >
                <span className="row-symbol" aria-hidden="true">
                  {tx.amount >= 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <time
                  dateTime={tx.date}
                  className="recent-date text-muted-foreground w-12 shrink-0 text-xs"
                >
                  {shortDate(tx.date)}
                </time>
                <span className="recent-description min-w-0 flex-1">
                  <span className="block truncate font-medium">{tx.payee}</span>
                  <span className="text-muted-foreground mt-1 block truncate text-xs">
                    {tx.transferAccountId
                      ? "Transfer"
                      : tx.splits.length
                        ? "Split transaction"
                        : (doc.categories.find((category) => category.id === tx.categoryId)?.name ??
                          (tx.amount >= 0 ? "Income" : "Uncategorized"))}
                  </span>
                </span>
                <span className="recent-amount shrink-0 tabular-nums">{money(tx.amount)}</span>
              </button>
            ))}
            {!recent.length && (
              <p className="text-muted-foreground py-5 text-sm">No transactions this month.</p>
            )}
          </div>
        </section>
        <section className="ledger-panel">
          <div className="section-top">
            <h2>
              <span className="section-number" aria-hidden="true">
                02
              </span>{" "}
              Accounts
            </h2>
            <SectionLink onClick={() => navigate({ to: "/accounts" })}>Manage</SectionLink>
          </div>
          <div className="min-w-0">
            {doc.accounts
              .filter((account) => !account.closed)
              .map((account) => (
                <div key={account.id} className="ledger-row">
                  <span className="row-symbol" aria-hidden="true">
                    <Wallet size={15} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{account.name}</span>
                  <span className="shrink-0 tabular-nums">
                    {money(accountBalance(doc, account.id, throughDate))}
                  </span>
                </div>
              ))}
            {!doc.accounts.some((account) => !account.closed) && (
              <p className="text-muted-foreground py-5 text-sm">No open accounts.</p>
            )}
          </div>
          <div className="ledger-total">
            <span>Net worth</span>
            <strong className="tabular-nums">{money(summary.netWorth)}</strong>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">As of {shortDate(throughDate)}</p>
          <section className="mt-8 border-t pt-6">
            <div className="section-top">
              <h2>
                <span className="section-number" aria-hidden="true">
                  03
                </span>{" "}
                Targets
              </h2>
              <SectionLink onClick={() => navigate({ to: "/targets" })}>View all</SectionLink>
            </div>
            <div className="min-w-0">
              {featured.map((category) => {
                const progress = targetProgress(doc, category.id, month);
                return (
                  <button
                    key={category.id}
                    type="button"
                    className="target-row"
                    onClick={() => navigate({ to: "/targets" })}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="tabular-nums">
                      {money(progress.current)} / {money(progress.target)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {progress.needed > 0
                        ? `${money(progress.needed)} needed this month`
                        : "Funded"}
                    </span>
                    <span className="text-muted-foreground text-right text-xs tabular-nums">
                      {Math.round(progress.percentage)}%
                    </span>
                    <progress
                      className="funding-meter"
                      value={Math.max(0, Math.min(100, progress.percentage))}
                      max={100}
                      aria-label={`${category.name} funding progress`}
                    />
                  </button>
                );
              })}
              {!featured.length && (
                <p className="text-muted-foreground py-5 text-sm">
                  No targets. Add one to a budget category.
                </p>
              )}
            </div>
          </section>
        </section>
      </div>
      {safeSettingsOpen && <SafeToSpendDialog onClose={() => setSafeSettingsOpen(false)} />}
    </>
  );
}
