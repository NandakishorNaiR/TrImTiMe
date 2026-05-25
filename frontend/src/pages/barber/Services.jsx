import { useEffect, useState } from "react";
import ServicesManager from "../../components/barber/ServicesManager";
import { getMyShop } from "../../api/barber.api";
import { useBarberGuard } from "../../hooks/useBarberGuard";
import { Card, CardHeader, CardTitle, CardBody } from "../../components/ui/Card";

const Services = () => {
  useBarberGuard();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyShop();
        setShop(data || { services: [] });
      } catch (err) {
        console.error(err);
        alert("Failed to load shop");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="text-4xl animate-spin">⏳</div>
        <p className="text-body text-neutral-600">Loading services…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-neutral-900">Services</h1>
          <p className="text-body-small text-neutral-600 mt-1">Manage service prices and durations</p>
        </div>

        {/* Services Manager Card */}
        <Card shadow="lg">
          <CardHeader className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-xl">
            <CardTitle>Service Catalog</CardTitle>
          </CardHeader>
          <CardBody>
            <ServicesManager shop={shop} setShop={setShop} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Services;
