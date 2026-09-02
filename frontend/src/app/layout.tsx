import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Display serif for headings, big numbers and italic accent words. The optical
// size axis keeps small text readable while large headings get the display cut.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "TheConnection — Citas curadas para universitarios",
  description:
    "Una cita real por semana, curada por IA, solo para estudiantes de universidades privadas en Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="bg-navy-deep text-cream flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
