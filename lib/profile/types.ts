import type { z } from "zod";
import type {
  colorPaletteSchema,
  fitChallengeSchema,
  measurementsSchema,
  necklineSchema,
  occasionSchema,
  profileSchema,
  shoeWidthSchema,
  silhouetteSchema,
  sizeRangeSchema,
  stylePreferencesSchema,
  styleVibeSchema,
  unitSystemSchema,
} from "./schema";

/**
 * All profile types are inferred from the zod schemas so they can never drift
 * from validation. Import from here when you only need the type (no runtime).
 */

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
