import { Outlet, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useBudgetStore } from "@/components/budget-provider";
import CommandMenu from "@/components/command-menu";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { navigation } from "@/lib/navigation";

const AppLayout = () => {
	const { error, retrySave } = useBudgetStore();
	const [commands, setCommands] = useState(false);
	const openCommands = useCallback(() => setCommands(true), []);
	const pathname = useLocation({ select: (location) => location.pathname });
	useEffect(() => {
		document.title = `${navigation.find((item) => item.to === pathname)?.label ?? "Settings"} — IcyFinance`;
	}, [pathname]);
	return (
		<>
			<Toaster />
			<a
				className="fixed -top-20 left-5 z-100 px-5 py-3 bg-foreground text-background focus:top-3"
				href="#main-content"
			>
				Skip to content
			</a>
			<div className="mx-auto flex min-h-dvh w-full max-w-360 flex-col px-4 sm:px-6 print:px-0">
				<Header openCommands={openCommands} />
				{error && (
					<div
						className="px-5 py-4 border border-border bg-card text-sm leading-[1.7] mt-5 flex justify-between items-center gap-5 text-destructive"
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
					className="min-w-0 flex-1 pb-6 outline-none print:p-0"
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
