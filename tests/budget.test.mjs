import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { hasAmounts } from "../src/lib/backups.ts";
import {
	accountBalance,
	applyMonthlyTemplate,
	budgetSummary,
	categorySummary,
	deleteCategory,
	deleteTransaction,
	monthlyTemplateFromMonth,
	monthReport,
	postScheduled,
	safeToSpendSummary,
	setAssignment,
	upsertTransaction,
} from "../src/lib/budget.ts";
import { createEmptyBudget } from "../src/lib/budget-seed.ts";
import { validateBudget } from "../src/lib/budget-validation.ts";
import { today } from "../src/lib/dates.ts";

const month = "2024-02";
const account = (id, kind = "checking", openingBalance = 100000) => ({
	id,
	name: id,
	kind,
	openingBalance,
	closed: false,
	note: "",
});
const category = (id) => ({
	id,
	name: id,
	group: "Test envelopes",
	note: "",
	hidden: false,
	target: null,
});
const transaction = (overrides = {}) => ({
	id: "tx",
	accountId: "checking",
	date: "2024-02-10",
	payee: "Test payee",
	memo: "",
	amount: -1000,
	categoryId: "groceries",
	transferAccountId: null,
	splits: [],
	cleared: false,
	reconciled: false,
	...overrides,
});
const fixture = () => ({
	...createEmptyBudget(),
	accounts: [account("checking")],
	categories: ["groceries", "shopping", "other", "reserve"].map(category),
	monthlyTemplate: { groceries: 15000, shopping: 5000 },
	safeToSpendCategoryIds: ["groceries", "shopping", "other"],
});
const funded = () => {
	let doc = fixture();
	for (const [id, amount] of [
		["groceries", 8000],
		["shopping", 3000],
		["other", 2000],
	]) {
		doc = setAssignment(doc, id, month, amount);
	}
	return doc;
};

beforeEach(() =>
	mock.timers.enable({ apis: ["Date"], now: new Date("2024-02-15T12:00:00Z") }),
);
afterEach(() => mock.timers.reset());

test("A: old v1 document loads with safe additive defaults", () => {
	const old = fixture();
	delete old.monthlyTemplate;
	delete old.safeToSpendCategoryIds;
	const doc = validateBudget(JSON.parse(JSON.stringify(old)));
	assert.equal(doc.schemaVersion, 1);
	assert.deepEqual(doc.monthlyTemplate, {});
	assert.deepEqual(doc.safeToSpendCategoryIds, []);
	assert.equal(doc.accounts[0].purpose, undefined);
	assert.equal(budgetSummary(doc, month).readyToAssign, 100000);
});

test("B: applying twice is idempotent and preserves assignment IDs", () => {
	const original = fixture();
	const once = applyMonthlyTemplate(original, month);
	const twice = applyMonthlyTemplate(once, month);
	assert.equal(budgetSummary(once, month).assigned, 20000);
	assert.deepEqual(twice, once);
	assert.equal(original.allocations.length, 0);
});

test("C/D: partial, higher and negative manual assignments are topped up safely", () => {
	for (const amount of [5000, 20000, -5000]) {
		const doc = setAssignment(fixture(), "groceries", month, amount);
		const id = doc.allocations[0].id;
		const next = applyMonthlyTemplate(doc, month);
		assert.equal(
			categorySummary(next, "groceries", month).assigned,
			Math.max(amount, 15000),
		);
		assert.equal(
			next.allocations.find((item) => item.categoryId === "groceries").id,
			id,
		);
		assert.deepEqual(applyMonthlyTemplate(next, month), next);
	}
});

test("template is all-or-nothing, uses RTA and respects reserved future funding", () => {
	for (const cash of [0, 19999, -1000]) {
		const doc = fixture();
		doc.accounts[0].openingBalance = cash;
		const before = structuredClone(doc);
		assert.throws(() => applyMonthlyTemplate(doc, month), /not enough Ready/);
		assert.deepEqual(doc, before);
	}
	const doc = setAssignment(fixture(), "reserve", "2024-03", 90000);
	assert.equal(budgetSummary(doc, month).readyToAssign, 10000);
	assert.throws(() => applyMonthlyTemplate(doc, month), /not enough Ready/);
	const exact = fixture();
	exact.accounts[0].openingBalance = 20000;
	assert.equal(
		budgetSummary(applyMonthlyTemplate(exact, month), month).readyToAssign,
		0,
	);
});

test("zero template entries exclude categories and month capture preserves only positive assignments", () => {
	const doc = setAssignment(fixture(), "groceries", month, -5000);
	doc.monthlyTemplate = { groceries: 0 };
	assert.deepEqual(
		applyMonthlyTemplate(doc, month).allocations,
		doc.allocations,
	);
	const positive = setAssignment(doc, "shopping", month, 2000);
	assert.deepEqual(monthlyTemplateFromMonth(positive, month), {
		shopping: 2000,
	});
});

