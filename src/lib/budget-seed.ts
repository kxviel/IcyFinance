import type { BudgetDocument } from "@/lib/budget-types";

export const createEmptyBudget = (currency = "EUR"): BudgetDocument => ({
	schemaVersion: 2,
	id: crypto.randomUUID(),
	name: "My budget",
	currency,
	defaultOverspendingPolicy: "carry",
	accounts: [],
	categories: [],
	allocations: [],
	monthlyTemplate: {},
	safeToSpendCategoryIds: [],
	transactions: [],
	schedules: [],
	updatedAt: new Date().toISOString(),
});
