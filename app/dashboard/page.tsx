// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase-Client';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

type Session = {
  id: string;
  session_date: string;
  session_time: string;
  session_type: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Session | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch user & bookings
  useEffect(() => {
    const fetchUserAndBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch user's sessions
      const { data, error } = await supabase
        .from('sessions')
        .select('id, session_date, session_time, session_type, status, payment_status')
        .eq('user_id', user.id)
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };

    fetchUserAndBookings();
  }, [router]);

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);

    const { error } = await supabase
      .from('sessions')
      .update({ status: 'cancelled' })
      .eq('id', cancelTarget.id)
      .eq('user_id', user.id); // extra safety

    if (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel. Please try again.');
    } else {
      // Update local state
      setBookings(prev =>
        prev.map(b =>
          b.id === cancelTarget.id ? { ...b, status: 'cancelled' } : b
        )
      );
    }
    setIsCancelling(false);
    setCancelTarget(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <div className="p-10 text-center">Loading your bookings…</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Your Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>

      {user && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-8">
          <p className="text-gray-700 dark:text-gray-300">
            Signed in as <strong>{user.email}</strong>
          </p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Your Sessions</h2>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <p className="text-gray-500">You haven't booked any sessions yet.</p>
          <button
            onClick={() => router.push('/booking')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Book Your First Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900 shadow-sm"
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {booking.session_type} Session
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(booking.session_date)} at {booking.session_time.substring(0, 5)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : booking.payment_status === 'refunded'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {booking.payment_status}
                    </span>
                  </div>
                </div>

                {booking.status === 'pending' || booking.status === 'confirmed' ? (
                  <button
                    onClick={() => setCancelTarget(booking)}
                    disabled={isCancelling && cancelTarget?.id === booking.id}
                    className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                ) : (
                  <span className="text-sm text-gray-400 italic">Cancelled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Session"
        message={`Are you sure you want to cancel your ${cancelTarget?.session_type} session on ${cancelTarget ? formatDate(cancelTarget.session_date) : ''}? ${
          new Date(cancelTarget?.session_date || '') < new Date(Date.now() + 24 * 60 * 60 * 1000)
            ? 'No refunds within 24 hours of the session.'
            : 'Refunds will be processed according to our policy.'
        }`}
        confirmText="Yes, cancel"
        variant="danger"
      />
    </main>
  );
}