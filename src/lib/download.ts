import { invoke, isTauri } from "@tauri-apps/api/core";

export async function downloadFile(
	name: string,
	contents: string,
	type = "application/json",
) {
	if (isTauri()) return invoke<boolean>("export_file", { name, contents });
	const url = URL.createObjectURL(new Blob([contents], { type }));
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = name;
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
	return true;
}
