import { CURRENT_SCHEMA_VERSION, profileSchema } from "./schema";
import type { Profile } from "./types";

export const PROFILE_STORAGE_KEY = "fit-first:profile";

type MigrationResult =
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
  if (typeof raw !== "object" || raw === null) return raw;
  const version = (raw as { schemaVersion?: unknown }).schemaVersion;
  if (version === CURRENT_SCHEMA_VERSION) return raw;
  // No older versions exist yet. Unknown versions fall through to validation,
  // which will reject them and surface an "invalid" status to the caller.
  return raw;
}

/** Reads and validates the stored profile. Never throws. */
export function loadProfile(): MigrationResult {
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
 * profile on success. Body changes are a normal update path, not an edge case.
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
 * Serializes a validated profile to a JSON string. This is the portable bridge
 * to the future browser extension, which cannot read the site's localStorage
 * directly. Validates first so we never export a malformed shape.
 */
export function exportProfileJson(profile: Profile, pretty = true): string {
  const result = profileSchema.parse(profile);
  return JSON.stringify(result, null, pretty ? 2 : 0);
}

/**
 * Triggers a client-side download of the profile as a .json file.
 * No-op outside the browser.
 */
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
