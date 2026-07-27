import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Reassures the user, up front, about local-only storage. Shown at the start
 * of onboarding and reusable anywhere the storage model needs explaining.
 */
export function PrivacyNote({
  className,
  showSettingsLink = true,
}: {
  className?: string;
  showSettingsLink?: boolean;
}) {
  return (
    <p
      className={cn(
        "bg-muted/60 text-muted-foreground rounded-lg px-4 py-3 text-sm text-pretty",
        className,
      )}
    >
      Your profile is stored locally in this browser, not on a server. You can{" "}
      {showSettingsLink ? (
        <Link
          href="/settings"
          className="text-foreground underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          edit or clear it
        </Link>
      ) : (
        "edit or clear it"
      )}{" "}
      any time.
    </p>
  );
}
