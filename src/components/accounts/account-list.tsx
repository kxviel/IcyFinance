import { Pencil, Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { IconButton } from "@/components/icon-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@/components/ui/field";
import { DataTable, type DataTableColumn } from "@/components/ui/table";
import type { useAccounts } from "@/hooks/use-accounts";
import { accountKinds, accountPurposes, clearedState } from "@/lib/accounts";
import { accountBalance } from "@/lib/budget";

type Props = Pick<
  ReturnType<typeof useAccounts>,
  | "doc"
  | "navigate"
  | "setAccountEditor"
  | "setReconciling"
  | "setClosing"
  | "showClosed"
  | "setShowClosed"
  | "setDialogError"
  | "visibleAccounts"
  | "closedCount"
  | "money"
  | "setClosed"
>;
const AccountList = ({
  doc,
  navigate,
  setAccountEditor,
  setReconciling,
  setClosing,
  showClosed,
  setShowClosed,
  setDialogError,
  visibleAccounts,
  closedCount,
  money,
  setClosed,
}: Props) => {
  const accountRows = visibleAccounts.map((account) => ({
    account,
    balance: accountBalance(doc, account.id),
    cleared: clearedState(doc, account.id),
  }));
  const columns: DataTableColumn<(typeof accountRows)[number]>[] = [
    {
      id: "account",
      header: "Account",
      cell: ({ account }) => (
        <>
          <button
            type="button"
            className="hover:text-primary max-w-64 text-left wrap-anywhere whitespace-normal"
            onClick={() => setAccountEditor(account)}
          >
            <span className="block font-medium">{account.name}</span>
            <span className="text-muted-foreground text-sm">
              {accountKinds[account.kind]}
              {account.purpose ? ` · ${accountPurposes[account.purpose]}` : ""}
              {account.closed ? " · Closed" : ""}
            </span>
          </button>
        </>
      ),
    },
    {
      id: "balance",
      header: "Balance",
      align: "right",
      cell: ({ balance }) => (
        <>
          <span className={balance < 0 ? "text-destructive font-medium" : "font-medium"}>
            {money(balance)}
          </span>
        </>
      ),
    },
    {
      id: "cleared",
      header: "Cleared",
      align: "right",
      cell: ({ cleared }) => <>{money(cleared.balance)}</>,
    },
    {
      id: "uncleared",
      header: "Uncleared",
      align: "right",
      cell: ({ balance, cleared }) => <>{money(balance - cleared.balance)}</>,
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: ({ account }) => (
        <>
          <div className="flex justify-end gap-1">
            <IconButton label={`Edit ${account.name}`} onClick={() => setAccountEditor(account)}>
              <Pencil size={14} />
            </IconButton>
            {account.closed ? (
              <Button size="sm" variant="outline" onClick={() => setClosed(account.id, false)}>
                Reopen
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setReconciling(account.id)}>
                  Reconcile
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setClosing(account.id);
                    setDialogError("");
                  }}
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="section-top mt-8 mb-5">
        <h2>Account balances</h2>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/transactions" })}>
            Transactions
          </Button>
          {closedCount > 0 && (
            <FieldLabel className="inline-flex items-center gap-2 text-sm">
              <Checkbox checked={showClosed} onCheckedChange={setShowClosed} />
              Show closed ({closedCount})
            </FieldLabel>
          )}
        </div>
      </div>
      {visibleAccounts.length ? (
        <DataTable
          tableKey="accounts"
          label="Account balances"
          data={accountRows}
          columns={columns}
          getRowId={({ account }) => account.id}
          rowClassName={({ account }) => (account.closed ? "opacity-60" : undefined)}
        />
      ) : (
        <EmptyState
          title="No accounts"
          description="Add an account and its opening balance."
          action={
            <Button variant="outline" onClick={() => setAccountEditor("new")}>
              <Plus size={15} /> Add account
            </Button>
          }
        />
      )}
    </>
  );
};
export default AccountList;
