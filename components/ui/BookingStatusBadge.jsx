export default function BookingStatusBadge({ status }) {
  const variants = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${variants[status] || variants.pending}`}>
      {labels[status] || status}
    </span>
  );
}