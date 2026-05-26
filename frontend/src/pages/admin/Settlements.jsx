import { useEffect, useState } from "react";
import { getShopStats } from "../../api/admin.api";
import { Card, CardHeader, CardTitle, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency } from "../../utils/format";

const Settlements = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getShopStats();
        setData(res || []);
      } catch (e) {
        console.error('Load settlements failed', e);
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="text-body text-neutral-600">Loading settlements…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-neutral-900">💰 Shop Settlements</h1>
          <p className="text-body-small text-neutral-600 mt-1">View COD payments and settlement details for all shops</p>
        </div>

        {/* Settlements Table */}
        {data.length === 0 ? (
          <Card shadow="lg" className="text-center py-12">
            <CardBody>
              <p className="text-5xl mb-3">📊</p>
              <p className="text-body text-neutral-700 font-medium">No settlements yet</p>
              <p className="text-body-small text-neutral-600 mt-1">Settlement data will appear once shops start receiving bookings</p>
            </CardBody>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <Card shadow="lg">
              <CardHeader className="bg-primary-700 text-white rounded-t-xl border-b-0 -mx-6 -mt-6 mb-0">
                <CardTitle>Settlement Overview</CardTitle>
              </CardHeader>

              <CardBody className="p-0">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-neutral-200">
                        <th className="px-4 py-3 text-left font-semibold text-neutral-900">Shop Name</th>
                        <th className="px-4 py-3 text-center font-semibold text-neutral-900">COD Bookings</th>
                        <th className="px-4 py-3 text-right font-semibold text-neutral-900">COD Value</th>
                        <th className="px-4 py-3 text-right font-semibold text-neutral-900">COD Due (Fee)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((s, idx) => (
                        <tr key={s.shopId || idx} className="border-b border-neutral-200 hover:bg-primary-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-neutral-900">{s.shopName}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="secondary">{s.codCount || 0}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-bold text-accent-700">{formatCurrency(s.codValue || 0)}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className={`font-bold ${s.codDue > 0 ? 'text-danger-700' : 'text-neutral-500'}`}>
                              {formatCurrency(s.codDue || 0)}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Footer */}
                <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-label font-semibold text-neutral-700">Total Shops</p>
                      <p className="text-h5 font-bold text-primary-700 mt-1">{data.length}</p>
                    </div>
                    <div>
                      <p className="text-label font-semibold text-neutral-700">Total COD Value</p>
                      <p className="text-h5 font-bold text-accent-700 mt-1">
                        {formatCurrency(data.reduce((sum, s) => sum + (s.codValue || 0), 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-label font-semibold text-neutral-700">Total COD Due</p>
                      <p className="text-h5 font-bold text-danger-700 mt-1">
                        {formatCurrency(data.reduce((sum, s) => sum + (s.codDue || 0), 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settlements;
