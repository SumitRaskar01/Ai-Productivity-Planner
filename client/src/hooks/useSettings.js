import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings } from '../services/api';

const STORAGE_KEY = 'tz_settings';

function applyTheme(darkMode) {
  document.documentElement.dataset.theme = darkMode ? 'dark' : '';
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (cached.darkMode !== undefined) applyTheme(cached.darkMode);
      return { darkMode: false, soundEnabled: true, ...cached };
    } catch {
      return { darkMode: false, soundEnabled: true };
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(({ data }) => {
        setSettings(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        applyTheme(data.darkMode);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (key === 'darkMode') applyTheme(value);
    try {
      await updateSettings({ [key]: value });
    } catch {
      setSettings(settings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      if (key === 'darkMode') applyTheme(settings.darkMode);
    }
  }, [settings]);

  return { settings, updateSetting, loading };
}
