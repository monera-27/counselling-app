"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-Client";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  full_name: string;
  email: string;
  session_type: string;
  session_date: string;
  session_time: string;
  intake_notes: string;
  status: string;
  payment_status: string;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Protect page – only admin can access
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    });
  }, []);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const updateBookingStatus = async (
    id: number,
    newStatus: string
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) fetchBookings(); // refresh
  };

  // Quick stats
  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter(
    (b) => b.session_date === today
  );
  const pendingBookings = bookings.filter(
    (b) => b.status === "pending"
  );

  if (loading) return <p>Loading...</p>;

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Total Bookings</h2>
          <p className="text-2xl font-semibold">{bookings.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Today</h2>
          <p className="text-2xl font-semibold">{todayBookings.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Pending Confirmation</h2>
          <p className="text-2xl font-semibold text-yellow-600">
            {pendingBookings.length}
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Session Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date / Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{booking.full_name}</div>
                  <div className="text-xs text-gray-500">{booking.email}</div>
                </td>
                <td className="px-4 py-3 text-sm">{booking.session_type}</td>
                <td className="px-4 py-3 text-sm">
                  {booking.session_date} <br />
                  <span className="text-xs text-gray-500">
                    {booking.session_time}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {booking.payment_status}
                </td>
                <td className="px-4 py-3 text-sm space-x-2">
                  {booking.status !== "confirmed" && (
                    <button
                      onClick={() =>
                        updateBookingStatus(booking.id, "confirmed")
                      }
                      className="text-green-600 hover:underline"
                    >
                      Confirm
                    </button>
                  )}
                  {booking.status !== "cancelled" && (
                    <button
                      onClick={() =>
                        updateBookingStatus(booking.id, "cancelled")
                      }
                      className="text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}