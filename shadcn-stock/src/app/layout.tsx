import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/dashboard/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Prototypes — shadcn-stock",
  description: "Prototypes built against the stock shadcn/ui theme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* One provider for the whole app — §10.4 puts a tooltip on every
              icon-only button, and Radix requires a Provider ancestor. */}
          <TooltipProvider delayDuration={200}>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
