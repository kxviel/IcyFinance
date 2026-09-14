import { cn } from "@/lib/utils";

type StatProps = {
	label: string;
	value: string;
	note?: string;
	negative?: boolean;
};

export function Stat({ label, value, note, negative = false }: StatProps) {
	return (
		<div className="min-w-0 py-3 pr-4 not-first:border-l not-first:pl-4 max-sm:not-first:border-l-0 max-sm:not-first:border-t max-sm:not-first:pl-0">
			<div className="text-sm text-muted-foreground">{label}</div>
			<strong
				className={cn(
					"mt-1 block text-3xl font-semibold tabular-nums",
					negative && "text-destructive",
				)}
			>
				{value}
			</strong>
			{note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
		</div>
	);
}
