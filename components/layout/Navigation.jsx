'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/bible', label: 'Bible' },
  { href: '/resources', label: 'Resources' },
  { href: '/book-session', label: 'Book Session' },  // ✅ Fixed here
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-medium transition-colors hover:text-primary-700 ${
            pathname === item.href
              ? 'text-primary-700 border-b-2 border-primary-700'
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}