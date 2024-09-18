import { Link, useMatchRoute } from "@tanstack/react-router";
import { Wallet, ChartBarDecreasing, Omega } from "lucide-react";

export const Sidebar = () => {
  const matchRoute = useMatchRoute();
  console.log(matchRoute);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col items-center border-r border-border bg-background px-4 py-6">
        <Link to="/" className="mb-8">
          <Omega size={42} />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <nav className="flex flex-col items-start gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Wallet size={24} />
            <span>Budgets</span>
          </Link>
          <Link
            to="/activity"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChartBarDecreasing size={24} />
            <span>Activity</span>
          </Link>
        </nav>
        <div className="mt-auto flex flex-col items-start gap-2">
          <div className="text-xs font-medium text-muted-foreground">
            Contact Us
          </div>
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            support@acme.com
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            +1 (234) 567-890
          </Link>
        </div>
      </div>
    </div>
  );
};
