import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShopById } from "../api/shop.api";
import { getAvailableSlots } from "../api/slot.api";
import ServiceSelector from "../components/booking/ServiceSelector";
import SlotPicker from "../components/booking/SlotPicker";
import ShopClosedModal from "../components/ui/ShopClosedModal";

const ShopDetails = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [closedInfo, setClosedInfo] = useState({ closed: false, reason: '' });
  // removed inline slot picker and date here to avoid duplicate slot-selection UI
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await getShopById(id);
      setShop(data);
    };
    load();
  }, [id]);

  // availability is handled on the dedicated Booking page; avoid duplicate picker here

  if (!shop) {
    return <div className="p-3 sm:p-4 text-sm sm:text-base">Loading shop…</div>;
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration || 0), 0);

  return (
    <div className="p-3 sm:p-4 pb-28 sm:pb-32">
      <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">{shop.name}</h1>
        <p className="text-xs sm:text-sm text-gray-600 capitalize mt-0.5">👥 {shop.type} salon</p>
      </div>

      <ServiceSelector services={shop.services} selected={selectedServices} onChange={setSelectedServices} />

      {/* Slot selection and availability check moved to Booking page to avoid duplicate interfaces */}

      <ShopClosedModal open={closedInfo.closed} reason={closedInfo.reason} onClose={() => setClosedInfo({ closed: false, reason: '' })} />

      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-xl mx-auto p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold text-gray-900">₹{totalPrice} • {totalDuration} mins</p>
              <p className="text-xs text-gray-500 mt-0.5">{selectedServices.length} service(s) selected</p>
            </div>

            <button
              onClick={() =>
                navigate(`/booking/${shop._id}`, {
                  state: { services: selectedServices }
                })
              }
              className="bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 active:scale-95 transition-all whitespace-nowrap"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetails;
