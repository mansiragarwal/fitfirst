"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/lib/profile";
import type { Measurements, Profile, ShoeWidth, UnitSystem } from "@/lib/types";
import { cn } from "@/lib/utils";

type NumericField =
  | "bust"
  | "waist"
  | "hips"
  | "underbust"
  | "torsoLength"
  | "inseam"
  | "height"
  | "shoeSize";

const NUMERIC_FIELDS: {
  key: NumericField;
  label: string;
  help: string;
  required?: boolean;
}[] = [
  {
    key: "bust",
    label: "Bust",
    help: "The fullest point of your chest. Drives tops, dresses, and outerwear sizing.",
    required: true,
  },
  {
    key: "waist",
    label: "Waist",
    help: "Narrowest part of your torso. Anchors fitted waists and high-rise bottoms.",
    required: true,
  },
  {
    key: "hips",
    label: "Hips",
    help: "Fullest part of your hips and seat. We size full garments to hips first.",
    required: true,
  },
  {
    key: "underbust",
    label: "Underbust",
    help: "Snug measure just under the bust. Helps with bra-friendly and empire styles.",
  },
  {
    key: "torsoLength",
    label: "Torso length",
    help: "Shoulder to natural waist. Flags where waist seams and empire lines will land.",
  },
  {
    key: "inseam",
    label: "Inseam",
    help: "Crotch to ankle. Sets whether trousers need petite, regular, or tall lengths.",
  },
  {
    key: "height",
    label: "Height",
    help: "Used to judge overall proportion and hem lengths.",
  },
  {
    key: "shoeSize",
    label: "Shoe size (US)",
    help: "Used for footwear fit guidance.",
  },
];

const SHOE_WIDTHS: { value: ShoeWidth; label: string }[] = [
  { value: "narrow", label: "Narrow" },
  { value: "medium", label: "Medium" },
  { value: "wide", label: "Wide" },
  { value: "extra-wide", label: "Extra wide" },
];

type FormState = Record<NumericField, string> & {
  unitSystem: UnitSystem;
  braSize: string;
  shoeWidth: "" | ShoeWidth;
  sizeMin: string;
  sizeMax: string;
};

type FieldErrors = Partial<Record<keyof FormState | "sizeRange", string>>;

function numToStr(n: number | null): string {
  return n == null ? "" : String(n);
}

function profileToForm(profile: Profile): FormState {
  const m = profile.measurements;
  return {
    unitSystem: profile.unitSystem,
    bust: numToStr(m.bust),
    waist: numToStr(m.waist),
    hips: numToStr(m.hips),
    underbust: numToStr(m.underbust),
    torsoLength: numToStr(m.torsoLength),
    inseam: numToStr(m.inseam),
    height: numToStr(m.height),
    shoeSize: numToStr(m.shoeSize),
    braSize: m.braSize ?? "",
    shoeWidth: m.shoeWidth ?? "",
    sizeMin: m.sizeRange ? String(m.sizeRange.min) : "",
    sizeMax: m.sizeRange ? String(m.sizeRange.max) : "",
  };
}

/** Parses a positive number from an input string. */
function parsePositive(raw: string): { value: number | null; error?: string } {
  const t = raw.trim();
  if (t === "") return { value: null };
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) {
    return { value: null, error: "Enter a positive number." };
  }
  return { value: n };
}

const REQUIRED_MSG = "Needed to generate recommendations.";
const unitLabel = (u: UnitSystem) => (u === "imperial" ? "in" : "cm");

