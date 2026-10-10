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
        <p role="alert" className="text-destructive notice">
          {error}
        </p>
      )}
      {status && (
        <p role="status" className="notice">
          {status}
        </p>
      )}
      {busy && (
        <p role="status" className="text-muted-foreground small text-sm">
          {busy}
        </p>
      )}

      <div className="settings-grid">
        <ProfileSettings {...state} />

        <StorageSettings {...state} />

        <BackupSettings {...state} />

        <ResetSettings {...state} />
      </div>

      <p className="text-muted-foreground mt-6 max-w-200 text-xs leading-relaxed">
        Backups include your financial data. Keep them somewhere private.
      </p>

      <ReplacementDialog {...state} />
    </>
  );
}
