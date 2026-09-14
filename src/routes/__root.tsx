import { createRootRoute, Link } from "@tanstack/react-router";
import AppLayout from "@/components/app-layout";
import { BudgetProvider } from "@/components/budget-provider";
import WorkspaceError from "@/components/workspace-error";
import WorkspaceProvider from "@/components/workspace-provider";

export const Route = createRootRoute({
	component: RootComponent,
	errorComponent: WorkspaceError,
	notFoundComponent: () => (
		<div className="px-5 py-16.25 flex flex-col items-center text-center gap-3.75 border-b border-border [&_p]:max-w-100 [&_p]:text-sm [&_[data-slot=button]]:mt-2">
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
