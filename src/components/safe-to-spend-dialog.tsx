import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useWorkspace } from "@/hooks/use-workspace";
import { message } from "@/lib/errors";

const SafeToSpendDialog = ({ onClose }: { onClose: () => void }) => {
  const { doc, update, notify } = useWorkspace();
  const [selected, setSelected] = useState<string[]>(doc.safeToSpendCategoryIds);
  const [error, setError] = useState("");
  function save() {
    try {
      update((current) => ({
        ...current,
        safeToSpendCategoryIds: selected.filter((id) =>
          current.categories.some((category) => category.id === id),
        ),
      }));
      notify("Safe to Spend categories saved.");
      onClose();
    } catch (cause) {
      setError(message(cause));
    }
  }
  return (
    <WorkspaceDialog
      title="Safe to Spend categories"
      description="Choose the envelopes you use for day-to-day spending."
      onClose={onClose}
    >
      <div className="grid gap-4">
        <div className="bg-background max-h-72 divide-y overflow-y-auto rounded-md border px-4">
          {doc.categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 py-4 text-sm">
              <Checkbox
                id={`safe-${category.id}`}
                checked={selected.includes(category.id)}
                onCheckedChange={(checked) =>
                  setSelected((current) =>
                    checked === true
                      ? current.includes(category.id)
                        ? current
                        : [...current, category.id]
                      : current.filter((id) => id !== category.id),
                  )
                }
              />
              <label
                htmlFor={`safe-${category.id}`}
                className="min-w-0 cursor-pointer wrap-anywhere"
              >
                <span className="block font-medium">{category.name}</span>
                <span className="text-muted-foreground">{category.group}</span>
              </label>
            </div>
          ))}
          {!doc.categories.length && (
            <p className="text-muted-foreground py-4 text-sm">Add categories in Budget first.</p>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Only these envelopes’ available balances contribute, including any overspending. Moving
          money between budget accounts does not change this total. Select none to turn off the
          summary.
        </p>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save categories</Button>
        </DialogFooter>
      </div>
    </WorkspaceDialog>
  );
};

export default SafeToSpendDialog;
