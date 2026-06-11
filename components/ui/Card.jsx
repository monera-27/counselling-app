export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 pt-6 pb-3 border-b border-gray-100 dark:border-gray-700 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-900/50 ${className}`}>{children}</div>;
}