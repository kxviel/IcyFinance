import { cn } from "@/lib/utils";

type StatProps = {
  label: string;
  value: string;
  note?: string;
  negative?: boolean;
};

export function Stat({ label, value, note, negative = false }: StatProps) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <strong
        className={cn("stat-value", value.length > 14 && "text-xl", negative && "text-destructive")}
      >
        {value}
      </strong>
      {note && <p className="stat-note">{note}</p>}
    </div>
  );
}
