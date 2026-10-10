import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import WorkspaceDialog from "@/components/workspace-dialog";
import { useWorkspace } from "@/hooks/use-workspace";
import { navigation } from "@/lib/navigation";

const CommandMenu = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const { doc, openTransaction } = useWorkspace();
  const hasOpenAccount = doc.accounts.some((account) => !account.closed);
  const search = query.trim().toLowerCase();
  const commands = [
    ...navigation,
    { to: "/settings", label: "Settings & backups" } as const,
  ].filter((item) => item.label.toLowerCase().includes(search));
  const showNewTransaction = "new transaction".includes(search);
  return (
    <WorkspaceDialog title="Quick actions" initialFocus={input} onClose={onClose}>
      <Input
        ref={input}
        className="mb-1"
        aria-label="Search commands"
        placeholder="Find a page or action…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="command-list">
        {commands.map((item) => (
          <Link key={item.to} to={item.to} onClick={onClose}>
            <span>{item.label}</span>
          </Link>
        ))}
        {showNewTransaction && hasOpenAccount && (
          <button
            type="button"
            onClick={() => {
              onClose();
              openTransaction();
            }}
          >
            <span>
              <Plus size={14} /> New transaction
            </span>
          </button>
        )}
        {showNewTransaction && !hasOpenAccount && (
          <Link to="/accounts" onClick={onClose}>
            <span>
              <Plus size={14} /> Create or reopen an account first
            </span>
          </Link>
        )}
        {!commands.length && !showNewTransaction && (
          <p className="text-muted-foreground" role="status">
            No matching commands.
          </p>
        )}
      </div>
    </WorkspaceDialog>
  );
};
export default CommandMenu;
