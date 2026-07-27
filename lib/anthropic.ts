import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseRecommendation,
  type Recommendation,
} from "./recommendations";
import type { Profile } from "./types";

// Current balanced model (2026). Override with ANTHROPIC_MODEL, e.g.
// claude-opus-5 (strongest) or claude-haiku-4-5-20251001 (cheapest).
// Confirm IDs: https://docs.claude.com/en/docs/about-claude/models/overview
const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1500;

/** Thrown when the server is missing its Anthropic key. Maps to a 500. */
export class MissingApiKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set on the server.");
    this.name = "MissingApiKeyError";
  }
}

/** Thrown when the model output fails schema validation after a retry. */
export class InvalidModelOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidModelOutputError";
  }
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();
  return new Anthropic({ apiKey });
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

/**
 * Calls the model and validates the JSON. On schema failure, retries once with
 * a corrective instruction that includes the previous (bad) output and error.
 */
export async function generateRecommendations(
  profile: Profile,
): Promise<Recommendation> {
  const client = getClient();
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const system = buildSystemPrompt();

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildUserPrompt(profile) },
  ];

  let lastError = "Unknown error.";

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system,
      messages,
    });

    const text = extractText(response);
    const parsed = parseRecommendation(text);
    if (parsed.ok) return parsed.data;

    lastError = parsed.error;

    // Feed the bad output back and ask for a strict correction, then retry.
    messages.push(
      { role: "assistant", content: text },
      {
        role: "user",
        content: `That was not valid. ${parsed.error} Reply with ONLY the JSON object in the required schema, no code fences, no prose.`,
      },
    );
  }

  throw new InvalidModelOutputError(lastError);
}
