import { Link, useLocation } from "@tanstack/react-router";
import { Command, Menu, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { IconButton } from "@/components/icon-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspace";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const Header = ({ openCommands }: { openCommands: () => void }) => {
	const [menu, setMenu] = useState(false);
	const { openTransaction } = useWorkspace();
	const pathname = useLocation({ select: (location) => location.pathname });
	useEffect(() => {
		setMenu(false);
	}, [pathname]);
	return (
		<header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-4 border-b bg-background py-2 print:hidden">
			<Link to="/overview" className="text-base font-semibold ">
				IcyFinance
			</Link>
			<nav
				aria-label="Main navigation"
				className={cn(
					"flex flex-1 items-center gap-1 max-lg:order-3 max-lg:w-full max-lg:flex-auto max-lg:overflow-x-auto",
					!menu && "max-sm:hidden",
				)}
			>
				{[...navigation, { to: "/settings", label: "Settings" } as const].map(
					(item) => (
						<Link
							key={item.to}
							to={item.to}
							className="rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground data-[status=active]:font-medium"
							onClick={() => setMenu(false)}
						>
							{item.label}
						</Link>
					),
				)}
			</nav>
			<div className="ml-auto flex items-center gap-1">
				<Button
					size="sm"
					onClick={() => openTransaction()}
					title="Add transaction"
				>
					<Plus size={15} /> Add transaction
				</Button>
				<IconButton
					className="max-sm:hidden"
					label="Open quick actions"
					onClick={openCommands}
				>
					<Command size={16} />
				</IconButton>
				<ThemeToggle />
				<IconButton
					className="hidden max-sm:inline-flex"
					label="Toggle navigation"
					aria-expanded={menu}
					onClick={() => setMenu((value) => !value)}
				>
					{menu ? <X size={18} /> : <Menu size={18} />}
				</IconButton>
			</div>
		</header>
	);
};
export default Header;
