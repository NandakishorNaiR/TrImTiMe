const Confirmation = () => {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-green-600">Booking Confirmed 🎉</h1>

      <p className="mt-4">Your slot has been successfully booked.</p>

      <a href="/" className="inline-block mt-6 underline">
        Back to Home
      </a>
    </div>
  );
};

export default Confirmation;