test("E/F/G/H: only selected envelopes contribute; savings, owned transfers and tracking values do not", () => {
	let doc = funded();
	assert.equal(safeToSpendSummary(doc, month).available, 13000);
	doc.accounts.push(account("savings", "savings", 500000));
	doc.accounts.push(account("ETF", "tracking", 500000));
	doc = setAssignment(doc, "reserve", month, 400000);
	assert.equal(safeToSpendSummary(doc, month).available, 13000);
	doc = upsertTransaction(
		doc,
		transaction({
			amount: -30000,
			categoryId: null,
			transferAccountId: "savings",
		}),
	);
	assert.equal(safeToSpendSummary(doc, month).available, 13000);
	assert.equal(safeToSpendSummary(doc, month).spent, 0);
	assert.equal(budgetSummary(doc, month).expenses, 0);
	assert.equal(accountBalance(doc, "checking"), 70000);
	assert.equal(accountBalance(doc, "savings"), 530000);
	assert.equal(budgetSummary(doc, month).netWorth, 1100000);
});

test("tracking-boundary transfers change envelopes but never income or expense reports", () => {
	let doc = funded();
	doc.accounts.push(account("tracking", "tracking", 500000));
	doc = upsertTransaction(
		doc,
		transaction({ amount: -3000, transferAccountId: "tracking" }),
	);
	assert.equal(safeToSpendSummary(doc, month).available, 10000);
	assert.equal(safeToSpendSummary(doc, month).spent, 0);
	let report = monthReport(doc, month);
	assert.equal(report.expenses, 0);
	assert.equal(
		report.categories.find((item) => item.id === "groceries").spent,
		0,
	);
	assert.ok(report.daily.every((item) => item.expenses === 0));
	doc = upsertTransaction(
		doc,
		transaction({
			id: "return",
			accountId: "tracking",
			categoryId: null,
			amount: -1000,
			transferAccountId: "checking",
		}),
	);
	report = monthReport(doc, month);
	assert.equal(report.income, 0);
	assert.equal(report.expenses, 0);
	assert.equal(budgetSummary(doc, month).netWorth, 600000);
});

test("uncategorized income increases RTA, categorized refunds reduce spending, tracking activity stays outside envelopes", () => {
	let doc = funded();
	const ready = budgetSummary(doc, month).readyToAssign;
	doc = upsertTransaction(doc, transaction({ amount: 5000, categoryId: null }));
	assert.equal(budgetSummary(doc, month).readyToAssign, ready + 5000);
	assert.equal(safeToSpendSummary(doc, month).available, 13000);
	doc = upsertTransaction(doc, transaction({ id: "expense", amount: -1000 }));
	doc = upsertTransaction(doc, transaction({ id: "refund", amount: 200 }));
	assert.equal(safeToSpendSummary(doc, month).spent, 800);
	assert.equal(budgetSummary(doc, month).expenses, 800);
	doc.accounts.push(account("ETF", "tracking", 0));
	doc = upsertTransaction(
		doc,
		transaction({ id: "valuation", accountId: "ETF", amount: 500000 }),
	);
	assert.equal(safeToSpendSummary(doc, month).available, 12200);
	assert.equal(budgetSummary(doc, month).readyToAssign, ready + 5000);
});

test("I: schedules affect nothing until posted; posting advances once atomically", () => {
	const doc = funded();
	doc.schedules = [
		{
			id: "rent",
			accountId: "checking",
			payee: "Test rent",
			memo: "",
			amount: -2000,
			categoryId: "groceries",
			nextDate: "2024-02-10",
			repeat: "monthly",
			paused: false,
		},
	];
	assert.equal(accountBalance(doc, "checking"), 100000);
	assert.equal(safeToSpendSummary(doc, month).available, 13000);
	const posted = postScheduled(doc, "rent");
	assert.equal(accountBalance(posted, "checking"), 98000);
	assert.equal(safeToSpendSummary(posted, month).available, 11000);
	assert.equal(posted.schedules[0].nextDate, "2024-03-10");
	assert.throws(() => postScheduled(posted, "rent"), /not due/);
});

