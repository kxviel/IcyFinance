import type {
	BudgetDocument,
	Transaction,
	TransactionSplit,
} from "@/lib/budget-types";
import { validateBudget } from "@/lib/budget-validation";
import { validDate } from "@/lib/dates";
import { inputMoney, parseMoney } from "@/lib/money";

interface CsvRow {
	cells: string[];
	line: number;
}

const delimiterFor = (text: string): string => {
	const counts = new Map([
		[",", 0],
		[";", 0],
		["\t", 0],
	]);
	let quoted = false;
	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		if (char === '"') {
			if (quoted && text[index + 1] === '"') index += 1;
			else quoted = !quoted;
		} else if (!quoted) {
			if (char === "\r" || char === "\n") break;
			if (counts.has(char)) counts.set(char, (counts.get(char) ?? 0) + 1);
		}
	}
	return [...counts].sort((a, b) => b[1] - a[1])[0][0];
};

/** RFC 4180 quoting, including escaped quotes and multiline memo fields. */
const readRows = (source: string): CsvRow[] => {
	const text = source.replace(/^\uFEFF/, "").replace(/^(?:[ \t]*\r?\n)+/, "");
	const delimiter = delimiterFor(text);
	const rows: CsvRow[] = [];
	let cells: string[] = [];
	let cell = "";
	let quoted = false;
	let afterQuote = false;
	let line = 1;
	let rowLine = 1;
	const finishCell = () => {
		cells.push(cell);
		cell = "";
		afterQuote = false;
	};
	const finishRow = () => {
		finishCell();
		if (cells.some((value) => value.trim()))
			rows.push({ cells, line: rowLine });
		cells = [];
		if (rows.length > 50_001)
			throw new Error("Import at most 50,000 transactions at a time.");
	};
	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		if (quoted) {
			if (char === '"' && text[index + 1] === '"') {
				cell += '"';
				index += 1;
			} else if (char === '"') {
				quoted = false;
				afterQuote = true;
			} else {
				cell += char;
				if (char === "\n") line += 1;
			}
			continue;
		}
		if (char === '"' && cell === "" && !afterQuote) {
			quoted = true;
			continue;
		}
		if (char === delimiter) {
			finishCell();
			continue;
		}
		if (char === "\n" || char === "\r") {
			if (char === "\r" && text[index + 1] === "\n") index += 1;
			finishRow();
			line += 1;
			rowLine = line;
			continue;
		}
		if (afterQuote || char === '"')
			throw new Error(`Line ${line}: invalid CSV quoting.`);
		cell += char;
	}
	if (quoted)
		throw new Error(`Line ${rowLine}: an opening quote is never closed.`);
	if (cell || cells.length || afterQuote) finishRow();
	return rows;
};

const fingerprint = (tx: Transaction) =>
	JSON.stringify([
		tx.accountId,
		tx.transferAccountId,
		tx.date,
		tx.payee.trim().toLowerCase(),
		tx.amount,
	]);
const transactionDetails = (tx: Transaction) =>
	JSON.stringify([
		tx.id,
		tx.accountId,
		tx.transferAccountId,
		tx.date,
		tx.payee,
		tx.memo,
		tx.amount,
		tx.categoryId,
		tx.splits.map((split) => [split.id, split.categoryId, split.amount]),
		tx.cleared,
		tx.reconciled,
		tx.transferAccountId ? (tx.transferCleared ?? tx.cleared) : null,
		tx.transferAccountId ? (tx.transferReconciled ?? tx.reconciled) : null,
	]);
const unprotect = (text: string) => text.replace(/^'(?=['=+\-@\t\r])/, "");
const parseFlag = (value: string, fallback = false): boolean => {
	if (!value.trim()) return fallback;
	if (["true", "1", "yes", "cleared", "c"].includes(value.toLowerCase()))
		return true;
	if (["false", "0", "no", "uncleared", "u"].includes(value.toLowerCase()))
		return false;
	throw new Error("Cleared and reconciled values must be true or false.");
};

