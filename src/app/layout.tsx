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

const title =
  "Спецпроект ВТБ Мои Инвестиции х Frank Media: «Сервис \"Интеллект\"»";
const description =
  "«Интеллект» от ВТБ Мои Инвестиции: четыре стратегии инвестиций. Разные подходы к рынку";

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
