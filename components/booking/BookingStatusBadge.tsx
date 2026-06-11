interface BookingStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
}

export default function BookingStatusBadge({ status, paymentStatus }: BookingStatusBadgeProps) {
  const statusConfig = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
    completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    no_show: { label: 'No Show', className: 'bg-gray-100 text-gray-800' },
  };
  const paymentConfig = {
    pending: { label: 'Unpaid', className: 'bg-orange-100 text-orange-800' },
    paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
    refunded: { label: 'Refunded', className: 'bg-purple-100 text-purple-800' },
  };

  return (
    <div className="flex gap-2">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[status].className}`}>
        {statusConfig[status].label}
      </span>
      {paymentStatus && (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentConfig[paymentStatus].className}`}>
          {paymentConfig[paymentStatus].label}
        </span>
      )}
    </div>
  );
}