// app/booking/steps/Step2DateTime.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-Client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '@/components/ui/Button';

const timeSlots = [
  { label: '09:00 AM', value: '09:00:00' },
  { label: '10:00 AM', value: '10:00:00' },
  { label: '11:00 AM', value: '11:00:00' },
  { label: '01:00 PM', value: '13:00:00' },
  { label: '02:00 PM', value: '14:00:00' },
  { label: '03:00 PM', value: '15:00:00' },
];

export default function Step2DateTime({ bookingData, updateBooking, nextStep, prevStep }) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Fetch booked slots whenever selectedDate changes
  useEffect(() => {
    if (!bookingData.session_date) {
      setAvailableSlots([]);
      return;
    }

    const fetchBooked = async () => {
      setLoadingSlots(true);
      const dateStr = formatDate(bookingData.session_date);

      const { data: booked, error } = await supabase
        .from('sessions')
        .select('session_time')
        .eq('session_date', dateStr)
        .eq('status', 'confirmed');

      if (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
      } else {
        const bookedTimes = booked.map((b) => b.session_time.substring(0, 5));
        const free = timeSlots.filter((s) => !bookedTimes.includes(s.value.substring(0, 5)));
        setAvailableSlots(free.map((s) => s.value.substring(0, 5)));
        // Clear selected time if it becomes unavailable
        if (bookingData.session_time && !free.some((s) => s.value === bookingData.session_time)) {
          updateBooking({ session_time: null });
        }
      }
      setLoadingSlots(false);
    };

    fetchBooked();
  }, [bookingData.session_date]);

  const handleDateChange = (date) => {
    updateBooking({ session_date: date, session_time: null }); // reset time on date change
  };

  const handleTimeSelect = (timeValue) => {
    updateBooking({ session_time: timeValue });
  };

  const canProceed = bookingData.session_date && bookingData.session_time;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select Date & Time</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Date *</label>
        <DatePicker
          selected={bookingData.session_date}
          onChange={handleDateChange}
          minDate={new Date()}
          dateFormat="yyyy-MM-dd"
          className="border p-2 rounded w-full"
          placeholderText="Choose a date"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Time *</label>
        {loadingSlots ? (
          <p className="text-gray-500">Loading available times…</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-1">
            {timeSlots.map(({ label, value }) => {
              const shortValue = value.substring(0, 5);
              const isAvailable = availableSlots.includes(shortValue);
              return (
                <button
                  key={value}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleTimeSelect(value)}
                  className={`p-2 border rounded transition-colors ${
                    !isAvailable
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : bookingData.session_time === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} type="button">
          Back
        </Button>
        <Button onClick={nextStep} disabled={!canProceed} className="flex-1">
          Next: Intake Notes
        </Button>
      </div>
    </div>
  );
}