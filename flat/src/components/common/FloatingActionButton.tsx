import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactElement<LucideIcon>;
  label: string;
  variant?: 'primary' | 'secondary';
  position?: 'first' | 'second' | 'third';
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const positionClasses = {
  first: 'bottom-8',
  second: 'bottom-24',
  third: 'bottom-40',
};

const variantClasses = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white',
  secondary: 'bg-white text-gray-700 border border-gray-200',
};

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
    dragImage.innerHTML = `<span style="font-size: 11px; color: #1e40af; font-weight: 500;">${label}</span>`;
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 25, 15);
    
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
    
    e.currentTarget.classList.add('opacity-50');
    onDragStart(e);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    if (!draggable || !onDragEnd) return;
    e.currentTarget.classList.remove('opacity-50');
    onDragEnd(e);
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed ${positionClasses[position]} right-8 
        ${variantClasses[variant]}
        rounded-full transition-all duration-300 shadow-lg hover:shadow-xl 
        flex items-center justify-center overflow-hidden z-50 group
        ${draggable ? 'cursor-move' : ''}
        ${className}
      `}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center gap-0 group-hover:gap-2 transition-all duration-300 px-4 py-4 group-hover:pr-5">
        {React.cloneElement(icon, { className: 'w-5 h-5 flex-shrink-0' })}
        <span className="max-w-0 group-hover:max-w-[100px] overflow-hidden whitespace-nowrap transition-all duration-300 font-medium text-sm">
          {label}
        </span>
      </div>
    </button>
  );
};

export default FloatingActionButton;