// app/book-session/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';

// ---------- Types ----------
interface BookingData {
  full_name: string;
  email: string;
  phone: string;
  session_type: 'individual' | 'couples' | 'family';
  session_date: string;
  session_time: string;
  intake_notes: string;
}

type StepProps = {
  bookingData: BookingData;
  updateBooking: (data: Partial<BookingData>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
  handleFinalSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
};

// ---------- Simple UI Components ----------
const Container = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${className}`} style={{ maxWidth: '80rem' }}>
    {children}
  </div>
);

const ErrorAlert = ({ message, onDismiss }: { message: string | null; onDismiss: () => void }) => {
  if (!message) return null;
  return (
    <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200 flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onDismiss} className="text-red-700 hover:text-red-900">✕</button>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// ---------- Step 1: Personal Details ----------
const Step1Details = ({ bookingData, updateBooking, nextStep }: StepProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateBooking({ [e.target.name]: e.target.value });
  };
  const isValid = bookingData.full_name && bookingData.email && bookingData.phone;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Information</h2>
      <input name="full_name" placeholder="Full Name" value={bookingData.full_name} onChange={handleChange} className="w-full border p-2 rounded" required />
      <input name="email" type="email" placeholder="Email" value={bookingData.email} onChange={handleChange} className="w-full border p-2 rounded" required />
      <input name="phone" placeholder="Phone Number" value={bookingData.phone} onChange={handleChange} className="w-full border p-2 rounded" required />
      <select name="session_type" value={bookingData.session_type} onChange={handleChange} className="w-full border p-2 rounded">
        <option value="individual">Individual</option>
        <option value="couples">Couples</option>
        <option value="family">Family</option>
      </select>
      <button onClick={nextStep} disabled={!isValid} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50">Continue</button>
    </div>
  );
};

// ---------- Step 2: Date & Time ----------
const Step2DateTime = ({ bookingData, updateBooking, nextStep, prevStep }: StepProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(bookingData.session_date || '');
  const [selectedTime, setSelectedTime] = useState<string>(bookingData.session_time || '');
  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    updateBooking({ session_date: date });
  };
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    updateBooking({ session_time: time });
  };

  // Date and time are optional per requirements
  const canProceed = true;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
      <p className="text-sm text-gray-500">
        You may select a preferred date and time, or skip — we will reach out to confirm scheduling with you.
      </p>
      <input type="date" value={selectedDate} onChange={handleDateChange} min={minDate} className="w-full border p-2 rounded" />
      <div className="grid grid-cols-3 gap-2 mt-2">
        {timeSlots.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => handleTimeSelect(selectedTime === time ? '' : time)}
            className={`p-2 border rounded ${selectedTime === time ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
          >
            {time}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={prevStep} className="flex-1 border border-gray-300 py-2 rounded">Back</button>
        <button onClick={nextStep} disabled={!canProceed} className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50">
          {selectedDate ? 'Continue' : 'Skip & Continue'}
        </button>
      </div>
    </div>
  );
};

// ---------- Step 3: Intake Notes ----------
const Step3Intake = ({ bookingData, updateBooking, nextStep, prevStep }: StepProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBooking({ intake_notes: e.target.value });
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Tell us a bit more</h2>
      <textarea placeholder="What would you like support with? (optional)" value={bookingData.intake_notes} onChange={handleChange} rows={5} className="w-full border p-2 rounded" />
      <div className="flex gap-3">
        <button onClick={prevStep} className="flex-1 border border-gray-300 py-2 rounded">Back</button>
        <button onClick={nextStep} className="flex-1 bg-blue-600 text-white py-2 rounded">Continue</button>
      </div>
    </div>
  );
};

// ---------- Step 4: Confirm & Submit ----------
const Step4Confirm = ({ bookingData, handleFinalSubmit, prevStep, isSubmitting }: StepProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Confirm Your Booking</h2>
      <div className="bg-gray-50 p-4 rounded space-y-2">
        <p><strong>Name:</strong> {bookingData.full_name}</p>
        <p><strong>Email:</strong> {bookingData.email}</p>
        <p><strong>Phone:</strong> {bookingData.phone}</p>
        <p><strong>Session Type:</strong> {bookingData.session_type}</p>
        <p><strong>Date:</strong> {bookingData.session_date || 'To be confirmed'}</p>
        <p><strong>Time:</strong> {bookingData.session_time || 'To be confirmed'}</p>
        <p><strong>Notes:</strong> {bookingData.intake_notes || '—'}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={prevStep} className="flex-1 border border-gray-300 py-2 rounded">Back</button>
        <button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-2 rounded disabled:opacity-50">
          {isSubmitting ? <LoadingSpinner /> : 'Confirm & Pay'}
        </button>
      </div>
    </div>
  );
};

// ---------- Main Booking Flow ----------
export default function BookingFlow() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    full_name: '',
    email: '',
    phone: '',
    session_type: 'individual',
    session_date: '',
    session_time: '',
    intake_notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookingDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBookingData((prev) => ({ ...prev, ...parsed }));
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    localStorage.setItem('bookingDraft', JSON.stringify(bookingData));
  }, [bookingData]);

  const updateBooking = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // apiUrl() prepends NEXT_PUBLIC_APP_URL so this works on both
      // Vercel (relative path) and the mobile app (full URL).
      const res = await fetch(apiUrl('/api/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Booking failed');
      }
      const { paymentLink } = await res.json();
      localStorage.removeItem('bookingDraft');
      window.location.href = paymentLink;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepComponents: Record<number, React.FC<StepProps>> = {
    1: Step1Details,
    2: Step2DateTime,
    3: Step3Intake,
    4: Step4Confirm,
  };
  const CurrentStep = stepComponents[step];
  const stepProps: StepProps = {
    bookingData,
    updateBooking,
    nextStep: step < 4 ? nextStep : undefined,
    prevStep: step > 1 ? prevStep : undefined,
    handleFinalSubmit: step === 4 ? handleFinalSubmit : undefined,
    isSubmitting,
  };

  return (
    <Container className="py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i}
              </div>
              <span className="text-xs mt-1 hidden sm:inline">
                {i === 1 && 'Your Info'}
                {i === 2 && 'Date & Time'}
                {i === 3 && 'Intake Notes'}
                {i === 4 && 'Confirm'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <CurrentStep {...stepProps} />
      </div>
    </Container>
  );
}