import { createLazyFileRoute } from "@tanstack/react-router";
import Budget from "../features/Budget/BudgetList";

export const Route = createLazyFileRoute("/")({
  component: Budget,
});
