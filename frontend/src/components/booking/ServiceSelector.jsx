const ServiceSelector = ({ services, selected, onChange }) => {
  const toggle = (service) => {
    const exists = selected.find((s) => s.name === service.name);
    if (exists) {
      onChange(selected.filter((s) => s.name !== service.name));
    } else {
      onChange([...selected, service]);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3 pb-32">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900">Services</h2>

      {services.map((s) => {
        const active = selected.some((x) => x.name === s.name);

        return (
          <div
            key={s.name}
            onClick={() => toggle(s)}
            className={`flex items-center justify-between rounded-lg sm:rounded-xl border p-3 sm:p-4 cursor-pointer transition active:scale-95
              ${active ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}
            `}
          >
            <div className="min-w-0">
              <p className="font-medium text-xs sm:text-base text-gray-900 truncate">{s.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.duration} mins</p>
            </div>

            <div className="text-right flex-shrink-0 ml-2">
              <p className="font-semibold text-xs sm:text-base text-gray-900">₹{s.price}</p>
              {active && (
                <span className="text-xs text-green-600 font-medium">✓ Selected</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ServiceSelector;
