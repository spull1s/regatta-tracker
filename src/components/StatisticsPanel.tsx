import { useState } from 'react';
import { BarChart3, LineChart, Award, Calendar, ChevronRight, TrendingUp, Sparkles, Trash2, Trophy, Flame } from 'lucide-react';
import { RegattaHistoryItem, RegattaPoints } from '../types';

interface StatisticsPanelProps {
  history: RegattaHistoryItem[];
  currentPoints: RegattaPoints;
  currentTheme: string;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export default function StatisticsPanel({
  history,
  currentPoints,
  currentTheme,
  onDeleteHistoryItem,
  onClearAllHistory,
}: StatisticsPanelProps) {
  const [hoveredNode, setHoveredNode] = useState<{ idx: number; x: number; y: number; val: number; theme: string; date: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'alltime'>('current');

  // Math for current season
  const MIN_POINTS = 1500;
  const w1 = currentPoints[1] || 0;
  const w2 = currentPoints[2] || 0;
  const w3 = currentPoints[3] || 0;
  const w4 = currentPoints[4] || 0;
  const currentTotal = w1 + w2 + w3 + w4;

  const currentWeeks = [
    { label: 'Week 1', val: w1 },
    { label: 'Week 2', val: w2 },
    { label: 'Week 3', val: w3 },
    { label: 'Week 4', val: w4 },
  ];

  // All-time variables
  const totalSeasons = history.length;
  const allTimeSum = history.reduce((sum, r) => sum + r.totalPoints, 0);
  const averagePoints = totalSeasons > 0 ? Math.round(allTimeSum / totalSeasons) : 0;
  
  // Find highest performing season
  const bestSeason = totalSeasons > 0 
    ? [...history].sort((a, b) => b.totalPoints - a.totalPoints)[0] 
    : null;

  // Streak calculations (consecutive seasons achieving over 6000 total points or 4 passed weeks)
  const highPerformanceSeasons = history.filter(r => r.totalPoints >= 6000).length;

  // Render Current Week Progress Chart
  const maxCurrentPoints = Math.max(...currentWeeks.map(w => w.val), 2000);
  const chartHeight = 160;
  const chartWidth = 480;

  return (
    <div id="statistics-panel" className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Featured High Contrast Bento Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white dark:from-sky-950/40 dark:to-slate-900/80 border border-transparent dark:border-sky-500/20 p-5 rounded-3xl shadow-lg shadow-blue-500/5 dark:shadow-[0_0_20px_rgba(14,165,233,0.06)] relative overflow-hidden group col-span-2 sm:col-span-1">
          <div className="absolute top-0 right-0 p-3 text-white/10 dark:text-sky-400/5 group-hover:scale-110 transition-transform">
            <Trophy className="w-14 h-14" />
          </div>
          <span className="text-[10px] font-black text-blue-100 dark:text-sky-400 uppercase tracking-widest block">Season Score</span>
          <span className="text-3xl font-black text-white dark:text-slate-100 mt-1 block tracking-tight">
            {currentTotal.toLocaleString()} <span className="text-xs font-medium opacity-85">pts</span>
          </span>
          <p className="text-[10px] text-blue-100 dark:text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            {currentTotal >= 6000 ? 'All milestones cleared!' : `${Math.max(0, 6000 - currentTotal).toLocaleString()} to reach 6000`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/10 dark:text-emerald-400/5 group-hover:scale-110 transition-transform">
            <Calendar className="w-14 h-14" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Seasons Logged</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
            {totalSeasons} <span className="text-xs font-medium text-slate-500">archived</span>
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
            Preserved in browser cache
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-indigo-500/10 dark:text-indigo-400/5 group-hover:scale-110 transition-transform">
            <Award className="w-14 h-14" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Archived Average</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
            {averagePoints.toLocaleString()} <span className="text-xs font-medium text-slate-500">pts</span>
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
            Avg target: {MIN_POINTS * 4} per season
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-amber-500/10 dark:text-amber-400/5 group-hover:scale-110 transition-transform">
            <Trophy className="w-14 h-14" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Season Peak</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
            {bestSeason ? bestSeason.totalPoints.toLocaleString() : '0'} <span className="text-xs font-medium text-slate-500">pts</span>
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            {bestSeason ? `Held during "${bestSeason.theme}"` : 'Complete a season to peak!'}
          </p>
        </div>
      </div>

      {/* Charts Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">Interactive Performance Visualizers</h3>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl text-xs font-semibold self-start sm:self-auto border border-transparent dark:border-slate-850">
            <button
              id="chart-toggle-current"
              onClick={() => setActiveTab('current')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'current'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-750'
              }`}
            >
              Current Season
            </button>
            <button
              id="chart-toggle-alltime"
              disabled={history.length === 0}
              onClick={() => setActiveTab('alltime')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'alltime'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-750'
              }`}
            >
              Long-Term Trend ({history.length})
            </button>
          </div>
        </div>

        {activeTab === 'current' ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                Current Series: "{currentTheme || 'Regatta'}"
                <span className="bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  live telemetry
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Visualizing weekly progress. Goal: Cross the 1,500 pt threshold each week.
              </p>
            </div>

            {/* SVG bar chart for current season */}
            <div className="relative pt-6">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
                {/* Y-Axis Guidelines */}
                {[0, 0.5, 1, 1.5].map((mult, i) => {
                  const val = MIN_POINTS * mult;
                  const y = chartHeight - 20 - (val / maxCurrentPoints) * (chartHeight - 40);
                  return (
                    <g key={i} className="opacity-40 dark:opacity-20">
                      <line
                        x1="45"
                        y1={y}
                        x2={chartWidth - 10}
                        y2={y}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray={mult === 1 ? "0" : "3,3"}
                      />
                      <text
                        x="35"
                        y={y + 4}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="end"
                        fill="#64748b"
                      >
                        {val === MIN_POINTS ? '1,500 (Min)' : val.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* Target Score Line highlighted in glowing red/amber */}
                {(() => {
                  const targetY = chartHeight - 20 - (MIN_POINTS / maxCurrentPoints) * (chartHeight - 40);
                  return (
                    <g>
                      <line
                        x1="45"
                        y1={targetY}
                        x2={chartWidth - 10}
                        y2={targetY}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="4,2"
                        className="opacity-70"
                      />
                      <rect
                        x={chartWidth - 85}
                        y={targetY - 8}
                        width="75"
                        height="16"
                        rx="4"
                        fill="#fef3c7"
                        className="dark:fill-amber-950 opacity-90 stroke stroke-amber-200 dark:stroke-amber-900"
                        strokeWidth="1"
                      />
                      <text
                        x={chartWidth - 47}
                        y={targetY + 3}
                        fontSize="9"
                        fontWeight="black"
                        textAnchor="middle"
                        className="fill-amber-700 dark:fill-amber-300"
                      >
                        MIN GOAL 1500
                      </text>
                    </g>
                  );
                })()}

                {/* Dynamic Bars */}
                {currentWeeks.map((week, idx) => {
                  const colWidth = (chartWidth - 60) / 4;
                  const x = 55 + idx * colWidth + (colWidth - 45) / 2;
                  const barH = (week.val / maxCurrentPoints) * (chartHeight - 40);
                  const y = chartHeight - 20 - barH;
                  const isPassed = week.val >= MIN_POINTS;

                  return (
                    <g key={idx} className="group cursor-pointer">
                      {/* Interactive Hover Backdrop */}
                      <rect
                        x={55 + idx * colWidth}
                        y="10"
                        width={colWidth}
                        height={chartHeight - 30}
                        fill="transparent"
                        className="hover:fill-slate-50 dark:hover:fill-slate-800/10 transition-colors"
                      />

                      {/* Bar Shadow Effect */}
                      {week.val > 0 && (
                        <rect
                          x={x}
                          y={y}
                          width="45"
                          height={barH}
                          rx="6"
                          fill={isPassed ? '#10b981' : '#3b82f6'}
                          className="opacity-15 blur-[2px]"
                        />
                      )}

                      {/* Empty state bar outline */}
                      {week.val === 0 && (
                        <rect
                          x={x}
                          y={chartHeight - 20 - 4}
                          width="45"
                          height="4"
                          rx="2"
                          fill="#cbd5e1"
                          className="dark:fill-slate-800"
                        />
                      )}

                      {/* Main Bar */}
                      {week.val > 0 && (
                        <rect
                          x={x}
                          y={y}
                          width="45"
                          height={barH}
                          rx="6"
                          fill={isPassed ? 'url(#greenGradient)' : 'url(#blueGradient)'}
                          className="transition-all duration-300"
                        />
                      )}

                      {/* Value label */}
                      <text
                        x={x + 22.5}
                        y={week.val > 0 ? y - 6 : chartHeight - 28}
                        fontSize="10"
                        fontWeight="black"
                        textAnchor="middle"
                        className="fill-slate-700 dark:fill-slate-300"
                      >
                        {week.val.toLocaleString()}
                      </text>

                      {/* Week Label */}
                      <text
                        x={x + 22.5}
                        y={chartHeight - 4}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="fill-slate-500 dark:fill-slate-400"
                      >
                        {week.label}
                      </text>
                    </g>
                  );
                })}

                {/* SVG Gradients definitions */}
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Micro details panel */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 flex justify-between items-center shadow-inner">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Completed Goals</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {currentWeeks.filter(w => w.val >= MIN_POINTS).length} of 4 weeks
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-100/70 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                  {Math.round((currentWeeks.filter(w => w.val >= MIN_POINTS).length / 4) * 100)}%
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 flex justify-between items-center shadow-inner">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Average Pace</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {Math.round(currentTotal / 28).toLocaleString()} <span className="text-xs font-normal text-slate-500">pts/day</span>
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-sky-100/70 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                  ⛵
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                Long-Term History Graph
                <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  interactive Nodes
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Hover or click nodes on the line chart below to see seasonal details.
              </p>
            </div>

            {history.length > 0 ? (
              <div className="relative pt-6">
                {/* Trend line rendering */}
                {(() => {
                  const trendWidth = 500;
                  const trendHeight = 150;
                  const padX = 40;
                  const padY = 20;

                  const scores = history.map(h => h.totalPoints);
                  const maxVal = Math.max(...scores, 6000);
                  const minVal = Math.min(...scores, 0);
                  const range = maxVal - minVal || 1;

                  const pointsArray: { x: number; y: number; val: number; theme: string; date: string }[] = [];
                  const step = history.length > 1 ? (trendWidth - padX * 2) / (history.length - 1) : 0;

                  history.forEach((h, idx) => {
                    const x = padX + idx * step;
                    const y = trendHeight - padY - ((h.totalPoints - minVal) / range) * (trendHeight - padY * 2);
                    pointsArray.push({ x, y, val: h.totalPoints, theme: h.theme, date: h.date });
                  });

                  // Build smooth cubic bezier curve or straight lines
                  let pathD = '';
                  pointsArray.forEach((pt, i) => {
                    if (i === 0) {
                      pathD = `M ${pt.x} ${pt.y}`;
                    } else {
                      // Straight lines
                      pathD += ` L ${pt.x} ${pt.y}`;
                    }
                  });

                  // Path representing shaded area below line
                  const areaD = history.length > 1 && pointsArray.length > 0
                    ? `${pathD} L ${pointsArray[pointsArray.length - 1].x} ${trendHeight - padY} L ${pointsArray[0].x} ${trendHeight - padY} Z`
                    : '';

                  return (
                    <div className="relative">
                      <svg viewBox={`0 0 ${trendWidth} ${trendHeight}`} className="w-full h-auto overflow-visible select-none">
                        {/* Horizontal guidelines */}
                        {[0, 0.5, 1].map((mult, i) => {
                          const val = minVal + range * mult;
                          const y = trendHeight - padY - ((val - minVal) / range) * (trendHeight - padY * 2);
                          return (
                            <g key={i} className="opacity-30 dark:opacity-10">
                              <line x1={padX} y1={y} x2={trendWidth - padX} y2={y} stroke="#94a3b8" strokeWidth="1" />
                              <text x={padX - 8} y={y + 3} fontSize="8" fontWeight="bold" textAnchor="end" fill="#64748b">
                                {Math.round(val).toLocaleString()}
                              </text>
                            </g>
                          );
                        })}

                        {/* Shaded Area */}
                        {areaD && <path d={areaD} fill="url(#areaGradient)" />}

                        {/* Main Trend Line */}
                        {pathD && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#0ea5e9"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
                          />
                        )}

                        {/* Interactive Dot Markers */}
                        {pointsArray.map((pt, idx) => (
                          <g
                            key={idx}
                            className="cursor-pointer group/node"
                            onMouseEnter={() => setHoveredNode({ idx, ...pt })}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={() => setHoveredNode({ idx, ...pt })}
                          >
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="6"
                              fill="#ffffff"
                              stroke="#0ea5e9"
                              strokeWidth="3.5"
                              className="transition-all duration-150 group-hover/node:scale-125"
                            />
                            {/* Hover halo */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="12"
                              fill="#0ea5e9"
                              className="opacity-0 group-hover/node:opacity-15 transition-opacity"
                            />
                          </g>
                        ))}
                      </svg>

                      {/* Floating HTML tooltip inside relative container */}
                      {hoveredNode && (
                        <div
                          className="absolute bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-xl shadow-xl text-[11px] border border-slate-700/50 pointer-events-none z-10 transition-all w-44 shadow-[0_0_15px_rgba(14,165,233,0.15)]"
                          style={{
                            left: `${(hoveredNode.x / trendWidth) * 100}%`,
                            top: `${(hoveredNode.y / trendHeight) * 100 - 65}%`,
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <div className="font-bold flex items-center justify-between text-sky-400">
                            <span className="truncate pr-1">🏆 {hoveredNode.theme || 'Season'}</span>
                            <span className="shrink-0">#{hoveredNode.idx + 1}</span>
                          </div>
                          <div className="font-semibold text-lg mt-1">{hoveredNode.val.toLocaleString()} pts</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Date: {hoveredNode.date}</div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">
                  💡 Tip: Hover nodes to reveal exact score totals and dates. Graph scales dynamically.
                </div>
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                Archived history trend will appear here
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historical List Log */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              Archived Seasons History Logs
            </h3>
            <button
              id="clear-all-history-btn"
              onClick={() => {
                if (window.confirm('Are you absolutely sure you want to permanently clear ALL archived regatta seasons? This cannot be undone.')) {
                  onClearAllHistory();
                }
              }}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-1">
            {history.slice().reverse().map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 group/row">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{item.theme || 'Unnamed'}</span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                      item.totalPoints >= 6000 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {item.totalPoints >= 6000 ? 'Gold Star' : 'Season'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span>Started: {item.date}</span>
                    <span>•</span>
                    <span>Daily average: {Math.round(item.totalPoints / 28).toLocaleString()} pts/day</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-800 dark:text-slate-100 block">{item.totalPoints.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block">points total</span>
                  </div>

                  <button
                    id={`delete-history-${item.id}`}
                    onClick={() => {
                      if (window.confirm(`Delete the archived "${item.theme}" season?`)) {
                        onDeleteHistoryItem(item.id);
                      }
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
