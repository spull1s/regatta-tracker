import { useState } from 'react';
import { BarChart3, Award, Calendar, TrendingUp, Sparkles, Trash2, Trophy, Flame } from 'lucide-react';
import { RegattaHistoryItem, RegattaPoints } from '../types';

interface StatisticsPanelProps {
  history: RegattaHistoryItem[];
  currentPoints: RegattaPoints;
  currentTheme: string;
  weeklyGoal?: number;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export default function StatisticsPanel({
  history,
  currentPoints,
  currentTheme,
  weeklyGoal = 5000,
  onDeleteHistoryItem,
  onClearAllHistory,
}: StatisticsPanelProps) {
  const [hoveredNode, setHoveredNode] = useState<{ idx: number; x: number; y: number; val: number; theme: string; date: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'alltime'>('current');

  // Math for current season
  const seasonGoal = weeklyGoal * 4;
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

  // Render Current Week Progress Chart
  const maxCurrentPoints = Math.max(...currentWeeks.map(w => w.val), weeklyGoal * 1.25);
  const chartHeight = 160;
  const chartWidth = 480;

  return (
    <div id="statistics-panel" className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Featured High Contrast Bento Card */}
        <div className="bg-gradient-to-br from-sky-600 via-indigo-600 to-sky-700 text-white dark:from-sky-950/70 dark:via-indigo-950/60 dark:to-slate-900/90 border border-sky-400/30 dark:border-sky-500/30 p-5.5 rounded-3xl shadow-xl shadow-sky-500/10 glow-cyan relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-white/10 dark:text-sky-400/10 group-hover:scale-110 transition-transform">
            <Trophy className="w-16 h-16" />
          </div>
          <span className="text-[10px] font-black text-sky-100 dark:text-sky-400 uppercase tracking-widest block">Active Season Score</span>
          <span className="text-3xl font-black text-white dark:text-slate-100 mt-1 block tracking-tight">
            {currentTotal.toLocaleString()} <span className="text-xs font-medium opacity-85">pts</span>
          </span>
          <p className="text-[10px] text-sky-100 dark:text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            {currentTotal >= seasonGoal ? 'All season goals cleared!' : `${Math.max(0, seasonGoal - currentTotal).toLocaleString()} pts to reach ${seasonGoal.toLocaleString()} goal`}
          </p>
        </div>

        <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm hover:border-sky-500/50 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/10 dark:text-emerald-400/5 group-hover:scale-110 transition-transform">
            <Calendar className="w-14 h-14" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Seasons Logged</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
            {totalSeasons} <span className="text-xs font-medium text-slate-500">archived</span>
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
            Saved & synced across devices
          </p>
        </div>

        <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm hover:border-sky-500/50 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-indigo-500/10 dark:text-indigo-400/5 group-hover:scale-110 transition-transform">
            <Award className="w-14 h-14" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Archived Average</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
            {averagePoints.toLocaleString()} <span className="text-xs font-medium text-slate-500">pts</span>
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
            Goal target: {seasonGoal.toLocaleString()} pts / season
          </p>
        </div>

        <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm hover:border-sky-500/50 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-amber-500/10 dark:text-amber-400/5 group-hover:scale-110 transition-transform">
            <Flame className="w-14 h-14" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Season Peak Record</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
            {bestSeason ? bestSeason.totalPoints.toLocaleString() : '0'} <span className="text-xs font-medium text-slate-500">pts</span>
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            {bestSeason ? `Held during "${bestSeason.theme}"` : 'Complete a season to peak!'}
          </p>
        </div>
      </div>

      {/* Charts Card */}
      <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">Interactive Performance Visualizers</h3>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl text-xs font-bold self-start sm:self-auto border border-slate-200/60 dark:border-slate-850">
            <button
              id="chart-toggle-current"
              onClick={() => setActiveTab('current')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'current'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Current Season
            </button>
            <button
              id="chart-toggle-alltime"
              disabled={history.length === 0}
              onClick={() => setActiveTab('alltime')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'alltime'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Long-Term Trend ({history.length})
            </button>
          </div>
        </div>

        {activeTab === 'current' ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                Current Series: "{currentTheme || 'Regatta'}"
                <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Telemetry
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visualizing weekly progress against your dynamic co-op goal ({weeklyGoal.toLocaleString()} pts / week).
              </p>
            </div>

            {/* SVG bar chart for current season */}
            <div className="relative pt-6">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
                {/* Y-Axis Guidelines */}
                {[0, 0.5, 1, 1.25].map((mult, i) => {
                  const val = Math.round(weeklyGoal * mult);
                  const y = chartHeight - 20 - (val / maxCurrentPoints) * (chartHeight - 40);
                  return (
                    <g key={i} className="opacity-40 dark:opacity-20">
                      <line
                        x1="55"
                        y1={y}
                        x2={chartWidth - 10}
                        y2={y}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray={mult === 1 ? "0" : "3,3"}
                      />
                      <text
                        x="48"
                        y={y + 4}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="end"
                        fill="#64748b"
                      >
                        {val === weeklyGoal ? `${weeklyGoal.toLocaleString()} (Goal)` : val.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* Target Line */}
                {(() => {
                  const targetY = chartHeight - 20 - (weeklyGoal / maxCurrentPoints) * (chartHeight - 40);
                  return (
                    <g>
                      <line
                        x1="55"
                        y1={targetY}
                        x2={chartWidth - 10}
                        y2={targetY}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="4,2"
                        className="opacity-80"
                      />
                      <rect
                        x={chartWidth - 110}
                        y={targetY - 8}
                        width="100"
                        height="16"
                        rx="4"
                        fill="#d1fae5"
                        className="dark:fill-emerald-950 opacity-90 stroke stroke-emerald-300 dark:stroke-emerald-800"
                        strokeWidth="1"
                      />
                      <text
                        x={chartWidth - 60}
                        y={targetY + 3}
                        fontSize="8"
                        fontWeight="black"
                        textAnchor="middle"
                        className="fill-emerald-800 dark:fill-emerald-300 uppercase"
                      >
                        GOAL {weeklyGoal.toLocaleString()} PTS
                      </text>
                    </g>
                  );
                })()}

                {/* Dynamic Bars */}
                {currentWeeks.map((week, idx) => {
                  const colWidth = (chartWidth - 70) / 4;
                  const x = 65 + idx * colWidth + (colWidth - 45) / 2;
                  const barH = (week.val / maxCurrentPoints) * (chartHeight - 40);
                  const y = chartHeight - 20 - barH;
                  const isPassed = week.val >= weeklyGoal;

                  return (
                    <g key={idx} className="group cursor-pointer">
                      <rect
                        x={65 + idx * colWidth}
                        y="10"
                        width={colWidth}
                        height={chartHeight - 30}
                        fill="transparent"
                        className="hover:fill-slate-50 dark:hover:fill-slate-800/20 transition-colors"
                      />

                      {week.val > 0 && (
                        <rect
                          x={x}
                          y={y}
                          width="45"
                          height={barH}
                          rx="8"
                          fill={isPassed ? 'url(#greenGradient)' : 'url(#blueGradient)'}
                          className="transition-all duration-300"
                        />
                      )}

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

                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                Long-Term History Graph
              </h4>
            </div>

            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-850">
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{h.theme || 'Unnamed Season'}</h5>
                      <span className="text-[11px] text-slate-400">Date: {h.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sky-500 text-sm">{h.totalPoints.toLocaleString()} pts</span>
                      <button
                        onClick={() => onDeleteHistoryItem(h.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={onClearAllHistory}
                  className="text-xs text-rose-500 font-bold hover:underline pt-2 block"
                >
                  Clear All History Logs
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-8">No past seasons logged yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
