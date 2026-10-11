import type { Metadata } from "next";
import { Nunito_Sans, Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";

const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: { default: "Seminovos", template: "%s" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("font-sans antialiased", nunito.variable, poppins.variable)}>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
