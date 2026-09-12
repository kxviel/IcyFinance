import { PageHeading } from "@/components/PageHeading";
import BackupSettings from "@/modules/Settings/BackupSettings";
import ProfileSettings from "@/modules/Settings/ProfileSettings";
import ReplacementDialog from "@/modules/Settings/ReplacementDialog";
import ResetSettings from "@/modules/Settings/ResetSettings";
import StorageSettings from "@/modules/Settings/StorageSettings";
import { useSettings } from "@/modules/Settings/useSettings";

const Settings = () => {
	const state = useSettings();
	const { busy, error, status } = state;
	return (
		<>
			<PageHeading
				index="06"
				title="Make yourself at home."
				description="Your preferences, local storage, portable backups and a fresh start."
			/>
			{error && (
				<p
					role="alert"
					className="text-destructive notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
				>
					{error}
				</p>
			)}
			{status && (
				<p
					role="status"
					className="notice px-5 py-4 border border-border bg-card text-[12px] leading-[1.7] mx-0 my-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
				>
					{status}
				</p>
			)}
			{busy && (
				<p role="status" className="text-muted-foreground small text-[12px]">
					{busy}
				</p>
			)}

			<div className="grid grid-cols-[1fr_1fr] gap-7 mt-5 mr-0 mb-0 ml-0 [align-items:start] max-[960px]:gap-4.5 max-[680px]:grid-cols-1">
				<ProfileSettings {...state} />

				<StorageSettings {...state} />

				<BackupSettings {...state} />

				<ResetSettings {...state} />
			</div>

			<p className="text-subtle text-[11px] leading-[1.75] mt-6.25 max-w-200">
				Backups include your financial data. Keep them somewhere private.
			</p>

			<ReplacementDialog {...state} />
		</>
	);
};

export default Settings;
