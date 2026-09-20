import assert from "node:assert/strict";
import { after, test } from "node:test";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { exportDocument } from "../src/lib/backups.ts";
import { createEmptyBudget } from "../src/lib/budget-seed.ts";
import { validateBudget } from "../src/lib/budget-validation.ts";
import { loadBudget, saveBudget } from "../src/lib/storage.ts";

globalThis.window = {};
globalThis.isTauri = true;
after(() => {
	clearMocks();
	delete globalThis.window;
	delete globalThis.isTauri;
});

const fixture = () => ({
	...createEmptyBudget(),
	accounts: [
		{
			id: "a",
			name: "Test account",
			kind: "checking",
			purpose: "bills",
			openingBalance: 1000,
			closed: false,
			note: "",
		},
	],
	categories: [
		{
			id: "c",
			name: "Test category",
			group: "Test group",
			note: "",
			hidden: false,
			target: null,
		},
	],
	monthlyTemplate: { c: 100 },
	safeToSpendCategoryIds: ["c"],
	extension: { note: "Preserve v1 extension data" },
});

test("storage bridge loads old documents without automatically rewriting them", async () => {
	const old = fixture();
	delete old.monthlyTemplate;
	delete old.safeToSpendCategoryIds;
	delete old.accounts[0].purpose;
	const contents = JSON.stringify(old);
	const commands = [];
	mockIPC((command) => {
		commands.push(command);
		return contents;
	});
	const loaded = await loadBudget();
	assert.deepEqual(loaded.monthlyTemplate, {});
	assert.deepEqual(loaded.safeToSpendCategoryIds, []);
	assert.deepEqual(commands, ["load_budget"]);
});

test("save/load and backup export/import preserve metadata and integer amounts", async () => {
	let contents;
	let backup;
	mockIPC((command, args) => {
		if (command === "save_budget") contents = args.contents;
		else if (command === "load_budget") return contents;
		else if (command === "export_file") {
			backup = args.contents;
			return true;
		}
	});
	const doc = fixture();
	await saveBudget(doc);
	assert.deepEqual(await loadBudget(), doc);
	await exportDocument(doc, "test");
	assert.deepEqual(validateBudget(JSON.parse(backup)), doc);
	assert.equal(
		Number.isSafeInteger(JSON.parse(contents).monthlyTemplate.c),
		true,
	);
});

test("invalid load/save never sends a destructive replacement to the backend", async () => {
	const contents = JSON.stringify({
		...fixture(),
		monthlyTemplate: { c: 0.5 },
	});
	const commands = [];
	mockIPC((command) => {
		commands.push(command);
		return contents;
	});
	await assert.rejects(loadBudget(), /row has been left unchanged/);
	assert.throws(() => saveBudget(JSON.parse(contents)), /integer amount/);
	assert.deepEqual(commands, ["load_budget"]);
});

test("serialized saves keep the latest snapshot after a failed earlier write", async () => {
	let contents;
	const attempts = [];
	mockIPC(async (command, args) => {
		if (command === "load_budget") return contents;
		attempts.push(JSON.parse(args.contents).name);
		if (attempts.length === 1) throw new Error("Simulated write failure");
		contents = args.contents;
	});
	const first = saveBudget({ ...fixture(), name: "First" });
	const second = saveBudget({ ...fixture(), name: "Second" });
	await assert.rejects(first, /Simulated write failure/);
	await second;
	assert.deepEqual(attempts, ["First", "Second"]);
	assert.equal((await loadBudget()).name, "Second");
});
