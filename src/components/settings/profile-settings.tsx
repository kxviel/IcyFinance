import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { useSettings } from "@/hooks/use-settings";
import { currencies } from "@/lib/backups";
import type { OverspendingPolicy } from "@/lib/budget-types";

type Props = Pick<
  ReturnType<typeof useSettings>,
  | "doc"
  | "name"
  | "setName"
  | "currency"
  | "setCurrency"
  | "defaultOverspendingPolicy"
  | "setDefaultOverspendingPolicy"
  | "busy"
  | "currencyLocked"
  | "saveProfile"
>;
const ProfileSettings = ({
  doc,
  name,
  setName,
  currency,
  setCurrency,
  defaultOverspendingPolicy,
  setDefaultOverspendingPolicy,
  busy,
  currencyLocked,
  saveProfile,
}: Props) => {
  const fieldId = useId();
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="section-top">
          <div>
            <h2>Budget details</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <form onSubmit={saveProfile} className="form-stack grid gap-4">
          <Field>
            <FieldLabel htmlFor={`${fieldId}-1`}>Budget name</FieldLabel>
            <Input
              id={`${fieldId}-1`}
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-2`}>Currency</FieldLabel>
            <NativeSelect
              id={`${fieldId}-2`}
              aria-describedby={`${fieldId}-2-hint`}
              value={currency}
              disabled={currencyLocked}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {[...new Set([doc.currency, ...currencies])].map((code) => (
                <option value={code} key={code}>
                  {code}
                </option>
              ))}
            </NativeSelect>
            <FieldDescription id={`${fieldId}-2-hint`}>
              {currencyLocked
                ? "Currency is fixed once this budget has amounts."
                : "Choose before adding money; amounts are not converted."}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-3`}>Default overspending next month</FieldLabel>
            <NativeSelect
              id={`${fieldId}-3`}
              aria-describedby={`${fieldId}-3-hint`}
              value={defaultOverspendingPolicy}
              onChange={(event) =>
                setDefaultOverspendingPolicy(event.target.value as OverspendingPolicy)
              }
            >
              <option value="carry">Carry the negative balance</option>
              <option value="deduct-from-next-ready">
                Reset it and deduct from Ready to Assign
              </option>
            </NativeSelect>
            <FieldDescription id={`${fieldId}-3-hint`}>
              Categories can override this default. Positive balances always carry forward.
            </FieldDescription>
          </Field>
          <div className="button-row">
            <Button
              type="submit"
              variant="default"
              disabled={
                Boolean(busy) ||
                (name.trim() === doc.name &&
                  currency === doc.currency &&
                  defaultOverspendingPolicy === doc.defaultOverspendingPolicy)
              }
            >
              Save details
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default ProfileSettings;
