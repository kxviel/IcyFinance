const pad = (value: number) => String(value).padStart(2, "0");

export const today = (): string => {
	const date = new Date();
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const currentMonth = (): string => today().slice(0, 7);

export const validDate = (value: string): boolean => {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T12:00:00Z`);
	return (
		Number.isFinite(date.getTime()) &&
		date.toISOString().slice(0, 10) === value &&
		Number(value.slice(0, 4)) >= 1900
	);
};

export const validMonth = (value: string): boolean =>
	/^\d{4}-(0[1-9]|1[0-2])$/.test(value) && Number(value.slice(0, 4)) >= 1900;

export const shiftMonth = (month: string, delta: number): string => {
	if (!validMonth(month) || !Number.isSafeInteger(delta))
		throw new Error("Choose a valid month.");
	const [year, index] = month.split("-").map(Number);
	const absoluteMonth = year * 12 + index - 1 + delta;
	if (
		!Number.isSafeInteger(absoluteMonth) ||
		absoluteMonth < 1900 * 12 ||
		absoluteMonth >= 10000 * 12
	)
		throw new Error("That month is outside the supported range.");
	return `${Math.floor(absoluteMonth / 12)}-${pad((absoluteMonth % 12) + 1)}`;
};

export const endOfMonth = (month: string): string => {
	if (!validMonth(month)) throw new Error("Choose a valid month.");
	const [year, index] = month.split("-").map(Number);
	return `${month}-${new Date(Date.UTC(year, index, 0)).getUTCDate()}`;
};

export const monthLabel = (month: string): string => {
	if (!validMonth(month)) throw new Error("Choose a valid month.");
	return new Intl.DateTimeFormat(undefined, {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${month}-01T12:00:00Z`));
};

export const shortDate = (date: string): string => {
	if (!validDate(date)) return date;
	return new Intl.DateTimeFormat(undefined, {
		day: "numeric",
		month: "short",
		timeZone: "UTC",
	}).format(new Date(`${date}T12:00:00Z`));
};

/** Monthly/yearly recurrence clamps to the last valid day of the destination month. */
export const addFrequency = (
	date: string,
	repeat: "once" | "weekly" | "monthly" | "yearly",
	anchorDay = Number(date.slice(8)),
): string => {
	if (!validDate(date)) throw new Error("Choose a valid date.");
	if (!Number.isInteger(anchorDay) || anchorDay < 1 || anchorDay > 31)
		throw new Error("Choose a recurring day between 1 and 31.");
	if (repeat === "once") return date;
	if (repeat === "weekly") {
		const next = new Date(`${date}T12:00:00Z`);
		next.setUTCDate(next.getUTCDate() + 7);
		const result = next.toISOString().slice(0, 10);
		if (!validDate(result))
			throw new Error("The recurring date is outside the supported range.");
		return result;
	}
	const month = shiftMonth(date.slice(0, 7), repeat === "yearly" ? 12 : 1);
	return `${month}-${pad(Math.min(anchorDay, Number(endOfMonth(month).slice(8))))}`;
};
