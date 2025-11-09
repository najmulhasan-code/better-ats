interface FilterButtonProps {
  /** Display text for the filter button */
  label: string;
  /** Number of items matching this filter */
  count: number;
  /** Whether this filter is currently active */
  isActive: boolean;
  /** Callback function when button is clicked */
  onClick: () => void;
  /** Visual variant for different use cases */
  variant?: 'primary' | 'success' | 'warning' | 'default';
}

/**
 * FilterButton - Reusable filter button with count badge
 * Used for filtering lists by status, category, or other criteria
 * Shows count of items matching the filter
 *
 * @example
 * <FilterButton
 *   label="Active"
 *   count={12}
 *   isActive={filter === 'active'}
 *   onClick={() => setFilter('active')}
 *   variant="success"
 * />
 */
export default function FilterButton({
  label,
  count,
  isActive,
  onClick,
  variant = 'default'
}: FilterButtonProps) {
  const getVariantClasses = () => {
    if (isActive) {
      switch (variant) {
        case 'primary':
          return 'bg-slate-900 text-white shadow-lg shadow-slate-900/20';
        case 'success':
          return 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30';
        case 'warning':
          return 'bg-amber-600 text-white shadow-lg shadow-amber-600/30';
        default:
          return 'bg-slate-700 text-white shadow-lg shadow-slate-700/30';
      }
    }

    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-2 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-2 border-slate-200';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 ${getVariantClasses()}`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );
}
