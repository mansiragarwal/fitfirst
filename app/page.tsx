import Link from "next/link";
import { Ruler, Shirt, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Ruler,
    title: "Share your measurements",
    body: "Bust, waist, hips, and the sizes you usually shop. Add more for sharper guidance.",
  },
  {
    icon: Shirt,
    title: "Tell us your style",
    body: "Pick the vibes, silhouettes, and necklines you like, and anything you'd rather skip.",
  },
  {
    icon: Sparkles,
    title: "Get concrete guidance",
    body: "Which shapes to prioritize, how to size, and what to check on a product page.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 py-4 sm:gap-20 sm:py-8">
      <section className="flex flex-col items-start gap-6">
        <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Fit First
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          Fit reviews and wardrobe-fit guidance based on your body and your
          style.
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg text-pretty">
          Informative, not a virtual try-on. Tell us your measurements and what
          you like to wear, and get concrete, neutral guidance on what fits and
          works for you.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/onboarding/measurements"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-11 px-6 text-base",
            )}
          >
            Start your fit profile
          </Link>
          <Link
            href="/recommendations"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-11 px-4 text-base",
            )}
          >
            See my guidance
          </Link>
        </div>
        <p className="text-muted-foreground text-sm">
          Your profile stays on your device. No account needed.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="border-border bg-card flex flex-col gap-3 rounded-xl border p-5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="bg-accent text-accent-foreground flex size-9 items-center justify-center rounded-full"
                  aria-hidden
                >
                  <step.icon className="size-5" />
                </span>
                <span className="text-muted-foreground text-sm font-medium">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-muted-foreground text-sm text-pretty">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-border bg-muted/40 flex flex-col gap-3 rounded-2xl border p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Who it&apos;s for</h2>
        <p className="text-muted-foreground max-w-2xl text-pretty">
          Built for mid-size (US 10&ndash;14) and plus-size (US 16 and above)
          women. The guidance is about fit mechanics&nbsp;&mdash; proportion,
          ease, and where seams land&nbsp;&mdash; never about changing your
          body.
        </p>
        <div className="pt-2">
          <Link
            href="/onboarding/measurements"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-11 px-6 text-base",
            )}
          >
            Build my profile
          </Link>
        </div>
      </section>
    </div>
  );
}
