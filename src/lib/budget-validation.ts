import type {
	Account,
	Allocation,
	BudgetDocument,
	Category,
	ScheduledTransaction,
	Transaction,
	TransactionSplit,
} from "@/lib/budget-types";
import { validDate, validMonth } from "@/lib/dates";

const fail = (path: string, reason: string): never => {
	throw new Error(`${path}: ${reason}`);
};
const record = (value: unknown, path: string): Record<string, unknown> => {
	if (typeof value !== "object" || value === null || Array.isArray(value))
		return fail(path, "expected an object.");
	return value as Record<string, unknown>;
};
const text = (
	value: unknown,
	path: string,
	max = 500,
	allowEmpty = false,
): string => {
	if (
		typeof value !== "string" ||
		value.length > max ||
		(!allowEmpty && !value.trim())
	)
		return fail(
			path,
			`expected ${allowEmpty ? "text" : "non-empty text"} of at most ${max} characters.`,
		);
	return value;
};
const id = (value: unknown, path: string): string => text(value, path, 128);
const bool = (value: unknown, path: string): boolean =>
	typeof value === "boolean" ? value : fail(path, "expected true or false.");
const cents = (value: unknown, path: string, positive = false): number => {
	if (
		typeof value !== "number" ||
		!Number.isSafeInteger(value) ||
		Math.abs(value) > 1_000_000_000_000 ||
		(positive && value < 0)
	)
		return fail(path, "expected a safe integer amount in cents.");
	return value;
};
const date = (value: unknown, path: string): string =>
	typeof value === "string" && validDate(value)
		? value
		: fail(path, "expected a real date in YYYY-MM-DD format.");
const month = (value: unknown, path: string): string =>
	typeof value === "string" && validMonth(value)
		? value
		: fail(path, "expected a month in YYYY-MM format.");
const choice = <T extends string>(
	value: unknown,
	choices: readonly T[],
	path: string,
): T =>
	typeof value === "string" && choices.includes(value as T)
		? (value as T)
		: fail(path, "unsupported value.");
const array = <T>(
	value: unknown,
	path: string,
	parse: (item: unknown, path: string) => T,
	maximum = 100_000,
): T[] => {
	if (!Array.isArray(value) || value.length > maximum)
		return fail(path, `expected a list with at most ${maximum} items.`);
	return value.map((item, index) => parse(item, `${path}[${index}]`));
};
const unique = (items: { id: string }[], path: string): void => {
	const found = new Set<string>();
	for (const item of items) {
		if (found.has(item.id))
			fail(path, "duplicate identifiers are not allowed.");
		found.add(item.id);
	}
};

