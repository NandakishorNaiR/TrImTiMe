import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyShop, updateMyShop, getMyShopStats } from "../../api/barber.api";
import GlassCard from "../../components/ui/GlassCard";
import ShopClosure from "../../components/barber/ShopClosure";

const ShopSettings = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const [stats, setStats] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const s = await getMyShopStats();
        setStats(s || null);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  const load = async () => {
    try {
      const data = await getMyShop();
      setShop(data || {});
    } catch (err) {
      console.error(err);
      if (err && err.response && err.response.status === 404) {
        navigate('/barber/shop-setup');
        return;
      }
      alert("Failed to load shop");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = value ? parseInt(value, 10) : 1;
    }
    setShop({ ...shop, [name]: newValue });
  };

  const save = async () => {
    try {
      await updateMyShop(shop);
      alert("Shop details saved");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6 py-6">
      {/* Shop Overview */}
      <GlassCard>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{shop.name || "My Shop"}</h1>
            <p className="text-sm text-gray-600">{shop.type ? `${shop.type.charAt(0).toUpperCase() + shop.type.slice(1)} Salon` : "Salon"} • ⭐ 4.6</p>
          </div>
          <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
            Open Today
          </span>
        </div>
      </GlassCard>

      {/* Shop Profile */}
      <GlassCard title="Shop Profile & Timings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Shop Name" name="name" value={shop.name || ""} onChange={handleChange} />
          <div>
            <label className="text-sm">Shop Type</label>
            <select
              name="type"
              value={shop.type || "UNISEX"}
              onChange={handleChange}
              className="input mt-1 w-full"
            >
              <option value="MALE">👨 Male (Barber Shops)</option>
              <option value="FEMALE">👩 Female (Salons)</option>
              <option value="UNISEX">👥 Unisex (Mixed Services)</option>
            </select>
          </div>
          <Input label="Phone" name="phone" value={shop.phone || ""} onChange={handleChange} />
          <Input label="Number of Chairs/Capacity" name="chairs" type="number" min="1" value={shop.chairs || 1} onChange={handleChange} />
          <Input label="Address" name="address" value={shop.address || ""} onChange={handleChange} className="md:col-span-2" />
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <label className="text-sm">Opening Time</label>
            <input type="time" className="input mt-1 w-full" name="openingTime" value={shop.openingTime || "10:00"} onChange={handleChange} />
          </div>
          <div className="flex-1">
            <label className="text-sm">Closing Time</label>
            <input type="time" className="input mt-1 w-full" name="closingTime" value={shop.closingTime || "20:00"} onChange={handleChange} />
          </div>
        </div>
        <div className="mt-4">
          <Toggle label="Accept Cash on Delivery" checked={!!shop.acceptCOD} onChange={(v) => setShop({ ...shop, acceptCOD: v })} />
        </div>
        {stats && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="border rounded p-3">
              <div className="text-xs text-gray-500">Online Collected</div>
              <div className="text-lg font-bold">₹{stats.onlineRevenue || 0}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs text-gray-500">COD Bookings Value</div>
              <div className="text-lg font-bold">₹{stats.codValue || 0}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs text-gray-500">COD Due (fee)</div>
              <div className="text-lg font-bold text-red-600">₹{stats.codDue || 0}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs text-gray-500">Net Payout</div>
              <div className="text-lg font-bold">₹{stats.payout || 0}</div>
            </div>
          </div>
        )}
        <button className="mt-4 px-4 py-2 bg-black text-white rounded" onClick={save}>
          Save Changes
        </button>
      </GlassCard>

      {/* Services Shortcut */}
      <GlassCard>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Services</h3>
            <p className="text-sm text-gray-600">Manage prices & duration</p>
          </div>
          <a href="/barber/services" className="px-4 py-2 border rounded-lg text-sm">
            Manage
          </a>
        </div>
      </GlassCard>

      {/* Emergency Actions */}
      <div className="mt-2">
        <ShopClosure />
      </div>
    </div>
  );
};

/* Reusable UI */

const Input = ({ label, className = "", ...props }) => (
  <div className={className}>
    <label className="text-xs text-gray-500">{label}</label>
    <input
      {...props}
      className={`border rounded-lg px-3 py-2 w-full mt-1 ${props.className || ""}`}
    />
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full p-1 transition ${
        checked ? "bg-black" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full transition ${
          checked ? "translate-x-6" : ""
        }`}
      />
    </button>
  </div>
);

export default ShopSettings;
