import { Plus, Minus, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

interface RegattaWeekCardProps {
  key?: number;
  weekNum: number;
  theme: string;
  startDateStr: string;
  value: number;
  onChange: (val: number) => void;
}

export default function RegattaWeekCard({
  weekNum,
  theme,
  startDateStr,
  value,
  onChange,
}: RegattaWeekCardProps) {
  const MIN_POINTS = 1500;

  // Compute dates safely
  const getWeekDateRange = () => {
    if (!startDateStr) return 'Select start date above';
    try {
      const parts = startDateStr.split('-');
      if (parts.length !== 3) return '';
      
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      const start = new Date(year, month, day);
      start.setDate(start.getDate() + (weekNum - 1) * 7);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      const formatDate = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      return `${formatDate(start)} to ${formatDate(end)}`;
    } catch (e) {
      return '';
    }
  };

  const handleAdjust = (amount: number) => {
    const newVal = Math.max(0, value + amount);
    onChange(newVal);
  };

  const handleSetTarget = () => {
    onChange(MIN_POINTS);
  };

  const pointsAboveMin = Math.max(0, value - MIN_POINTS);
  const avgPerDay = Math.round(value / 7);
  const isPassed = value >= MIN_POINTS;

  return (
    <div
      id={`week-card-${weekNum}`}
      className={`border rounded-2xl p-5 shadow-sm transition-all duration-300 group ${
        isPassed
          ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-500/30 dark:shadow-[0_0_15px_rgba(16,185,129,0.04)]'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-500/80'
      }`}
    >
      {/* Card Header with Week Title, Date range, and Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
            <span className="text-sky-500 dark:text-sky-400">⛵</span>
            {theme || 'Regatta'} Week {weekNum}/4
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {getWeekDateRange()}
          </p>
        </div>

        {/* Goal Badge */}
        <div>
          {isPassed ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.1)] animate-pulse-slow">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Goal Reached
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-100 dark:border-amber-500/20">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              In Progress
            </span>
          )}
        </div>
      </div>

      {/* Grid Inputs & Telemetry Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Main Touch Controls Block */}
        <div className="md:col-span-7 space-y-3.5">
          <label htmlFor={`points-input-${weekNum}`} className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest block">
            Points Entry
          </label>
          
          <div className="flex items-stretch gap-2.5">
            {/* Minus Button (Touch targeted min 44px height) */}
            <button
              id={`btn-dec-100-w${weekNum}`}
              onClick={() => handleAdjust(-100)}
              disabled={value <= 0}
              className="w-12 sm:w-14 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-850 flex items-center justify-center font-bold text-lg select-none disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-950 cursor-pointer active:scale-95 transition-all"
              style={{ minHeight: '48px' }}
              title="Decrease by 100"
              aria-label="Decrease points by 100"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Direct Value input */}
            <div className="relative flex-1">
              <input
                id={`points-input-${weekNum}`}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value || ''}
                placeholder="0"
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10);
                  onChange(isNaN(parsed) ? 0 : Math.max(0, parsed));
                }}
                className="w-full h-full text-center text-xl sm:text-2xl font-black rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder-slate-300 dark:placeholder-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ minHeight: '48px' }}
              />
            </div>

            {/* Plus Button (Touch targeted min 44px height) */}
            <button
              id={`btn-inc-100-w${weekNum}`}
              onClick={() => handleAdjust(100)}
              className="w-12 sm:w-14 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-850 flex items-center justify-center font-bold text-lg select-none cursor-pointer active:scale-95 transition-all"
              style={{ minHeight: '48px' }}
              title="Increase by 100"
              aria-label="Increase points by 100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Adjustment Pills/Shortcuts */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              id={`quick-add-100-w${weekNum}`}
              onClick={() => handleAdjust(100)}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-blue-50 dark:bg-slate-950 hover:bg-blue-100 dark:hover:bg-slate-800 text-blue-600 dark:text-sky-400 border border-blue-100/50 dark:border-slate-800 transition-colors cursor-pointer"
            >
              +100
            </button>
            <button
              id={`quick-add-500-w${weekNum}`}
              onClick={() => handleAdjust(500)}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-blue-50 dark:bg-slate-950 hover:bg-blue-100 dark:hover:bg-slate-800 text-blue-600 dark:text-sky-400 border border-blue-100/50 dark:border-slate-800 transition-colors cursor-pointer"
            >
              +500
            </button>
            <button
              id={`quick-sub-100-w${weekNum}`}
              disabled={value < 100}
              onClick={() => handleAdjust(-100)}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              -100
            </button>
            <button
              id={`quick-sub-500-w${weekNum}`}
              disabled={value < 500}
              onClick={() => handleAdjust(-500)}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              -500
            </button>
            <button
              id={`quick-set-goal-w${weekNum}`}
              onClick={handleSetTarget}
              className={`px-3 py-1.5 text-[11px] font-extrabold rounded-lg border transition-colors cursor-pointer ml-auto ${
                isPassed
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
              }`}
            >
              Set 1500 Target
            </button>
          </div>
        </div>

        {/* Weekly Stats Indicators */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3.5 bg-slate-50/50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 self-stretch flex items-center">
          <div className="text-center md:text-left space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Target Surplus</span>
            <span className={`text-base font-black flex items-center justify-center md:justify-start gap-0.5 ${pointsAboveMin > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {pointsAboveMin > 0 ? `+${pointsAboveMin.toLocaleString()}` : '0'}
              {pointsAboveMin > 0 && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
            </span>
            <span className="text-[9px] text-slate-400 block font-medium">above target</span>
          </div>

          <div className="text-center md:text-left border-l border-slate-100 dark:border-slate-800/80 pl-3.5 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Avg. Per Day</span>
            <span className="text-base font-black text-slate-700 dark:text-slate-200 block">
              {value > 0 ? avgPerDay.toLocaleString() : '0'}
            </span>
            <span className="text-[9px] text-slate-400 block font-medium">points per day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
