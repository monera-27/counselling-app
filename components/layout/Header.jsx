'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-700">
          ✝️ SoulCare
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:block">
          <Navigation />
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu drawer */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}