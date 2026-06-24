// app/booking/steps/Step4Confirm.jsx
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Step4Confirm({ bookingData, handleFinalSubmit, prevStep, isSubmitting }) {
  const { full_name, email, phone, session_type, session_date, session_time, intake_notes } = bookingData;

  const formattedDate = session_date
    ? session_date.toLocaleDateString('en-CA') // YYYY-MM-DD format
    : 'To be confirmed';

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Confirm Your Booking</h2>

      <div className="space-y-2 mb-6 text-sm">
        <p><strong>Name:</strong> {full_name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Session Type:</strong> {session_type}</p>
        <p><strong>Date:</strong> {formattedDate}</p>
        <p><strong>Time:</strong> {session_time ? session_time.substring(0, 5) : 'To be confirmed'}</p>
        <p><strong>Intake Notes:</strong> {intake_notes || 'None'}</p>
      </div>

      {isSubmitting && (
        <div className="mb-4 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} type="button" disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="flex-1"
          variant="primary"
        >
          {isSubmitting ? 'Submitting...' : 'Confirm & Pay'}
        </Button>
      </div>
    </div>
  );
}