import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <section className="flex flex-col items-start gap-8 py-8 sm:py-16">
      <div className="flex flex-col gap-4">
        <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Fit First
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Fit reviews and wardrobe-fit guidance based on your body and your
          style.
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg text-pretty">
          Informative, not a virtual try-on. Tell us your measurements and what
          you like to wear, and get concrete, neutral guidance on what fits and
          flatters&nbsp;&mdash; made for mid-size and plus-size women.
        </p>
      </div>

      <Link
        href="/onboarding/measurements"
        className={cn(
          buttonVariants({ variant: "default" }),
          "h-11 px-6 text-base",
        )}
      >
        Start your fit profile
      </Link>

      <p className="text-muted-foreground text-sm">
        Your profile stays on your device. No account needed.
      </p>
    </section>
  );
}