/** Validate known fields while preserving extension data in v1 backups. */
export const validateBudget = (value: unknown): BudgetDocument => {
	const root = record(value, "Budget");
	if (root.schemaVersion !== 1)
		fail(
			"Budget",
			"unsupported schema version. Export this budget using a compatible IcyFinance version.",
		);
	const accounts = array<Account>(
		root.accounts,
		"Accounts",
		(value, path) => {
			const item = record(value, path);
			return {
				...item,
				id: id(item.id, `${path}.id`),
				name: text(item.name, `${path}.name`, 100),
				kind: choice(
					item.kind,
					["checking", "savings", "cash", "tracking"] as const,
					`${path}.kind`,
				),
				...(item.purpose === undefined
					? {}
					: {
							purpose: choice(
								item.purpose,
								[
									"bills",
									"spending",
									"savings",
									"subscriptions",
									"investments",
									"other",
								] as const,
								`${path}.purpose`,
							),
						}),
				openingBalance: cents(item.openingBalance, `${path}.openingBalance`),
				closed: bool(item.closed, `${path}.closed`),
				note: text(item.note, `${path}.note`, 2000, true),
			};
		},
		500,
	);
	const categories = array<Category>(
		root.categories,
		"Categories",
		(value, path) => {
			const item = record(value, path);
			let target: Category["target"] = null;
			if (item.target !== null) {
				const raw = record(item.target, `${path}.target`);
				target = {
					...raw,
					amount: cents(raw.amount, `${path}.target.amount`, true),
					cadence: choice(
						raw.cadence,
						["monthly", "balance"] as const,
						`${path}.target.cadence`,
					),
				};
				if (raw.dueDate !== undefined)
					target.dueDate = date(raw.dueDate, `${path}.target.dueDate`);
			}
			return {
				...item,
				id: id(item.id, `${path}.id`),
				name: text(item.name, `${path}.name`, 100),
				group: text(item.group, `${path}.group`, 100),
				note: text(item.note, `${path}.note`, 2000, true),
				hidden: bool(item.hidden, `${path}.hidden`),
				target,
			};
		},
		2000,
	);
	unique(accounts, "Accounts");
	unique(categories, "Categories");
	const accountIds = new Set(accounts.map((item) => item.id));
	const categoryIds = new Set(categories.map((item) => item.id));
	const accountRef = (value: unknown, path: string): string => {
		const key = id(value, path);
		return accountIds.has(key) ? key : fail(path, "account no longer exists.");
	};
	const categoryRef = (value: unknown, path: string): string | null => {
		if (value === null) return null;
		const key = id(value, path);
		return categoryIds.has(key)
			? key
			: fail(path, "category no longer exists.");
	};
	const monthlyTemplate: Record<string, number> = {};
	if (root.monthlyTemplate !== undefined) {
		const entries = Object.entries(
			record(root.monthlyTemplate, "Monthly template"),
		);
		if (entries.length > 2000) fail("Monthly template", "too many categories.");
		for (const [key, amount] of entries) {
			const categoryId = categoryRef(key, `Monthly template.${key}`);
			if (categoryId === null)
				return fail("Monthly template", "a category is required.");
			Object.defineProperty(monthlyTemplate, categoryId, {
				value: cents(amount, `Monthly template.${key}`, true),
				enumerable: true,
				configurable: true,
				writable: true,
			});
		}
	}
	const safeToSpendCategoryIds =
		root.safeToSpendCategoryIds === undefined
			? []
			: array(
					root.safeToSpendCategoryIds,
					"Safe to spend categories",
					(value, path) => {
						const categoryId = categoryRef(value, path);
						if (categoryId === null)
							return fail(path, "a category is required.");
						return categoryId;
					},
					2000,
				);
	if (new Set(safeToSpendCategoryIds).size !== safeToSpendCategoryIds.length)
		fail("Safe to spend categories", "duplicate categories are not allowed.");
	const allocations = array<Allocation>(
		root.allocations,
		"Assignments",
		(value, path) => {
			const item = record(value, path);
			const categoryId = categoryRef(item.categoryId, `${path}.categoryId`);
			if (categoryId === null)
				return fail(path, "assignment needs a category.");
			return {
				...item,
				id: id(item.id, `${path}.id`),
				month: month(item.month, `${path}.month`),
				categoryId,
				amount: cents(item.amount, `${path}.amount`),
			};
		},
	);
	unique(allocations, "Assignments");
	const assignmentKeys = new Set<string>();
	for (const item of allocations) {
		const key = JSON.stringify([item.month, item.categoryId]);
		if (assignmentKeys.has(key))
			fail("Assignments", "a category can only have one assignment per month.");
		assignmentKeys.add(key);
	}
	const transactions = array<Transaction>(
		root.transactions,
		"Transactions",
		(value, path) => {
			const item = record(value, path);
			const splits = array<TransactionSplit>(
				item.splits,
				`${path}.splits`,
				(value, splitPath) => {
					const split = record(value, splitPath);
					return {
						...split,
						id: id(split.id, `${splitPath}.id`),
						categoryId: categoryRef(
							split.categoryId,
							`${splitPath}.categoryId`,
						),
						amount: cents(split.amount, `${splitPath}.amount`),
					};
				},
				100,
			);
			unique(splits, `${path}.splits`);
			const transaction: Transaction = {
				...item,
				id: id(item.id, `${path}.id`),
				accountId: accountRef(item.accountId, `${path}.accountId`),
				date: date(item.date, `${path}.date`),
				payee: text(item.payee, `${path}.payee`, 300),
				memo: text(item.memo, `${path}.memo`, 4000, true),
				amount: cents(item.amount, `${path}.amount`),
				categoryId: categoryRef(item.categoryId, `${path}.categoryId`),
				transferAccountId:
					item.transferAccountId === null
						? null
						: accountRef(item.transferAccountId, `${path}.transferAccountId`),
				splits,
				cleared: bool(item.cleared, `${path}.cleared`),
				reconciled: bool(item.reconciled, `${path}.reconciled`),
				...(item.transferCleared === undefined
					? {}
					: {
							transferCleared: bool(
								item.transferCleared,
								`${path}.transferCleared`,
							),
						}),
				...(item.transferReconciled === undefined
					? {}
					: {
							transferReconciled: bool(
								item.transferReconciled,
								`${path}.transferReconciled`,
							),
						}),
			};
			if (transaction.reconciled && !transaction.cleared)
				fail(path, "a reconciled transaction must also be cleared.");
			if (
				splits.length &&
				(splits.reduce((sum, split) => sum + split.amount, 0) !==
					transaction.amount ||
					transaction.categoryId !== null)
			)
				fail(
					path,
					"splits must total the transaction amount, with no category on the parent transaction.",
				);
			if (transaction.transferAccountId) {
				transaction.transferCleared =
					transaction.transferCleared ?? transaction.cleared;
				transaction.transferReconciled =
					transaction.transferReconciled ?? transaction.reconciled;
				if (transaction.transferReconciled && !transaction.transferCleared)
					fail(path, "a reconciled transfer destination must also be cleared.");
				if (transaction.transferAccountId === transaction.accountId)
					fail(path, "choose a different transfer destination.");
				if (transaction.amount >= 0 || splits.length)
					fail(
						path,
						"a transfer must be a negative source amount and cannot contain splits.",
					);
				const source = accounts.find(
					(account) => account.id === transaction.accountId,
				);
				const destination = accounts.find(
					(account) => account.id === transaction.transferAccountId,
				);
				if (!source || !destination)
					return fail(path, "a transfer account is missing.");
				if (
					(source.kind === "tracking") === (destination.kind === "tracking") &&
					transaction.categoryId !== null
				)
					fail(
						path,
						"transfers within the same budget boundary do not need a category.",
					);
			}
			return transaction;
		},
	);
	unique(transactions, "Transactions");
	const schedules = array<ScheduledTransaction>(
		root.schedules,
		"Schedules",
		(value, path) => {
			const item = record(value, path);
			if (
				item.anchorDay !== undefined &&
				(typeof item.anchorDay !== "number" ||
					!Number.isInteger(item.anchorDay) ||
					item.anchorDay < 1 ||
					item.anchorDay > 31)
			)
				fail(path, "recurring anchor day must be an integer between 1 and 31.");
			return {
				...item,
				id: id(item.id, `${path}.id`),
				accountId: accountRef(item.accountId, `${path}.accountId`),
				payee: text(item.payee, `${path}.payee`, 300),
				memo: text(item.memo, `${path}.memo`, 4000, true),
				amount: cents(item.amount, `${path}.amount`),
				categoryId: categoryRef(item.categoryId, `${path}.categoryId`),
				nextDate: date(item.nextDate, `${path}.nextDate`),
				repeat: choice(
					item.repeat,
					["once", "weekly", "monthly", "yearly"] as const,
					`${path}.repeat`,
				),
				paused: bool(item.paused, `${path}.paused`),
				...(item.anchorDay === undefined
					? {}
					: { anchorDay: item.anchorDay as number }),
			};
		},
		5000,
	);
	unique(schedules, "Schedules");
	const currency = text(root.currency, "Currency", 3);
	if (!/^[A-Z]{3}$/.test(currency))
		fail("Currency", "use a three-letter uppercase currency code.");
	const updatedAt = text(root.updatedAt, "Last updated", 40);
	if (
		!/^\d{4}-\d{2}-\d{2}T/.test(updatedAt) ||
		!Number.isFinite(Date.parse(updatedAt))
	)
		fail("Last updated", "expected an ISO timestamp.");
	// Keep aggregate arithmetic safely below JavaScript's integer boundary as well.
	const gross = [
		...accounts.map((item) => item.openingBalance),
		...allocations.map((item) => item.amount),
		...transactions.map((item) => item.amount),
		...transactions.flatMap((item) => item.splits.map((split) => split.amount)),
	].reduce((sum, amount) => sum + Math.abs(amount), 0);
	if (!Number.isSafeInteger(gross))
		fail("Budget", "aggregate amounts exceed the safe integer range.");
	return {
		...root,
		schemaVersion: 1,
		id: id(root.id, "Budget identifier"),
		name: text(root.name, "Budget name", 100),
		currency,
		accounts,
		categories,
		allocations,
		monthlyTemplate,
		safeToSpendCategoryIds,
		transactions,
		schedules,
		updatedAt,
	};
};
