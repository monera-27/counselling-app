import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary-700 hover:text-primary-800 transition">
      <span className="text-3xl">🌿</span>
      <span>SoulCare</span>
    </Link>
  );
}