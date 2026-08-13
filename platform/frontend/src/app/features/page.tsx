import type { Metadata } from "next";
import Features from "@/components/marketing/Features";

export const metadata: Metadata = {
  title: "Features — Obsidias",
  description: "Everything Obsidias does for a real estate agency, from lead capture to booked viewing.",
};

export default function FeaturesPage() {
  return <Features />;
}
