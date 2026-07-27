"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/lib/profile";
import type {
  ColorPalette,
  Neckline,
  Occasion,
  Profile,
  Silhouette,
  StylePreferences,
  StyleVibe,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const VIBE_TILES: { value: StyleVibe; label: string; blurb: string }[] = [
  { value: "classic", label: "Classic", blurb: "Timeless, tailored, refined" },
  { value: "minimal", label: "Minimal", blurb: "Clean lines, few details" },
  { value: "romantic", label: "Romantic", blurb: "Soft, floaty, feminine" },
  { value: "edgy", label: "Edgy", blurb: "Structured, bold, high-contrast" },
  { value: "bohemian", label: "Bohemian", blurb: "Relaxed, earthy, layered" },
  { value: "sporty", label: "Sporty", blurb: "Active, comfortable, casual" },
  { value: "polished", label: "Polished", blurb: "Put-together, sharp, sleek" },
  { value: "cozy", label: "Cozy", blurb: "Soft, easy, comfort-first" },
];

const SILHOUETTES: { value: Silhouette; label: string }[] = [
  { value: "fit-and-flare", label: "Fit & flare" },
  { value: "a-line", label: "A-line" },
  { value: "wrap", label: "Wrap" },
  { value: "shift", label: "Shift" },
  { value: "bodycon", label: "Bodycon" },
  { value: "empire", label: "Empire" },
  { value: "straight", label: "Straight" },
  { value: "wide-leg", label: "Wide-leg" },
];

const NECKLINES: { value: Neckline; label: string }[] = [
  { value: "v-neck", label: "V-neck" },
  { value: "scoop", label: "Scoop" },
  { value: "crew", label: "Crew" },
  { value: "boat", label: "Boat" },
  { value: "square", label: "Square" },
  { value: "sweetheart", label: "Sweetheart" },
  { value: "cowl", label: "Cowl" },
  { value: "halter", label: "Halter" },
];

const PALETTES: { value: ColorPalette; label: string }[] = [
  { value: "neutrals", label: "Neutrals" },
  { value: "earth-tones", label: "Earth tones" },
  { value: "jewel-tones", label: "Jewel tones" },
  { value: "pastels", label: "Pastels" },
  { value: "brights", label: "Brights" },
  { value: "monochrome", label: "Monochrome" },
];

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: "work", label: "Work" },
  { value: "casual", label: "Casual" },
  { value: "date-night", label: "Date night" },
  { value: "formal", label: "Formal" },
  { value: "athleisure", label: "Athleisure" },
  { value: "travel", label: "Travel" },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function StylePage() {
  const router = useRouter();
  const { profile, status, save } = useProfile();

  const [style, setStyle] = useState<StylePreferences>(profile.style);
  const [avoidDraft, setAvoidDraft] = useState("");
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || status === "loading") return;
    setStyle(profile.style);
    seeded.current = true;
  }, [status, profile]);

  function addAvoid() {
    const tag = avoidDraft.trim();
    if (tag === "" || style.avoid.includes(tag)) {
      setAvoidDraft("");
      return;
    }
    setStyle((s) => ({ ...s, avoid: [...s.avoid, tag] }));
    setAvoidDraft("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Profile = { ...profile, style };
    save(next);
    router.push("/recommendations");
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Your style</h1>
        <p className="text-muted-foreground text-pretty">
          Pick anything that resonates. All fields are optional&nbsp;&mdash; the
          more you share, the more specific your guidance.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Overall vibe</h2>
          <div
            role="group"
            aria-label="Overall vibe"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {VIBE_TILES.map((tile) => {
              const selected = style.vibes.includes(tile.value);
              return (
                <button
                  key={tile.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setStyle((s) => ({
                      ...s,
                      vibes: toggle(s.vibes, tile.value),
                    }))
                  }
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    selected
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-muted/60",
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="font-medium">{tile.label}</span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full text-[10px]",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "border-border border",
                      )}
                    >
                      {selected ? "✓" : ""}
                    </span>
                  </span>
                  <span className="text-muted-foreground text-xs text-pretty">
                    {tile.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <PillGroup
          label="Preferred silhouettes"
          options={SILHOUETTES}
          selected={style.silhouettes}
          onToggle={(v) =>
            setStyle((s) => ({ ...s, silhouettes: toggle(s.silhouettes, v) }))
          }
        />
        <PillGroup
          label="Necklines"
          options={NECKLINES}
          selected={style.necklines}
          onToggle={(v) =>
            setStyle((s) => ({ ...s, necklines: toggle(s.necklines, v) }))
          }
        />
        <PillGroup
          label="Color palette"
          options={PALETTES}
          selected={style.colorPalette}
          onToggle={(v) =>
            setStyle((s) => ({ ...s, colorPalette: toggle(s.colorPalette, v) }))
          }
        />
        <PillGroup
          label="Occasions you dress for"
          options={OCCASIONS}
          selected={style.occasions}
          onToggle={(v) =>
            setStyle((s) => ({ ...s, occasions: toggle(s.occasions, v) }))
          }
        />

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="avoid">Materials or cuts to avoid</Label>
            <p id="avoid-help" className="text-muted-foreground text-sm">
              Anything you never want recommended. Type one and press Enter or
              Add.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              id="avoid"
              value={avoidDraft}
              aria-describedby="avoid-help"
              placeholder="e.g. bodycon, sheer, scratchy wool"
              onChange={(e) => setAvoidDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAvoid();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addAvoid}>
              Add
            </Button>
          </div>
          {style.avoid.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {style.avoid.map((tag) => (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() =>
                      setStyle((s) => ({
                        ...s,
                        avoid: s.avoid.filter((t) => t !== tag),
                      }))
                    }
                    className="bg-secondary text-secondary-foreground hover:bg-muted flex items-center gap-1.5 rounded-full px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={`Remove ${tag}`}
                  >
                    {tag}
                    <span aria-hidden className="text-muted-foreground">
                      ×
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5"
            onClick={() => router.push("/onboarding/measurements")}
          >
            Back
          </Button>
          <Button type="submit" className="h-10 px-5">
            Save profile
          </Button>
        </div>
      </form>
    </div>
  );
}

function PillGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{label}</h2>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(opt.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted/60",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
