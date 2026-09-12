import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	plugins: [
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		react(),
		tailwindcss(),
	],
	resolve: {
		tsconfigPaths: true,
	},
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
		host: host || "127.0.0.1",
		hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
		watch: { ignored: ["**/src-tauri/**"] },
	},
	build: {
		target: ["es2022", "chrome105", "safari15.4"],
		sourcemap: false,
	},
});
