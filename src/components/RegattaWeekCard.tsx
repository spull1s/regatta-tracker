import { Plus, Minus, ArrowUpRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { fireGoalConfetti } from '../lib/confetti';

interface RegattaWeekCardProps {
  key?: number;
  weekNum: number;
  theme: string;
  startDateStr: string;
  value: number;
  weeklyGoal?: number;
  onChange: (val: number) => void;
}

export default function RegattaWeekCard({
  weekNum,
  theme,
  startDateStr,
  value,
  weeklyGoal = 5000,
  onChange,
}: RegattaWeekCardProps) {
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
    if (value < weeklyGoal && newVal >= weeklyGoal) {
      fireGoalConfetti();
    }
    onChange(newVal);
  };

  const handleSetTarget = () => {
    if (value < weeklyGoal) {
      fireGoalConfetti();
    }
    onChange(weeklyGoal);
  };

  const pointsAboveMin = Math.max(0, value - weeklyGoal);
  const avgPerDay = Math.round(value / 7);
  const isPassed = value >= weeklyGoal;
  const progressPct = Math.min(100, Math.round((value / weeklyGoal) * 100));

  return (
    <div
      id={`week-card-${weekNum}`}
      className={`glass-panel border rounded-3xl p-5 md:p-6 transition-all duration-300 relative overflow-hidden group ${
        isPassed
          ? 'bg-white/80 dark:bg-slate-900/80 border-emerald-300 dark:border-emerald-500/40 glow-emerald'
          : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 hover:border-sky-500/80 dark:hover:border-sky-500/80 hover:glow-cyan'
      }`}
    >
      {/* Background Subtle Gradient Overlay */}
      <div className={`absolute inset-0 pointer-events-none opacity-10 transition-opacity ${isPassed ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-sky-500 to-indigo-500'}`} />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800/80 mb-4 relative z-10">
        <div>
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
            <span className="text-sky-500 dark:text-sky-400 text-lg">⛵</span>
            {theme || 'Regatta'} Week {weekNum}/4
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
            <span>📅</span> {getWeekDateRange()}
          </p>
        </div>

        {/* Goal Badge */}
        <div className="self-start sm:self-auto">
          {isPassed ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-emerald-500/30 glow-emerald animate-pulse-slow">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Goal Breached! (+{pointsAboveMin.toLocaleString()})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {progressPct}% ({value.toLocaleString()} / {weeklyGoal.toLocaleString()} pts)
            </span>
          )}
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="mb-5 relative z-10 space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span>Target Progress</span>
          <span className={isPassed ? 'text-emerald-500 font-black' : 'text-sky-400'}>
            {value.toLocaleString()} / {weeklyGoal.toLocaleString()} PTS ({progressPct}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800/80">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isPassed
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 glow-emerald'
                : 'bg-gradient-to-r from-sky-500 to-indigo-500 glow-cyan'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Single Column on Mobile (<640px), Multi-column on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
        {/* Main Touch Controls Block */}
        <div className="md:col-span-7 space-y-3.5">
          <label htmlFor={`points-input-${weekNum}`} className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-widest block">
            Points Adjustment
          </label>
          
          <div className="flex items-stretch gap-2.5">
            {/* Minus Button - Touch targeted min 48px height */}
            <button
              id={`btn-dec-100-w${weekNum}`}
              onClick={() => handleAdjust(-100)}
              disabled={value <= 0}
              className="w-14 shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-center font-black text-xl select-none disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all shadow-sm min-h-[48px]"
              title="Decrease by 100"
              aria-label="Decrease points by 100"
            >
              <Minus className="w-5 h-5" />
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
                  const newVal = isNaN(parsed) ? 0 : Math.max(0, parsed);
                  if (value < weeklyGoal && newVal >= weeklyGoal) {
                    fireGoalConfetti();
                  }
                  onChange(newVal);
                }}
                className="w-full h-full text-center text-2xl sm:text-3xl font-black rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder-slate-300 dark:placeholder-slate-800 min-h-[48px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Plus Button - Touch targeted min 48px height */}
            <button
              id={`btn-inc-100-w${weekNum}`}
              onClick={() => handleAdjust(100)}
              className="w-14 shrink-0 rounded-2xl bg-sky-500 dark:bg-sky-500/20 hover:bg-sky-600 dark:hover:bg-sky-500/30 text-white dark:text-sky-300 border border-sky-400/40 dark:border-sky-500/40 flex items-center justify-center font-black text-xl select-none cursor-pointer active:scale-95 transition-all shadow-md shadow-sky-500/20 min-h-[48px]"
              title="Increase by 100"
              aria-label="Increase points by 100"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Touch-Friendly Shortcuts */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              id={`quick-add-100-w${weekNum}`}
              onClick={() => handleAdjust(100)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-sky-50 dark:bg-slate-950 hover:bg-sky-100 dark:hover:bg-slate-800 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-slate-800 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              +100
            </button>
            <button
              id={`quick-add-500-w${weekNum}`}
              onClick={() => handleAdjust(500)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-sky-50 dark:bg-slate-950 hover:bg-sky-100 dark:hover:bg-slate-800 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-slate-800 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              +500
            </button>
            <button
              id={`quick-add-1000-w${weekNum}`}
              onClick={() => handleAdjust(1000)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              +1,000
            </button>
            <button
              id={`quick-sub-100-w${weekNum}`}
              disabled={value < 100}
              onClick={() => handleAdjust(-100)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-955 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              -100
            </button>
            <button
              id={`quick-set-goal-w${weekNum}`}
              onClick={handleSetTarget}
              className={`px-3.5 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ml-auto flex items-center gap-1.5 active:scale-95 shadow-sm ${
                isPassed
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Goal ({weeklyGoal.toLocaleString()})
            </button>
          </div>
        </div>

        {/* Weekly Stats Indicators */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3.5 bg-slate-50/80 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850 self-stretch flex items-center">
          <div className="text-center md:text-left space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Target Surplus</span>
            <span className={`text-base font-black flex items-center justify-center md:justify-start gap-0.5 ${pointsAboveMin > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {pointsAboveMin > 0 ? `+${pointsAboveMin.toLocaleString()}` : '0'}
              {pointsAboveMin > 0 && <ArrowUpRight className="w-4 h-4 stroke-[3]" />}
            </span>
            <span className="text-[9px] text-slate-400 block font-medium">above target goal</span>
          </div>

          <div className="text-center md:text-left border-l border-slate-200/60 dark:border-slate-800/80 pl-3.5 space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Avg. Per Day</span>
            <span className="text-base font-black text-slate-800 dark:text-slate-200 block">
              {value > 0 ? avgPerDay.toLocaleString() : '0'}
            </span>
            <span className="text-[9px] text-slate-400 block font-medium">pts / day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
