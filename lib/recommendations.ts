import { z } from "zod";
import type { Profile } from "./types";

/**
 * The recommendations contract. The model must return JSON matching this
 * exactly. We re-validate its output against this schema before returning.
 */
export const recommendationSchema = z.object({
  silhouettes_to_prioritize: z.array(
    z.object({
      name: z.string().min(1),
      why: z.string().min(1),
    }),
  ),
  sizing_strategy: z.string().min(1),
  fit_red_flags: z.array(z.string().min(1)),
  garment_measurements_to_check: z.array(z.string().min(1)),
  style_directions: z.array(z.string().min(1)),
});

export type Recommendation = z.infer<typeof recommendationSchema>;

const SCHEMA_SHAPE = `{
  "silhouettes_to_prioritize": [{ "name": string, "why": string }],
  "sizing_strategy": string,
  "fit_red_flags": string[],
  "garment_measurements_to_check": string[],
  "style_directions": string[]
}`;

export function buildSystemPrompt(): string {
  return [
    "You are a fit-and-style advisor for mid-size (US 10-14) and plus-size (US 16+) women.",
    "You give concrete, practical fit guidance based on body measurements and style preferences.",
    "You are NOT a virtual try-on and you do not recommend specific products or brands.",
    "",
    "Rules:",
    "- Respond with ONLY a single JSON object. No prose, no markdown, no code fences.",
    "- The JSON MUST match this exact shape:",
    SCHEMA_SHAPE,
    "- Tone: neutral, concrete, and brief. Never judgmental about the body. Never use words like 'flaw', 'problem area', 'flattering' as a euphemism for hiding the body, or 'slimming'.",
    "- Frame everything as fit mechanics (proportion, ease, where seams land), not as fixing the body.",
    "- For full garments (dresses, jumpsuits, one-pieces), size to the hips first, then adjust other areas.",
    "- garment_measurements_to_check must be specific, lookup-able measurements from a product page (e.g. 'waist (flat)', 'hip', 'bust', 'shoulder width', 'sleeve length', 'rise', 'inseam', 'total length').",
    "- Base advice on the measurements and preferences provided; do not invent data. If a field is missing, work with what is given.",
  ].join("\n");
}

export function buildUserPrompt(profile: Profile): string {
  return [
    "Here is the user's profile as JSON. Generate their fit-and-style guidance.",
    "",
    "```json",
    JSON.stringify(profile, null, 2),
    "```",
    "",
    "Return ONLY the JSON object described in the system prompt.",
  ].join("\n");
}

/**
 * Removes surrounding markdown code fences and any leading/trailing prose so
 * the remaining text can be JSON.parse'd. Falls back to the widest {...} span.
 */
export function stripCodeFences(raw: string): string {
  let text = raw.trim();

  // Strip a leading fence like ``` or ```json, and a trailing fence.
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) {
    text = fenced[1].trim();
  }

  // If there's still stray prose around it, take the outermost object span.
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1);
  }
  return text.trim();
}

export type ParseResult =
  | { ok: true; data: Recommendation }
  | { ok: false; error: string };

/** Safely parses model output into a validated Recommendation. Never throws. */
export function parseRecommendation(raw: string): ParseResult {
  const cleaned = stripCodeFences(raw);
  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch {
    return { ok: false, error: "Model output was not valid JSON." };
  }
  const result = recommendationSchema.safeParse(json);
  if (!result.success) {
    return {
      ok: false,
      error: `Model JSON did not match the schema: ${result.error.message}`,
    };
  }
  return { ok: true, data: result.data };
}
