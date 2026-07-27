import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { ProfileProvider } from "@/lib/profile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fit First",
    template: "%s · Fit First",
  },
  description:
    "Fit reviews and wardrobe-fit guidance based on your body and your style. Informative, not a virtual try-on.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ProfileProvider>
          <a
            href="#main-content"
            className="bg-primary text-primary-foreground focus-visible:ring-ring sr-only rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus-visible:ring-2 focus-visible:outline-none"
          >
            Skip to content
          </a>

          <header className="border-border/60 border-b">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <Link
                href="/"
                className="text-primary rounded-sm text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Fit First
              </Link>
              <nav aria-label="Primary" className="flex items-center gap-1">
                <Link
                  href="/recommendations"
                  className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  Guidance
                </Link>
                <Link
                  href="/settings"
                  className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  Settings
                </Link>
              </nav>
            </div>
          </header>

          <main
            id="main-content"
            className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
          >
            {children}
          </main>

          <footer className="border-border/60 border-t">
            <div className="text-muted-foreground mx-auto w-full max-w-3xl px-4 py-6 text-sm text-pretty sm:px-6">
              Fit-and-style guidance based on your body and your style.
              Informative, not a virtual try-on. Your profile stays on your
              device.
            </div>
          </footer>
        </ProfileProvider>
      </body>
    </html>
  );
}
