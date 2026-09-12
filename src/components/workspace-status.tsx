import { isTauri } from "@tauri-apps/api/core";
import { useBudgetStore } from "@/components/budget-provider";
import { Button } from "@/components/ui/button";

const WorkspaceStatus = () => {
	const store = useBudgetStore();
	if (!store.ready)
		return (
			<main className="w-[min(700px,_calc(100%_-_64px))] min-h-[80vh] m-auto flex flex-col items-start justify-center gap-6">
				<span className="inline-flex items-center gap-2.75 p-0 text-[24px] leading-[1] font-[620] tracking-[-0.05em] whitespace-nowrap max-[960px]:text-[23px]">
					IcyFinance
					<span className="block w-3.5 h-3.5 border border-current [transform:rotate(45deg)] bg-[linear-gradient(90deg,_currentColor_50%,_transparent_50%)]" />
				</span>
				<p className="text-muted-foreground">Opening your collection…</p>
				<span className="block h-0.25 w-40 bg-[linear-gradient(_90deg,_var(--border),_var(--foreground),_var(--border)_)] [background-size:200%_100%] animate-[loading_1.5s_ease_infinite]" />
			</main>
		);
	return (
		<main className="w-[min(700px,_calc(100%_-_64px))] min-h-[80vh] m-auto flex flex-col items-start justify-center gap-6 [&_h1]:text-[54px] [&_p]:max-w-135 [&_p]:text-[13px] [&_p]:leading-[1.8] max-[680px]:[&_h1]:text-[38px]">
			<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
				ICYFINANCE / SQLITE
			</span>
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
						Start it from this project with <code>pnpm desktop</code>.
					</p>
				</>
			)}
		</main>
	);
};
export default WorkspaceStatus;
