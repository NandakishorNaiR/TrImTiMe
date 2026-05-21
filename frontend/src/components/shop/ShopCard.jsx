import { useNavigate } from "react-router-dom";
import GlassCard from "../ui/GlassCard";
import Badge from "../Badge";

const ShopCard = ({ shop }) => {
  const navigate = useNavigate();

  const minPrice = shop.services?.length
    ? Math.min(...shop.services.map((s) => s.price))
    : null;

  const maxPrice = shop.services?.length
    ? Math.max(...shop.services.map((s) => s.price))
    : null;

  const serviceCount = shop.services?.length || 0;

  return (
    <GlassCard
      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-4 sm:p-6 group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/shops/${shop._id}`); } }}
      onClick={() => navigate(`/shops/${shop._id}`)}
    >
      {/* Header with type badge and rating */}
      <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition truncate">{shop.name}</h2>
            {/* Shop type badge */}
            <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full font-semibold whitespace-nowrap ${
              shop.type === 'MALE'
                ? 'bg-blue-100 text-blue-700'
                : shop.type === 'FEMALE'
                ? 'bg-pink-100 text-pink-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {shop.type === 'MALE' ? '👨 Male' : shop.type === 'FEMALE' ? '👩 Female' : '👥 Unisex'}
            </span>
          </div>
          <p className="text-xs text-gray-500 capitalize">{shop.type || 'Unisex'} Salon</p>
        </div>
        <Badge variant="success" size="sm" className="whitespace-nowrap ml-1 sm:ml-2 flex-shrink-0">
          ⭐ {(shop.rating || 4.5).toFixed(1)}
        </Badge>
      </div>

      {/* Address */}
      {shop.address && (
        <div className="flex items-start gap-2 mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">📍</span>
          <p className="text-xs text-gray-600 leading-tight line-clamp-2">{shop.address}</p>
        </div>
      )}

      {/* Occupancy/Chairs */}
      {shop.chairs && (
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm text-gray-600">👥</span>
          <p className="text-xs text-gray-700">
            <span className="font-semibold">{shop.chairs}</span> {shop.chairs === 1 ? 'chair' : 'chairs'} available
          </p>
        </div>
      )}

      {/* Services info */}
      <div className="flex items-center gap-2 mb-2 sm:mb-3 py-1.5 sm:py-2 border-t border-b border-gray-100">
        <span className="text-xs sm:text-sm text-gray-600">📋</span>
        <p className="text-xs text-gray-700">
          <span className="font-semibold">{serviceCount}</span> service{serviceCount !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Price range */}
      {minPrice !== null && (
        <div className="mb-3 sm:mb-4">
          <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Price Range</p>
          <div className="text-sm sm:text-base font-bold text-blue-600">
            ₹{minPrice}
            {maxPrice && maxPrice !== minPrice && <span className="text-gray-600"> – ₹{maxPrice}</span>}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between group/link">
          <span className="text-xs sm:text-sm font-semibold text-blue-600">View Details</span>
          <span className="text-lg group-hover/link:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default ShopCard;
