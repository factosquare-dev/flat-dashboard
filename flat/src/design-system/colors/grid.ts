/**
 * Grid-specific color tokens
 * Used for schedule grids, tables, and other grid components
 */

export const gridColors = {
  // Cell backgrounds
  cell: {
    default: 'bg-white/50',
    weekend: 'bg-gray-50/80',
    today: 'bg-blue-50/30',
    hover: {
      default: 'hover:bg-blue-50/30',
      weekend: 'hover:bg-gray-100',
      today: 'hover:bg-blue-100/40',
    },
  },
  
  // Add factory row specific
  addFactory: {
    today: 'bg-blue-100/20',
    weekend: 'bg-gray-100/50',
    default: '',
  },
  
  // Borders
  border: {
    cell: 'border-gray-100',
    header: 'border-gray-200',
    divider: 'border-gray-300',
  },
  
  // Task cell colors
  task: {
    default: 'bg-gray-50/50',
    active: 'bg-blue-50/50',
    hover: 'hover:bg-gray-100/50',
    text: 'text-gray-900',
    textHover: 'hover:text-blue-600',
  },
  
  // Row colors
  row: {
    hover: 'hover:bg-gray-50/50',
    border: 'border-gray-100',
  },
  
  // Header colors
  header: {
    default: 'bg-gray-50',
    sticky: 'bg-white/95',
    month: 'bg-gray-100',
  },
} as const;

// Get cell background classes based on state
export function getCellBackgroundClasses(isToday: boolean, isWeekend: boolean, isAddFactory: boolean = false) {
  if (isAddFactory) {
    if (isToday) return gridColors.addFactory.today;
    if (isWeekend) return gridColors.addFactory.weekend;
    return gridColors.addFactory.default;
  }
  
  if (isToday) return gridColors.cell.today;
  if (isWeekend) return gridColors.cell.weekend;
  return gridColors.cell.default;
}

// Get cell hover classes based on state
export function getCellHoverClasses(isToday: boolean, isWeekend: boolean) {
  if (isToday) return gridColors.cell.hover.today;
  if (isWeekend) return gridColors.cell.hover.weekend;
  return gridColors.cell.hover.default;
}