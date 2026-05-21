import React from 'react';

export const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-40 rounded-lg mb-4" />
    <div className="space-y-3">
      <div className="bg-gray-200 h-4 rounded w-3/4" />
      <div className="bg-gray-200 h-4 rounded w-1/2" />
    </div>
  </div>
);

export const SkeletonLine = ({ width = 'w-full' }) => (
  <div className="animate-pulse">
    <div className={`${width} bg-gray-200 h-4 rounded`} />
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(count).fill(0).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse space-y-4">
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array(cols).fill(0).map((_, j) => (
          <div key={j} className="flex-1 bg-gray-200 h-4 rounded" />
        ))}
      </div>
    ))}
  </div>
);
