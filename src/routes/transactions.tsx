import { createFileRoute } from "@tanstack/react-router";
import Transactions from "@/modules/Transactions/Transactions";

export const Route = createFileRoute("/transactions")({
	component: Transactions,
});
