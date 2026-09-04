'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/bible', label: 'Bible' },
  { href: '/resources', label: 'Resources' },
  { href: '/book-session', label: 'Book Session' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function MobileMenu({ isOpen, onClose }) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 top-16 bg-navy z-40 p-6 border-t border-gold/30">
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                py-3.5 px-4 rounded-md font-serif text-base 
                transition-all duration-150
                border-l-2 
                ${
                  isActive
                    ? 'text-gold bg-gold/10 border-gold font-semibold'
                    : 'text-navy border-transparent hover:text-gold hover:bg-gold/5'
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}