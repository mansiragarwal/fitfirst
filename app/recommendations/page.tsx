"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/lib/profile";
import { isReadyForRecommendations } from "@/lib/types";
import type { Recommendation } from "@/lib/recommendations";
import { cn } from "@/lib/utils";

type FetchState =
  | { status: "loading" }
  | { status: "incomplete"; missing: string[] }
  | { status: "error"; message: string }
  | { status: "success"; data: Recommendation };

const MEASUREMENT_LABELS: Record<string, string> = {
  bust: "bust",
  waist: "waist",
  hips: "hips",
  sizeRange: "size range",
};

export default function RecommendationsPage() {
  const { profile, status: profileStatus } = useProfile();
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const started = useRef(false);

  const run = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setState({ status: "success", data: body as Recommendation });
      } else if (res.status === 422) {
        setState({ status: "incomplete", missing: body.missing ?? [] });
      } else {
        setState({
          status: "error",
          message: body.error ?? "Something went wrong generating guidance.",
        });
      }
    } catch {
      setState({
        status: "error",
        message: "Could not reach the server. Check your connection and retry.",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (profileStatus === "loading" || started.current) return;
    started.current = true;
    if (!isReadyForRecommendations(profile)) {
      setState({
        status: "incomplete",
        missing: ["bust", "waist", "hips", "sizeRange"].filter(
          (k) => profile.measurements[k as keyof typeof profile.measurements] == null,
        ),
      });
      return;
    }
    void run();
  }, [profileStatus, profile, run]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your fit-and-style guidance
        </h1>
        <p className="text-muted-foreground text-pretty">
          Generated from your saved profile. Informative, not a virtual
          try-on.
        </p>
      </header>

      <div aria-live="polite" className="flex flex-col gap-6">
        {state.status === "loading" && <LoadingState />}
        {state.status === "incomplete" && (
          <IncompleteState missing={state.missing} />
        )}
        {state.status === "error" && (
          <ErrorState message={state.message} onRetry={run} />
        )}
        {state.status === "success" && (
          <Results data={state.data} onRegenerate={run} />
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-8">
        <span
          className="border-muted-foreground/40 border-t-primary size-5 animate-spin rounded-full border-2"
          aria-hidden
        />
        <p className="text-muted-foreground text-sm">
          Generating your guidance&hellip; this takes a few seconds.
        </p>
      </CardContent>
    </Card>
  );
}

function IncompleteState({ missing }: { missing: string[] }) {
  const labels = missing.map((m) => MEASUREMENT_LABELS[m] ?? m);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete your measurements first</CardTitle>
        <CardDescription>
          We need {labels.length > 0 ? labels.join(", ") : "a few measurements"}{" "}
          before we can generate guidance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href="/onboarding/measurements"
          className={cn(buttonVariants({ variant: "default" }), "h-10 px-4")}
        >
          Add measurements
        </Link>
      </CardContent>
    </Card>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Couldn&apos;t generate guidance</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button type="button" className="h-10 px-4" onClick={onRetry}>
          Try again
        </Button>
        <Link
          href="/settings"
          className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
        >
          Review profile
        </Link>
      </CardContent>
    </Card>
  );
}

function Results({
  data,
  onRegenerate,
}: {
  data: Recommendation;
  onRegenerate: () => void;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Silhouettes to prioritize</CardTitle>
        </CardHeader>
        <CardContent>
          {data.silhouettes_to_prioritize.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {data.silhouettes_to_prioritize.map((s, i) => (
                <li key={`${s.name}-${i}`} className="flex flex-col gap-1">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground text-sm text-pretty">
                    {s.why}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyLine />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sizing strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-pretty">{data.sizing_strategy}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fit red flags</CardTitle>
          <CardDescription>Watch for these given your body.</CardDescription>
        </CardHeader>
        <CardContent>
          <BulletList items={data.fit_red_flags} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Garment measurements to check</CardTitle>
          <CardDescription>
            Look these up on the product page before buying.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.garment_measurements_to_check.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {data.garment_measurements_to_check.map((m, i) => (
                <li
                  key={`${m}-${i}`}
                  className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                >
                  {m}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyLine />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Style directions</CardTitle>
        </CardHeader>
        <CardContent>
          <BulletList items={data.style_directions} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          onClick={onRegenerate}
        >
          Regenerate
        </Button>
        <Link
          href="/settings"
          className={cn(buttonVariants({ variant: "ghost" }), "h-10 px-4")}
        >
          Edit profile
        </Link>
      </div>
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <EmptyLine />;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex gap-2 text-sm text-pretty">
          <span aria-hidden className="text-muted-foreground">
            &bull;
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function EmptyLine() {
  return (
    <p className="text-muted-foreground text-sm">
      Nothing specific here for your profile.
    </p>
  );
}
