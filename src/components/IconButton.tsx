import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function IconButton({
	label,
	className,
	...props
}: Omit<ComponentProps<typeof Button>, "className"> & {
	label: string;
	className?: string;
}) {
	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label={label}
			title={label}
			className={cn(
				"icon-button rounded-full text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export { IconButton };
