import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

// wght comes with the variable font; opsz and wdth are what display and UI
// weights are built on (wdth 75 for display, 100 for UI).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

// Only the words people say are set in Newsreader, always italic.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic", "normal"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Mourly — Una cita real por semana, solo con carné",
  description:
    "Una cita real por semana, organizada por nosotros en un lugar aliado. Solo con carné de EAFIT, UPB, CES o EIA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="bg-page text-ink flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
