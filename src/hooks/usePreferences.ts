"use client";

import { useState, useCallback } from "react";

export interface UserPreferences {
  preferredServer: string;
  defaultQuality: string;
  linkShortener: boolean;
  subtitleLanguage: string;
  autoPlay: boolean;
  defaultStreamSource: string;
  episodeType: string;
}

const STORAGE_KEY = "apexanime-preferences";

const defaults: UserPreferences = {
  preferredServer: "auto",
  defaultQuality: "auto",
  linkShortener: true,
  subtitleLanguage: "english",
  autoPlay: true,
  defaultStreamSource: "auto",
  episodeType: "sub",
};

function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return defaults;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch {}
  return defaults;
}

function savePreferences(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences);

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      savePreferences(next);
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPrefs(defaults);
    savePreferences(defaults);
  }, []);

  return { preferences: prefs, updatePreference, resetPreferences };
}
