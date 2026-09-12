import type { BudgetDocument, Category, Transaction } from "@/lib/budget-types";
import { validateBudget } from "@/lib/budget-validation";
import {
	addFrequency,
	endOfMonth,
	shiftMonth,
	today,
	validDate,
	validMonth,
} from "@/lib/dates";
import { assertCents } from "@/lib/money";

const sum = (values: number[]) =>
	values.reduce((total, amount) => assertCents(total + assertCents(amount)), 0);
const save = (doc: BudgetDocument): BudgetDocument =>
	validateBudget({ ...doc, updatedAt: new Date().toISOString() });
const categoryById = (doc: BudgetDocument, id: string): Category => {
	const category = doc.categories.find((item) => item.id === id);
	if (!category) throw new Error("This category no longer exists.");
	return category;
};
const accountById = (doc: BudgetDocument, id: string) => {
	const account = doc.accounts.find((item) => item.id === id);
	if (!account) throw new Error("This account no longer exists.");
	return account;
};
const assertMonth = (month: string) => {
	if (!validMonth(month)) throw new Error("Choose a valid budget month.");
};

export const isTransactionCleared = (
	tx: Transaction,
	accountId: string,
): boolean =>
	tx.accountId === accountId
		? tx.cleared
		: tx.transferAccountId === accountId
			? (tx.transferCleared ?? tx.cleared)
			: false;

export const isTransactionReconciled = (
	tx: Transaction,
	accountId: string,
): boolean =>
	tx.accountId === accountId
		? tx.reconciled
		: tx.transferAccountId === accountId
			? (tx.transferReconciled ?? tx.reconciled)
			: false;

export const accountBalance = (
	doc: BudgetDocument,
	accountId: string,
	throughDate = today(),
): number => {
	const account = accountById(doc, accountId);
	if (!validDate(throughDate)) throw new Error("Choose a valid balance date.");
	return sum([
		account.openingBalance,
		...doc.transactions
			.filter((tx) => tx.date <= throughDate)
			.map((tx) =>
				tx.accountId === accountId
					? tx.amount
					: tx.transferAccountId === accountId
						? -tx.amount
						: 0,
			),
	]);
};

/** A transfer is stored once. Only crossing the tracking boundary moves budget cash. */
const budgetParts = (
	doc: BudgetDocument,
	tx: Transaction,
): { categoryId: string | null; amount: number }[] => {
	const source = accountById(doc, tx.accountId);
	if (tx.transferAccountId) {
		const destination = accountById(doc, tx.transferAccountId);
		if ((source.kind === "tracking") === (destination.kind === "tracking"))
			return [];
		return [
			{
				categoryId: tx.categoryId,
				amount: source.kind === "tracking" ? -tx.amount : tx.amount,
			},
		];
	}
	if (source.kind === "tracking") return [];
	return tx.splits.length
		? tx.splits
		: [{ categoryId: tx.categoryId, amount: tx.amount }];
};

export const transactionsForMonth = (
	doc: BudgetDocument,
	month: string,
): Transaction[] => {
	assertMonth(month);
	return doc.transactions
		.filter((tx) => tx.date.slice(0, 7) === month)
		.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
};

const categoryNumbers = (
	doc: BudgetDocument,
	categoryId: string,
	month: string,
) => {
	assertMonth(month);
	categoryById(doc, categoryId);
	const assigned = sum(
		doc.allocations
			.filter((item) => item.categoryId === categoryId && item.month === month)
			.map((item) => item.amount),
	);
	const totalAssigned = sum(
		doc.allocations
			.filter((item) => item.categoryId === categoryId && item.month <= month)
			.map((item) => item.amount),
	);
	let activity = 0;
	let totalActivity = 0;
	const postedThrough = today();
	for (const tx of doc.transactions) {
		if (tx.date.slice(0, 7) > month || tx.date > postedThrough) continue;
		for (const part of budgetParts(doc, tx)) {
			if (part.categoryId !== categoryId) continue;
			totalActivity = sum([totalActivity, part.amount]);
			if (tx.date.slice(0, 7) === month)
				activity = sum([activity, part.amount]);
		}
	}
	// Every category carries both surplus and overspending into the next month.
	return { assigned, activity, available: sum([totalAssigned, totalActivity]) };
};

export interface TargetProgress {
	target: number;
	current: number;
	needed: number;
	remaining: number;
	percentage: number;
	dueDate: string | undefined;
	cadence: "monthly" | "balance" | null;
}

