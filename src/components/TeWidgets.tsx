import React from 'react';

// Apple Live Activity / Status Indicator
export const TeTapeReel: React.FC<{ active?: boolean; size?: 'sm' | 'md' }> = ({ active = true, size = 'sm' }) => {
  const isSm = size === 'sm';
  return (
    <div className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/90 border border-black/[0.08] shadow-xs select-none ${isSm ? 'text-[11px]' : 'text-xs'}`}>
      <span className="relative flex h-2 w-2">
        {active && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-75" />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34c759]" />
      </span>
      <span className="text-[#1d1d1f] font-medium tracking-tight">Active Engine</span>
    </div>
  );
};

// Apple Metric Gauge / Activity Meter
export const TeVuMeter: React.FC<{ value: number; max?: number; color?: 'orange' | 'cyan' | 'green' }> = ({
  value,
  max = 100,
  color = 'orange',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getColorClass = () => {
    if (color === 'green') return 'bg-[#34c759]';
    if (color === 'cyan') return 'bg-[#0071e3]';
    return 'bg-[#ff9500]';
  };

  return (
    <div className="w-16 h-1.5 bg-black/[0.08] rounded-full overflow-hidden flex items-center">
      <div
        className={`h-full rounded-full transition-all duration-300 ${getColorClass()}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Apple HIG Parameter Capsule
export const TeParamPill: React.FC<{
  label: string;
  value: string | number;
  variant?: 'orange' | 'cyan' | 'green' | 'amber' | 'bone';
}> = ({ label, value, variant = 'bone' }) => {
  const colors = {
    orange: 'bg-orange-50 text-[#c97500] border-orange-200/60',
    cyan: 'bg-blue-50 text-[#0071e3] border-blue-200/60',
    green: 'bg-emerald-50 text-[#248a3d] border-emerald-200/60',
    amber: 'bg-amber-50 text-[#b45309] border-amber-200/60',
    bone: 'bg-black/[0.04] text-[#424245] border-black/[0.08]',
  };

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${colors[variant]}`}>
      <span className="opacity-70 text-[10px] uppercase">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

// Apple Activity Ring Gauge Widget
export const TeDial: React.FC<{ label: string; value: string; deg?: number; color?: string }> = ({
  label,
  value,
  color = '#0071e3',
}) => {
  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative w-8 h-8 rounded-full border-2 border-black/[0.08] flex items-center justify-center bg-white shadow-xs">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] text-[#86868b] uppercase tracking-wide mt-1">{label}</span>
      <span className="text-xs text-[#1d1d1f] font-semibold">{value}</span>
    </div>
  );
};
