import { CURRENT_SCHEMA_VERSION } from "./schema";
import type { Measurements, Profile } from "./types";

/**
 * The measurements required before we will call /api/recommendations.
 * A partial profile can still be saved; these gate the API call only.
 */
export const REQUIRED_MEASUREMENT_KEYS = [
  "bust",
  "waist",
  "hips",
  "sizeRange",
] as const satisfies readonly (keyof Measurements)[];

export function createEmptyProfile(): Profile {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    unitSystem: "imperial",
    measurements: {
      bust: null,
      underbust: null,
      waist: null,
      hips: null,
      torsoLength: null,
      inseam: null,
      height: null,
      braSize: null,
      shoeSize: null,
      shoeWidth: null,
      sizeRange: null,
    },
    fitChallenges: [],
    style: {
      vibes: [],
      silhouettes: [],
      necklines: [],
      colorPalette: [],
      occasions: [],
      avoid: [],
    },
    updatedAt: new Date().toISOString(),
  };
}

/** Returns the subset of required measurement keys that are still missing. */
export function getMissingRequiredMeasurements(
  profile: Profile,
): (keyof Measurements)[] {
  return REQUIRED_MEASUREMENT_KEYS.filter(
    (key) => profile.measurements[key] == null,
  );
}

/** True when the profile has the minimum set needed for recommendations. */
export function isReadyForRecommendations(profile: Profile): boolean {
  return getMissingRequiredMeasurements(profile).length === 0;
}
