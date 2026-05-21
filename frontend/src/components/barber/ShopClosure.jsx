import { useState } from "react";
import { closeShopForDay } from "../../api/barber.api";

const ShopClosure = () => {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Mocked impact preview data
  const impact = {
    bookings: 3,
    refunds: 270,
    payout: -240,
  };

  const handleClosure = async () => {
    try {
      setLoading(true);
      const res = await closeShopForDay({ date, reason });
      alert(`Shop closed successfully.\nAffected bookings: ${res.affectedBookings}`);
      setDate("");
      setReason("");
      setShowConfirm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close shop for the day");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">

      <button
        className="flex items-center gap-2 text-red-600 text-sm mb-1"
        onClick={() => setOpen((v) => !v)}
      >
        ⚠️ Emergency Actions
        <span>{open ? "▲" : "▼"}</span>
      </button>
      <div className="text-xs text-gray-500 mb-2 ml-1">
        Use when unexpected shutdown of shop occurs (e.g. emergency, strike, personal reason).
      </div>

      {open && (
        <div className="bg-white/60 backdrop-blur-xl border border-red-200 rounded-2xl p-5 shadow-sm mb-6">
          <div className="font-semibold text-red-700 mb-2">Emergency / Temporary Closure</div>
          <div className="text-sm text-gray-700 mb-4">
            This will temporarily close your shop for the selected date.<br />
            All bookings for that day will be automatically refunded.
          </div>
          <label className="block text-xs mb-1">Select Date</label>
          <input
            type="date"
            className="input mb-3"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <label className="block text-xs mb-1">Reason (optional)</label>
          <input
            className="input mb-3"
            placeholder="Hartal / Emergency / Personal"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
          {/* Impact Preview (mocked) */}
          <div className="text-xs text-gray-600 mb-3">
            <div className="font-semibold mb-1">Impact for selected date:</div>
            <ul className="list-disc ml-5">
              <li>Bookings affected: {impact.bookings}</li>
              <li>Refunds issued: ₹{impact.refunds}</li>
              <li>Payout impact: −₹{Math.abs(impact.payout)}</li>
            </ul>
          </div>
          <button
            className="w-full bg-red-600 text-white py-2 rounded mt-2"
            onClick={() => setShowConfirm(true)}
            disabled={loading || !date}
          >
            Close Shop for This Day
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-xl p-6 max-w-xs w-full shadow-lg">
            <div className="font-bold text-lg mb-2">Confirm Closure</div>
            <div className="mb-4 text-sm">
              Are you sure you want to close the shop on <b>{date || "selected date"}</b>?<br />
              <span className="text-red-600">This action cannot be undone.</span>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded bg-gray-200"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 rounded bg-red-600 text-white"
                onClick={handleClosure}
                disabled={loading}
              >
                {loading ? "Closing..." : "Confirm Closure"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopClosure;
