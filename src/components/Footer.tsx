import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Undo2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { cn } from "@/lib/utils";
import { useBudgetStore } from "@/modules/Workspace/BudgetProvider";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

const Footer = () => {
	const { saveStatus, canUndo, undo } = useBudgetStore();
	const { notify } = useWorkspace();
	return (
		<footer className="pt-7.5 pr-0 pb-9.5 pl-0 border-t border-border flex items-center justify-between gap-6 [&>div:first-child]:flex [&>div:first-child]:items-center [&>div:first-child]:gap-6.25 max-[960px]:[&>div:first-child]:gap-3.75 max-[960px]:[&>div:first-child_.small]:hidden max-[680px]:items-start max-[680px]:px-0 max-[680px]:py-6.25 print:hidden!">
			<div>
				<span className="text-[16px] font-semibold tracking-[-0.05em]">
					IcyFinance
				</span>
				<span className="text-muted-foreground small text-[12px]">
					A quieter way to money.
				</span>
			</div>
			<div className="flex items-center gap-4.5 max-[960px]:gap-2.5 max-[680px]:flex-wrap max-[680px]:justify-end max-[680px]:max-w-56.25 max-[680px]:gap-y-2.5">
				<span
					className={cn(
						"inline-flex items-center gap-1.75 text-muted-foreground text-[11px] max-[680px]:w-full max-[680px]:justify-end max-[680px]:text-[9px]",
						saveStatus === "error" && "text-destructive!",
					)}
					role="status"
				>
					<span className="inline-block w-1.25 h-1.25 rounded-full bg-current shrink-0" />
					{saveStatus === "saving"
						? "Saving…"
						: saveStatus === "error"
							? "Not saved"
							: "Saved on this device"}
				</span>
				<IconButton
					label="Undo last change (Ctrl+Z)"
					disabled={!canUndo}
					onClick={() => {
						undo();
						notify("Last change undone.");
					}}
				>
					<Undo2 size={16} />
				</IconButton>
				<Link
					to="/settings"
					className="inline-flex items-center gap-2 text-[12px] px-0 py-1.25 text-muted-foreground no-underline hover:text-foreground"
				>
					Settings <ArrowUpRight size={15} />
				</Link>
			</div>
		</footer>
	);
};
export default Footer;
