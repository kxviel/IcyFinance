import { cn } from "@/lib/utils";

type StatProps = {
	label: string;
	value: string;
	note?: string;
	negative?: boolean;
};

export function Stat({ label, value, note, negative = false }: StatProps) {
	return (
		<div className="flex min-w-0 flex-col gap-2.5 py-7 pr-7 not-first:border-l not-first:border-border not-first:pl-7 max-[960px]:pr-5 max-[960px]:not-first:pl-5 max-[680px]:grid max-[680px]:grid-cols-[1fr_auto] max-[680px]:items-center max-[680px]:gap-2 max-[680px]:px-0 max-[680px]:py-5.5 max-[680px]:not-first:border-t max-[680px]:not-first:border-l-0 max-[680px]:not-first:pl-0 print:break-inside-avoid">
			<span className="text-[10px] font-medium leading-snug tracking-widest text-muted-foreground uppercase max-[960px]:text-[9px]">
				{label}
			</span>
			<strong
				className={cn(
					"whitespace-nowrap text-[clamp(28px,3vw,42px)] font-[450] leading-tight tracking-[-0.06em] tabular-nums max-[960px]:text-[31px] max-[680px]:text-[32px]",
					negative && "text-destructive",
				)}
			>
				{value}
			</strong>
			{note && (
				<span className="text-[11px] text-muted-foreground max-[960px]:text-[10px] max-[680px]:col-span-full">
					{note}
				</span>
			)}
		</div>
	);
}
