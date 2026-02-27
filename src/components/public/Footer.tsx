"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, Phone, Mail } from "lucide-react";

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
      { label: "Ply Guide", href: "/#ply-guide" },
      { label: "GSM Calculator", href: "/resources/gsm-calculator" },
      { label: "Box Styles", href: "/#products" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
];

export default function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <footer className="relative bg-charcoal overflow-hidden">
      {/* Top decorative line */}
      <div className="h-1 bg-gradient-to-r from-forest via-kraft to-forest" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20 py-10 md:pt-20 md:pb-10">
        {/* Mobile footer */}
        <div className="block md:hidden px-6 py-10 space-y-6">
          {/* Logo + tagline */}
          <div>
            <a href="#" className="flex items-center gap-3 group mb-3">
              <div className="relative w-10 h-10 bg-forest rounded-lg flex items-center justify-center overflow-hidden group-hover:bg-forest-light transition-colors duration-300">
                <Image
                  src="/am-global-logo.png"
                  alt="AM Global Packaging logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
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
            <p className="text-sm text-offwhite/40 leading-relaxed">
              Australian-focused packaging sourcing backed by trusted partner
              factories across India and Asia.
            </p>
            <div className="mt-8">
              <div className="text-[11px] font-semibold tracking-[0.22em] text-offwhite/30 uppercase mb-3">
                Contact
              </div>
              <ul className="space-y-2.5 text-sm text-offwhite/55">
                <li>
                  <a
                    href="https://www.google.com/maps?q=-33.792362213134766,150.9712677001953&z=17&hl=en"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 hover:text-kraft-light transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-offwhite/30" />
                    148 Bulli Road, Constitution Hill
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+61434396360"
                    className="flex items-center gap-2.5 hover:text-kraft-light transition-colors"
                  >
                    <Phone className="w-4 h-4 text-offwhite/30" />
                    +61 0434 396 360
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@amglobalpackagingsolutions.com"
                    className="flex items-center gap-2.5 hover:text-kraft-light transition-colors"
                  >
                    <Mail className="w-4 h-4 text-offwhite/30" />
                    info@amglobalpackagingsolutions.com
                  </a>
                </li>
              </ul>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-6 bg-forest text-offwhite text-xs font-semibold rounded-full hover:bg-forest-light transition-all duration-300"
            >
              Request a Quote
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Accordion sections */}
          {footerLinks.map((group) => {
            const isOpen = Boolean(openSections[group.title]);
            return (
              <div key={group.title} className="border-t border-offwhite/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => toggleSection(group.title)}
                  className="flex justify-between items-center w-full text-left font-medium text-offwhite"
                >
                  <span>{group.title}</span>
                  <span>{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <ul className="mt-3 space-y-2 text-sm text-neutral-500">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="hover:text-kraft-light transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

        </div>

        <div className="hidden md:grid lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-3 group mb-6">
              <div className="relative w-10 h-10 bg-forest rounded-lg flex items-center justify-center overflow-hidden group-hover:bg-forest-light transition-colors duration-300">
                <Image
                  src="/am-global-logo.png"
                  alt="AM Global Packaging logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
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

            <div className="mt-8 mb-6">
              <div className="text-[11px] font-semibold tracking-[0.22em] text-offwhite/30 uppercase mb-3">
                Contact
              </div>
              <ul className="space-y-2.5 text-sm text-offwhite/55">
                <li>
                  <a
                    href="https://www.google.com/maps?q=-33.792362213134766,150.9712677001953&z=17&hl=en"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 hover:text-kraft-light transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-offwhite/30" />
                    148 Bulli Road, Constitution Hill
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+61434396360"
                    className="flex items-center gap-2.5 hover:text-kraft-light transition-colors"
                  >
                    <Phone className="w-4 h-4 text-offwhite/30" />
                    +61 0434 396 360
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@amglobalpackagingsolutions.com"
                    className="flex items-center gap-2.5 hover:text-kraft-light transition-colors"
                  >
                    <Mail className="w-4 h-4 text-offwhite/30" />
                    info@amglobalpackagingsolutions.com
                  </a>
                </li>
              </ul>
            </div>
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
                    <Link
                      href={link.href}
                      className="text-sm text-offwhite/50 hover:text-kraft-light transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
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
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Service", href: "/terms-of-service" },
              { label: "Cookie Policy", href: "/cookie-policy" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs text-offwhite/30 hover:text-offwhite/60 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
