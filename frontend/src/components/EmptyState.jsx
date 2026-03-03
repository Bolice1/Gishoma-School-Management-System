import React from 'react';
import './EmptyState.css';

export default function EmptyState({ 
  icon = '📭', 
  title = 'No items found', 
  message = 'Get started by creating your first item',
  action = null,
  actionLabel = 'Create'
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <button 
          className="empty-state-button" 
          onClick={action}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
