// app/booking/steps/Step1Details.jsx
import Button from '@/components/ui/Button';

export default function Step1Details({ bookingData, updateBooking, nextStep }) {
  const handleChange = (e) => {
    updateBooking({ [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Your Details</h2>

      <label className="block mb-2">
        Full Name *
        <input
          type="text"
          name="full_name"
          required
          value={bookingData.full_name}
          onChange={handleChange}
          className="border p-2 rounded w-full mt-1"
        />
      </label>

      <label className="block mb-2">
        Email *
        <input
          type="email"
          name="email"
          required
          value={bookingData.email}
          onChange={handleChange}
          className="border p-2 rounded w-full mt-1"
        />
      </label>

      <label className="block mb-2">
        Phone *
        <input
          type="tel"
          name="phone"
          required
          value={bookingData.phone}
          onChange={handleChange}
          className="border p-2 rounded w-full mt-1"
        />
      </label>

      <label className="block mb-6">
        Session Type
        <select
          name="session_type"
          value={bookingData.session_type}
          onChange={handleChange}
          className="border p-2 rounded w-full mt-1"
        >
          <option value="individual">Individual</option>
          <option value="couples">Couples</option>
          <option value="family">Family</option>
        </select>
      </label>

      <Button type="submit" className="w-full">
        Next: Choose Date & Time
      </Button>
    </form>
  );
}