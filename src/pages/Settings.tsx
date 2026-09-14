import { PageHeading } from "@/components/page-heading";
import BackupSettings from "@/components/settings/backup-settings";
import ProfileSettings from "@/components/settings/profile-settings";
import ReplacementDialog from "@/components/settings/replacement-dialog";
import ResetSettings from "@/components/settings/reset-settings";
import StorageSettings from "@/components/settings/storage-settings";
import { useSettings } from "@/hooks/use-settings";

export default function Settings() {
	const state = useSettings();
	const { busy, error, status } = state;
	return (
		<>
			<PageHeading title="Settings" />
			{error && (
				<p
					role="alert"
					className="text-destructive notice px-5 py-4 border border-border bg-card text-sm leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
				>
					{error}
				</p>
			)}
			{status && (
				<p
					role="status"
					className="notice px-5 py-4 border border-border bg-card text-sm leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
				>
					{status}
				</p>
			)}
			{busy && (
				<p role="status" className="text-muted-foreground small text-sm">
					{busy}
				</p>
			)}

			<div className="grid max-w-5xl gap-4 sm:grid-cols-2">
				<ProfileSettings {...state} />

				<StorageSettings {...state} />

				<BackupSettings {...state} />

				<ResetSettings {...state} />
			</div>

			<p className="text-subtle text-sm leading-[1.75] mt-6.25 max-w-200">
				Backups include your financial data. Keep them somewhere private.
			</p>

			<ReplacementDialog {...state} />
		</>
	);
}