export const targetProgress = (
	doc: BudgetDocument,
	categoryId: string,
	month: string,
): TargetProgress => {
	const category = categoryById(doc, categoryId);
	const amounts = categoryNumbers(doc, categoryId, month);
	const target = category.target;
	if (!target)
		return {
			target: 0,
			current: amounts.available,
			needed: Math.max(0, -amounts.available),
			remaining: 0,
			percentage: 0,
			dueDate: undefined,
			cadence: null,
		};
	const current =
		target.cadence === "monthly" ? amounts.assigned : amounts.available;
	const remaining = Math.max(0, sum([target.amount, -current]));
	let months = 1;
	if (
		target.cadence === "balance" &&
		target.dueDate &&
		target.dueDate.slice(0, 7) > month
	) {
		const [year, index] = month.split("-").map(Number);
		const [dueYear, dueIndex] = target.dueDate
			.slice(0, 7)
			.split("-")
			.map(Number);
		months = (dueYear - year) * 12 + dueIndex - index + 1;
	}
	return {
		target: target.amount,
		current,
		remaining,
		needed: Math.max(0, -amounts.available, Math.ceil(remaining / months)),
		percentage:
			target.amount === 0
				? 100
				: Math.max(0, Math.min(100, (current / target.amount) * 100)),
		dueDate: target.dueDate,
		cadence: target.cadence,
	};
};

export const categorySummary = (
	doc: BudgetDocument,
	categoryId: string,
	month: string,
) => {
	const amounts = categoryNumbers(doc, categoryId, month);
	const progress = targetProgress(doc, categoryId, month);
	return { ...amounts, target: progress.target, needed: progress.needed };
};

const cashFlow = (doc: BudgetDocument, transactions: Transaction[]) => {
	let income = 0;
	let expenses = 0;
	let uncategorized = 0;
	const postedThrough = today();
	for (const tx of transactions) {
		if (tx.date > postedThrough) continue;
		for (const part of budgetParts(doc, tx)) {
			if (part.categoryId === null && part.amount > 0)
				income = sum([income, part.amount]);
			else expenses = sum([expenses, -part.amount]); // Categorized refunds reduce expense.
			if (part.categoryId === null && part.amount < 0)
				uncategorized = sum([uncategorized, -part.amount]);
		}
	}
	return { income, expenses, uncategorized };
};

export const budgetSummary = (doc: BudgetDocument, month: string) => {
	assertMonth(month);
	const throughDate = endOfMonth(month) < today() ? endOfMonth(month) : today();
	const categories = doc.categories.map((category) =>
		categoryNumbers(doc, category.id, month),
	);
	const assigned = sum(categories.map((item) => item.assigned));
	const activity = sum(categories.map((item) => item.activity));
	const available = sum(categories.map((item) => item.available));
	const cash = sum(
		doc.accounts
			.filter((account) => account.kind !== "tracking")
			.map((account) => accountBalance(doc, account.id, throughDate)),
	);
	// Reserve the peak cumulative future funding. Moving money between envelopes
	// in a future month does not reserve it twice; future releases never add to RTA.
	const futureMonths = [
		...new Set(
			doc.allocations
				.filter((item) => item.month > month)
				.map((item) => item.month),
		),
	].sort();
	let cumulative = 0;
	let futureAssigned = 0;
	for (const future of futureMonths) {
		cumulative = sum([
			cumulative,
			...doc.allocations
				.filter((item) => item.month === future)
				.map((item) => item.amount),
		]);
		futureAssigned = Math.max(futureAssigned, cumulative);
	}
	const netWorth = sum(
		doc.accounts.map((account) => accountBalance(doc, account.id, throughDate)),
	);
	return {
		assigned,
		activity,
		available,
		readyToAssign: sum([cash, -available, -futureAssigned]),
		...cashFlow(doc, transactionsForMonth(doc, month)),
		netWorth,
	};
};

export const setAssignment = (
	doc: BudgetDocument,
	categoryId: string,
	month: string,
	amount: number,
): BudgetDocument => {
	categoryById(doc, categoryId);
	assertMonth(month);
	assertCents(amount);
	const previous = doc.allocations.find(
		(item) => item.categoryId === categoryId && item.month === month,
	);
	return save({
		...doc,
		allocations: [
			...doc.allocations.filter(
				(item) => !(item.categoryId === categoryId && item.month === month),
			),
			...(amount === 0
				? []
				: [
						{
							id: previous?.id ?? crypto.randomUUID(),
							categoryId,
							month,
							amount,
						},
					]),
		],
	});
};

