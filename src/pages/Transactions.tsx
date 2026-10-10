import { useNavigate } from "@tanstack/react-router";
import { Check, Download, LockKeyhole, Plus, Search, Upload } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeading } from "@/components/page-heading";
import ImportDialog from "@/components/transactions/import-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { DataTable, type DataTableColumn } from "@/components/ui/table";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { isTransactionCleared, isTransactionReconciled } from "@/lib/budget";
import { shortDate } from "@/lib/dates";
import { downloadFile } from "@/lib/download";
import { message } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { exportTransactionsCsv } from "@/lib/transaction-csv";

export default function Transactions() {
  const navigate = useNavigate();
  const {
    doc,
    openTransaction,
    update,
    notify,
    query,
    setQuery,
    account,
    setAccount,
    status,
    setStatus,
    allDates,
    setAllDates,
    importing,
    setImporting,
    unlock,
    setUnlock,
    searchRef,
    side,
    rows,
    toggleCleared,
  } = useTransactions();
  const hasOpenAccount = doc.accounts.some((item) => !item.closed);
  const columns: DataTableColumn<(typeof rows)[number]>[] = [
    {
      id: "cleared",
      header: "C",
      cell: (item) => (
        <>
          <button
            type="button"
            className={`cleared-toggle ${isTransactionCleared(item, side(item)) ? "is-cleared" : ""}`}
            aria-label={
              isTransactionReconciled(item, side(item))
                ? "Remove reconciliation"
                : isTransactionCleared(item, side(item))
                  ? "Mark uncleared"
                  : "Mark cleared"
            }
            onClick={() => toggleCleared(item)}
          >
            {isTransactionReconciled(item, side(item)) ? (
              <LockKeyhole size={12} />
            ) : isTransactionCleared(item, side(item)) ? (
              <Check size={13} />
            ) : null}
          </button>
        </>
      ),
    },
    {
      id: "date",
      header: "Date",
      className: "text-muted-foreground whitespace-nowrap",
      cell: (item) => <>{shortDate(item.date)}</>,
    },
    {
      id: "payee",
      header: "Payee / memo",
      cell: (item) => (
        <>
          <button type="button" className="row-title" onClick={() => openTransaction(item)}>
            <strong>{item.payee}</strong>
            {item.memo && <span className="text-muted-foreground small text-sm">{item.memo}</span>}
          </button>
        </>
      ),
    },
    {
      id: "category",
      header: "Category",
      className: "text-muted-foreground",
      cell: (item) => (
        <>
          {item.transferAccountId
            ? "Transfer"
            : item.splits.length
              ? `${item.splits.length} split categories`
              : doc.categories.find((category) => category.id === item.categoryId)?.name ||
                (item.amount >= 0 ? (
                  "Ready to assign"
                ) : (
                  <span className="text-destructive!">Uncategorized</span>
                ))}
        </>
      ),
    },
    {
      id: "account",
      header: "Account",
      className: "text-muted-foreground",
      cell: (item) => (
        <>
          {doc.accounts.find((account) => account.id === item.accountId)?.name}
          {item.transferAccountId && (
            <span className="small text-sm">
              {" "}
              → {doc.accounts.find((account) => account.id === item.transferAccountId)?.name}
            </span>
          )}
        </>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      className: "numeric tabular-nums whitespace-nowrap",
      cell: (item) => (
        <>
          {formatMoney(
            account !== "all" && item.transferAccountId === account ? -item.amount : item.amount,
            doc.currency,
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="Transactions"
        actions={
          <Button
            variant="outline"
            onClick={() => setImporting(true)}
            disabled={!hasOpenAccount}
            title={
              hasOpenAccount
                ? "Import transactions"
                : "Create or reopen an account before importing transactions"
            }
          >
            <Upload size={16} /> Import
          </Button>
        }
      />
      <div className="section-top my-4">
        <div className="search-field">
          <Search size={17} />
          <Input
            ref={searchRef}
            type="search"
            aria-label="Search transactions"
            placeholder="Find a payee, category, or note…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <MonthPicker />
      </div>
      <div className="section-top my-4">
        <div className="button-row">
          <NativeSelect
            aria-label="Filter by account"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
          >
            <option value="all">All accounts</option>
            {doc.accounts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All transactions</option>
            <option value="uncleared">Uncleared</option>
            <option value="uncategorized">Needs a category</option>
          </NativeSelect>
          <FieldLabel className="check-label text-muted-foreground inline-flex items-center gap-2.25 text-sm">
            <Checkbox checked={allDates} onCheckedChange={(checked) => setAllDates(checked)} /> All
            dates
          </FieldLabel>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              const saved = await downloadFile(
                "IcyFinance-transactions.csv",
                exportTransactionsCsv(doc),
                "text/csv;charset=utf-8",
              );
              if (saved) notify("Transaction export saved.");
            } catch (error) {
              notify(message(error), true);
            }
          }}
        >
          <Download size={15} /> Export all
        </Button>
      </div>
      <DataTable
        tableKey="transactions"
        label="Transactions"
        data={rows}
        columns={columns}
        getRowId={(item) => item.id}
        className="min-w-160"
      />
      {!rows.length && (
        <EmptyState
          title={hasOpenAccount ? "No transactions" : "No open accounts"}
          description={
            hasOpenAccount
              ? "Add a transaction or adjust your filters to see more."
              : "Create or reopen an account before adding transactions."
          }
          action={
            hasOpenAccount ? (
              <Button variant="outline" onClick={() => openTransaction()}>
                Add transaction <Plus size={15} />
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate({ to: "/accounts" })}>
                Manage accounts
              </Button>
            )
          }
        />
      )}
      <div className="table-note">
        <span>
          {rows.length} {rows.length === 1 ? "transaction" : "transactions"}
        </span>
        <span>C = cleared · Lock = reconciled</span>
      </div>
      {importing && <ImportDialog onClose={() => setImporting(false)} />}
      {unlock && (
        <WorkspaceDialog
          title="Reopen this entry?"
          description="Removing reconciliation lets you edit this transaction. Your next reconciliation may need an adjustment."
          onClose={() => setUnlock(null)}
        >
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlock(null)}>
              Keep reconciled
            </Button>
            <Button
              variant="default"
              onClick={() => {
                update((current) => ({
                  ...current,
                  transactions: current.transactions.map((item) =>
                    item.id === unlock.id
                      ? {
                          ...item,
                          ...(side(item) === item.accountId
                            ? { reconciled: false }
                            : { transferReconciled: false }),
                        }
                      : item,
                  ),
                }));
                setUnlock(null);
                notify("Reconciliation removed for this entry.");
              }}
            >
              Reopen entry
            </Button>
          </DialogFooter>
        </WorkspaceDialog>
      )}
    </>
  );
}
