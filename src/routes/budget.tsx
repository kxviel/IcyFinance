import { createFileRoute } from "@tanstack/react-router";
import Budget from "@/modules/Budget/Budget";

export const Route = createFileRoute("/budget")({ component: Budget });
