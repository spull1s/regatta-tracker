import { useState, useEffect } from 'react';
import { Ship, Calendar, RefreshCw, Trophy, CheckCircle, Info, ChevronRight, HelpCircle } from 'lucide-react';
import { RegattaConfig, RegattaPoints, RegattaHistoryItem, Theme } from './types';
import ThemeToggle from './components/ThemeToggle';
import RegattaWeekCard from './components/RegattaWeekCard';
import StatisticsPanel from './components/StatisticsPanel';
import SyncManager from './components/SyncManager';

export default function App() {
  // Load initial states from LocalStorage safely
  const [config, setConfig] = useState<RegattaConfig>(() => {
    try {
      const saved = localStorage.getItem('regatta_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme !== undefined && parsed.startDate !== undefined) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Default config starts on today's date (July 20, 2026)
    return { theme: 'Greek', startDate: '2026-07-20' };
  });

  const [points, setPoints] = useState<RegattaPoints>(() => {
    try {
      const saved = localStorage.getItem('regatta_points');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { 1: 0, 2: 0, 3: 0, 4: 0 };
  });

  const [history, setHistory] = useState<RegattaHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('regatta_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('regatta_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
      
      // Auto fallback to system settings
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error(e);
    }
    return 'light';
  });

  const [showSyncTutorial, setShowSyncTutorial] = useState(false);

  // Sync state variables with LocalStorage
  useEffect(() => {
    localStorage.setItem('regatta_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('regatta_points', JSON.stringify(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem('regatta_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('regatta_theme_mode', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handlePointChange = (weekNum: number, value: number) => {
    setPoints(prev => ({
      ...prev,
      [weekNum]: value,
    }));
  };

  // Check if all 4 weeks are filled with a non-zero value
  const isSeasonCompleted = [1, 2, 3, 4].every(num => {
    const score = points[num];
    return score !== undefined && score >= 1500; // All weeks must have cleared the minimum 1500 goal!
  });

  // Archive the active season and reset for the next one
  const handleArchiveSeason = () => {
    const totalPoints = (points[1] || 0) + (points[2] || 0) + (points[3] || 0) + (points[4] || 0);
    
    const newHistoryItem: RegattaHistoryItem = {
      id: Date.now().toString(),
      theme: config.theme || 'Regatta Season',
      totalPoints,
      date: config.startDate,
      weeks: { ...points },
    };

    setHistory(prev => [...prev, newHistoryItem]);

    // Calculate start date of the next season (advance by 28 days / 4 weeks)
    try {
      const parts = config.startDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        
        const nextStart = new Date(year, month, day);
        nextStart.setDate(nextStart.getDate() + 28);

        const formatDate = (d: Date) => {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        setConfig({
          theme: '', // Clear theme name so they can write the next one
          startDate: formatDate(nextStart),
        });
      }
    } catch (e) {
      console.error('Error advancing date:', e);
    }

    // Reset weekly points
    setPoints({ 1: 0, 2: 0, 3: 0, 4: 0 });
  };

  // Delete a specific history item
  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Clear all history
  const handleClearAllHistory = () => {
    setHistory([]);
  };

  // Handle successful device sync import
  const handleImportSuccess = (imported: { config: RegattaConfig; points: RegattaPoints; history: RegattaHistoryItem[] }) => {
    setConfig(imported.config);
    setPoints(imported.points);
    setHistory(imported.history);
    alert('🎉 Data Imported Successfully! Your screen is now fully synchronized.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top Banner Navigation bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 dark:shadow-sky-500/20">
              <Ship className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-sky-600 to-indigo-500 dark:from-sky-400 dark:to-indigo-300 bg-clip-text text-transparent uppercase">
                Regatta Tracker
              </h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block -mt-0.5 font-bold tracking-wider uppercase">
                Township Co-op Companion
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="help-toggle-btn"
              onClick={() => setShowSyncTutorial(prev => !prev)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
              title="Show guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* Dynamic Sync Interactive Help Guide (Toggleable) */}
        {showSyncTutorial && (
          <div className="bg-gradient-to-br from-indigo-600 to-sky-600 text-white rounded-3xl p-5 md:p-6 shadow-xl shadow-sky-500/10 animate-fade-in relative overflow-hidden border border-transparent dark:border-sky-500/20">
            <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
              <Ship className="w-64 h-64" />
            </div>
            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="bg-sky-500/40 text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border border-sky-400/20">
                  Active Guide
                </span>
                <h3 className="font-extrabold text-sm md:text-base">How does device synchronization work?</h3>
              </div>
              <p className="text-xs text-sky-100 leading-relaxed">
                Our tracker operates completely offline-first, storing data locally on your browser. 
                If you play Township on both your mobile device and PC, you can copy your data between them 
                instantly using a secure, compressed token:
              </p>
              <ol className="text-xs text-sky-500 bg-white dark:bg-slate-950 p-4 rounded-2xl space-y-2.5 font-medium border border-sky-400/20 shadow-inner">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-transparent dark:border-sky-500/20 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    On <strong>Device A</strong> (e.g. Phone), scroll down to the <strong>Sync</strong> panel, click <strong>"Generate & Copy Sync Code"</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-transparent dark:border-sky-500/20 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Send this code to yourself (via email, a chat client like Discord/WhatsApp, or saved notes).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-transparent dark:border-sky-500/20 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    On <strong>Device B</strong> (e.g. PC), select the <strong>Import</strong> tab in the Sync panel, paste the code, and confirm.
                  </span>
                </li>
              </ol>
              <button
                onClick={() => setShowSyncTutorial(false)}
                className="text-xs font-bold text-sky-600 bg-white hover:bg-sky-50 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Got it, close guide
              </button>
            </div>
          </div>
        )}

        {/* Global Configuration Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Theme Input */}
            <div className="space-y-1.5">
              <label htmlFor="regatta-theme-input" className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5">
                Regatta Season Theme
              </label>
              <div className="relative">
                <input
                  id="regatta-theme-input"
                  type="text"
                  value={config.theme}
                  onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="e.g. Greek, Space, Halloween, Pirate"
                  className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-750 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 text-sm select-none">
                  ⛵
                </span>
              </div>
            </div>

            {/* Start Date Picker */}
            <div className="space-y-1.5">
              <label htmlFor="start-date-input" className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5">
                Start Date (Week 1/4)
              </label>
              <div className="relative">
                <input
                  id="start-date-input"
                  type="date"
                  value={config.startDate}
                  onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full h-12 pl-4 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Master Full-Stack Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: The 4 Interactive Weeks (Column size 7/12) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  <span className="text-sky-500">🏆</span>
                  Active Series Roadmap
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Input scores weekly. Progress displays automatically.
                </p>
              </div>

              <span className="text-[10px] bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-sky-400 font-black px-2.5 py-1 rounded-lg border border-transparent dark:border-slate-850 uppercase tracking-wider">
                Theme: {config.theme || 'Untitled'}
              </span>
            </div>

            {[1, 2, 3, 4].map((num) => (
              <RegattaWeekCard
                key={num}
                weekNum={num}
                theme={config.theme}
                startDateStr={config.startDate}
                value={points[num] || 0}
                onChange={(val) => handlePointChange(num, val)}
              />
            ))}
          </div>

          {/* RIGHT PANEL: Stats, Archive Prompts, Syncing (Column size 5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Archive Notification Area (When all 4 weeks cleared 1500 target!) */}
            {isSeasonCompleted ? (
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-5 md:p-6 shadow-lg shadow-emerald-500/20 relative overflow-hidden animate-bounce-slow border border-emerald-400/30">
                <div className="absolute right-0 top-0 translate-y-1/3 translate-x-1/3 opacity-10">
                  <Trophy className="w-40 h-40" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-100" />
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-700/50 px-2 py-0.5 rounded-md">
                      Regatta Complete!
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base md:text-lg">
                    Congratulations on completing "{config.theme || 'the season'}"!
                  </h3>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    All 4 weeks have achieved the minimum target of 1,500 points. 
                    Archive this regatta to save it to your long-term statistics log, reset the scores, 
                    and advance to the next season schedule.
                  </p>
                  <button
                    id="archive-season-btn"
                    onClick={handleArchiveSeason}
                    className="w-full py-3 bg-white hover:bg-emerald-50 text-emerald-850 font-black text-xs md:text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Archive Season & Start Next 🚀
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4.5 flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-sky-50 dark:bg-sky-500/10 rounded-xl shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-xs space-y-1 leading-relaxed">
                  <span className="font-bold text-slate-800 dark:text-slate-200">How to unlock archiving:</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    To complete and archive a regatta, enter scores for all 4 weeks that are equal to or greater than the 1,500 point goal. A success box will appear here immediately to save your stats!
                  </p>
                </div>
              </div>
            )}

            {/* Enhanced Statistics and Interactive Charts */}
            <StatisticsPanel
              history={history}
              currentPoints={points}
              currentTheme={config.theme}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearAllHistory={handleClearAllHistory}
            />

            {/* Device Syncing Manager */}
            <SyncManager
              config={config}
              points={points}
              history={history}
              onImportSuccess={handleImportSuccess}
            />

          </div>

        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-900 mt-12 py-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase">
            Township Regatta Tracker Companion
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-600">
            Designed for convenience and smooth cross-device tracking. Safe sailing, Co-op captains!
          </p>
        </div>
      </footer>
    </div>
  );
}
