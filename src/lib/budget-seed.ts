import type { BudgetDocument } from "@/lib/budget-types";

export const createEmptyBudget = (currency = "EUR"): BudgetDocument => ({
	schemaVersion: 1,
	id: crypto.randomUUID(),
	name: "My budget",
	currency,
	accounts: [],
	categories: [],
	allocations: [],
	transactions: [],
	schedules: [],
	updatedAt: new Date().toISOString(),
});
