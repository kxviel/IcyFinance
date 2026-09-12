import type { ReactNode } from "react";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

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
		<Empty className="rounded-none border-b border-solid border-border px-5 py-16">
			<EmptyHeader>
				<EmptyMedia
					aria-hidden="true"
					className="mb-6 size-11 rotate-45 border border-subtle bg-[repeating-linear-gradient(0deg,transparent_0_4px,var(--border)_4px_5px)]"
				/>
				<EmptyTitle>
					<h3>{title}</h3>
				</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{action && <EmptyContent>{action}</EmptyContent>}
		</Empty>
	);
}
