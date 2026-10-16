import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.scss";

const vtbGroup = localFont({
  src: "./fonts/VTBGroup-Book.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Roboto", "Arial", "sans-serif"],
});

const title = "«Интеллект» от ВТБ Мои Инвестиции";
const description =
  "Стратегия инвестиций, которая подходит именно вам. Четыре стратегии. Разные подходы к рынку.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vtb-intellect-landing.vercel.app"),
  title,
  description,
  openGraph: { title, description, type: "website", locale: "ru_RU" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body className={vtbGroup.className}>{children}</body>
    </html>
  );
}
