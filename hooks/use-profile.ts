"use client";

import { useCallback, useEffect, useState } from "react";
import { createEmptyProfile } from "@/lib/profile/defaults";
import {
  clearProfile,
  downloadProfileJson,
  exportProfileJson,
  loadProfile,
  saveProfile,
} from "@/lib/profile/storage";
import type { Profile } from "@/lib/profile/types";

type ProfileStatus = "loading" | "empty" | "ready" | "invalid";

interface UseProfileResult {
  profile: Profile;
  status: ProfileStatus;
  /** True once a valid profile has been loaded from storage at least once. */
  isPersisted: boolean;
  error: string | null;
  /** Merge a partial update into the in-memory profile (does not persist). */
  update: (patch: Partial<Profile>) => void;
  /** Replace the in-memory profile (does not persist). */
  setProfile: (next: Profile) => void;
  /** Validate + write the current profile to localStorage. */
  save: () => Profile;
  /** Remove the stored profile and reset to an empty one. */
  reset: () => void;
  /** Serialize the current profile to a JSON string (extension bridge). */
  exportJson: () => string;
  /** Download the current profile as a .json file. */
  downloadJson: (filename?: string) => void;
}

export function useProfile(): UseProfileResult {
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

  const save = useCallback((): Profile => {
    const saved = saveProfile(profile);
    setProfileState(saved);
    setIsPersisted(true);
    setStatus("ready");
    setError(null);
    return saved;
  }, [profile]);

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
