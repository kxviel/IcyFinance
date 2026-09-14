import type { ReactNode } from "react";

export function EmptyState({
	title,
	description,
	action,
}: {
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<div className="flex flex-col items-start gap-2 border-b py-6">
			<h3 className="text-sm font-medium">{title}</h3>
			<p className="text-sm text-muted-foreground">{description}</p>
			{action && <div className="mt-1">{action}</div>}
		</div>
	);
}
