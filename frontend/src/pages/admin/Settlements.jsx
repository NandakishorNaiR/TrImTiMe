import { useEffect, useState } from "react";
import { getShopStats } from "../../api/admin.api";
import GlassCard from "../../components/ui/GlassCard";
import { formatCurrency } from "../../utils/format";

const Settlements = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getShopStats();
        setData(res || []);
      } catch (e) { console.error('Load settlements failed', e); }
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Shop Settlements</h1>

      <div className="overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Shop</th>
              <th className="px-4 py-2">COD Value</th>
              <th className="px-4 py-2">COD Count</th>
              <th className="px-4 py-2">COD Due</th>
            </tr>
          </thead>
          <tbody>
            {data.map(s => (
              <tr key={s.shopId} className="border-t text-center">
                <td className="px-4 py-2 text-left">{s.shopName}</td>
                <td className="px-4 py-2">{formatCurrency(s.codValue || 0)}</td>
                <td className="px-4 py-2">{s.codCount || 0}</td>
                <td className="px-4 py-2 text-red-600">{formatCurrency(s.codDue || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settlements;
