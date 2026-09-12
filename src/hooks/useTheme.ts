import { useEffect, useState } from "react";

export const useTheme = () => {
	const [theme, setTheme] = useState<"dark" | "light">(() => {
		try {
			return localStorage.getItem("icyfinance.theme") === "light"
				? "light"
				: "dark";
		} catch {
			return "dark";
		}
	});
	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem("icyfinance.theme", theme);
		} catch {
			/* Appearance remains available without browser storage. */
		}
	}, [theme]);
	const toggleTheme = () =>
		setTheme((current) => (current === "dark" ? "light" : "dark"));
	return { theme, toggleTheme };
};
