import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";

const inter = Inter({
  variable: "--font-fallback",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "«Интеллект» от ВТБ Мои Инвестиции",
  description:
    "Стратегия инвестиций, которая подходит именно вам. Четыре стратегии. Разные подходы к рынку.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
