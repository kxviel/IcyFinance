import { createLazyFileRoute } from "@tanstack/react-router";
import { Input } from "../components/ui/input";
import AddBudget from "../features/Budget/AddBudget";
import BudgetList from "../features/Budget/BudgetList";

export const Route = createLazyFileRoute("/")({
  component: Budget,
});

function Budget() {
  return (
    <main className="flex h-full w-full flex-col items-center gap-[48px] p-8">
      <h1 className="self-start text-3xl font-bold">Budget</h1>

      <div className="flex w-full items-center justify-between gap-2">
        <Input placeholder="Search" type="search" className="w-[50%]" />
        <AddBudget />
      </div>

      <BudgetList />
    </main>
  );
}
