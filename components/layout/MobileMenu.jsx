'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/bible', label: 'Bible' },
  { href: '/resources', label: 'Resources' },
  { href: '/booking', label: 'Book Session' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function MobileMenu({ isOpen, onClose }) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 top-16 bg-white dark:bg-gray-900 z-40 p-4">
      <div className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`py-2 px-4 rounded-lg text-lg ${
              pathname === item.href
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700'
                : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}