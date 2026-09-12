import { createRootRoute, Link } from "@tanstack/react-router";
import AppLayout from "@/components/AppLayout";
import WorkspaceError from "@/components/WorkspaceError";
import { BudgetProvider } from "@/modules/Workspace/BudgetProvider";
import WorkspaceProvider from "@/modules/Workspace/WorkspaceProvider";

export const Route = createRootRoute({
	component: RootComponent,
	errorComponent: WorkspaceError,
	notFoundComponent: () => (
		<div className="px-5 py-16.25 flex flex-col items-center text-center gap-3.75 border-b border-border [&_p]:max-w-100 [&_p]:text-[13px] [&_[data-slot=button]]:mt-2">
			<h1>Page not found.</h1>
			<Link to="/overview">Return to your overview</Link>
		</div>
	),
});

function RootComponent() {
	return (
		<BudgetProvider>
			<WorkspaceProvider>
				<AppLayout />
			</WorkspaceProvider>
		</BudgetProvider>
	);
}