export const moveMoney = (
	doc: BudgetDocument,
	fromId: string,
	toId: string,
	month: string,
	amount: number,
): BudgetDocument => {
	assertCents(amount);
	if (fromId === toId || amount <= 0)
		throw new Error(
			"Choose different categories and a positive amount to move.",
		);
	const from = categorySummary(doc, fromId, month);
	const to = categorySummary(doc, toId, month);
	if (amount > from.available)
		throw new Error(
			"There is not enough available money in the source category.",
		);
	return setAssignment(
		setAssignment(doc, fromId, month, from.assigned - amount),
		toId,
		month,
		to.assigned + amount,
	);
};

/** Fund overspending first, then targets in due-date order, using existing cash only. */
export const autoAssign = (
	doc: BudgetDocument,
	month: string,
): BudgetDocument => {
	assertMonth(month);
	let next = doc;
	let remaining = Math.max(0, budgetSummary(doc, month).readyToAssign);
	const categories = [...doc.categories].sort((a, b) =>
		(a.target?.dueDate ?? "9999-12-31").localeCompare(
			b.target?.dueDate ?? "9999-12-31",
		),
	);
	for (const phase of ["overspending", "targets"] as const) {
		for (const category of categories) {
			if (remaining <= 0) return next;
			if (phase === "targets" && category.hidden) continue;
			const status = categorySummary(next, category.id, month);
			const needed =
				phase === "overspending"
					? Math.max(0, -status.available)
					: status.needed;
			const amount = Math.min(needed, remaining);
			if (amount <= 0) continue;
			next = setAssignment(next, category.id, month, status.assigned + amount);
			remaining -= amount;
		}
	}
	return next;
};

export const upsertTransaction = (
	doc: BudgetDocument,
	tx: Transaction,
): BudgetDocument => {
	const account = accountById(doc, tx.accountId);
	const previous = doc.transactions.find((item) => item.id === tx.id);
	if (account.closed && previous?.accountId !== tx.accountId)
		throw new Error("Reopen this account before adding a transaction.");
	if (
		tx.transferAccountId &&
		accountById(doc, tx.transferAccountId).closed &&
		previous?.transferAccountId !== tx.transferAccountId
	)
		throw new Error(
			"Reopen the destination account before transferring money.",
		);
	const locked =
		previous &&
		(previous.reconciled ||
			(previous.transferAccountId &&
				isTransactionReconciled(previous, previous.transferAccountId)));
	if (
		previous &&
		locked &&
		(previous.amount !== tx.amount ||
			previous.accountId !== tx.accountId ||
			previous.transferAccountId !== tx.transferAccountId ||
			previous.date !== tx.date)
	)
		throw new Error(
			"Unreconcile this transaction in each affected account before changing its amount, account or date.",
		);
	const sameDestination =
		previous && previous.transferAccountId === tx.transferAccountId;
	const next = tx.transferAccountId
		? {
				...tx,
				transferCleared:
					tx.transferCleared ??
					(previous && sameDestination
						? isTransactionCleared(previous, tx.transferAccountId)
						: false),
				transferReconciled:
					tx.transferReconciled ??
					(previous && sameDestination
						? isTransactionReconciled(previous, tx.transferAccountId)
						: false),
			}
		: tx;
	return save({
		...doc,
		transactions: previous
			? doc.transactions.map((item) => (item.id === tx.id ? next : item))
			: [...doc.transactions, next],
	});
};

export const deleteTransaction = (
	doc: BudgetDocument,
	id: string,
): BudgetDocument => {
	const previous = doc.transactions.find((item) => item.id === id);
	if (!previous) throw new Error("This transaction no longer exists.");
	if (
		previous.reconciled ||
		(previous.transferAccountId &&
			isTransactionReconciled(previous, previous.transferAccountId))
	)
		throw new Error(
			"Unreconcile this transaction in each affected account before deleting it.",
		);
	return save({
		...doc,
		transactions: doc.transactions.filter((item) => item.id !== id),
	});
};

