import { useState } from "react";
import api from "../../api/axios";
import GlassCard from "../ui/GlassCard";
import Button from "../Button";

const OfflineBookingForm = ({ shop, onBookingCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "10:00",
    paymentMethod: "COD"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate
      if (!form.customerName.trim()) throw new Error("Customer name required");
      if (!form.customerPhone.trim()) throw new Error("Customer phone required");
      if (!form.serviceId) throw new Error("Service required");

      // Get service name for backend fallback matching
      const selectedService = (shop.services || []).find(s => s._id?.toString() === form.serviceId || s.name === form.serviceId);
      const serviceName = selectedService?.name;

      const response = await api.post("/bookings/offline/create", {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        serviceId: form.serviceId,
        serviceName: serviceName,
        date: form.date,
        startTime: form.startTime,
        paymentMethod: form.paymentMethod
      });

      setSuccess(`✅ Offline booking created for ${form.customerName}`);
      setForm({
        customerName: "",
        customerPhone: "",
        serviceId: "",
        date: new Date().toISOString().slice(0, 10),
        startTime: "10:00",
        paymentMethod: "COD"
      });

      // Callback to refresh bookings
      if (onBookingCreated) {
        setTimeout(() => onBookingCreated(), 1500);
      }

      setTimeout(() => setIsOpen(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  if (!shop) return null;

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        ➕ Add Walk-in / Offline Booking
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Offline Booking</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  className="w-full border rounded-lg px-3 py-2"
                  pattern="\d{10}"
                  required
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium mb-1">Service *</label>
                <select
                  name="serviceId"
                  value={form.serviceId}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option key="select-default" value="">Select a service</option>
                  {(shop.services || []).map(s => (
                    <option key={s._id?.toString() || `service-${Math.random()}`} value={s._id || s.name}>
                      {s.name} • ₹{s.price} • {s.duration}min
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium mb-1">Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method *</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="ONLINE">Online Payment</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                  {success}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border rounded-lg px-4 py-2 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Booking"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </>
  );
};

export default OfflineBookingForm;
