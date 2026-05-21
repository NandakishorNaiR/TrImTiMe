import { useState } from "react";
import { addService, updateService, deleteService } from "../../api/barber.api";

const ServicesManager = ({ shop, setShop }) => {
  const [form, setForm] = useState({ name: "", price: "", duration: "" });
  const [editIndex, setEditIndex] = useState(null);

  const validate = () => {
    if (!form.name) return "Name required";
    if (!form.price || form.price <= 0) return "Price must be > 0";
    if (!form.duration || form.duration < 10) return "Duration min 10 min";
    return null;
  };

  const save = async () => {
    const error = validate();
    if (error) return alert(error);

    try {
      let services;
      if (editIndex === null) {
        services = await addService(form);
      } else {
        services = await updateService(editIndex, form);
      }

      setShop({ ...shop, services });
      setForm({ name: "", price: "", duration: "" });
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save service");
    }
  };

  const remove = async (i) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      const services = await deleteService(i);
      setShop({ ...shop, services });
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="border rounded-xl p-4 mt-4">
      <h2 className="font-semibold mb-3">Services</h2>

      {editIndex !== null && (
        <div className="mb-3 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
          ⚠️ Changing duration affects future availability only. Existing bookings will not change.
        </div>
      )}

      {Array.isArray(shop.services) && shop.services.map((s, i) => (
        <div key={i} className="flex justify-between items-center mb-2">
          <span>
            {s.name} • ₹{s.price} • {s.duration} min
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setForm({ name: s.name, price: s.price, duration: s.duration });
                setEditIndex(i);
              }}
              className="text-xs text-blue-600"
            >
              Edit
            </button>

            <button
              onClick={() => remove(i)}
              className="text-xs text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Form */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <input placeholder="Service"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border px-2 py-1 rounded" />

        <input type="number" placeholder="₹"
          value={form.price}
          onChange={e => setForm({ ...form, price: +e.target.value })}
          className="border px-2 py-1 rounded" />

        <input type="number" placeholder="Min"
          value={form.duration}
          onChange={e => setForm({ ...form, duration: +e.target.value })}
          className="border px-2 py-1 rounded" />
      </div>

      <button
        onClick={save}
        className="mt-2 text-sm font-medium"
      >
        {editIndex === null ? "+ Add Service" : "Update Service"}
      </button>
    </div>
  );
};

export default ServicesManager;
