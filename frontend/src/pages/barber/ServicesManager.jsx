import { useState } from "react";

const ServicesManager = ({ services = [], onChange }) => {
  const [form, setForm] = useState({ name: "", price: "", duration: "" });

  const add = () => {
    if (!form.name || !form.price || !form.duration) return;
    const item = { name: form.name, price: Number(form.price), duration: Number(form.duration) };
    onChange([...services, item]);
    setForm({ name: "", price: "", duration: "" });
  };

  const remove = (index) => {
    onChange(services.filter((_, i) => i !== index));
  };

  return (
    <div className="border rounded-xl p-4 mb-4">
      <h2 className="font-semibold mb-3">Services</h2>

      {services.map((s, i) => (
        <div key={i} className="flex justify-between mb-2">
          <span>{s.name} • ₹{s.price} • {s.duration} min</span>
          <button onClick={() => remove(i)} className="text-red-600 text-xs">
            Remove
          </button>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-2 mt-3">
        <input placeholder="Service" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border px-2 py-1 rounded" />
        <input placeholder="₹" value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          className="border px-2 py-1 rounded" />
        <input placeholder="Min" value={form.duration}
          onChange={e => setForm({ ...form, duration: e.target.value })}
          className="border px-2 py-1 rounded" />
      </div>

      <button onClick={add} className="mt-2 text-sm text-black font-medium">
        + Add Service
      </button>
    </div>
  );
};

export default ServicesManager;