test("J: deleting unused categories cleans both references; financial history blocks deletion", () => {
	const doc = fixture();
	const next = deleteCategory(doc, "groceries");
	assert.equal(
		next.categories.some((item) => item.id === "groceries"),
		false,
	);
	assert.equal(Object.hasOwn(next.monthlyTemplate, "groceries"), false);
	assert.equal(next.safeToSpendCategoryIds.includes("groceries"), false);
	validateBudget(next);
	assert.equal(safeToSpendSummary(next, month).categoryCount, 2);
	const allocated = funded();
	assert.throws(() => deleteCategory(allocated, "groceries"), /history/);
	const transacted = upsertTransaction(doc, transaction());
	assert.throws(() => deleteCategory(transacted, "groceries"), /history/);
	const split = upsertTransaction(
		doc,
		transaction({
			categoryId: null,
			splits: [{ id: "split", categoryId: "groceries", amount: -1000 }],
		}),
	);
	assert.throws(() => deleteCategory(split, "groceries"), /history/);
	const scheduled = {
		...doc,
		schedules: [
			{
				id: "scheduled",
				accountId: "checking",
				payee: "Test",
				memo: "",
				amount: -1,
				categoryId: "groceries",
				nextDate: "2024-02-20",
				repeat: "once",
				paused: false,
			},
		],
	};
	assert.throws(() => deleteCategory(scheduled, "groceries"), /history/);
});

test("K: validation/JSON backup round-trip preserves feature and extension data", () => {
	const doc = fixture();
	doc.accounts[0].purpose = "investments";
	doc.extension = { nested: ["unknown but valid", 42] };
	doc.accounts[0].extension = "account metadata";
	doc.categories[0].extension = "category metadata";
	const exported = JSON.stringify(validateBudget(doc));
	const imported = validateBudget(JSON.parse(exported));
	assert.deepEqual(imported, doc);
	const assigned = applyMonthlyTemplate(imported, month);
	assert.deepEqual(assigned.extension, doc.extension);
	assert.equal(assigned.accounts[0].extension, "account metadata");
});

test("purpose stays metadata for every account kind and allowed purpose", () => {
	for (const kind of ["checking", "savings", "cash", "tracking"]) {
		const doc = funded();
		doc.accounts[0].kind = kind;
		const baseline = budgetSummary(doc, month);
		const safe = safeToSpendSummary(doc, month);
		for (const purpose of [
			undefined,
			"bills",
			"spending",
			"savings",
			"subscriptions",
			"investments",
			"other",
		]) {
			doc.accounts[0].purpose = purpose;
			const validated = validateBudget(doc);
			assert.deepEqual(budgetSummary(validated, month), baseline);
			assert.deepEqual(safeToSpendSummary(validated, month), safe);
			assert.equal(accountBalance(validated, "checking"), 100000);
		}
	}
});

test("reconciled source and destination amounts/dates/deletion stay protected", () => {
	for (const destinationLocked of [false, true]) {
		const doc = fixture();
		doc.accounts.push(account("savings", "savings", 0));
		const tx = transaction({
			categoryId: null,
			transferAccountId: "savings",
			cleared: !destinationLocked,
			reconciled: !destinationLocked,
			transferCleared: destinationLocked,
			transferReconciled: destinationLocked,
		});
		const saved = upsertTransaction(doc, tx);
		assert.throws(
			() => upsertTransaction(saved, { ...tx, amount: -2000 }),
			/Unreconcile/,
		);
		assert.throws(
			() => upsertTransaction(saved, { ...tx, date: "2024-02-11" }),
			/Unreconcile/,
		);
		assert.throws(() => deleteTransaction(saved, tx.id), /Unreconcile/);
		const templated = applyMonthlyTemplate(saved, month);
		assert.deepEqual(templated.transactions, saved.transactions);
	}
});

test("L: past/current/future pacing, leap years and partial weeks include today", () => {
	const doc = funded();
	for (const [selectedMonth, asOf, expectedDays] of [
		["2024-02", "2024-02-01", 29],
		["2024-02", "2024-02-15", 15],
		["2024-02", "2024-02-29", 1],
		["2023-02", "2023-02-01", 28],
		["2024-04", "2024-04-01", 30],
		["2024-12", "2024-12-01", 31],
		["2024-01", "2024-02-15", 0],
		["2024-03", "2024-02-15", 0],
	]) {
		const summary = safeToSpendSummary(doc, selectedMonth, asOf);
		assert.equal(summary.daysRemaining, expectedDays);
		assert.ok(Number.isSafeInteger(summary.perDay));
		assert.ok(Number.isSafeInteger(summary.perWeek));
		assert.ok(summary.perWeek <= Math.max(0, summary.available));
	}
	const final = safeToSpendSummary(doc, month, "2024-02-29");
	assert.equal(final.perDay, 13000);
	assert.equal(final.perWeek, 13000);
	assert.equal(final.weekDays, 1);
	assert.equal(safeToSpendSummary(doc, "2024-01").monthKind, "past");
	assert.equal(safeToSpendSummary(doc, "2024-03").monthKind, "future");
	assert.equal(safeToSpendSummary(doc, month).monthKind, "current");
});