export const parseTransactionCsv = (
	text: string,
	accountId: string,
	doc: BudgetDocument,
): { transactions: Transaction[]; errors: string[]; duplicates: number } => {
	const transactions: Transaction[] = [];
	const errors: string[] = [];
	let duplicates = 0;
	try {
		if (text.length > 20_000_000)
			throw new Error("Choose a CSV file smaller than 20 MB.");
		if (!doc.accounts.some((item) => item.id === accountId && !item.closed))
			throw new Error("Choose an open account for imported transactions.");
		const rows = readRows(text);
		if (rows.length < 2)
			throw new Error("The CSV needs a header and at least one transaction.");
		const headers = rows[0].cells.map((header) =>
			header.trim().toLowerCase().replace(/[ -]+/g, "_"),
		);
		if (new Set(headers).size !== headers.length)
			throw new Error("CSV column names must be unique.");
		const aliases: Record<string, string[]> = {
			date: ["date", "transaction_date"],
			payee: ["payee", "description", "merchant"],
			amount: ["amount"],
			memo: ["memo", "notes", "note"],
			outflow: ["outflow", "debit"],
			inflow: ["inflow", "credit"],
		};
		const indexFor = (name: string) =>
			headers.findIndex((header) => (aliases[name] ?? [name]).includes(header));
		if (
			indexFor("date") < 0 ||
			indexFor("payee") < 0 ||
			(indexFor("amount") < 0 &&
				(indexFor("outflow") < 0 || indexFor("inflow") < 0))
		)
			throw new Error(
				"Required columns: date, payee, amount. You can use separate outflow and inflow columns instead of amount. Dates must be YYYY-MM-DD.",
			);
		// IDs are authoritative for IcyFinance exports. Bank CSVs without IDs use
		// occurrence counts: two identical purchases remain two ledger entries.
		const known = new Map<string, number>();
		for (const tx of doc.transactions) {
			const key = fingerprint(tx);
			known.set(key, (known.get(key) ?? 0) + 1);
		}
		const knownIds = new Map(doc.transactions.map((tx) => [tx.id, tx]));
		for (const row of rows.slice(1)) {
			try {
				if (row.cells.length !== headers.length)
					throw new Error(
						`Expected ${headers.length} columns; found ${row.cells.length}.`,
					);
				const raw = (name: string) =>
					unprotect(row.cells[indexFor(name)] ?? "");
				const get = (name: string) => raw(name).trim();
				const date = get("date");
				if (!validDate(date))
					throw new Error("Use a real date in YYYY-MM-DD format.");
				const amount = get("amount")
					? parseMoney(get("amount"))
					: (() => {
							if (!get("inflow") && !get("outflow"))
								throw new Error(
									"Enter an amount, inflow, or outflow; blank amounts are not zero.",
								);
							const inflow = get("inflow") ? parseMoney(get("inflow")) : 0;
							const outflow = get("outflow") ? parseMoney(get("outflow")) : 0;
							if (inflow < 0 || outflow < 0 || (inflow > 0 && outflow > 0))
								throw new Error(
									"Use one non-negative inflow or outflow per row.",
								);
							return inflow - outflow;
						})();
				const categoryKey = get("category_id");
				const categoryName = get("category");
				let categoryId: string | null = categoryKey || null;
				if (!categoryKey && categoryName) {
					const matches = doc.categories.filter(
						(item) =>
							item.name.toLocaleLowerCase() ===
								categoryName.toLocaleLowerCase() ||
							`${item.group}: ${item.name}`.toLocaleLowerCase() ===
								categoryName.toLocaleLowerCase(),
					);
					if (matches.length !== 1)
						throw new Error(
							`Category “${categoryName}” is unknown or ambiguous; use its exact group: name or category_id.`,
						);
					categoryId = matches[0].id;
				}
				let splits: TransactionSplit[] = [];
				if (get("splits")) {
					const splitData: unknown = JSON.parse(get("splits"));
					if (!Array.isArray(splitData))
						throw new Error("Splits must be a JSON array.");
					splits = splitData as TransactionSplit[]; // The document validator checks every field below.
				}
				const reconciled = parseFlag(get("reconciled"));
				const transaction: Transaction = {
					id: get("id") || crypto.randomUUID(),
					accountId: get("account_id") || accountId,
					date,
					payee: raw("payee"),
					memo: raw("memo"),
					amount,
					categoryId,
					transferAccountId: get("transfer_account_id") || null,
					splits,
					cleared: parseFlag(get("cleared"), reconciled),
					reconciled,
					...(get("transfer_cleared")
						? { transferCleared: parseFlag(get("transfer_cleared")) }
						: {}),
					...(get("transfer_reconciled")
						? { transferReconciled: parseFlag(get("transfer_reconciled")) }
						: {}),
				};
				if (
					doc.accounts.find((item) => item.id === transaction.accountId)?.closed
				)
					throw new Error("The imported account is closed.");
				if (
					doc.accounts.find((item) => item.id === transaction.transferAccountId)
						?.closed
				)
					throw new Error("The transfer destination is closed.");
				const checked = validateBudget({
					...doc,
					transactions: [transaction],
					allocations: [],
					schedules: [],
				}).transactions[0];
				const key = fingerprint(checked);
				const existing = knownIds.get(checked.id);
				if (existing) {
					if (transactionDetails(existing) !== transactionDetails(checked))
						throw new Error(
							"This transaction identifier already exists with different details.",
						);
					duplicates += 1;
					continue;
				}
				const remainingMatches = known.get(key) ?? 0;
				if (!get("id") && remainingMatches > 0) {
					known.set(key, remainingMatches - 1);
					duplicates += 1;
					continue;
				}
				knownIds.set(checked.id, checked);
				transactions.push(checked);
			} catch (error) {
				errors.push(
					`Line ${row.line}: ${error instanceof Error ? error.message : "Invalid transaction."}`,
				);
			}
		}
	} catch (error) {
		errors.push(
			error instanceof Error ? error.message : "Unable to read this CSV.",
		);
	}
	return { transactions, errors, duplicates };
};

