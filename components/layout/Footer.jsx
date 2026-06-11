export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} SoulCare Counselling. All rights reserved.
      </div>
    </footer>
  );
}