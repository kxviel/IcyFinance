import { Outlet, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import CommandMenu from "@/components/CommandMenu";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/useTheme";
import { navigation } from "@/lib/navigation";
import { useBudgetStore } from "@/modules/Workspace/BudgetProvider";
import { useShortcuts } from "@/modules/Workspace/useShortcuts";

const AppLayout = () => {
	const { error, retrySave } = useBudgetStore();
	const { theme, toggleTheme } = useTheme();
	const [commands, setCommands] = useState(false);
	const openCommands = useCallback(() => setCommands(true), []);
	const pathname = useLocation({ select: (location) => location.pathname });
	useShortcuts(openCommands);
	useEffect(() => {
		document.title = `${navigation.find((item) => item.to === pathname)?.label ?? "Settings"} — IcyFinance`;
	}, [pathname]);
	return (
		<>
			<Toaster theme={theme} />
			<a
				className="fixed -top-20 left-5 z-100 px-5 py-3 bg-foreground text-background focus:top-3"
				href="#main-content"
			>
				Skip to content
			</a>
			<div className="w-[min(1440px,_calc(100%_-_128px))] mx-auto my-0 min-[1700px]:w-[min(1600px,_calc(100%_-_240px))] max-[1200px]:w-[calc(100%_-_72px)] max-[960px]:w-[calc(100%_-_48px)] max-[680px]:w-[calc(100%_-_36px)] print:w-full">
				<Header
					theme={theme}
					toggleTheme={toggleTheme}
					openCommands={openCommands}
				/>
				{error && (
					<div
						className="px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mt-5 flex justify-between items-center gap-5 text-destructive"
						role="alert"
					>
						<span>{error}</span>
						<Button variant="outline" onClick={() => void retrySave()}>
							Retry save
						</Button>
					</div>
				)}
				<main
					id="main-content"
					tabIndex={-1}
					className="min-h-[65vh] pb-22 outline-none animate-[arrive_0.28s_ease-out] max-[680px]:pb-12.5 print:p-0"
				>
					<Outlet />
				</main>
				<Footer />
			</div>
			{commands && <CommandMenu onClose={() => setCommands(false)} />}
		</>
	);
};
export default AppLayout;
