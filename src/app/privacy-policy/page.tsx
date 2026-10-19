import type { Metadata } from "next";
import Legal from "@/components/Legal/Legal";
import { PRIVACY_POLICY } from "@/data/legal";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  alternates: { canonical: "/privacy-policy" },
};

export default function Page() {
  return <Legal document={PRIVACY_POLICY} />;
}
