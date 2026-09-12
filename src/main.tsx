import React from "react";
import ReactDOM from "react-dom/client";
import "@/globals.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
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
		<ThemeProvider defaultTheme="dark" storageKey="icyfinance.theme">
			<RouterProvider router={router} />
		</ThemeProvider>
	</React.StrictMode>,
);
