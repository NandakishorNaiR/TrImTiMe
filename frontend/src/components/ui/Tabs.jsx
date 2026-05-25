/**
 * TAB COMPONENT - Tabbed Navigation
 */

import React, { useState } from 'react';

export const Tabs = ({ tabs = [], defaultActive = 0, onChange }) => {
  const [active, setActive] = useState(defaultActive);

  const handleTabChange = (index) => {
    setActive(index);
    onChange?.(index);
  };

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex gap-2 border-b border-neutral-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all duration-200 ${
              active === index
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs[active]?.content}
      </div>
    </div>
  );
};

export default Tabs;
