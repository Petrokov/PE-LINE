import { getSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Postavke</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
