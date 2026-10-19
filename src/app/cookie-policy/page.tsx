import type { Metadata } from "next";
import Legal from "@/components/Legal/Legal";
import { COOKIE_POLICY } from "@/data/legal";

export const metadata: Metadata = {
  title: "Согласие на использование куки",
  alternates: { canonical: "/cookie-policy" },
};

export default function Page() {
  return <Legal document={COOKIE_POLICY} />;
}
