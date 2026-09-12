import { currentMonth, endOfMonth, shiftMonth, today } from "@/lib/dates";
import type {
	Allocation,
	BudgetDocument,
	Category,
	Transaction,
} from "@/modules/Workspace/budget.types";

export const createEmptyBudget = (): BudgetDocument => ({
	schemaVersion: 1,
	id: crypto.randomUUID(),
	name: "My budget",
	currency: "EUR",
	accounts: [],
	categories: [],
	allocations: [],
	transactions: [],
	schedules: [],
	updatedAt: new Date().toISOString(),
});

/** Explicitly fictional, relative-date sample data. It never contacts a bank. */
export const createDemoBudget = (): BudgetDocument => {
	const month = currentMonth();
	const day = Number(today().slice(8));
	const categories: Category[] = [
		{
			id: "rent",
			name: "A place to live",
			group: "The essentials",
			note: "Rent, paid on the first.",
			hidden: false,
			target: { amount: 98000, cadence: "monthly" },
		},
		{
			id: "groceries",
			name: "Good food",
			group: "The essentials",
			note: "Groceries and the Saturday market.",
			hidden: false,
			target: { amount: 36000, cadence: "monthly" },
		},
		{
			id: "utilities",
			name: "Lights on",
			group: "The essentials",
			note: "Electricity, internet and water.",
			hidden: false,
			target: { amount: 14500, cadence: "monthly" },
		},
		{
			id: "transport",
			name: "Getting around",
			group: "The essentials",
			note: "Public transport and a little bike maintenance.",
			hidden: false,
			target: { amount: 7500, cadence: "monthly" },
		},
		{
			id: "coffee",
			name: "Coffee & company",
			group: "A little living",
			note: "Small rituals worth making room for.",
			hidden: false,
			target: { amount: 12000, cadence: "monthly" },
		},
		{
			id: "creative",
			name: "Things to make",
			group: "A little living",
			note: "Books, tools and creative experiments.",
			hidden: false,
			target: { amount: 9500, cadence: "monthly" },
		},
		{
			id: "subscriptions",
			name: "On repeat",
			group: "A little living",
			note: "Subscriptions and memberships.",
			hidden: false,
			target: { amount: 4200, cadence: "monthly" },
		},
		{
			id: "travel",
			name: "Somewhere new",
			group: "The bigger picture",
			note: "An autumn trip, one small assignment at a time.",
			hidden: false,
			target: {
				amount: 180000,
				cadence: "balance",
				dueDate: `${shiftMonth(month, 3)}-01`,
			},
		},
		{
			id: "buffer",
			name: "Room to breathe",
			group: "The bigger picture",
			note: "A buffer for the wonderfully unpredictable.",
			hidden: false,
			target: {
				amount: 600000,
				cadence: "balance",
				dueDate: `${shiftMonth(month, 10)}-01`,
			},
		},
		{
			id: "annual",
			name: "Once a year",
			group: "The bigger picture",
			note: "Annual insurance and the expenses that sneak up.",
			hidden: false,
			target: {
				amount: 72000,
				cadence: "balance",
				dueDate: `${shiftMonth(month, 5)}-01`,
			},
		},
	];
	const allocations: Allocation[] = [];
	const transactions: Transaction[] = [];
	const addTransaction = (
		date: string,
		payee: string,
		amount: number,
		categoryId: string | null,
		options: Partial<Transaction> = {},
	) => {
		transactions.push({
			id: crypto.randomUUID(),
			accountId: "everyday",
			date,
			payee,
			memo: "",
			amount,
			categoryId,
			transferAccountId: null,
			splits: [],
			cleared: true,
			reconciled: date.slice(0, 7) < month,
			...options,
		});
	};
	for (let offset = -5; offset <= 0; offset += 1) {
		const active = shiftMonth(month, offset);
		const current = offset === 0;
		const maxDay = current ? day : Number(endOfMonth(active).slice(8));
		const date = (at: number) =>
			`${active}-${String(Math.min(at, maxDay)).padStart(2, "0")}`;
		const assign = (categoryId: string, amount: number) =>
			allocations.push({
				id: crypto.randomUUID(),
				month: active,
				categoryId,
				amount,
			});
		assign("rent", 98000);
		assign("groceries", current ? 31000 : 36000);
		assign("utilities", 14500);
		assign("transport", 7500);
		assign("coffee", current ? 7000 : 12000);
		assign("creative", current ? 5000 : 9500);
		assign("subscriptions", 4200);
		assign("travel", current ? 15000 : 12000);
		assign("buffer", current ? 18000 : 15000);
		assign("annual", 5000);
		addTransaction(date(1), "Studio North · salary", 325000, null, {
			memo: "Fictional sample income",
		});
		addTransaction(date(1), "Home, sweet home", -98000, "rent");
		addTransaction(
			date(2),
			"Saturday market",
			-6240 - (offset + 5) * 117,
			"groceries",
		);
		addTransaction(date(2), "City transit", -5800, "transport");
		addTransaction(date(3), "The corner café", -1420, "coffee", {
			cleared: !current,
			reconciled: !current,
		});
		addTransaction(date(3), "Fiber connection", -3990, "utilities");
		addTransaction(date(4), "Paper & things", -3850, "creative");
		addTransaction(date(4), "Music subscription", -1099, "subscriptions");
		addTransaction(date(5), "A little set aside", -20000, null, {
			transferAccountId: "savings",
			memo: "Transfer between budget accounts; no spending.",
		});
		if (maxDay >= 6)
			addTransaction(date(6), "Neighborhood store", -4875, null, {
				splits: [
					{ id: crypto.randomUUID(), categoryId: "groceries", amount: -3275 },
					{ id: crypto.randomUUID(), categoryId: "creative", amount: -1600 },
				],
				memo: "Dinner ingredients and a new notebook.",
			});
		if (maxDay >= 9)
			addTransaction(date(9), "Power company", -7800, "utilities");
		if (maxDay >= 11)
			addTransaction(date(11), "Dinner with friends", -6400, "coffee");
		if (maxDay >= 13)
			addTransaction(date(13), "Market hall", -9870, "groceries");
		if (maxDay >= 16)
			addTransaction(date(16), "Independent bookshop", -2850, "creative");
		if (maxDay >= 19)
			addTransaction(date(19), "Neighborhood store", -7650, "groceries");
		if (maxDay >= 21)
			addTransaction(date(21), "Cloud storage", -299, "subscriptions");
		if (maxDay >= 23)
			addTransaction(date(23), "Market hall", -5670, "groceries");
		if (maxDay >= 25)
			addTransaction(date(25), "Weekend brunch", -3590, "coffee");
		if (!current)
			addTransaction(
				date(26),
				"Side project",
				18000 + (offset + 5) * 2500,
				null,
				{ memo: "Fictional freelance income." },
			);
	}
	// One previous-month overspend demonstrates honest negative rollover.
	addTransaction(
		`${shiftMonth(month, -1)}-28`,
		"A new creative tool",
		-18000,
		"creative",
	);
	const dueDay = Math.min(day, 28);
	return {
		...createEmptyBudget(),
		name: "Sample budget",
		categories,
		allocations,
		transactions,
		accounts: [
			{
				id: "everyday",
				name: "Everyday account",
				kind: "checking",
				openingBalance: 148250,
				closed: false,
				note: "Fictional day-to-day account.",
			},
			{
				id: "savings",
				name: "A little further ahead",
				kind: "savings",
				openingBalance: 284000,
				closed: false,
				note: "Included in the budget; categories decide what these euros are for.",
			},
			{
				id: "wallet",
				name: "In my pocket",
				kind: "cash",
				openingBalance: 6500,
				closed: false,
				note: "Fictional cash wallet.",
			},
			{
				id: "investments",
				name: "Long game",
				kind: "tracking",
				openingBalance: 427500,
				closed: false,
				note: "Tracked in net worth, outside the spending plan.",
			},
		],
		schedules: [
			{
				id: "scheduled-rent",
				accountId: "everyday",
				payee: "Home, sweet home",
				memo: "Monthly rent",
				amount: -98000,
				categoryId: "rent",
				nextDate: `${shiftMonth(month, 1)}-01`,
				repeat: "monthly",
				paused: false,
			},
			{
				id: "scheduled-water",
				accountId: "everyday",
				payee: "Water cooperative",
				memo: "Review and post when the bill arrives.",
				amount: -2600,
				categoryId: "utilities",
				nextDate: `${month}-${String(dueDay).padStart(2, "0")}`,
				repeat: "monthly",
				paused: false,
			},
			{
				id: "scheduled-music",
				accountId: "everyday",
				payee: "Music subscription",
				memo: "Monthly subscription",
				amount: -1099,
				categoryId: "subscriptions",
				nextDate: `${shiftMonth(month, 1)}-04`,
				repeat: "monthly",
				paused: false,
			},
		],
	};
};
