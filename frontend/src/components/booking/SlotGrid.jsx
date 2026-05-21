import React from "react";
import { minutesToTime } from "../../utils/time";

// Accessible single slot button
const SlotButton = ({ slot, active, disabled, onSelect }) => {
  const label = typeof slot === 'number' ? minutesToTime(slot) : slot.start;
  const capacity = slot.available !== undefined ? slot.available : null;

  const handleKey = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(slot);
    }
  };

  return (
    <button
      type="button"
      role="gridcell"
      aria-pressed={!!active}
      aria-disabled={!!disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKey}
      onClick={() => !disabled && onSelect(slot)}
      className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg border text-xs sm:text-sm text-center leading-5 focus:outline-none focus:ring-2 focus:ring-offset-1 transition transform
        ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:shadow-lg active:scale-95'}
        ${active ? 'bg-primary text-white border-black' : ''}`}
    >
      <div>{label}</div>
      {capacity !== null && (
        <div className={`text-xs mt-0.5 sm:mt-1 ${active ? 'text-white' : 'text-gray-600'}`}>
          {capacity > 0 ? `${capacity} seat${capacity !== 1 ? 's' : ''}` : 'Full'}
        </div>
      )}
    </button>
  );
};

const SlotGrid = ({ slots = [], selected, onSelect, isToday }) => {
  const nowMin = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

  return (
    <div role="grid" aria-label="Available time slots" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
      {(slots || []).map((slot, idx) => {
        // Convert slot to standard format
        let slotObj = slot;
        if (typeof slot === "number") {
          const hh = Math.floor(slot / 60).toString().padStart(2, '0');
          const mm = (slot % 60).toString().padStart(2, '0');
          slotObj = { start: `${hh}:${mm}`, capacity: 1, available: 1 };
        }

        // Check if disabled (past time for today)
        const [slotHh, slotMm] = slotObj.start.split(':').map(Number);
        const slotMin = slotHh * 60 + slotMm;
        const disabled = isToday && slotMin <= nowMin + 10 && (!selected || selected.start !== slotObj.start);
        const active = selected && selected.start === slotObj.start;

        return (
          <SlotButton
            key={slotObj.start}
            slot={slotObj}
            active={active}
            disabled={disabled}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
};

export default SlotGrid;
