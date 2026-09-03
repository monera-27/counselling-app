export default function Card({
  children,
  className = '',
  accent = false,
  hover = false,
  glass = false,
  ...props
}) {
  // Base styles
  const base = 'rounded-xl overflow-hidden transition-all duration-200';

  // Color strategy: glass or solid
  const colorClass = glass
    ? 'glass'
    : 'bg-white dark:bg-gray-800 shadow-sm border border-cream-dark dark:border-gray-700';

  // Accent: gold top border
  const accentClass = accent ? 'border-t-2 border-t-gold dark:border-t-gold' : '';

  // Interactive: hover effects
  const hoverClass = hover
    ? 'hover:shadow-md hover:scale-[1.01] dark:hover:shadow-lg'
    : '';

  // Combine everything
  const combined = `${base} ${colorClass} ${accentClass} ${hoverClass} ${className}`;

  return (
    <div className={combined} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div
      className={`px-6 pt-5 pb-3 border-b border-cream-dark dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`px-6 py-4 bg-cream dark:bg-gray-700/50 border-t border-cream-dark dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}