test("negative envelopes reduce total, pacing never suggests overspending, and empty selections are safe", () => {
	const doc = setAssignment(funded(), "groceries", month, -9000);
	let summary = safeToSpendSummary(doc, month);
	assert.equal(summary.available, -4000);
	assert.equal(summary.overspentCount, 1);
	assert.equal(summary.perDay, 0);
	assert.equal(summary.perWeek, 0);
	doc.safeToSpendCategoryIds = [];
	summary = safeToSpendSummary(doc, month);
	assert.equal(summary.available, 0);
	assert.equal(summary.categoryCount, 0);
	doc.safeToSpendCategoryIds = ["deleted"];
	assert.equal(safeToSpendSummary(doc, month).available, 0);
	assert.throws(() => validateBudget(doc), /no longer exists/);
});

test("pacing rounds down and handles large safe integer balances without multiplication overflow", () => {
	const doc = funded();
	doc.allocations[0].amount = 1;
	doc.safeToSpendCategoryIds = ["groceries"];
	assert.equal(safeToSpendSummary(doc, month).perDay, 0);
	assert.equal(safeToSpendSummary(doc, month).perWeek, 0);
	// Every stored entry remains under the per-entry limit; aggregate exceeds MAX_SAFE_INTEGER / 7.
	doc.categories = Array.from({ length: 2000 }, (_, i) => category(`c${i}`));
	doc.allocations = doc.categories.map((item) => ({
		id: item.id,
		categoryId: item.id,
		month,
		amount: 1000000000000,
	}));
	doc.monthlyTemplate = {};
	doc.safeToSpendCategoryIds = doc.categories.map((item) => item.id);
	const summary = safeToSpendSummary(validateBudget(doc), month, "2024-02-15");
	assert.equal(summary.perWeek, Number((2000000000000000n * 7n) / 15n));
});

test("validation rejects malformed feature data, even when applying would otherwise do nothing", () => {
	for (const value of [
		-1,
		0.5,
		"100",
		null,
		Number.NaN,
		Number.POSITIVE_INFINITY,
		1000000000001,
	]) {
		const doc = fixture();
		doc.monthlyTemplate = { groceries: value };
		assert.throws(() => validateBudget(doc), /integer amount/);
		assert.throws(() => applyMonthlyTemplate(doc, month), /integer amount/);
	}
	for (const value of [null, [], "template"]) {
		assert.throws(
			() => validateBudget({ ...fixture(), monthlyTemplate: value }),
			/object/,
		);
	}
	assert.throws(
		() => validateBudget({ ...fixture(), monthlyTemplate: { deleted: 1 } }),
		/no longer exists/,
	);
	assert.throws(
		() =>
			validateBudget({
				...fixture(),
				safeToSpendCategoryIds: ["groceries", "groceries"],
			}),
		/duplicate/,
	);
	assert.throws(
		() => validateBudget({ ...fixture(), safeToSpendCategoryIds: [null] }),
		/category is required/,
	);
	assert.throws(
		() => validateBudget({ ...fixture(), schemaVersion: 2 }),
		/unsupported schema/,
	);
	const purpose = fixture();
	purpose.accounts[0].purpose = "invalid";
	assert.throws(() => validateBudget(purpose), /purpose/);
});

test("special object-key IDs survive templates without prototype pollution", () => {
	const doc = fixture();
	doc.categories = [category("__proto__"), category("constructor")];
	doc.safeToSpendCategoryIds = ["__proto__"];
	doc.monthlyTemplate = JSON.parse('{"__proto__":1000,"constructor":2000}');
	const saved = applyMonthlyTemplate(doc, month);
	assert.equal(categorySummary(saved, "__proto__", month).assigned, 1000);
	assert.equal(safeToSpendSummary(saved, month).available, 1000);
	assert.equal(Object.getPrototypeOf(saved.monthlyTemplate), Object.prototype);
});

test("template money locks currency even before accounts or assignments exist", () => {
	const doc = fixture();
	doc.accounts = [];
	assert.equal(hasAmounts(doc), true);
	doc.monthlyTemplate = {};
	assert.equal(hasAmounts(doc), false);
});

test("today uses the local calendar across UTC midnight", () => {
	mock.timers.setTime(new Date("2024-03-01T00:30:00Z").getTime());
	const local = new Date();
	const date = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
	assert.equal(today(), date);
	assert.equal(
		safeToSpendSummary(funded(), date.slice(0, 7)).monthKind,
		"current",
	);
});

test("known transfer status fields are validated while extension data survives", () => {
	const doc = fixture();
	doc.transactions = [transaction({ transferCleared: "yes" })];
	assert.throws(() => validateBudget(doc), /transferCleared/);
	doc.transactions = [transaction({ transferReconciled: 1 })];
	assert.throws(() => validateBudget(doc), /transferReconciled/);
	const valid = upsertTransaction(
		fixture(),
		transaction({ extra: { imported: true } }),
	);
	assert.deepEqual(
		validateBudget(JSON.parse(JSON.stringify(valid))).transactions[0].extra,
		{ imported: true },
	);
});
