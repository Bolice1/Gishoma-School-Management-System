import React from 'react';
import './SkeletonTable.css';

export default function SkeletonTable({ rows = 8, columns = 5 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-header">
        {Array(columns).fill(0).map((_, i) => (
          <div key={`header-${i}`} className="skeleton-cell skeleton-cell-header"></div>
        ))}
      </div>
      {Array(rows).fill(0).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="skeleton-row">
          {Array(columns).fill(0).map((_, colIdx) => (
            <div key={`cell-${rowIdx}-${colIdx}`} className="skeleton-cell"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
