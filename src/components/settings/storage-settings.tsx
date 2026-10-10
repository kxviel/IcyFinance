import { Database, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { useSettings } from "@/hooks/use-settings";

type Props = Pick<ReturnType<typeof useSettings>, "database" | "setDatabaseAttempt" | "busy">;
const StorageSettings = ({ database, setDatabaseAttempt, busy }: Props) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="section-top">
          <div>
            <h2>Storage</h2>
          </div>
          <Database size={22} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <p className="text-muted-foreground">Your budget saves automatically to SQLite.</p>
        <div className="notice">
          <strong>SQLite</strong>
          <p
            className={
              database.failed
                ? "text-destructive wrap-anywhere"
                : "text-muted-foreground wrap-anywhere"
            }
            role={database.failed ? "alert" : "status"}
          >
            {database.text}
          </p>
        </div>
        <div className="button-row">
          <Button
            variant="outline"
            onClick={() => setDatabaseAttempt((attempt) => attempt + 1)}
            disabled={Boolean(busy) || database.pending}
          >
            <RefreshCw size={15} /> Check database
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default StorageSettings;
