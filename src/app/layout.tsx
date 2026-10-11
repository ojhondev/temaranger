import type { Metadata } from "next";
import { Archivo, Geist } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: { default: "SoftMotors", template: "%s" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("font-sans antialiased", geist.variable, archivo.variable)}>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
