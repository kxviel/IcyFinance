import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { navigation } from "@/lib/navigation";
import { useBudgetStore } from "@/modules/Workspace/BudgetProvider";
import { useWorkspace } from "@/modules/Workspace/useWorkspace";

export const useShortcuts = (openCommands: () => void) => {
	const navigate = useNavigate();
	const { canUndo, undo } = useBudgetStore();
	const { notify, openTransaction } = useWorkspace();
	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (event.defaultPrevented || event.isComposing) return;
			const target = event.target;
			const typing =
				target instanceof HTMLElement &&
				(target.isContentEditable ||
					Boolean(target.closest("input, textarea, select")));
			if (document.querySelector('[role="dialog"], [role="alertdialog"]'))
				return;
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				openCommands();
				return;
			}
			if (typing) return;
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
				event.preventDefault();
				if (canUndo) {
					undo();
					notify("Last change undone.");
				}
				return;
			}
			if (event.altKey) {
				const item = navigation.find((item) => item.key === event.key);
				if (item) {
					event.preventDefault();
					void navigate({ to: item.to });
				}
			}
			if (
				!event.ctrlKey &&
				!event.metaKey &&
				!event.altKey &&
				event.key.toLowerCase() === "n"
			) {
				event.preventDefault();
				openTransaction();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [canUndo, undo, navigate, notify, openTransaction, openCommands]);
};
