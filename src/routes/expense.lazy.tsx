import { createLazyFileRoute } from "@tanstack/react-router";
import { Input } from "../components/ui/input";
import ExpenseList from "../features/Expense/ExpenseList";
import AddExpense from "../features/Expense/AddExpense";

export const Route = createLazyFileRoute("/expense")({
  component: () => <Expense />,
});

function Expense() {
  return (
    <main className="flex h-full w-full flex-col items-center gap-[48px] p-8">
      <h1 className="self-start text-3xl font-bold">Expense</h1>

      <div className="flex w-full items-center justify-between gap-2">
        <Input placeholder="Search" type="search" className="w-[50%]" />
        <AddExpense />
      </div>

      <ExpenseList />
    </main>
  );
}
