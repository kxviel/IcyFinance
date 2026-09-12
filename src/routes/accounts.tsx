import { createFileRoute } from "@tanstack/react-router";
import Accounts from "@/modules/Accounts/Accounts";

export const Route = createFileRoute("/accounts")({ component: Accounts });
