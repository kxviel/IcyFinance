import { Check } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useReconcileDialog } from "@/hooks/use-reconcile-dialog";
import { shortDate, today } from "@/lib/dates";

const ReconcileDialog = ({ accountId, onClose }: { accountId: string; onClose: () => void }) => {
  const fieldId = useId();

  const {
    doc,
    account,
    cleared,
    statement,
    setStatement,
    consent,
    setConsent,
    error,
    statementBalance,
    difference,
    fingerprint,
    pending,
    money,
    save,
  } = useReconcileDialog({ accountId, onClose });
  return (
    <WorkspaceDialog
      title="Reconcile account"
      description={`Reconcile ${account.name} against its cleared bank balance as of today. Mark settled entries cleared in the register first.`}
      onClose={onClose}
    >
      <form className="form-stack grid gap-4" onSubmit={save}>
        <Field>
          <FieldLabel
            htmlFor={`${fieldId}-1`}
          >{`Bank's cleared balance (${doc.currency})`}</FieldLabel>
          <Input
            id={`${fieldId}-1`}
            aria-describedby={`${fieldId}-1-hint`}
            autoFocus
            required
            inputMode="decimal"
            value={statement}
            onChange={(event) => {
              setStatement(event.target.value);
              setConsent("");
            }}
          />
          <FieldDescription id={`${fieldId}-1-hint`}>
            {"Exclude pending card payments and future entries."}
          </FieldDescription>
        </Field>
        <div className="summary-list" aria-live="polite">
          <div>
            <span className="text-muted-foreground">Opening balance</span>
            <strong className="numeric whitespace-nowrap tabular-nums">
              {money(account.openingBalance)}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground">Cleared entries through today</span>
            <strong className="numeric whitespace-nowrap tabular-nums">
              {money(cleared.balance - account.openingBalance)}
            </strong>
          </div>
          <div>
            <span>IcyFinance cleared balance</span>
            <strong className="numeric whitespace-nowrap tabular-nums">
              {money(cleared.balance)}
            </strong>
          </div>
          <div>
            <span>Bank's cleared balance</span>
            <strong className="numeric whitespace-nowrap tabular-nums">
              {statementBalance === null ? "—" : money(statementBalance)}
            </strong>
          </div>
          <div className={difference ? "text-destructive!" : ""}>
            <span>{difference === 0 ? "Difference · all matched" : "Adjustment needed"}</span>
            <strong className="numeric whitespace-nowrap tabular-nums">
              {difference === null ? "—" : money(difference)}
            </strong>
          </div>
        </div>
        <p className="text-muted-foreground small text-sm">
          {pending.length} cleared {pending.length === 1 ? "entry will" : "entries will"} be locked
          as reconciled in this account. Uncleared and future entries stay as they are. Each side of
          a transfer is reconciled separately.
        </p>
        {difference !== null && difference !== 0 && (
          <>
            <p className="notice">
              First check for missing or duplicate transactions. Continuing adds a{" "}
              {money(difference)} reconciliation adjustment dated {shortDate(today())}.
              {account.kind !== "tracking" &&
                " This changes your budget's Ready to assign balance. Review its category in the register."}
            </p>
            <FieldLabel className="check-label text-muted-foreground inline-flex items-center gap-2.25 text-sm">
              <Checkbox
                checked={consent === fingerprint}
                onCheckedChange={(checked) => setConsent(checked ? fingerprint : "")}
              />{" "}
              Add this adjustment and reconcile the account
            </FieldLabel>
          </>
        )}
        {error && (
          <p className="text-destructive px-0 py-3 text-sm leading-[1.7]" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            type="submit"
            disabled={statementBalance === null || (difference !== 0 && consent !== fingerprint)}
          >
            <Check size={16} /> {difference === 0 ? "Reconcile account" : "Adjust & reconcile"}
          </Button>
        </DialogFooter>
      </form>
    </WorkspaceDialog>
  );
};

export default ReconcileDialog;
