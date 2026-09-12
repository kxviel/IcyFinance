import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
	undefined,
);

function getSystemTheme(): ResolvedTheme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getStoredTheme(storageKey: string, fallback: Theme): Theme {
	try {
		const storedTheme = localStorage.getItem(storageKey);
		return storedTheme === "dark" ||
			storedTheme === "light" ||
			storedTheme === "system"
			? storedTheme
			: fallback;
	} catch {
		return fallback;
	}
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() =>
		getStoredTheme(storageKey, defaultTheme),
	);
	const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
	const resolvedTheme = theme === "system" ? systemTheme : theme;

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const syncSystemTheme = () => setSystemTheme(getSystemTheme());

		mediaQuery.addEventListener("change", syncSystemTheme);
		return () => mediaQuery.removeEventListener("change", syncSystemTheme);
	}, []);

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.toggle("dark", resolvedTheme === "dark");
		root.classList.toggle("light", resolvedTheme === "light");
	}, [resolvedTheme]);

	const value = {
		theme,
		resolvedTheme,
		setTheme: (theme: Theme) => {
			try {
				localStorage.setItem(storageKey, theme);
			} catch {
				// The in-memory theme still changes when storage is unavailable.
			}
			setTheme(theme);
		},
	};

	return (
		<ThemeProviderContext.Provider value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
