import type { Metadata } from "next";
import Pricing from "@/components/marketing/Pricing";

export const metadata: Metadata = {
  title: "Pricing — Obsidias",
  description: "A monthly subscription sized to lead volume, not headcount. No setup fee, no annual contract.",
};

export default function PricingPage() {
  return <Pricing />;
}
