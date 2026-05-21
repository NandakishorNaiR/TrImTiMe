import SlotGrid from "./SlotGrid";

const SlotPicker = ({ date, slots = [], selectedSlot, setSelectedSlot }) => {
  // compare ISO date strings (YYYY-MM-DD) to avoid timezone shifts
  const today = date === new Date().toISOString().slice(0, 10);

  // normalize incoming slots but preserve capacity info
  const normalized = (slots || []).map((s) => {
    if (typeof s === "number") {
      // convert minute number to object format
      const hh = Math.floor(s / 60).toString().padStart(2, '0');
      const mm = (s % 60).toString().padStart(2, '0');
      return { start: `${hh}:${mm}`, end: '', capacity: 1, booked: 0, available: 1 };
    }
    // if already an object with capacity info, return as-is
    if (s && typeof s.start === "string" && s.start.includes(":")) {
      return s;
    }
    return null;
  }).filter(Boolean);

  // Ensure the currently selected slot remains visible
  if (selectedSlot && !normalized.find(s => s.start === selectedSlot.start)) {
    normalized.push(selectedSlot);
    // keep normalized sorted by start time
    normalized.sort((a, b) => {
      const [ah] = a.start.split(':').map(Number);
      const [bh] = b.start.split(':').map(Number);
      return ah - bh;
    });
  }

  return (
    <div className="mt-4 sm:mt-6">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-sm sm:text-base">Select Time</h2>
        {today && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Today</span>
        )}
      </div>

      {normalized.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">No slots available</p>
      ) : (
        <SlotGrid
          slots={normalized}
          selected={selectedSlot}
          onSelect={(slot) => setSelectedSlot(slot)}
          isToday={today}
        />
      )}
    </div>
  );
};

export default SlotPicker;

