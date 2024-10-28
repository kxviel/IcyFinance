import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Sidebar } from "../components/Sidebar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="w-full bg-[#f9f9f9] p-8">
          <Outlet />
        </div>
      </div>

      <ReactQueryDevtools />
      <TanStackRouterDevtools />
    </>
  );
}
