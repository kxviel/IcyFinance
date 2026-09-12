import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/inter";
import "@/globals.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
	routeTree,
	scrollRestoration: true,
	defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const root = document.getElementById("root");
if (!root) throw new Error("App root was not found.");
ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
