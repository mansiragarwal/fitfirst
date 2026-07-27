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
        <header className="border-border/60 border-b">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-primary rounded-sm text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Fit First
            </Link>
            <Link
              href="/settings"
              className="text-muted-foreground hover:text-foreground rounded-sm text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Settings
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-border/60 border-t">
          <div className="text-muted-foreground mx-auto w-full max-w-3xl px-4 py-6 text-sm">
            Fit-and-style guidance based on your body and your style.
            Informative, not a virtual try-on.
          </div>
        </footer>
        </ProfileProvider>
      </body>
    </html>
  );
}
