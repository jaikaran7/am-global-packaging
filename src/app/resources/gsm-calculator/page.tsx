import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import GsmCalculatorClient from "./GsmCalculatorClient";

export const metadata: Metadata = {
  title: "Corrugated GSM Calculator | AM Global Packaging",
  description:
    "Estimate paper weight and board strength for corrugated packaging. Calculate GSM-based board weight and recommended ply type.",
};

export default function GsmCalculatorPage() {
  return (
    <>
      <Navbar />
      <main>
        <GsmCalculatorClient />
      </main>
      <Footer />
    </>
  );
}
