import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  fallback: ["Roboto", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "«Интеллект» от ВТБ Мои Инвестиции",
  description:
    "Стратегия инвестиций, которая подходит именно вам. Четыре стратегии. Разные подходы к рынку.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