export default function MeasurementsPage() {
  const router = useRouter();
  const { profile, status, save } = useProfile();

  const [form, setForm] = useState<FormState>(() => profileToForm(profile));
  const [errors, setErrors] = useState<FieldErrors>({});
  const seeded = useRef(false);

  // Seed the form from the stored profile once it has loaded.
  useEffect(() => {
    if (seeded.current || status === "loading") return;
    setForm(profileToForm(profile));
    seeded.current = true;
  }, [status, profile]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: FieldErrors = {};

    const measurements: Measurements = {
      bust: null,
      underbust: null,
      waist: null,
      hips: null,
      torsoLength: null,
      inseam: null,
      height: null,
      braSize: form.braSize.trim() === "" ? null : form.braSize.trim(),
      shoeSize: null,
      shoeWidth: form.shoeWidth === "" ? null : form.shoeWidth,
      sizeRange: null,
    };

    for (const { key, required } of NUMERIC_FIELDS) {
      const { value, error } = parsePositive(form[key]);
      if (error) nextErrors[key] = error;
      else if (required && value == null) nextErrors[key] = REQUIRED_MSG;
      measurements[key] = value;
    }

    // Size range: both bounds required, max >= min.
    const min = parsePositive(form.sizeMin);
    const max = parsePositive(form.sizeMax);
    if (form.sizeMin.trim() === "" || form.sizeMax.trim() === "") {
      nextErrors.sizeRange = REQUIRED_MSG;
    } else if (min.error || max.error) {
      nextErrors.sizeRange = "Enter positive size numbers.";
    } else if (min.value! > max.value!) {
      nextErrors.sizeRange = "Max size must be greater than or equal to min.";
    } else {
      measurements.sizeRange = {
        min: Math.round(min.value!),
        max: Math.round(max.value!),
      };
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const next: Profile = {
      ...profile,
      unitSystem: form.unitSystem,
      measurements,
    };
    save(next);
    router.push("/onboarding/style");
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your measurements
        </h1>
        <p className="text-muted-foreground text-pretty">
          Only bust, waist, hips, and your size range are required. Everything
          else sharpens the guidance. You can update these any time&nbsp;&mdash;
          bodies change, and that&apos;s expected.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Units</legend>
          <div
            role="radiogroup"
            aria-label="Unit system"
            className="flex gap-2"
          >
            {(["imperial", "metric"] as const).map((u) => (
              <Button
                key={u}
                type="button"
                variant={form.unitSystem === u ? "default" : "outline"}
                aria-pressed={form.unitSystem === u}
                onClick={() => setField("unitSystem", u)}
              >
                {u === "imperial" ? "Inches" : "Centimeters"}
              </Button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {NUMERIC_FIELDS.map(({ key, label, help, required }) => (
            <Field
              key={key}
              id={key}
              label={label}
              help={help}
              required={required}
              suffix={unitLabel(form.unitSystem)}
              error={errors[key]}
            >
              <Input
                id={key}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={form[key]}
                aria-invalid={errors[key] ? true : undefined}
                aria-describedby={`${key}-help`}
                onChange={(e) => setField(key, e.target.value)}
              />
            </Field>
          ))}

          <Field
            id="braSize"
            label="Bra size"
            help="e.g. 38DD. Guides support and neckline recommendations."
          >
            <Input
              id="braSize"
              type="text"
              value={form.braSize}
              aria-describedby="braSize-help"
              onChange={(e) => setField("braSize", e.target.value)}
            />
          </Field>

          <Field
            id="shoeWidth"
            label="Shoe width"
            help="Used for footwear fit guidance."
          >
            <select
              id="shoeWidth"
              value={form.shoeWidth}
              aria-describedby="shoeWidth-help"
              onChange={(e) =>
                setField("shoeWidth", e.target.value as "" | ShoeWidth)
              }
              className="border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 py-1 text-sm outline-none focus-visible:ring-3"
            >
              <option value="">Not specified</option>
              {SHOE_WIDTHS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">
            Typical size range{" "}
            <span className="text-destructive" aria-hidden>
              *
            </span>
          </legend>
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="sizeMin" className="text-muted-foreground text-xs">
                From
              </Label>
              <Input
                id="sizeMin"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                className="w-24"
                value={form.sizeMin}
                aria-invalid={errors.sizeRange ? true : undefined}
                aria-describedby="sizeRange-help"
                onChange={(e) => setField("sizeMin", e.target.value)}
              />
            </div>
            <span className="text-muted-foreground pb-2">to</span>
            <div className="flex flex-col gap-1">
              <Label htmlFor="sizeMax" className="text-muted-foreground text-xs">
                To
              </Label>
              <Input
                id="sizeMax"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                className="w-24"
                value={form.sizeMax}
                aria-invalid={errors.sizeRange ? true : undefined}
                aria-describedby="sizeRange-help"
                onChange={(e) => setField("sizeMax", e.target.value)}
              />
            </div>
          </div>
          <p
            id="sizeRange-help"
            className={cn(
              "text-sm",
              errors.sizeRange ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {errors.sizeRange ??
              "e.g. 10 to 14. The range you usually shop, so fit advice matches the sizes you buy."}
          </p>
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" className="h-10 px-5">
            Next
          </Button>
          <span className="text-muted-foreground text-sm">
            Saved to this device.
          </span>
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  help,
  required,
  suffix,
  error,
  children,
}: {
  id: string;
  label: string;
  help: string;
  required?: boolean;
  suffix?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        )}
        {suffix && (
          <span className="text-muted-foreground font-normal">({suffix})</span>
        )}
      </Label>
      <div className="relative">{children}</div>
      <p
        id={`${id}-help`}
        className={cn(
          "text-sm",
          error ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {error ?? help}
      </p>
    </div>
  );
}
