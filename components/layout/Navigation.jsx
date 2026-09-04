'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx'; // optional but cleaner – or just use template literals

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/bible', label: 'Bible' },
  { href: '/resources', label: 'Resources' },
  { href: '/book-session', label: 'Book Session' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              // Base styles
              'font-serif text-sm tracking-wide transition-all duration-200',
              'border-b-2 pb-1',
              // Active state: gold text + gold underline
              isActive
                ? 'text-gold border-gold font-bold'
                : // Inactive: cream text, transparent underline, hover gold
                  'text-navy border-transparent hover:text-gold hover:border-gold/50'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}