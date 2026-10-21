import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import CookieBanner from "@/components/CookieBanner/CookieBanner";
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

const METRIKA_ID = 113670974;

const VK_ID = "3807144";

const vkPixelInit = `
var _tmr = window._tmr || (window._tmr = []);
_tmr.push({id: "${VK_ID}", type: "pageView", start: (new Date()).getTime()});
(function (d, w, id) {
  if (d.getElementById(id)) return;
  var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;
  ts.src = "https://top-fwz1.mail.ru/js/code.js";
  var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};
  if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
})(document, window, "tmr-code");
`;

const metrikaInit = `
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}', 'ym');
ym(${METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
`;

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
      <body className={vtbGroup.className}>
        {children}
        <CookieBanner />
        <Script id="yandex-metrika" strategy="afterInteractive">
          {metrikaInit}
        </Script>
        <Script id="vk-pixel" strategy="afterInteractive">
          {vkPixelInit}
        </Script>
        <noscript>
          <div>
            <img
              src={`https://top-fwz1.mail.ru/counter?id=${VK_ID};js=na`}
              style={{ position: "absolute", left: "-9999px" }}
              alt="Top.Mail.Ru"
            />
          </div>
        </noscript>
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
