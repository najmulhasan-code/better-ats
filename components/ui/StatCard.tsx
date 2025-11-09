import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  /** Label for the statistic being displayed */
  title: string;
  /** The numerical or string value to display */
  value: string | number;
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Optional trend direction indicator */
  trend?: 'up' | 'down';
  /** Optional trend value to display (e.g., "+12%") */
  trendValue?: string;
}

/**
 * StatCard - Reusable statistics display card
 * Shows a single metric with an icon, value, and optional trend indicator
 * Used across jobs, candidates, and other list pages for key metrics
 *
 * @example
 * <StatCard
 *   title="Total Jobs"
 *   value={42}
 *   icon={Briefcase}
 *   trend="up"
 *   trendValue="+8%"
 * />
 */
export default function StatCard({ title, value, icon: Icon, trend, trendValue }: StatCardProps) {
  return (
    <div className="group bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 group-hover:scale-110 transition-all duration-300">
          <Icon size={24} className="text-slate-700" strokeWidth={2.5} />
        </div>
        {trend && trendValue && (
          <div className={`text-sm font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{value}</p>
      <p className="text-sm text-slate-600 font-semibold">{title}</p>
    </div>
  );
}
