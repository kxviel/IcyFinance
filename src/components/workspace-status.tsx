import { isTauri } from "@tauri-apps/api/core";
import { useBudgetStore } from "@/components/budget-provider";
import { Button } from "@/components/ui/button";

const WorkspaceStatus = () => {
	const store = useBudgetStore();
	if (!store.ready)
		return (
			<main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-6">
				<span className="text-base font-semibold">IcyFinance</span>
				<p className="text-muted-foreground">Loading budget…</p>
				<span className="block h-0.25 w-40 bg-[linear-gradient(_90deg,_var(--border),_var(--foreground),_var(--border)_)] [background-size:200%_100%] animate-[loading_1.5s_ease_infinite]" />
			</main>
		);
	return (
		<main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-6">
			<h1>
				{isTauri()
					? "Your budget couldn’t be opened."
					: "Open IcyFinance on your desktop."}
			</h1>
			{isTauri() ? (
				<>
					<p role="alert">{store.error}</p>
					<p className="text-muted-foreground">
						Your saved budget is unchanged. Check that your app-data folder is
						accessible, then try again.
					</p>
					<Button variant="default" onClick={store.retryLoad}>
						Try again
					</Button>
				</>
			) : (
				<>
					<p>
						The desktop app saves to SQLite on this device. No database
						installation is needed.
					</p>
					<p className="text-muted-foreground">
						Start it from this project with <code>pnpm tauri dev</code>.
					</p>
				</>
			)}
		</main>
	);
};
export default WorkspaceStatus;
