import { useState } from "react";
import api from "../../api/axios";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/barber/shop", form);
      // update user.shop in localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      user.shop = res.data.shop._id;
      localStorage.setItem("user", JSON.stringify(user));
      window.location = "/barber/today";
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create shop");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 flex items-center justify-center p-4">
      <Card shadow="2xl" className="w-full max-w-md">
        <CardHeader className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-xl">
          <CardTitle>Setup Your Shop</CardTitle>
        </CardHeader>

        <CardBody className="space-y-4">
          <div>
            <p className="text-body text-neutral-700 font-medium">🎉 Welcome to TrimTime!</p>
            <p className="text-body-small text-neutral-600 mt-1">Complete your shop setup to start receiving bookings.</p>
          </div>

          {error && (
            <Alert variant="error" title="Setup Error" message={error} />
          )}

          <div className="space-y-3">
            <Input
              label="Shop Name"
              placeholder="E.g., John's Barber Shop"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <div>
              <label className="text-label font-semibold text-neutral-700 block mb-2">Shop Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="MALE">👨 Male (Barber Shops)</option>
                <option value="FEMALE">👩 Female (Salons)</option>
                <option value="UNISEX">👥 Unisex (Mixed Services)</option>
              </select>
            </div>

            <Input
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />

            <Input
              label="Shop Address"
              placeholder="123 Main Street, City"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />

            <Input
              label="Number of Chairs/Capacity"
              type="number"
              min="1"
              value={form.chairs}
              onChange={e => setForm({ ...form, chairs: parseInt(e.target.value) || 1 })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-label font-semibold text-neutral-700 block mb-2">Opening Time</label>
                <input
                  type="time"
                  value={form.openingTime}
                  onChange={e => setForm({ ...form, openingTime: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-label font-semibold text-neutral-700 block mb-2">Closing Time</label>
                <input
                  type="time"
                  value={form.closingTime}
                  onChange={e => setForm({ ...form, closingTime: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            onClick={submit}
            disabled={!form.name || !form.phone || !form.address}
          >
            ✓ Create Shop
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShopSetup;
