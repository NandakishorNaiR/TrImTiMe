import React from 'react';
import GlassCard from '../ui/GlassCard';
import { formatDate, formatTime } from '../../utils/time';
import { formatCurrency } from '../../utils/format';

const BookingSummary = ({ shop, services = [], slot, date, platformFee = 0 }) => {
  const servicesTotal = services.reduce((s, it) => s + (it.price || 0), 0);
  const total = servicesTotal + (platformFee || 0);

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex justify-between">
          <div>
            <p className="font-semibold text-gray-900">{shop?.name}</p>
            <p className="text-sm text-gray-500">📅 {formatDate(date)} • ⏰ {formatTime(slot.start)}{slot.end ? ` – ${formatTime(slot.end)}` : ''}</p>
            {shop?.address && <p className="text-xs text-gray-500 mt-1">📍 {shop.address}</p>}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="font-medium mb-2">Selected Services</p>
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.name} className="flex justify-between text-sm">
              <span>{s.name}</span>
              <span>₹{s.price}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="text-sm">
          <div className="flex justify-between mb-2">
            <span>Services total</span>
            <span>{formatCurrency(servicesTotal)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Platform fee</span>
            <span>{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total payable</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default BookingSummary;
