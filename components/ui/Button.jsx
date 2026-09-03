import Link from 'next/link';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  ...props
}) {
  // Base styles
  const base = 'inline-flex items-center justify-center font-serif rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variants using brand colors
  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-light focus:ring-gold dark:bg-gold dark:text-navy dark:hover:bg-gold-light dark:focus:ring-cream',
    gold: 'border-2 border-gold text-navy hover:bg-gold hover:text-white focus:ring-gold dark:text-cream dark:hover:bg-gold dark:hover:text-navy',
    teal: 'bg-teal text-white hover:bg-teal-light focus:ring-gold dark:bg-teal dark:hover:bg-teal-light',
    outline: 'border border-cream-dark bg-transparent text-navy hover:bg-cream focus:ring-gold dark:border-gray-600 dark:text-cream dark:hover:bg-white/10',
    ghost: 'text-navy hover:bg-cream focus:ring-gold dark:text-cream dark:hover:bg-white/10',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800',
  };

  // Sizes using Tailwind classes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Interactive effects (bonus: scale on hover/click)
  const interactive = 'hover:scale-105 active:scale-95';

  const combined = `${base} ${variants[variant]} ${sizes[size]} ${interactive} ${className}`;

  // Render as Link if href is provided
  if (href) {
    return (
      <Link href={href} className={combined} {...props}>
        {children}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button className={combined} {...props}>
      {children}
    </button>
  );
}