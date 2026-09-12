import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function SectionLink({
	children,
	onClick,
}: {
	children: ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			className="inline-flex items-center gap-2 text-[12px] px-0 py-1.25 text-muted-foreground no-underline hover:text-foreground"
			onClick={onClick}
		>
			{children}
			<ArrowUpRight size={16} />
		</button>
	);
}