const quote = (value: string, protectFormula = true): string => {
	// Escaping leading apostrophes too makes formula protection reversible.
	const safe =
		protectFormula && /^['=+\-@\t\r]/.test(value) ? `'${value}` : value;
	return `"${safe.replace(/"/g, '""')}"`;
};

/** A single row per ledger entry; transfer destinations are not duplicated. */
export const exportTransactionsCsv = (doc: BudgetDocument): string => {
	const headers = [
		"id",
		"account_id",
		"account",
		"date",
		"payee",
		"memo",
		"amount",
		"category_id",
		"category",
		"transfer_account_id",
		"transfer_account",
		"splits",
		"cleared",
		"reconciled",
		"transfer_cleared",
		"transfer_reconciled",
	];
	const lines = [...doc.transactions]
		.sort((a, b) => a.date.localeCompare(b.date))
		.map((tx) => {
			const category = doc.categories.find((item) => item.id === tx.categoryId);
			const values = [
				tx.id,
				tx.accountId,
				doc.accounts.find((item) => item.id === tx.accountId)?.name ?? "",
				tx.date,
				tx.payee,
				tx.memo,
				inputMoney(tx.amount),
				tx.categoryId ?? "",
				category ? `${category.group}: ${category.name}` : "",
				tx.transferAccountId ?? "",
				doc.accounts.find((item) => item.id === tx.transferAccountId)?.name ??
					"",
				JSON.stringify(tx.splits),
				String(tx.cleared),
				String(tx.reconciled),
				tx.transferAccountId ? String(tx.transferCleared ?? tx.cleared) : "",
				tx.transferAccountId
					? String(tx.transferReconciled ?? tx.reconciled)
					: "",
			];
			return values.map((value, index) => quote(value, index !== 6)).join(",");
		});
	return `\uFEFF${headers.join(",")}\r\n${lines.join("\r\n")}`;
};
