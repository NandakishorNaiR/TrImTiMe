import { useState } from "react";
import api from "../../api/axios";

const ShopSetup = () => {
  const [form, setForm] = useState({
    name: "",
    type: "UNISEX",
    phone: "",
    address: "",
    openingTime: "10:00",
    closingTime: "20:00",
    chairs: 1
  });

  const submit = async () => {
    try {
      const res = await api.post("/barber/shop", form);
      // update user.shop in localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      user.shop = res.data.shop._id;
      localStorage.setItem("user", JSON.stringify(user));
      window.location = "/barber/today";
    } catch (e) {
      alert(e.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow">
        <div className="text-center text-base text-gray-700 mb-2 font-semibold">
          Complete your shop setup to start receiving bookings.
        </div>
        <h1 className="text-xl font-bold text-center mb-2">Setup Your Shop</h1>

        <input
          className="input mt-3"
          placeholder="Shop Name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <select
          className="input mt-3"
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
        >
          <option value="MALE">👨 Male (Barber Shops)</option>
          <option value="FEMALE">👩 Female (Salons)</option>
          <option value="UNISEX">👥 Unisex (Mixed Services)</option>
        </select>
        <input
          className="input mt-3"
          placeholder="Phone"
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="input mt-3"
          placeholder="Address"
          onChange={e => setForm({ ...form, address: e.target.value })}
        />
        <input
          type="number"
          className="input mt-3"
          placeholder="Number of Chairs/Capacity"
          min="1"
          value={form.chairs}
          onChange={e => setForm({ ...form, chairs: parseInt(e.target.value) || 1 })}
        />
        <div className="flex gap-3 mt-3">
          <input
            type="time"
            className="input"
            value={form.openingTime}
            onChange={e => setForm({ ...form, openingTime: e.target.value })}
          />
          <input
            type="time"
            className="input"
            value={form.closingTime}
            onChange={e => setForm({ ...form, closingTime: e.target.value })}
          />
        </div>
        <button
          onClick={submit}
          className="mt-5 w-full bg-black text-white py-2 rounded"
        >
          Create Shop
        </button>
      </div>
    </div>
  );
};

export default ShopSetup;
