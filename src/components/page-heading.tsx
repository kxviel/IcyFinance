import type { ReactNode } from "react";

type PageHeadingProps = {
	title: string;
	description?: string;
	actions?: ReactNode;
};

export function PageHeading({ title, description, actions }: PageHeadingProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 py-6 print:pt-0">
			<div className="min-w-0">
				<h1 className="text-3xl font-semibold ">{title}</h1>
				{description && (
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			{actions && (
				<div className="flex flex-wrap items-center gap-2 print:hidden">
					{actions}
				</div>
			)}
		</div>
	);
}
