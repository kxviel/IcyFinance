import { useState } from "react";

import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/hooks/use-workspace";
import { setAssignment } from "@/lib/budget";
import type { Category } from "@/lib/budget-types";
import { message } from "@/lib/errors";
import { inputMoney, parseMoney } from "@/lib/money";

function AssignmentInput({ category, amount }: { category: Category; amount: number }) {
  const { month, update, notify } = useWorkspace();
  const [value, setValue] = useState(inputMoney(amount));
  function commit() {
    try {
      const next = parseMoney(value);
      if (next !== amount) update((doc) => setAssignment(doc, category.id, month, next));
      setValue(inputMoney(next));
    } catch (error) {
      setValue(inputMoney(amount));
      notify(message(error), true);
    }
  }
  return (
    <Input
      className="border-border bg-background hover:border-input focus:bg-card h-9 w-full max-w-28 justify-self-end px-3 text-right text-sm tabular-nums"
      aria-label={`Assigned to ${category.name}`}
      inputMode="decimal"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setValue(inputMoney(amount));
          event.currentTarget.blur();
        }
      }}
    />
  );
}

export default AssignmentInput;
