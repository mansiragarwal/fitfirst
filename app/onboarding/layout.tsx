"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PrivacyNote } from "@/components/privacy-note";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/onboarding/measurements", label: "Measurements" },
  { href: "/onboarding/style", label: "Style" },
] as const;

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => pathname.startsWith(s.href)),
  );

  return (
    <div className="flex flex-col gap-8">
      <PrivacyNote />

      <nav aria-label="Onboarding progress">
        <ol className="flex items-center gap-3">
          {STEPS.map((step, i) => {
            const isCurrent = i === currentIndex;
            const isDone = i < currentIndex;
            return (
              <li key={step.href} className="flex items-center gap-3">
                <Link
                  href={step.href}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border text-xs",
                      isCurrent
                        ? "border-primary-foreground/40"
                        : isDone
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border",
                    )}
                    aria-hidden
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  {step.label}
                </Link>
                {i < STEPS.length - 1 && (
                  <span className="bg-border h-px w-6" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {children}
    </div>
  );
}
