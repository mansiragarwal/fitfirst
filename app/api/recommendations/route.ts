import Anthropic from "@anthropic-ai/sdk";
import {
  generateRecommendations,
  InvalidModelOutputError,
  MissingApiKeyError,
} from "@/lib/anthropic";
import { getMissingRequiredMeasurements, profileSchema } from "@/lib/types";

export const runtime = "nodejs";

function json(body: unknown, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  // 1. Parse the body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  // Accept either { profile } or a bare profile object.
  const candidate =
    body && typeof body === "object" && "profile" in body
      ? (body as { profile: unknown }).profile
      : body;

  // 2. Validate the profile shape.
  const parsed = profileSchema.safeParse(candidate);
  if (!parsed.success) {
    return json(
      { error: "Invalid profile.", issues: parsed.error.issues },
      400,
    );
  }
  const profile = parsed.data;

  // 3. Enforce the minimum measurements before spending a model call.
  const missing = getMissingRequiredMeasurements(profile);
  if (missing.length > 0) {
    return json(
      {
        error: "Profile is missing required measurements.",
        missing,
      },
      422,
    );
  }

  // 4. Generate, validate, and surface errors with useful status codes.
  try {
    const recommendation = await generateRecommendations(profile);
    return json(recommendation, 200);
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return json({ error: "Recommendations are not configured." }, 500);
    }
    if (err instanceof InvalidModelOutputError) {
      return json(
        { error: "The model returned an unexpected format. Please retry." },
        502,
      );
    }
    if (err instanceof Anthropic.APIError) {
      return json(
        { error: `Anthropic API error: ${err.message}` },
        err.status ?? 502,
      );
    }
    return json({ error: "Unexpected server error." }, 500);
  }
}
