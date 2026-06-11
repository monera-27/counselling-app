// app/booking/steps/Step3Intake.jsx
import Button from '@/components/ui/Button';

export default function Step3Intake({ bookingData, updateBooking, nextStep, prevStep }) {
  const handleChange = (e) => {
    updateBooking({ intake_notes: e.target.value });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">What would you like support with?</h2>
      <textarea
        placeholder="Briefly describe your situation..."
        value={bookingData.intake_notes}
        onChange={handleChange}
        className="border p-2 rounded w-full h-32 mb-6"
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} type="button">
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1">
          Next: Review & Confirm
        </Button>
      </div>
    </div>
  );
}