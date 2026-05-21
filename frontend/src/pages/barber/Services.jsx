import { useEffect, useState } from "react";
import ServicesManager from "../../components/barber/ServicesManager";
import { getMyShop } from "../../api/barber.api";
import { useBarberGuard } from "../../hooks/useBarberGuard";

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

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Services</h1>
      <ServicesManager shop={shop} setShop={setShop} />
    </div>
  );
};

export default Services;
