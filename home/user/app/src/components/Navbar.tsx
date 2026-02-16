"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Package, ChevronRight } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Industries", href: "#industries" },
  { label: "Sustainability", href: "#sustainability" },
  { label: "Why Us", href: "#why-us" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-offwhite/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(184,134,11,0.1)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 bg-forest rounded-lg flex items-center justify-center overflow-hidden group-hover:bg-forest-light transition-colors duration-300">
                <Package className="w-5 h-5 text-kraft-light" />
                <div className="absolute inset-0 bg-gradient-to-tr from-kraft/20 to-transparent" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-forest leading-none">
                  AM GLOBAL
                </span>
                <span className="text-[10px] font-medium tracking-[0.2em] text-warm-gray uppercase leading-none mt-0.5">
                  Packaging
                </span>
              </div>
            </a>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-[13px] font-medium text-charcoal/70 hover:text-forest transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-4 right-4 h-px bg-kraft scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-forest text-offwhite text-[13px] font-semibold rounded-full hover:bg-forest-light transition-all duration-300 shadow-lg shadow-forest/20 hover:shadow-forest/30"
              >
                Request a Quote
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-charcoal"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-offwhite pt-24 px-6"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="py-4 px-4 text-lg font-medium text-charcoal border-b border-kraft/10 hover:text-forest hover:bg-kraft-pale/50 rounded-lg transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 bg-forest text-offwhite font-semibold rounded-full"
              >
                Request a Quote
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
