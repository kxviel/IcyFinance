import type { ReactNode } from "react";

type PageHeadingProps = {
	index: string;
	title: string;
	description: string;
	actions?: ReactNode;
};

export function PageHeading({
	index,
	title,
	description,
	actions,
}: PageHeadingProps) {
	return (
		<div className="flex items-end justify-between gap-10 pt-16 pb-10 max-[1200px]:items-start max-[960px]:flex-col max-[960px]:gap-6 max-[960px]:pt-11 max-[680px]:pt-10 max-[680px]:pb-6 print:pt-0">
			<div>
				<span className="text-[10px] font-medium leading-snug tracking-widest text-muted-foreground uppercase">
					{index} / YOUR COLLECTION
				</span>
				<h1 className="mt-5 text-[58px] max-[1200px]:text-[47px] max-[960px]:text-[52px] max-[680px]:text-[44px]">
					{title}
				</h1>
				<p className="mt-5 max-w-135 text-sm leading-relaxed text-muted-foreground max-[680px]:text-xs">
					{description}
				</p>
			</div>
			<div className="flex shrink-0 flex-wrap items-center justify-end gap-5 max-[1200px]:max-w-80 max-[960px]:w-full max-[960px]:max-w-full max-[960px]:justify-start max-[680px]:gap-3 print:hidden">
				{actions}
			</div>
		</div>
	);
}
