import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyShop, updateMyShop, getMyShopStats } from "../../api/barber.api";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Alert } from "../../components/ui/Alert";
import ShopClosure from "../../components/barber/ShopClosure";

const ShopSettings = () => {
  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

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
    setSaving(true);
    try {
      await updateMyShop(shop);
      alert("✓ Shop details saved successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="text-4xl animate-spin">⏳</div>
        <p className="text-body text-neutral-600">Loading settings…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-neutral-900">Shop Settings</h1>
          <p className="text-body-small text-neutral-600 mt-1">Manage your shop details and preferences</p>
        </div>

        {/* Shop Overview Card */}
        <Card shadow="lg" className="bg-gradient-to-r from-primary-100 to-secondary-100 border-2 border-primary-200">
          <CardBody className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-h4 font-bold text-primary-900">{shop.name || "My Shop"}</p>
                <p className="text-body-small text-primary-700 mt-1">
                  {shop.type === 'MALE' ? '👨 Male Barber' : shop.type === 'FEMALE' ? '👩 Female Salon' : '👥 Unisex Shop'}
                </p>
              </div>
              <Badge variant="success">✓ Active</Badge>
            </div>
          </CardBody>
        </Card>

        {/* Shop Profile & Settings */}
        <Card shadow="lg">
          <CardHeader className="bg-primary-700 text-white rounded-t-xl border-b-0 -mx-6 -mt-6 mb-0">
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>

          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Shop Name"
                name="name"
                value={shop.name || ""}
                onChange={handleChange}
              />

              <div>
                <label className="text-label font-semibold text-neutral-700 block mb-2">Shop Type</label>
                <select
                  name="type"
                  value={shop.type || "UNISEX"}
                  onChange={handleChange}
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
                name="phone"
                value={shop.phone || ""}
                onChange={handleChange}
              />

              <Input
                label="Number of Chairs/Capacity"
                type="number"
                name="chairs"
                min="1"
                value={shop.chairs || 1}
                onChange={handleChange}
              />

              <Input
                label="Address"
                name="address"
                value={shop.address || ""}
                onChange={handleChange}
                className="md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-label font-semibold text-neutral-700 block mb-2">Opening Time</label>
                <input
                  type="time"
                  name="openingTime"
                  value={shop.openingTime || "10:00"}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-label font-semibold text-neutral-700 block mb-2">Closing Time</label>
                <input
                  type="time"
                  name="closingTime"
                  value={shop.closingTime || "20:00"}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* COD Toggle */}
            <div className="flex items-center justify-between p-3 bg-accent-50 rounded-lg border border-accent-200 mt-4">
              <div>
                <p className="font-medium text-neutral-900">Accept Cash on Delivery (COD)</p>
                <p className="text-body-small text-neutral-600">Allow customers to pay at the shop</p>
              </div>
              <input
                type="checkbox"
                checked={!!shop.acceptCOD}
                onChange={(e) => setShop({ ...shop, acceptCOD: e.target.checked })}
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
          </CardBody>

          <CardFooter>
            <Button
              variant="primary"
              fullWidth
              loading={saving}
              onClick={save}
            >
              ✓ Save Changes
            </Button>
          </CardFooter>
        </Card>

        {/* Statistics Card */}
        {stats && (
          <Card shadow="lg">
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>

            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                  <p className="text-caption text-primary-700 font-semibold">Online Collected</p>
                  <p className="text-h5 font-bold text-primary-900 mt-1">₹{stats.onlineRevenue || 0}</p>
                </div>

                <div className="bg-accent-50 p-3 rounded-lg border border-accent-200">
                  <p className="text-caption text-accent-700 font-semibold">COD Value</p>
                  <p className="text-h5 font-bold text-accent-900 mt-1">₹{stats.codValue || 0}</p>
                </div>

                <div className="bg-warning-50 p-3 rounded-lg border border-warning-200">
                  <p className="text-caption text-warning-700 font-semibold">COD Due (Fee)</p>
                  <p className="text-h5 font-bold text-warning-900 mt-1">₹{stats.codDue || 0}</p>
                </div>

                <div className="bg-success-50 p-3 rounded-lg border border-success-200">
                  <p className="text-caption text-success-700 font-semibold">Net Payout</p>
                  <p className="text-h5 font-bold text-success-900 mt-1">₹{stats.payout || 0}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Services Management */}
        <Card shadow="lg">
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900">📋 Manage Services</p>
              <p className="text-body-small text-neutral-600 mt-1">Update service prices and durations</p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/barber/services')}
            >
              Go to Services
            </Button>
          </CardBody>
        </Card>

        {/* Emergency Actions */}
        <div className="rounded-xl overflow-hidden">
          <ShopClosure />
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;
