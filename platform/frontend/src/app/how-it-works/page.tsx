import type { Metadata } from "next";
import HowItWorks from "@/components/marketing/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works — Obsidias",
  description: "The exact sequence a lead goes through, from the first message to a booked viewing.",
};

export default function HowItWorksPage() {
  return <HowItWorks />;
}
