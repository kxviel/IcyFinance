import { Outlet, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { useBudgetStore } from "@/components/budget-provider";
import CommandMenu from "@/components/command-menu";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { navigation } from "@/lib/navigation";

const AppLayout = () => {
  const { error, retrySave } = useBudgetStore();
  const [commands, setCommands] = useState(false);
  const openCommands = useCallback(() => setCommands(true), []);
  const pathname = useLocation({ select: (location) => location.pathname });
  useEffect(() => {
    document.title = `${navigation.find((item) => item.to === pathname)?.label ?? "Settings"} — IcyFinance`;
  }, [pathname]);
  return (
    <>
      <Toaster />
      <a
        className="bg-foreground text-background fixed -top-20 left-5 z-100 px-5 py-3 focus:top-3"
        href="#main-content"
      >
        Skip to content
      </a>
      <div className="app-shell">
        <Header openCommands={openCommands} />
        <div className="app-body">
          {error && (
            <div
              className="notice text-destructive flex items-center justify-between gap-5"
              role="alert"
            >
              <span>{error}</span>
              <Button variant="outline" onClick={() => void retrySave()}>
                Retry save
              </Button>
            </div>
          )}
          <main id="main-content" tabIndex={-1} className="app-main print:p-0">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      {commands && <CommandMenu onClose={() => setCommands(false)} />}
    </>
  );
};
export default AppLayout;
