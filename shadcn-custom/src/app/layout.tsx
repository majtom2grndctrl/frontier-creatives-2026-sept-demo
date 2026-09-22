import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-flex",
  axes: ["GRAD", "XOPQ", "XTRA", "YOPQ", "YTAS", "YTDE", "YTFI", "YTLC", "YTUC", "opsz", "slnt", "wdth"],
});

export const metadata: Metadata = {
  title: "shadcn-custom",
  description: "Frontier Creatives 2026 demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${robotoFlex.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
