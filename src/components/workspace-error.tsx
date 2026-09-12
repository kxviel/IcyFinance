import { Button } from "@/components/ui/button";

const WorkspaceError = () => (
	<main className="w-[min(700px,_calc(100%_-_64px))] min-h-[80vh] m-auto flex flex-col items-start justify-center gap-6 [&_h1]:text-[54px] [&_p]:max-w-135 [&_p]:text-[13px] [&_p]:leading-[1.8] max-[680px]:[&_h1]:text-[38px]">
		<span className="eyebrow inline-flex items-center gap-2.25 text-muted-foreground text-[10px] font-[550] leading-[1.4] tracking-[0.11em] uppercase">
			ICYFINANCE
		</span>
		<h1>Something lost its shape.</h1>
		<p>
			Reload the workspace to try again. Your saved budget remains on this
			device.
		</p>
		<Button variant="default" onClick={() => location.reload()}>
			Reload workspace
		</Button>
	</main>
);
export default WorkspaceError;
