"use client";

import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";

function allTimezones(): string[] {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
    if (fn) return fn("timeZone");
  } catch {
    // fall through
  }
  return [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Phoenix", "Europe/London", "Europe/Paris", "Europe/Berlin",
    "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "UTC",
  ];
}

export function TimezoneSelect() {
  const { profile, loading, updateProfile } = useProfile();
  const zones = useMemo(allTimezones, []);
  const [value, setValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const browserTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; }
  }, []);

  useEffect(() => {
    if (!loading) setValue(profile?.timezone || browserTz);
  }, [loading, profile?.timezone, browserTz]);

  const onChange = async (tz: string) => {
    setValue(tz);
    setSaving(true);
    const { error } = await updateProfile({ timezone: tz });
    setSaving(false);
    if (error) {
      toast.error("Could not save timezone");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <label className="text-sm font-medium text-ecco-secondary mb-2 block">
        Timezone
        {saving && <Loader2 className="ml-2 inline h-3 w-3 animate-spin text-ecco-tertiary" />}
        {saved && <Check className="ml-2 inline h-3 w-3 text-ecco-success" />}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full px-3 py-2 text-sm border border-ecco rounded-lg bg-white text-ecco-primary"
      >
        {!zones.includes(value) && value && <option value={value}>{value}</option>}
        {zones.map((z) => (
          <option key={z} value={z}>{z.replace(/_/g, " ")}</option>
        ))}
      </select>
      <p className="text-[10px] text-ecco-muted mt-2">
        Used when scheduling posts. Detected: {browserTz}.
      </p>
    </div>
  );
}
