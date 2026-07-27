import { z } from "zod";

/**
 * Single source of truth for the Fit First profile.
 * Types are inferred from these zod schemas so validation and TypeScript can
 * never drift. This file is framework-agnostic and portable, so the future
 * browser extension can reuse it directly. No React, no localStorage here.
 */

export const CURRENT_SCHEMA_VERSION = 1 as const;

// --- Enums --------------------------------------------------------------

export const unitSystemSchema = z.enum(["imperial", "metric"]);

export const shoeWidthSchema = z.enum([
  "narrow",
  "medium",
  "wide",
  "extra-wide",
]);

export const fitChallengeSchema = z.enum([
  "fuller-bust",
  "waist-to-hip-difference",
  "broader-shoulders",
  "narrower-shoulders",
  "longer-torso",
  "shorter-torso",
  "tummy",
  "fuller-arms",
  "fuller-thighs",
]);

export const styleVibeSchema = z.enum([
  "classic",
  "minimal",
  "romantic",
  "edgy",
  "bohemian",
  "sporty",
  "polished",
  "cozy",
]);

export const silhouetteSchema = z.enum([
  "fit-and-flare",
  "a-line",
  "wrap",
  "shift",
  "bodycon",
  "empire",
  "straight",
  "wide-leg",
]);

export const necklineSchema = z.enum([
  "v-neck",
  "scoop",
  "crew",
  "boat",
  "square",
  "sweetheart",
  "cowl",
  "halter",
]);

export const colorPaletteSchema = z.enum([
  "neutrals",
  "earth-tones",
  "jewel-tones",
  "pastels",
  "brights",
  "monochrome",
]);

export const occasionSchema = z.enum([
  "work",
  "casual",
  "date-night",
  "formal",
  "athleisure",
  "travel",
]);

// --- Composite shapes ---------------------------------------------------

export const sizeRangeSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
  })
  .refine((r) => r.max >= r.min, {
    message: "Size range max must be greater than or equal to min.",
  });

const nullableNumber = z.number().positive().nullable();

/** All measurements are nullable so a partial profile can be saved. */
export const measurementsSchema = z.object({
  bust: nullableNumber,
  underbust: nullableNumber,
  waist: nullableNumber,
  hips: nullableNumber,
  torsoLength: nullableNumber,
  inseam: nullableNumber,
  height: nullableNumber,
  braSize: z.string().trim().min(1).nullable(),
  shoeSize: nullableNumber,
  shoeWidth: shoeWidthSchema.nullable(),
  sizeRange: sizeRangeSchema.nullable(),
});

export const stylePreferencesSchema = z.object({
  vibes: z.array(styleVibeSchema),
  silhouettes: z.array(silhouetteSchema),
  necklines: z.array(necklineSchema),
  colorPalette: z.array(colorPaletteSchema),
  occasions: z.array(occasionSchema),
  avoid: z.array(z.string().trim().min(1)),
});

export const profileSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  unitSystem: unitSystemSchema,
  measurements: measurementsSchema,
  fitChallenges: z.array(fitChallengeSchema),
  style: stylePreferencesSchema,
  updatedAt: z.string().datetime(),
});

// --- Inferred types -----------------------------------------------------

export type UnitSystem = z.infer<typeof unitSystemSchema>;
export type ShoeWidth = z.infer<typeof shoeWidthSchema>;
export type SizeRange = z.infer<typeof sizeRangeSchema>;
export type FitChallenge = z.infer<typeof fitChallengeSchema>;
export type StyleVibe = z.infer<typeof styleVibeSchema>;
export type Silhouette = z.infer<typeof silhouetteSchema>;
export type Neckline = z.infer<typeof necklineSchema>;
export type ColorPalette = z.infer<typeof colorPaletteSchema>;
export type Occasion = z.infer<typeof occasionSchema>;
export type Measurements = z.infer<typeof measurementsSchema>;
export type StylePreferences = z.infer<typeof stylePreferencesSchema>;
export type Profile = z.infer<typeof profileSchema>;

// --- Pure helpers (safe on server and client) ---------------------------

/**
 * The measurements required before we call /api/recommendations. A partial
 * profile can still be saved; these gate the recommendations call only.
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

export function getMissingRequiredMeasurements(
  profile: Profile,
): (keyof Measurements)[] {
  return REQUIRED_MEASUREMENT_KEYS.filter(
    (key) => profile.measurements[key] == null,
  );
}

export function isReadyForRecommendations(profile: Profile): boolean {
  return getMissingRequiredMeasurements(profile).length === 0;
}
