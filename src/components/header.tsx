import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowDownUp,
  ChartNoAxesCombined,
  Command,
  LayoutDashboard,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { IconButton } from "@/components/icon-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspace";
import { navigation } from "@/lib/navigation";

const navigationIcons = {
  "/overview": LayoutDashboard,
  "/budget": SlidersHorizontal,
  "/transactions": ArrowDownUp,
  "/accounts": Wallet,
  "/targets": Target,
  "/reports": ChartNoAxesCombined,
  "/settings": Settings,
};

const Header = ({ openCommands }: { openCommands: () => void }) => {
  const [menu, setMenu] = useState(false);
  const { doc, openTransaction } = useWorkspace();
  const hasOpenAccount = doc.accounts.some((account) => !account.closed);
  const pathname = useLocation({ select: (location) => location.pathname });
  useEffect(() => {
    setMenu(false);
  }, [pathname]);
  return (
    <header className="app-sidebar print:hidden">
      <Link to="/overview" className="brand" aria-label="IcyFinance overview">
        <span className="brand-mark" aria-hidden="true">
          i
        </span>
        <span className="brand-name">IcyFinance</span>
      </Link>
      <div className="mobile-controls">
        <IconButton
          label="Add transaction"
          disabled={!hasOpenAccount}
          onClick={() => openTransaction()}
        >
          <Plus size={18} />
        </IconButton>
        <IconButton label="Open quick actions" onClick={openCommands}>
          <Command size={17} />
        </IconButton>
        <ThemeToggle />
        <IconButton
          label="Toggle navigation"
          aria-expanded={menu}
          aria-controls="main-navigation"
          onClick={() => setMenu((value) => !value)}
        >
          {menu ? <X size={19} /> : <Menu size={19} />}
        </IconButton>
      </div>
      <p className="sidebar-kicker">Your workspace</p>
      <nav
        id="main-navigation"
        aria-label="Main navigation"
        className="sidebar-nav"
        data-open={menu}
      >
        {[...navigation, { to: "/settings", label: "Settings" } as const].map((item) => {
          const Icon = navigationIcons[item.to];
          return (
            <Link key={item.to} to={item.to} className="nav-link" onClick={() => setMenu(false)}>
              <Icon size={17} strokeWidth={1.65} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="workspace-label">
          <ShieldCheck size={16} className="text-[var(--hero-accent)]" aria-hidden="true" />
          <span title={doc.name}>{doc.name}</span>
        </div>
        <Button
          className="sidebar-add"
          onClick={() => openTransaction()}
          disabled={!hasOpenAccount}
          title={
            hasOpenAccount
              ? "Add transaction"
              : "Create or reopen an account before adding a transaction"
          }
        >
          <Plus size={16} /> Add transaction
        </Button>
        <div className="sidebar-actions">
          <Button variant="ghost" size="sm" onClick={openCommands}>
            <Command size={15} /> Quick actions
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
export default Header;
