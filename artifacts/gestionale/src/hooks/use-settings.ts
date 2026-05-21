import { useLocalStorage } from "@/hooks/use-local-storage";

export interface AppSettings {
  expiryThresholdDays: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  expiryThresholdDays: 30,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    "gestionale.settings.v1",
    DEFAULT_SETTINGS,
  );

  const setExpiryThresholdDays = (days: number) => {
    setSettings({ ...settings, expiryThresholdDays: days });
  };

  return { settings, setExpiryThresholdDays };
}
