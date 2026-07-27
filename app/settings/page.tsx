"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getMissingRequiredMeasurements,
  isReadyForRecommendations,
  useProfile,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { profile, status, isPersisted, downloadJson, reset } = useProfile();
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);

  const savedAt =
    isPersisted && profile.updatedAt
      ? new Date(profile.updatedAt).toLocaleString()
      : null;

  const filledMeasurements = Object.values(profile.measurements).filter(
    (v) => v != null,
  ).length;
  const stylePicks =
    profile.style.vibes.length +
    profile.style.silhouettes.length +
    profile.style.necklines.length +
    profile.style.colorPalette.length +
    profile.style.occasions.length +
    profile.style.avoid.length;

  function handleClear() {
    reset();
    setConfirming(false);
    setCleared(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-pretty">
          Your profile lives only in this browser. Edit it any time&nbsp;&mdash;
          bodies change, and that&apos;s expected&nbsp;&mdash; or clear it
          completely.
        </p>
      </header>

      <section
        aria-live="polite"
        className="border-border flex flex-col gap-2 rounded-xl border p-4"
      >
        <h2 className="text-sm font-medium">Your profile</h2>
        {status === "loading" ? (
          <p className="text-muted-foreground text-sm">Loading&hellip;</p>
        ) : cleared ? (
          <p className="text-muted-foreground text-sm">
            Profile cleared. Start fresh from onboarding whenever you like.
          </p>
        ) : isPersisted ? (
          <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
            <li>Saved: {savedAt}</li>
            <li>{filledMeasurements} of 11 measurements filled</li>
            <li>{stylePicks} style preferences selected</li>
            <li>
              Recommendations:{" "}
              {isReadyForRecommendations(profile)
                ? "ready"
                : `missing ${getMissingRequiredMeasurements(profile).join(", ")}`}
            </li>
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No profile saved yet.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Edit</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/onboarding/measurements"
            className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
          >
            Edit measurements
          </Link>
          <Link
            href="/onboarding/style"
            className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
          >
            Edit style
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Your data</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4"
            disabled={!isPersisted && filledMeasurements === 0 && stylePicks === 0}
            onClick={() => downloadJson()}
          >
            Export as JSON
          </Button>
          <span className="text-muted-foreground text-sm">
            A portable copy you own (also the bridge to the future extension).
          </span>
        </div>
      </section>

      <section className="border-destructive/30 flex flex-col gap-3 rounded-xl border p-4">
        <h2 className="text-sm font-medium">Clear profile</h2>
        <p className="text-muted-foreground text-sm text-pretty">
          Permanently removes your profile from this browser. This cannot be
          undone.
        </p>
        {confirming ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Clear your profile?</span>
            <Button
              type="button"
              variant="destructive"
              className="h-10 px-4"
              onClick={handleClear}
            >
              Yes, clear it
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-4"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              variant="destructive"
              className="h-10 px-4"
              disabled={!isPersisted}
              onClick={() => {
                setCleared(false);
                setConfirming(true);
              }}
            >
              Clear profile
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
