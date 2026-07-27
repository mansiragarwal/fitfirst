"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { profileSchema, type Profile } from "./types";

export {
  REQUIRED_MEASUREMENT_KEYS,
  createEmptyProfile,
  getMissingRequiredMeasurements,
  isReadyForRecommendations,
} from "./types";
import { createEmptyProfile } from "./types";

export const PROFILE_STORAGE_KEY = "fit-first:profile";

// --- Storage ------------------------------------------------------------

export type LoadResult =
  | { status: "ok"; profile: Profile }
  | { status: "empty" }
  | { status: "invalid"; error: string };

function hasWindow(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * Placeholder for future schema migrations. When CURRENT_SCHEMA_VERSION is
 * bumped, add cases here that upgrade older shapes before validation.
 */
function migrate(raw: unknown): unknown {
  return raw;
}

/** Reads and validates the stored profile. Never throws. */
export function loadProfile(): LoadResult {
  if (!hasWindow()) return { status: "empty" };
  const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!stored) return { status: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return { status: "invalid", error: "Stored profile is not valid JSON." };
  }

  const result = profileSchema.safeParse(migrate(parsed));
  if (!result.success) {
    return { status: "invalid", error: result.error.message };
  }
  return { status: "ok", profile: result.data };
}

/**
 * Validates and persists the profile, stamping updatedAt. Returns the saved
 * profile. A body change is a normal update path, not an edge case.
 */
export function saveProfile(profile: Profile): Profile {
  const stamped: Profile = { ...profile, updatedAt: new Date().toISOString() };
  const result = profileSchema.parse(stamped);
  if (hasWindow()) {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(result));
  }
  return result;
}

export function clearProfile(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
}

/**
 * Serializes a validated profile to JSON. This is the portable bridge to the
 * future browser extension, which cannot read the site's localStorage.
 */
export function exportProfileJson(profile: Profile, pretty = true): string {
  const result = profileSchema.parse(profile);
  return JSON.stringify(result, null, pretty ? 2 : 0);
}

/** Triggers a client-side download of the profile as a .json file. */
export function downloadProfileJson(
  profile: Profile,
  filename = "fit-first-profile.json",
): void {
  if (!hasWindow()) return;
  const blob = new Blob([exportProfileJson(profile)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// --- React context + hook ----------------------------------------------

type ProfileStatus = "loading" | "empty" | "ready" | "invalid";

export interface ProfileContextValue {
  profile: Profile;
  status: ProfileStatus;
  /** True once a valid profile has been loaded from storage at least once. */
  isPersisted: boolean;
  error: string | null;
  /** Merge a partial update into the in-memory profile (does not persist). */
  update: (patch: Partial<Profile>) => void;
  /** Replace the in-memory profile (does not persist). */
  setProfile: (next: Profile) => void;
  /**
   * Validate + write to localStorage. Pass a profile to save that exact value
   * (avoids stale state right after building an updated profile); otherwise the
   * current in-memory profile is saved.
   */
  save: (next?: Profile) => Profile;
  /** Remove the stored profile and reset to an empty one. */
  reset: () => void;
  /** Serialize the current profile to a JSON string (extension bridge). */
  exportJson: () => string;
  /** Download the current profile as a .json file. */
  downloadJson: (filename?: string) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function useProfileState(): ProfileContextValue {
  const [profile, setProfileState] = useState<Profile>(createEmptyProfile);
  const [status, setStatus] = useState<ProfileStatus>("loading");
  const [isPersisted, setIsPersisted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const result = loadProfile();
    if (result.status === "ok") {
      setProfileState(result.profile);
      setIsPersisted(true);
      setStatus("ready");
    } else if (result.status === "invalid") {
      setError(result.error);
      setStatus("invalid");
    } else {
      setStatus("empty");
    }
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    setProfileState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setProfile = useCallback((next: Profile) => {
    setProfileState(next);
  }, []);

  const save = useCallback(
    (next?: Profile): Profile => {
      const saved = saveProfile(next ?? profile);
      setProfileState(saved);
      setIsPersisted(true);
      setStatus("ready");
      setError(null);
      return saved;
    },
    [profile],
  );

  const reset = useCallback(() => {
    clearProfile();
    setProfileState(createEmptyProfile());
    setIsPersisted(false);
    setStatus("empty");
    setError(null);
  }, []);

  const exportJson = useCallback(() => exportProfileJson(profile), [profile]);

  const downloadJson = useCallback(
    (filename?: string) => downloadProfileJson(profile, filename),
    [profile],
  );

  return {
    profile,
    status,
    isPersisted,
    error,
    update,
    setProfile,
    save,
    reset,
    exportJson,
    downloadJson,
  };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfileState();

  // Dev-only console bridge: lets you set/read a profile from DevTools.
  // e.g. const p = fitFirst.createEmptyProfile(); p.measurements.hips = 40;
  //      fitFirst.save(p); fitFirst.load();
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { fitFirst: unknown }).fitFirst = {
      createEmptyProfile,
      load: loadProfile,
      save: saveProfile,
      clear: clearProfile,
      exportJson: exportProfileJson,
      current: () => value.profile,
    };
  }, [value.profile]);

  return createElement(ProfileContext.Provider, { value }, children);
}

/** Access the shared profile. Must be used within a <ProfileProvider>. */
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a <ProfileProvider>.");
  }
  return ctx;
}
