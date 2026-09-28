import React, { useState, useEffect } from "react";
import { HERO_DATA } from "../../data/spidermanData";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled || mobileMenuOpen
            ? "bg-black/90 backdrop-blur-md border-red-900/50 py-3 shadow-[0_4px_30px_rgba(220,38,38,0.15)]"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="text-white text-2xl font-black tracking-tighter italic uppercase group flex items-center"
          >
            <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
              {HERO_DATA.firstName.charAt(0)}
            </span>
            <span className="group-hover:text-red-500 transition-colors duration-300">
              {HERO_DATA.firstName.slice(1)}.
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="relative text-xs md:text-sm font-bold text-gray-400 uppercase tracking-[0.15em] transition-colors duration-300 hover:text-white group"
                >
                  {item.label}
                  <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-red-600 transition-all duration-300 ease-out group-hover:w-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                </a>
              ))}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-red-500 focus:outline-none transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Slide-over Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute top-0 right-0 w-4/5 max-w-sm h-full bg-[#0a0a0a] border-l border-red-900/50 shadow-2xl p-8 pt-24 flex flex-col justify-between transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Decorative Web Accent */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-4 border-b border-red-900/40">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse" />
              <span className="text-xs uppercase font-mono tracking-widest text-gray-400">
                Navigation Protocol
              </span>
            </div>

            <div className="flex flex-col gap-5">
              {navItems.map((item, idx) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={handleNavClick}
                  className="group flex items-center justify-between py-2 text-2xl font-black italic uppercase tracking-wider text-gray-200 hover:text-red-500 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs font-mono text-red-600">
                      0{idx + 1}.
                    </span>
                    {item.label}
                  </span>
                  <span className="text-red-600 text-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="pt-6 border-t border-gray-800/80 flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
              {HERO_DATA.tagline}
            </span>
            <div className="text-xs font-bold text-gray-400">
              © {new Date().getFullYear()} {HERO_DATA.firstName} {HERO_DATA.lastName}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