/** Post one due occurrence; saving the transaction and advancing its rule is atomic. */
export const postScheduled = (
	doc: BudgetDocument,
	id: string,
): BudgetDocument => {
	const schedule = doc.schedules.find((item) => item.id === id);
	if (!schedule)
		throw new Error("This scheduled transaction no longer exists.");
	if (schedule.paused)
		throw new Error("Resume this schedule before posting it.");
	if (schedule.nextDate > today())
		throw new Error("This scheduled transaction is not due yet.");
	if (accountById(doc, schedule.accountId).closed)
		throw new Error("Reopen this account before posting its schedule.");
	const transaction: Transaction = {
		id: crypto.randomUUID(),
		accountId: schedule.accountId,
		date: schedule.nextDate,
		payee: schedule.payee,
		memo: schedule.memo,
		amount: schedule.amount,
		categoryId: schedule.categoryId,
		transferAccountId: null,
		splits: [],
		cleared: false,
		reconciled: false,
	};
	const anchorDay = schedule.anchorDay ?? Number(schedule.nextDate.slice(8));
	return save({
		...doc,
		transactions: [...doc.transactions, transaction],
		schedules: doc.schedules.map((item) =>
			item.id !== id
				? item
				: schedule.repeat === "once"
					? { ...item, paused: true }
					: {
							...item,
							anchorDay,
							nextDate: addFrequency(item.nextDate, item.repeat, anchorDay),
						},
		),
	});
};

export const reconcileAccount = (
	doc: BudgetDocument,
	id: string,
	balance: number,
): BudgetDocument => {
	assertCents(balance);
	const account = accountById(doc, id);
	const eligible = (tx: Transaction) =>
		isTransactionCleared(tx, id) &&
		tx.date <= today() &&
		(tx.accountId === id || tx.transferAccountId === id);
	const clearedBalance = sum([
		account.openingBalance,
		...doc.transactions
			.filter(eligible)
			.map((tx) => (tx.accountId === id ? tx.amount : -tx.amount)),
	]);
	const difference = sum([balance, -clearedBalance]);
	const transactions = doc.transactions.map((tx) => {
		if (!eligible(tx)) return tx;
		if (tx.accountId !== id) return { ...tx, transferReconciled: true };
		return {
			...tx,
			...(tx.transferAccountId
				? {
						transferCleared: isTransactionCleared(tx, tx.transferAccountId),
						transferReconciled: isTransactionReconciled(
							tx,
							tx.transferAccountId,
						),
					}
				: {}),
			reconciled: true,
		};
	});
	if (difference !== 0)
		transactions.push({
			id: crypto.randomUUID(),
			accountId: id,
			date: today(),
			payee: "Reconciliation adjustment",
			memo: "Adjustment to match the entered statement balance; review and categorize if needed.",
			amount: difference,
			categoryId: null,
			transferAccountId: null,
			splits: [],
			cleared: true,
			reconciled: true,
		});
	return save({ ...doc, transactions });
};

export const monthReport = (doc: BudgetDocument, month: string) => {
	const summary = budgetSummary(doc, month);
	const transactions = transactionsForMonth(doc, month);
	const days = Number(endOfMonth(month).slice(8));
	const historyLength = Math.min(
		6,
		(Number(month.slice(0, 4)) - 1900) * 12 + Number(month.slice(5)),
	);
	return {
		month,
		income: summary.income,
		expenses: summary.expenses,
		net: sum([summary.income, -summary.expenses]),
		netWorth: summary.netWorth,
		categories: doc.categories
			.map((category) => {
				const status = categoryNumbers(doc, category.id, month);
				return {
					id: category.id,
					name: category.name,
					group: category.group,
					spent: Math.max(0, -status.activity),
					assigned: status.assigned,
					available: status.available,
				};
			})
			.sort((a, b) => b.spent - a.spent),
		daily: Array.from({ length: days }, (_, index) => {
			const date = `${month}-${String(index + 1).padStart(2, "0")}`;
			const flow = cashFlow(
				doc,
				transactions.filter((tx) => tx.date === date),
			);
			return {
				date,
				income: flow.income,
				expenses: flow.expenses,
				net: sum([flow.income, -flow.expenses]),
			};
		}),
		history: Array.from({ length: historyLength }, (_, index) => {
			const historicMonth = shiftMonth(month, index - historyLength + 1);
			const historic = budgetSummary(doc, historicMonth);
			return {
				month: historicMonth,
				income: historic.income,
				expenses: historic.expenses,
				net: sum([historic.income, -historic.expenses]),
				netWorth: historic.netWorth,
			};
		}),
	};
};
