import { z } from "zod";

/**
 * Single source of truth for the Fit First profile.
 * Types are derived from these schemas (see ./types.ts) so validation and
 * TypeScript never drift. This file is framework-agnostic and portable so the
 * future browser extension can reuse it directly.
 */

export const CURRENT_SCHEMA_VERSION = 1 as const;

export const unitSystemSchema = z.enum(["imperial", "metric"]);

export const shoeWidthSchema = z.enum([
  "narrow",
  "medium",
  "wide",
  "extra-wide",
]);

export const sizeRangeSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
  })
  .refine((r) => r.max >= r.min, {
    message: "Size range max must be greater than or equal to min.",
  });

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

const nullableNumber = z.number().positive().nullable();

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
