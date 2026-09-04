'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* ✅ BONUS 1: Glass morphism applied to the entire header */}
      <header className="glass sticky top-0 z-50 border-b-2 border-gold dark:border-gold/60 shadow-lg">
        <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
          {/* Logo with hover effects (already included) */}
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <span className="w-9 h-9 rounded-full border-2 border-gold flex items-center justify-center text-gold text-lg shrink-0 transition-all duration-200 group-hover:bg-gold/10 group-hover:scale-105 dark:border-gold/70">
              ✝
            </span>
            <span className="font-serif text-xl font-bold text-navy tracking-wide transition-colors duration-200 group-hover:text-gold dark:text-navy-100 dark:group-hover:text-gold">
              Living Renewal
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* ✅ BONUS 2: Mobile button with enhanced hover & scale effects */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden border border-gold rounded px-3 py-1.5 text-cream text-base cursor-pointer transition-all duration-200 hover:bg-gold/20 hover:scale-105 active:scale-95 dark:border-gold/60 dark:text-gray-200 dark:hover:bg-gold/10"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu drawer */}
        <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </header>
    </>
  );
}