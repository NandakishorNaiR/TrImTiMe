import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import SlotPicker from "../components/booking/SlotPicker";
import { formatTime } from "../utils/time";
import { getAvailableSlots } from "../api/booking.api";
import { getShopById } from "../api/shop.api";
import ShopClosedModal from "../components/ui/ShopClosedModal";

const Booking = () => {
  const params = useParams();
  const location = useLocation();

  const selectedServices = location.state?.services || [];
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]); // now stores objects with capacity info
  const [selectedSlot, setSelectedSlot] = useState(null); // now an object {start, end, capacity, booked, available}
  const [shop, setShop] = useState(null);
  const [closedInfo, setClosedInfo] = useState({ closed: false, reason: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // determine shopId from URL params or location state
    const paramShopId = params?.shopId;
    const stateShopId = location.state?.shopId || location.state?.shop?._id;
    const resolvedShopId = paramShopId || stateShopId;

    const loadSlots = async () => {
      try {
        const data = await getAvailableSlots(resolvedShopId, date, totalDuration);

        if (data && data.closed) {
          setClosedInfo({ closed: true, reason: data.reason || 'Shop closed' });
          setSlots([]);
          return;
        } else {
          setClosedInfo({ closed: false, reason: '' });
        }

        // normalize response formats:
        // 1) { slots: [600,630], totalDuration }
        // 2) [{ start: '10:00', end: '10:50', capacity, booked, available }, ...]
        // 3) array of minutes
        let normalized = [];
        if (!data) normalized = [];
        else if (Array.isArray(data)) {
          // array of either numbers or objects
          normalized = data.map(s => {
            if (typeof s === 'number') {
              const hh = Math.floor(s / 60).toString().padStart(2, '0');
              const mm = (s % 60).toString().padStart(2, '0');
              return { start: `${hh}:${mm}`, end: '', capacity: 1, booked: 0, available: 1 };
            }
            if (s && typeof s.start === 'string' && s.start.includes(':')) {
              return s; // already has capacity info
            }
            return null;
          }).filter(Boolean);
        } else if (data.slots && Array.isArray(data.slots)) {
          normalized = data.slots.map(s => {
            if (typeof s === 'number') {
              const hh = Math.floor(s / 60).toString().padStart(2, '0');
              const mm = (s % 60).toString().padStart(2, '0');
              return { start: `${hh}:${mm}`, end: '', capacity: 1, booked: 0, available: 1 };
            }
            return s;
          }).filter(Boolean);
        }

        if (normalized.length > 0) setSlots(normalized);
        else {
          const mock = generateMockSlots(date, totalDuration, location.state?.shop);
          setSlots(mock);
        }
      } catch (err) {
        console.error('Failed to load slots', err);
        const mock = generateMockSlots(date, totalDuration, location.state?.shop);
        setSlots(mock);
      }
    };

    const loadShop = async () => {
      // prefer shop passed in state
      if (location.state?.shop) {
        setShop(location.state.shop);
        return;
      }

      if (!resolvedShopId) return;

      try {
        const s = await getShopById(resolvedShopId);
        setShop(s);
      } catch (e) {
        console.error('Failed to load shop', e);
      }
    };

    loadSlots();
    loadShop();
  }, [params, location, date, totalDuration]);

  // Reset selection when the user changes the date
  useEffect(() => {
    setSelectedSlot(null);
  }, [date]);

  // helper to create simple mock slots
  function generateMockSlots(dateStr, duration, shopObj) {
    // Use shop opening/closing if available, else defaults
    const opening = (shopObj && shopObj.openingTime) || '10:00';
    const closing = (shopObj && shopObj.closingTime) || '20:00';
    const capacity = (shopObj && shopObj.chairs) || 1;

    const [oh, om] = opening.split(':').map(Number);
    const [ch, cm] = closing.split(':').map(Number);

    const startMinutes = oh * 60 + om;
    const endMinutes = ch * 60 + cm;

    const slots = [];
    let cursor = startMinutes;
    while (cursor + duration <= endMinutes && slots.length < 18) {
      const s = minutesToHHMM(cursor);
      const e = minutesToHHMM(cursor + duration);
      slots.push({ 
        start: s, 
        end: e, 
        capacity: capacity, 
        booked: 0, 
        available: capacity 
      });
      cursor += duration + (shopObj?.slotBuffer || 5);
    }
    return slots;
  }
  function minutesToHHMM(m) {
    const hh = Math.floor(m / 60).toString().padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-xl mx-auto pb-32 sm:pb-36">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">Select Time Slot</h1>

      {/* Date Picker */}
      <div className="mb-4 sm:mb-6">
        <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1.5 sm:mb-2">
          Select Date
          {date === new Date().toISOString().slice(0, 10) && (
            <span className="ml-2 text-xs text-green-600 font-semibold">• Today</span>
          )}
        </label>

        <input
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Slot Picker */}
      <SlotPicker date={date} slots={slots} selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot} />

      <ShopClosedModal
        open={closedInfo.closed}
        reason={closedInfo.reason}
        onClose={() => setClosedInfo({ closed: false, reason: '' })}
      />

      {/* CTA */}
      {selectedSlot && (
        <div
          role="region"
          aria-label="Booking continue"
          className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 sm:p-4"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold">{formatTime(selectedSlot.start)} – {formatTime(selectedSlot.end)}</p>
              {selectedSlot.available !== undefined && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {selectedSlot.available} seat{selectedSlot.available !== 1 ? 's' : ''} available
                </p>
              )}
            </div>

            <button
              className="w-full sm:w-auto bg-[#1F7A8C] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all text-sm sm:text-base font-semibold"
              aria-label="Proceed to confirmation"
              onClick={() => {
                navigate("/confirm-booking", {
                  state: {
                    shop,
                    services: selectedServices,
                    slot: { start: selectedSlot.start, end: selectedSlot.end },
                    date,
                  },
                });
              }}
            >
              Proceed to confirmation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
