import React from 'react';
import { cn } from '../../utils/cn';
import './FloatingActionButton.css';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactElement;
  label: string;
  variant?: 'primary' | 'secondary';
  position?: 'first' | 'second' | 'third';
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
  variant = 'secondary',
  position = 'first',
  className = '',
  draggable = false,
  onDragStart,
  onDragEnd,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable || !onDragStart) return;
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'new-task');
    
    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.width = '50px';
    dragImage.style.height = '30px';
    dragImage.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
    dragImage.style.border = '2px dashed #3b82f6';
    dragImage.style.borderRadius = '6px';
    dragImage.style.display = 'flex';
    dragImage.style.alignItems = 'center';
    dragImage.style.justifyContent = 'center';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-9999px';
    dragImage.style.left = '-9999px';
    // Safe text content - prevents XSS attacks
    const span = document.createElement('span');
    span.style.fontSize = '11px';
    span.style.color = '#1e40af';
    span.style.fontWeight = '500';
    span.textContent = label; // Safe text assignment - no HTML parsing
    dragImage.appendChild(span);
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 25, 15);
    
    setTimeout(() => {
      try {
        // Safe DOM element removal with error handling
        if (dragImage && document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      } catch (error) {
        console.warn('Failed to remove drag image element:', error);
      }
    }, 0);
    
    e.currentTarget.classList.add('floating-action-button--dragging');
    onDragStart(e);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    if (!draggable || !onDragEnd) return;
    e.currentTarget.classList.remove('floating-action-button--dragging');
    onDragEnd(e);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'floating-action-button',
        `floating-action-button--${position}`,
        `floating-action-button--${variant}`,
        draggable && 'floating-action-button--draggable',
        className
      )}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="floating-action-button__content">
        {React.cloneElement(icon, { className: 'floating-action-button__icon' })}
        <span className="floating-action-button__label">
          {label}
        </span>
      </div>
    </button>
  );
};

export default FloatingActionButton;