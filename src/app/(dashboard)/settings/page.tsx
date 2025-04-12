import { SettingsHeader } from "./_components/settings-header";
import { SettingsTabs } from "./_components/settings-tabs";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <SettingsHeader />
      <SettingsTabs />
    </div>
  );
}
