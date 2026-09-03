import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-navy border-t-2 border-gold py-8 mt-auto dark:bg-gray-950 dark:border-gold/60">
      <div className="container mx-auto px-4 text-center">
        
        {/* 1️⃣ Brand Section + Hover Effect (Option 1) */}
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <span className="text-gold text-lg">✝</span>
          <span className="font-serif text-lg font-bold text-cream tracking-wide transition-colors hover:text-gold dark:text-gray-100 dark:hover:text-gold">
            Living Renewal
          </span>
        </div>

        {/* 2️⃣ Navigation Links (Option 2) */}
        <div className="flex justify-center gap-6 mb-4">
          <Link
            href="/about"
            className="text-cream/70 hover:text-gold text-sm transition-colors dark:text-gray-400 dark:hover:text-gold"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-cream/70 hover:text-gold text-sm transition-colors dark:text-gray-400 dark:hover:text-gold"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="text-cream/70 hover:text-gold text-sm transition-colors dark:text-gray-400 dark:hover:text-gold"
          >
            Privacy
          </Link>
        </div>

        {/* 3️⃣ Gold Divider Line (Option 3) */}
        <div className="w-12 h-0.5 bg-gold/30 mx-auto mb-3"></div>

        {/* 4️⃣ Copyright */}
        <p className="text-xs text-cream/50 font-sans tracking-wider dark:text-gray-400">
          © {new Date().getFullYear()} SoulCare Counselling. All rights reserved.
        </p><Link href="/" className="flex items-center justify-center gap-2.5 mb-3">
  <span className="text-gold text-lg">✝</span>
  <span className="font-serif text-lg font-bold text-cream tracking-wide transition-colors hover:text-gold dark:text-gray-100 dark:hover:text-gold">
    Living Renewal
  </span>
</Link>

      </div>
    </footer>
  );
}