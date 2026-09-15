export type AccountKind = "checking" | "savings" | "cash" | "tracking";
export type AccountPurpose =
	| "bills"
	| "spending"
	| "savings"
	| "subscriptions"
	| "investments"
	| "other";

export interface Account {
	id: string;
	name: string;
	kind: AccountKind;
	purpose?: AccountPurpose;
	openingBalance: number;
	closed: boolean;
	note: string;
}

export interface Category {
	id: string;
	name: string;
	group: string;
	note: string;
	hidden: boolean;
	target: {
		amount: number;
		cadence: "monthly" | "balance";
		dueDate?: string;
	} | null;
}

export interface Allocation {
	id: string;
	month: string;
	categoryId: string;
	amount: number;
}

export interface TransactionSplit {
	id: string;
	categoryId: string | null;
	amount: number;
}

export interface Transaction {
	id: string;
	accountId: string;
	date: string;
	payee: string;
	memo: string;
	amount: number;
	categoryId: string | null;
	transferAccountId: string | null;
	splits: TransactionSplit[];
	cleared: boolean;
	reconciled: boolean;
	/** Transfer destination status is independent; absent in older v1 backups. */
	transferCleared?: boolean;
	transferReconciled?: boolean;
}

export interface ScheduledTransaction {
	id: string;
	accountId: string;
	payee: string;
	memo: string;
	amount: number;
	categoryId: string | null;
	nextDate: string;
	/** Retains the original day across shorter months and non-leap years. */
	anchorDay?: number;
	repeat: "once" | "weekly" | "monthly" | "yearly";
	paused: boolean;
}

export interface BudgetDocument {
	schemaVersion: 1;
	id: string;
	name: string;
	currency: string;
	accounts: Account[];
	categories: Category[];
	allocations: Allocation[];
	monthlyTemplate: Record<string, number>;
	safeToSpendCategoryIds: string[];
	transactions: Transaction[];
	schedules: ScheduledTransaction[];
	updatedAt: string;
}
