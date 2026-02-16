"use client";

import { Package, ChevronRight } from "lucide-react";

const footerLinks = [
  {
    title: "Products",
    links: [
      { label: "Corrugated Boxes", href: "#products" },
      { label: "Corrugated Sheets", href: "#products" },
      { label: "Custom Packaging", href: "#products" },
      { label: "Die-Cut Solutions", href: "#products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Sustainability", href: "#sustainability" },
      { label: "Quality & Certifications", href: "#why-us" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Ply Guide", href: "#" },
      { label: "GSM Calculator", href: "#" },
      { label: "Box Styles", href: "#" },
      { label: "FAQs", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-charcoal overflow-hidden">
      {/* Top decorative line */}
      <div className="h-1 bg-gradient-to-r from-forest via-kraft to-forest" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 pt-20 pb-10">
        <div className="grid lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-3 group mb-6">
              <div className="w-10 h-10 bg-forest rounded-lg flex items-center justify-center overflow-hidden group-hover:bg-forest-light transition-colors duration-300">
                <Package className="w-5 h-5 text-kraft-light" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-offwhite leading-none">
                  AM GLOBAL
                </span>
                <span className="text-[10px] font-medium tracking-[0.2em] text-offwhite/40 uppercase leading-none mt-0.5">
                  Packaging Solutions
                </span>
              </div>
            </a>
            <p className="text-sm text-offwhite/40 leading-relaxed max-w-xs mb-8">
              India&apos;s trusted corrugated packaging manufacturer. Engineering
              strength, sustainability, and scale into every box.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-offwhite text-xs font-semibold rounded-full hover:bg-forest-light transition-all duration-300"
            >
              Request a Quote
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <div className="text-xs font-semibold tracking-[0.2em] text-offwhite/30 uppercase mb-5">
                {group.title}
              </div>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-offwhite/50 hover:text-kraft-light transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-offwhite/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-offwhite/30">
            &copy; {new Date().getFullYear()} AM Global Packaging Solutions. All
            rights reserved.
          </div>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="text-xs text-offwhite/30 hover:text-offwhite/60 transition-colors"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
