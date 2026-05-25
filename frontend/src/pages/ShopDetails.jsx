import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShopById } from "../api/shop.api";
import ServiceSelector from "../components/booking/ServiceSelector";
import ShopClosedModal from "../components/ui/ShopClosedModal";
import { Card, Button, Badge } from "../components/ui";

const ShopDetails = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [closedInfo, setClosedInfo] = useState({ closed: false, reason: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await getShopById(id);
      setShop(data);
    };
    load();
  }, [id]);

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="text-body text-neutral-600">Loading shop details…</p>
        </div>
      </div>
    );
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-accent-50 pb-40">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Shop Header Card */}
        <Card shadow="lg" className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-h2 font-bold text-neutral-900">{shop.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={shop.type === 'MALE' ? 'primary' : shop.type === 'FEMALE' ? 'accent' : 'secondary'}>
                  {shop.type === 'MALE' ? '👨 Male Barber' : shop.type === 'FEMALE' ? '👩 Female Salon' : '👥 Unisex'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-sm font-semibold text-neutral-900">{shop.rating || 4.8}</div>
              <div className="text-caption text-neutral-600">{shop.reviews || 128} reviews</div>
            </div>
          </div>

          {/* Shop Details */}
          <div className="border-t border-neutral-200 pt-4 space-y-2">
            <div className="flex gap-2">
              <span>📍</span>
              <p className="text-body-small text-neutral-700">{shop.location || 'Shop location'}</p>
            </div>
            <div className="flex gap-2">
              <span>🕐</span>
              <p className="text-body-small text-neutral-700">{shop.openTime || '10:00 AM'} - {shop.closeTime || '8:00 PM'}</p>
            </div>
            {shop.description && (
              <div className="flex gap-2">
                <span>ℹ️</span>
                <p className="text-body-small text-neutral-700">{shop.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Services Section */}
        <div>
          <h2 className="text-h4 font-bold text-neutral-900 mb-4">Select Services</h2>
          <ServiceSelector services={shop.services} selected={selectedServices} onChange={setSelectedServices} />
        </div>

        {/* Selected Services Summary */}
        {selectedServices.length > 0 && (
          <Card shadow="md" className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 space-y-4">
            <h3 className="text-h4 font-bold text-primary-900">Selected Services ({selectedServices.length})</h3>
            <div className="space-y-2">
              {selectedServices.map((s) => (
                <div key={s._id} className="flex justify-between items-center">
                  <span className="text-body-small font-semibold text-primary-900">{s.name}</span>
                  <div className="flex gap-3 text-body-small">
                    <span className="text-primary-700">⏱️ {s.duration || 30}m</span>
                    <span className="font-bold text-primary-600">₹{s.price}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-primary-200 pt-4 flex justify-between items-center">
              <div>
                <p className="text-label text-primary-700">Total Duration:</p>
                <p className="text-h4 font-bold text-primary-900">{totalDuration} mins</p>
              </div>
              <div>
                <p className="text-label text-primary-700">Total Price:</p>
                <p className="text-h4 font-bold text-primary-600">₹{totalPrice}</p>
              </div>
            </div>
          </Card>
        )}

        <ShopClosedModal open={closedInfo.closed} reason={closedInfo.reason} onClose={() => setClosedInfo({ closed: false, reason: '' })} />
      </div>

      {/* Sticky Bottom CTA */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl">
          <div className="max-w-2xl mx-auto p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-primary-600 text-h4">₹{totalPrice}</p>
              <p className="text-caption text-neutral-600">{totalDuration} mins • {selectedServices.length} service(s)</p>
            </div>
            <Button
              size="lg"
              variant="primary"
              onClick={() =>
                navigate(`/booking/${shop._id}`, {
                  state: { services: selectedServices, shop }
                })
              }
            >
              Continue Booking →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetails;
