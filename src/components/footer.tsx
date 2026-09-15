import { Undo2 } from "lucide-react";
import { useBudgetStore } from "@/components/budget-provider";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";

const Footer = () => {
	const { saveStatus, canUndo, undo } = useBudgetStore();
	const { notify } = useWorkspace();
	return (
		<footer className="sticky bottom-0 z-20 flex h-11 items-center justify-between border-t bg-background text-sm print:hidden">
			<span
				role="status"
				className={cn(
					"text-muted-foreground",
					saveStatus === "error" && "text-destructive",
				)}
			>
				{saveStatus === "saving"
					? "Saving…"
					: saveStatus === "error"
						? "Not saved"
						: "Saved on this device"}
			</span>
			<Button
				variant="ghost"
				size="sm"
				title="Undo last change"
				disabled={!canUndo}
				onClick={() => {
					undo();
					notify("Change undone.");
				}}
			>
				<Undo2 size={14} /> Undo
			</Button>
		</footer>
	);
};
export default Footer;
