import { Link, useLocation } from "@tanstack/react-router";
import { Command, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { IconButton } from "@/components/icon-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type HeaderProps = {
	openCommands: () => void;
};

const Header = ({ openCommands }: HeaderProps) => {
	const [menu, setMenu] = useState(false);
	const pathname = useLocation({ select: (location) => location.pathname });
	useEffect(() => {
		setMenu(false);
	}, [pathname]);

	return (
		<header className="flex min-h-28 items-center gap-12 border-b border-border max-[1200px]:gap-6 max-[960px]:min-h-24 max-[960px]:flex-wrap max-[960px]:gap-4 max-[960px]:py-6 min-[1700px]:min-h-34 print:hidden">
			<Link
				to="/overview"
				className="inline-flex items-center gap-3 whitespace-nowrap text-2xl font-semibold leading-none tracking-tight"
			>
				IcyFinance
				<span className="size-3.5 rotate-45 border border-current bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]" />
			</Link>
			<nav
				aria-label="Main navigation"
				className={cn(
					"ml-auto flex gap-7 max-[1200px]:gap-4 max-[960px]:order-3 max-[960px]:m-0 max-[960px]:w-full max-[960px]:justify-between max-[680px]:flex-wrap max-[680px]:justify-start min-[1700px]:gap-9",
					!menu && "max-[680px]:hidden",
				)}
			>
				{navigation.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						className="relative whitespace-nowrap py-3 text-xs text-muted-foreground hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:bottom-0 data-[status=active]:after:left-1/2 data-[status=active]:after:size-1 data-[status=active]:after:rounded-full data-[status=active]:after:bg-current min-[1700px]:text-[13px]"
						onClick={() => setMenu(false)}
					>
						{item.label}
					</Link>
				))}
			</nav>
			<div className="flex items-center gap-5 max-[1200px]:gap-3 max-[960px]:ml-auto">
				<IconButton
					className="max-[680px]:hidden"
					label="Open command menu (Ctrl+K)"
					onClick={openCommands}
				>
					<Command size={19} />
				</IconButton>
				<ThemeToggle />
				<IconButton
					className="hidden max-[680px]:inline-flex"
					label="Toggle navigation"
					aria-expanded={menu}
					onClick={() => setMenu((current) => !current)}
				>
					{menu ? <X size={20} /> : <Menu size={20} />}
				</IconButton>
			</div>
		</header>
	);
};
export default Header;
