import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";

export const metadata: Metadata = {
  title: "Papers | AM Global",
  description:
    "Industrial paper solutions — material taxonomy, precision applications, and structural packaging.",
};

const papersStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.parallelogram-clip {
  clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%);
}
.torn-paper-edge {
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="40"><path d="M0,20 Q50,0 100,20 T200,20 T300,20 T400,20 T500,20 T600,20 T700,20 T800,20 T900,20 T1000,20 V40 H0 Z" fill="black"/></svg>');
  mask-size: cover;
}
.marquee {
  display: flex;
  overflow: hidden;
  user-select: none;
  gap: 4rem;
}
.marquee-content {
  flex-shrink: 0;
  display: flex;
  justify-content: space-around;
  gap: 4rem;
  min-width: 100%;
}
.skew-section {
  transform: skewY(-2deg);
}
.skew-inner {
  transform: skewY(2deg);
}
`;

export default function PapersPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: papersStyles }} />
      <Navbar />
      <div className="bg-[#f9f9f6] font-['Inter',sans-serif] text-[#1a1c1b] antialiased">
        {/* Hero Section */}
        <header className="relative bg-[#1b3a2d] text-white min-h-[921px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              alt="Minimalist, high-end shot of a premium paper sheet with perfect industrial lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8GPVtNttzyKQgr72xG8-BpK8oOX7BXt8iH8xcMTdALVTpMDO4rewrahOjO5DjZ-rvKVf9ZeSavqVFUstNXa8b58IfXrC03iMujNonZ7_qRTjb0c0Geygo7IX60dAnlQlbjKfirVMkEoyEiAKXEni9AqMBqBMoDro479mtBm3_zrtW5Fk6fXPiGE8a-LtT-ZYVk5GDn8rPcHK3HlNKY3D7TgZLwagKHUydZg96kEKufmtMQwsVmikDQAZ2PJ9RDppaTYZlTgr7w3Y"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1b3a2d] via-[#1b3a2d]/80 to-transparent" />
          </div>
          <div className="max-w-7xl mx-auto px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20 md:pt-24 pb-8 md:pb-16">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#ffd57a] text-[#795a06] text-[0.6875rem] font-bold uppercase tracking-widest mb-6">
                Industrial Solutions
              </span>
              <h1 className="text-6xl md:text-8xl font-black font-['Inter',sans-serif] tracking-tighter leading-none mb-8">
                INDUSTRIAL <br />{" "}
                <span className="text-[#785a06]">PRECISION.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#83a493] max-w-lg mb-10 leading-relaxed font-light">
                Engineered for Authority. The intersection of architectural
                structural integrity and bespoke tactile luxury.
              </p>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  className="bg-[#785a06] text-white px-10 py-5 rounded-full font-bold uppercase text-sm tracking-widest hover:translate-y-[-2px] transition-all duration-300 shadow-2xl"
                >
                  Explore Collection
                </button>
                <button
                  type="button"
                  className="flex items-center gap-3 text-white font-bold uppercase text-sm tracking-widest group"
                >
                  <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#042419] transition-all">
                    <span className="material-symbols-outlined">play_arrow</span>
                  </span>
                  Process Film
                </button>
              </div>
            </div>
            <div className="hidden lg:block relative h-[600px]">
              <div className="absolute top-0 right-0 w-64 h-80 bg-white rounded-lg parallelogram-clip overflow-hidden shadow-2xl z-20">
                <img
                  className="w-full h-full object-cover"
                  alt="Close up of black high quality cardstock with subtle texture"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Fyy--A-COqQ4fB-FR2BiG2iTlIcyuQa-kn8kSQKa-e5wATFWCqg0hlIdOX_z2TXcWF29G5PJb0HMYFZjdh1YveYHF02JdaL5zCuT1Cs_p5GraJEqHaYxP5Sf4i4xALWqTlWU1-OrDr5jgzVZv_ReVbgA5XrWBzhwuuZTHb_kI7gfaq1n1atlI3W6jICBpokryenSvmGXB6lOnRXwQAwuEpMB-MITbHR33ie7BHfcNXhZ0KyNwbuPG5dlB4XJbf5AZJIXNs1mkzY"
                />
              </div>
              <div className="absolute bottom-10 left-10 w-80 h-96 bg-[#785a06] rounded-lg parallelogram-clip overflow-hidden shadow-2xl z-10">
                <img
                  className="w-full h-full object-cover opacity-80"
                  alt="A stack of luxurious heavy weight cream colored paper sheets"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Fyy--A-COqQ4fB-FR2BiG2iTlIcyuQa-kn8kSQKa-e5wATFWCqg0hlIdOX_z2TXcWF29G5PJb0HMYFZjdh1YveYHF02JdaL5zCuT1Cs_p5GraJEqHaYxP5Sf4i4xALWqTlWU1-OrDr5jgzVZv_ReVbgA5XrWBzhwuuZTHb_kI7gfaq1n1atlI3W6jICBpokryenSvmGXB6lOnRXwQAwuEpMB-MITbHR33ie7BHfcNXhZ0KyNwbuPG5dlB4XJbf5AZJIXNs1mkzY"
                />
              </div>
            </div>
          </div>
        </header>
        {/* Trust Marquee */}
        <div className="bg-[#eeeeeb] py-10 border-y border-[#c1c8c2]/10">
          <div className="marquee">
            <div className="marquee-content font-black text-3xl text-[#c1c8c2]/40 tracking-tighter uppercase italic">
              <span>ESTEE LAUDER</span>
              <span>CARTIER</span>
              <span>MERCEDES BENZ</span>
              <span>LEICA CAMERA</span>
              <span>SAMSUNG GLOBAL</span>
              <span>DIOR HOMME</span>
              <span>ESTEE LAUDER</span>
              <span>CARTIER</span>
            </div>
          </div>
        </div>
        {/* Parallelogram Grid Section */}
        <section className="py-32 bg-[#042419] text-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-black tracking-tighter uppercase mb-6 leading-none">
                  The Material <br />
                  Taxonomy.
                </h2>
                <p className="text-[#9d9c9c] text-lg">
                  Four tiers of industrial paper science designed to protect and
                  elevate.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-[#042419] transition-all"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button
                  type="button"
                  className="w-14 h-14 rounded-full bg-[#785a06] flex items-center justify-center text-white shadow-lg"
                >
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Paper Card 1 */}
              <div className="group relative h-[500px] parallelogram-clip overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
                <img
                  className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-110 transition-transform duration-700"
                  alt="High-resolution macro texture for Carbon Fibre industrial paper"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Fyy--A-COqQ4fB-FR2BiG2iTlIcyuQa-kn8kSQKa-e5wATFWCqg0hlIdOX_z2TXcWF29G5PJb0HMYFZjdh1YveYHF02JdaL5zCuT1Cs_p5GraJEqHaYxP5Sf4i4xALWqTlWU1-OrDr5jgzVZv_ReVbgA5XrWBzhwuuZTHb_kI7gfaq1n1atlI3W6jICBpokryenSvmGXB6lOnRXwQAwuEpMB-MITbHR33ie7BHfcNXhZ0KyNwbuPG5dlB4XJbf5AZJIXNs1mkzY"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-12 w-full">
                  <span className="text-[#785a06] font-bold text-xs tracking-widest uppercase mb-2 block">
                    Series 01
                  </span>
                  <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">
                    Carbon Fibre
                  </h3>
                  <p className="text-sm text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Unmatched tensile strength with a matte black industrial
                    finish.
                  </p>
                </div>
              </div>
              {/* Paper Card 2 */}
              <div className="group relative h-[500px] parallelogram-clip overflow-hidden transition-transform duration-500 hover:scale-[1.02] mt-8 md:mt-0">
                <img
                  className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-110 transition-transform duration-700"
                  alt="High-resolution macro texture for Marble Pulp"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdoVTtLUFSVcbSfwETd1gMi_LHRRLWAFiqBQI5lgUiUQsayJaVH0bJPRKk24qzck9X6wcjde3VXMhsLO_dvTLkRhZchaqCpOgBHFqN8RPySjxhpNEmkGG5bI3v1BHBfXnhrSBbKoA2T_4bJpTuHKRAT7g9pgGWfyUjRHEoPFQYEtupXd7f7WOCICDpqUjID8vgNHpw39ts-oqyMWGCJ5pGXX4xALC1l194lXsNNifS5P6wyNlHHs0UpmVRdjW7b2q2HyJyxOqqp_8"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-12 w-full">
                  <span className="text-[#785a06] font-bold text-xs tracking-widest uppercase mb-2 block">
                    Series 02
                  </span>
                  <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">
                    Marble Pulp
                  </h3>
                  <p className="text-sm text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Organic textures infused with crushed mineral components for
                    weight.
                  </p>
                </div>
              </div>
              {/* Paper Card 3 */}
              <div className="group relative h-[500px] parallelogram-clip overflow-hidden transition-transform duration-500 hover:scale-[1.02] mt-8 lg:mt-0">
                <img
                  className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-110 transition-transform duration-700"
                  alt="High-resolution macro texture for Titanium Foil"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNk7c_5qbvtQwMicnYrBUgY3w4Gq99AmeWa8uDVdC5JvcOIsKL_gjAbzfyuNg6rulXaN8iZvD9fIf5Py158dBlukUZOS_YTMALaCc-EeVNbvU5NKOTzJGRrRjYJ0c3F2CzO37w4Gb-pjbdYF2wSnL3Xjx43whKetUmlw0u03hSfrHkfRPt2Yk_7pLb9T4cSzWKqAWzb4bgtsPDdK4i7mZ4hJDbmIZoQRa-YLDk7nBjCwe2FM15uVtXX-y9yLV4_4r5zP3yypmvj0U"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-12 w-full">
                  <span className="text-[#785a06] font-bold text-xs tracking-widest uppercase mb-2 block">
                    Series 03
                  </span>
                  <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">
                    Titanium Foil
                  </h3>
                  <p className="text-sm text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Micro-etched metallic surfaces for technological resonance.
                  </p>
                </div>
              </div>
              {/* Paper Card 4 */}
              <div className="group relative h-[500px] parallelogram-clip overflow-hidden transition-transform duration-500 hover:scale-[1.02] mt-8 lg:mt-0">
                <img
                  className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-110 transition-transform duration-700"
                  alt="High-resolution macro texture for Artisan White"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS8gDhY_7tSgWGDBJeIXrx0zkULsWDHbLHB80ecbeUZ5XSCWckCY6_9venGy3JNkF7bERx98JmN8cx4_AoGpZAYhaX2tW7GGIT9nbQ6Z9ssfjblGf-iYUff8jRZSbzykVYwEpLSMfsvYluy8xMKcHcDmMKvgZJWFT_HFUaiep-CD8CpFko2TE7PPbY8HaGHYgsbOjjFx8WxySOzebpTXx-P0-TLYL9mFtyOLYkOuuq4FX0C6D9iaY7Er2Ra3Ilh4XvlysQMO6FyrI"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-12 w-full">
                  <span className="text-[#785a06] font-bold text-xs tracking-widest uppercase mb-2 block">
                    Series 04
                  </span>
                  <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">
                    Artisan White
                  </h3>
                  <p className="text-sm text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Bleach-free virgin pulp for a natural architectural feel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Diagonal Spotlight 1: Marble Series */}
        <section className="relative bg-white overflow-hidden skew-section py-40">
          <div className="skew-inner max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-6xl font-black tracking-tighter text-[#042419] uppercase leading-none mb-8">
                The Marble <br />
                <span className="text-[#785a06]">Series.</span>
              </h2>
              <div className="space-y-6 text-[#414844] text-lg max-w-md">
                <p>
                  Constructed with integrated mineral particulates for a
                  cold-to-the-touch finish. The Marble Series offers a mineral
                  feel that standard paper cannot replicate.
                </p>
                <p className="font-bold text-[#042419]">
                  Spec: 450GSM / Acid-Free / FSC Certified
                </p>
              </div>
              <div className="mt-12 flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-[#042419]">98%</span>
                  <span className="text-xs uppercase tracking-widest font-bold opacity-50">
                    Opacity Rating
                  </span>
                </div>
                <div className="w-px h-12 bg-[#c1c8c2]/30" />
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-[#042419]">Ultra</span>
                  <span className="text-xs uppercase tracking-widest font-bold opacity-50">
                    Tactile Grade
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-10 bg-[#ffd57a]/20 rounded-full blur-3xl" />
              <img
                className="w-full h-auto rounded-lg shadow-2xl relative z-10"
                alt="A 3D render of a luxury perfume bottle sitting on a marble paper plinth"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoOso_1rwfKNf7wd5fL-Rm7D1ffTNLSRqbJ1WZYY226rlwjb5lngXN3zwofxzj8BZdU24IPpBp489_w5cW5XSRA1GMsvb5XPnhSRMlcoEy4DIgCQ9pjmWOaxqent-FO9DYwSmYf30BGw1ouSLo7zbcvXcyLti0BtIicEg0Q0Z8kMGzCbxvfmIjzLWsVbPRXTvsT1JGeQFZQpOQRD46B1RxyEBYn34sZ8Rkk4DITgvCD8ivJTMryd7xJZvQ95gQEw4eBCN8v_Uf_oI"
              />
            </div>
          </div>
        </section>
        {/* Diagonal Spotlight 2: Artisan White */}
        <section className="relative bg-[#f4f4f1] overflow-hidden -skew-y-2 py-40">
          <div className="skew-inner max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -inset-10 bg-[#1b3a2d]/10 rounded-full blur-3xl" />
              <img
                className="w-full h-auto rounded-lg shadow-2xl relative z-10"
                alt="A close-up of a perfectly folded, sharp-edged white industrial box"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS8gDhY_7tSgWGDBJeIXrx0zkULsWDHbLHB80ecbeUZ5XSCWckCY6_9venGy3JNkF7bERx98JmN8cx4_AoGpZAYhaX2tW7GGIT9nbQ6Z9ssfjblGf-iYUff8jRZSbzykVYwEpLSMfsvYluy8xMKcHcDmMKvgZJWFT_HFUaiep-CD8CpFko2TE7PPbY8HaGHYgsbOjjFx8WxySOzebpTXx-P0-TLYL9mFtyOLYkOuuq4FX0C6D9iaY7Er2Ra3Ilh4XvlysQMO6FyrI"
              />
            </div>
            <div>
              <h2 className="text-6xl font-black tracking-tighter text-[#042419] uppercase leading-none mb-8">
                Artisan <br />
                <span className="text-[#785a06]">White.</span>
              </h2>
              <div className="space-y-6 text-[#414844] text-lg max-w-md">
                <p>
                  Designed for architectural precision, Artisan White holds a
                  crease with mathematical perfection. It is the canvas for the
                  world&apos;s most minimal high-fashion brands.
                </p>
                <p className="font-bold text-[#042419]">
                  Spec: 600GSM / Double-Compressed / Matte
                </p>
              </div>
              <button
                type="button"
                className="mt-10 border-b-2 border-[#785a06] pb-1 text-[#042419] font-bold uppercase tracking-widest hover:text-[#785a06] transition-colors"
              >
                Download Technical Specs
              </button>
            </div>
          </div>
        </section>
        {/* Bento Grid: Where It's Used */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-20 text-center">
              <span className="text-[#785a06] font-black text-sm uppercase tracking-widest">
                Global Applications
              </span>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-[#042419] mt-4">
                Precision in Practice.
              </h2>
              <p className="text-[#414844] text-lg max-w-2xl mx-auto mt-4">
                Structural protection meets bespoke aesthetics. Engineered
                internal framing for precision instruments.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[800px]">
              <div className="md:col-span-8 group relative overflow-hidden rounded-lg">
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Luxury watch in a premium black paper box"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4Uu6UI6XauXDZnNxciD6zwq9t32sjA1PzbpT2MIY5jhWS2LhDwGyQFiVKBBHDrrXzdjG3CfK4NahIWUw_1Jhf_iCqAoDfnH9m5YzLTjUm2uJJa915wQXQJsafdtkqAHCAHk05JQPFmVYZ3oi8dR51JZQlCLqskY_qz58bvAmGvkJJfV8-XJq_r9LzDrLr99R-wjIHUU7-L74ULnYPRrIpWkifZ5-pBuql8z0DYSVNGg1rD4p_4LyEOH_zxO4-X2HXhJnkN2p245E"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-8 left-8">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Horology
                  </h4>
                </div>
              </div>
              <div className="md:col-span-4 group relative overflow-hidden rounded-lg">
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Premium minimalist stationery set"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUMvHvyFvpu_DxapMc7FU133gZKqGzJVQBccAxcbOlvfxNoaLd8OvfkFzYMX_z1_tw2nFFs2C7BhzN4n16E7zbD0nz-sj3KBU6F0PkiJYQrKqbqQYogFUpZoe1xJZw_QiSTXbKGoaZgLWHHOl8Mde2KlLEfl-3RpfUcye2_9C6nJrdJ8npNY3s0Pvn6hqW2BWkVZ2bDrEO4FHJcL8CgqbGJLb2XyFy0g3Xpdmgg68KeKMv4DkNoZfUKcUM-bWDhCwRjBk2XpSz_tg"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-8 left-8">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Stationery
                  </h4>
                </div>
              </div>
              <div className="md:col-span-4 group relative overflow-hidden rounded-lg">
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Luxury cosmetics packaging with embossed detailing"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdovrzg6bMRExzVwq08VLdNCVM97wMFnBz0KGFxw0TZUr2kLpOxyBwexMw_flt2yQL69nSKe07A09AdMcOtfwvPXToSycJE1jpEKHBUIHqkWCE99aBcHOPeBVQVsMAjII3XnTCy-5v0Rg4wRD7c5A4yPXFCGYSfH2b-ms5gn6mEremnbBmODDL1sb-lOOki2sxxxwGwFTa5_vKLN1qBy9dYOKTGrUSt_qN3HnVJAuGm7JVNeYlBR9wrqff7q-eC2Q5HF-Xn0GzF64"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-8 left-8">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Beauty
                  </h4>
                </div>
              </div>
              <div className="md:col-span-8 group relative overflow-hidden rounded-lg">
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Honeycomb-core tech component internal structure"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqoo4AOA1peXGIiOks3Z59k7GkikVNZC6cDt5bjApdh9iMXI27AFJR_5ClcRzBOz_zkx1PgrZddlyOw9bhfkak8S0LIV4niEU3iUANv2_Z3ZjwN6Yb7vyR9oKhsXaaQp1f2YiC3VWNuuBKClBX8B8minMYsVer7E69A851SxlrXnMjYqDKUvZSysH8GmfeQ_eyaBaptetgHteV_6I05Jhe_GQS4NNHLjzod_Gj7F3cU7tyBTRP3cEa2oE3i_zUt7NU13F5BM6ZXIw"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-8 left-8">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Tech-Systems
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Torn Paper CTA Section */}
        <section className="relative pt-32 pb-48 bg-[#042419] overflow-x-clip overflow-y-visible">
          <div className="absolute top-0 left-0 w-full h-20 bg-white torn-paper-edge z-10 rotate-180 origin-center" />
          <div className="max-w-4xl mx-auto px-8 text-center relative z-20">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-tight mb-10">
              Ready to <span className="text-[#785a06] italic">Redefine</span>{" "}
              <br />
              Your Standards?
            </h2>
            <p className="text-[#83a493] text-xl mb-12 max-w-2xl mx-auto">
              Join 500+ global brands who trust AM Global for their high-end
              structural requirements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                type="button"
                className="w-full sm:w-auto bg-[#785a06] text-white px-12 py-6 rounded-full font-black uppercase text-sm tracking-widest shadow-2xl hover:scale-105 transition-all"
              >
                Order Sample Kit
              </button>
              <button
                type="button"
                className="w-full sm:w-auto bg-transparent border-2 border-white/20 text-white px-12 py-6 rounded-full font-black uppercase text-sm tracking-widest hover:bg-white hover:text-[#042419] transition-all"
              >
                Speak to Engineer
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 p-8 sm:p-12 opacity-10 text-right pointer-events-none leading-none">
            <span className="inline-block text-[clamp(3.25rem,7vw,6.5rem)] font-black text-white select-none tracking-tighter whitespace-nowrap">
              AM GLOBAL
            </span>
          </div>
        </section>
        {/* Footer */}
        <footer className="bg-[#1B3A2D] dark:bg-stone-900 border-t border-white/10 text-[#FAFAF7] font-['Inter']">
          <div className="max-w-7xl mx-auto px-12 py-20 grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <div className="text-xl font-black text-[#C9A34E] mb-8">AM GLOBAL</div>
              <p className="text-sm opacity-60 leading-relaxed uppercase tracking-widest">
                Precision engineering for luxury packaging solutions since 1994.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-[#C9A34E] mb-2">
                Offerings
              </h5>
              <a
                className="text-sm opacity-70 hover:text-[#C9A34E] transition-all hover:translate-x-1"
                href="#"
              >
                Custom Packaging
              </a>
              <a
                className="text-sm opacity-70 hover:text-[#C9A34E] transition-all hover:translate-x-1"
                href="#"
              >
                Paper Science
              </a>
              <a
                className="text-sm opacity-70 hover:text-[#C9A34E] transition-all hover:translate-x-1"
                href="#"
              >
                Supply Chain
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-[#C9A34E] mb-2">
                Ethics
              </h5>
              <a
                className="text-sm opacity-70 hover:text-[#C9A34E] transition-all hover:translate-x-1"
                href="#"
              >
                Eco-Commitment
              </a>
              <a
                className="text-sm opacity-70 hover:text-[#C9A34E] transition-all hover:translate-x-1"
                href="#"
              >
                Sustainability Report
              </a>
              <a
                className="text-sm opacity-70 hover:text-[#C9A34E] transition-all hover:translate-x-1"
                href="#"
              >
                Privacy Policy
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-[#C9A34E] mb-2">
                Connect
              </h5>
              <a
                className="text-sm opacity-70 hover:text-[#C9A34E] transition-all hover:translate-x-1"
                href="#"
              >
                Contact Support
              </a>
              <a
                className="text-sm opacity-70 hover:text-[#C9A34E] transition-all hover:translate-x-1"
                href="#"
              >
                Instagram
              </a>
              <a
                className="text-sm opacity-70 hover:text-[#C9A34E] transition-all hover:translate-x-1"
                href="#"
              >
                LinkedIn
              </a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-12 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-[0.6875rem] uppercase tracking-widest opacity-40">
              © 2024 AM GLOBAL PACKAGING SOLUTIONS. PRECISION &amp; SUSTAINABILITY.
            </span>
            <div className="flex items-center gap-8">
              <span className="material-symbols-outlined opacity-40 cursor-pointer hover:opacity-100 transition-opacity">
                language
              </span>
              <span className="material-symbols-outlined opacity-40 cursor-pointer hover:opacity-100 transition-opacity">
                settings
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
