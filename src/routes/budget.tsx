import { createFileRoute } from "@tanstack/react-router";
import Budget from "@/pages/Budget";

export const Route = createFileRoute("/budget")({ component: Budget });
