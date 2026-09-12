import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<Button
			type="button"
			role="switch"
			aria-label="Theme"
			aria-checked={isDark}
			title={`Switch to ${isDark ? "light" : "dark"} mode`}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			variant="ghost"
			size="icon"
			className="rounded-full"
		>
			{isDark ? <SunIcon /> : <MoonIcon />}
		</Button>
	);
}
