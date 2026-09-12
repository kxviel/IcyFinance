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
	const { openTransaction } = useWorkspace();
	const search = query.trim().toLowerCase();
	const commands = [
		...navigation,
		{ to: "/settings", label: "Settings & backups", key: "" } as const,
	].filter((item) => item.label.toLowerCase().includes(search));
	const showNewTransaction = "new transaction".includes(search);
	return (
		<WorkspaceDialog title="Where to?" initialFocus={input} onClose={onClose}>
			<Input
				ref={input}
				className="mb-3.75"
				aria-label="Search commands"
				placeholder="Find a page or action…"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			/>
			<div className="grid mb-5 [&_:is(button,_a)]:px-1.5 [&_:is(button,_a)]:py-3.75 [&_:is(button,_a)]:flex [&_:is(button,_a)]:items-center [&_:is(button,_a)]:justify-between [&_:is(button,_a)]:border-b [&_:is(button,_a)]:border-border [&_:is(button,_a)]:text-[13px] [&_:is(button,_a):hover]:bg-card [&_:is(button,_a)>span:first-child]:flex [&_:is(button,_a)>span:first-child]:items-center [&_:is(button,_a)>span:first-child]:gap-2.5">
				{commands.map((item) => (
					<Link key={item.to} to={item.to} onClick={onClose}>
						<span>{item.label}</span>
						<span className="text-muted-foreground small text-[12px]">
							{item.key ? `Alt ${item.key}` : "↗"}
						</span>
					</Link>
				))}
				{showNewTransaction && (
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
						<span className="text-muted-foreground small text-[12px]">N</span>
					</button>
				)}
				{!commands.length && !showNewTransaction && (
					<p className="text-muted-foreground" role="status">
						No matching commands.
					</p>
				)}
			</div>
			<p className="small text-[12px] text-muted-foreground">
				Alt + 1–6 to navigate · N to add · Ctrl/Cmd + Z to undo
			</p>
		</WorkspaceDialog>
	);
};
export default CommandMenu;
