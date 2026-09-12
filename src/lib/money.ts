/** All persisted money is integer minor units; currency is presentation only. */
export const assertCents = (amount: number): number => {
	if (!Number.isSafeInteger(amount))
		throw new Error("Enter a valid amount with at most two decimal places.");
	return amount;
};

export const formatMoney = (cents: number, currency = "EUR"): string =>
	new Intl.NumberFormat(undefined, {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(assertCents(cents) / 100);

export const inputMoney = (cents: number): string => {
	assertCents(cents);
	return `${cents < 0 ? "-" : ""}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, "0")}`;
};

/** Accept decimal comma or point, but deliberately reject ambiguous grouping. */
export const parseMoney = (input: string): number => {
	const text = input.trim().replace(/\s/g, "");
	if (!/^[+-]?\d+(?:[.,]\d{1,2})?$/.test(text))
		throw new Error(
			"Use an amount such as 1250.00 or 1250,00, without thousands separators.",
		);
	const negative = text.startsWith("-");
	const [whole, fraction = ""] = text.replace(/^[+-]/, "").split(/[.,]/);
	const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
	return assertCents(negative ? -cents : cents);
};
