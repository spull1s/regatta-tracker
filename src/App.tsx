import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Ship,
  Trophy,
  CheckCircle,
  Info,
  HelpCircle,
  Cloud,
  Download,
  Target,
  Sparkles,
  Flame,
  Settings,
  X
} from 'lucide-react';
import { RegattaConfig, RegattaPoints, RegattaHistoryItem, Theme, JSONBinConfig } from './types';
import ThemeToggle from './components/ThemeToggle';
import RegattaWeekCard from './components/RegattaWeekCard';
import StatisticsPanel from './components/StatisticsPanel';
import SyncManager from './components/SyncManager';
import { fireSeasonVictoryConfetti } from './lib/confetti';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function App() {
  // Load initial states from LocalStorage safely
  const [config, setConfig] = useState<RegattaConfig>(() => {
    try {
      const saved = localStorage.getItem('regatta_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme !== undefined && parsed.startDate !== undefined) {
          return {
            theme: parsed.theme || 'Greek',
            startDate: parsed.startDate || '2026-07-20',
            weeklyGoal: typeof parsed.weeklyGoal === 'number' && parsed.weeklyGoal > 0 ? parsed.weeklyGoal : 5000,
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return { theme: 'Greek', startDate: '2026-07-20', weeklyGoal: 5000 };
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

  const [jsonBinConfig, setJsonBinConfig] = useState<JSONBinConfig>(() => {
    try {
      const saved = localStorage.getItem('regatta_jsonbin_cfg');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { apiKey: '', binId: '', autoSync: false };
  });

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('regatta_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error(e);
    }
    return 'dark'; // Default dark mode for gaming glow
  });

  const [showSyncTutorial, setShowSyncTutorial] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [pwaPrompt, setPwaPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hasCelebratedVictory, setHasCelebratedVictory] = useState(false);

  // Auto-sync debouncing ref
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    localStorage.setItem('regatta_jsonbin_cfg', JSON.stringify(jsonBinConfig));
  }, [jsonBinConfig]);

  useEffect(() => {
    localStorage.setItem('regatta_theme_mode', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle PWA installation prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPwaPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    const { outcome } = await pwaPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaPrompt(null);
    }
  };

  // Auto-Sync to JSONBin.io if enabled
  const triggerAutoSync = useCallback(() => {
    if (!jsonBinConfig.autoSync || !jsonBinConfig.apiKey || !jsonBinConfig.binId) return;

    if (autoSyncTimerRef.current) {
      clearTimeout(autoSyncTimerRef.current);
    }

    autoSyncTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`https://api.jsonbin.io/v3/b/${jsonBinConfig.binId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': jsonBinConfig.apiKey,
          },
          body: JSON.stringify({ config, points, history, updatedAt: new Date().toISOString() }),
        });
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setJsonBinConfig(prev => ({ ...prev, lastSyncedAt: nowStr }));
      } catch (err) {
        console.error('Auto-sync error:', err);
      }
    }, 2000); // 2 second debounce
  }, [jsonBinConfig.autoSync, jsonBinConfig.apiKey, jsonBinConfig.binId, config, points, history]);

  useEffect(() => {
    triggerAutoSync();
  }, [config, points, history, triggerAutoSync]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handlePointChange = (weekNum: number, value: number) => {
    setPoints(prev => ({
      ...prev,
      [weekNum]: value,
    }));
  };

  const handleUpdateJSONBinConfig = (cfg: Partial<JSONBinConfig>) => {
    setJsonBinConfig(prev => ({ ...prev, ...cfg }));
  };

  const weeklyGoal = config.weeklyGoal || 5000;
  const seasonGoal = weeklyGoal * 4;
  const currentTotal = (points[1] || 0) + (points[2] || 0) + (points[3] || 0) + (points[4] || 0);

  // Check if all 4 weeks cleared the weekly goal
  const isSeasonCompleted = [1, 2, 3, 4].every(num => {
    const score = points[num];
    return score !== undefined && score >= weeklyGoal;
  });

  // Trigger celebration when season goal is breached
  useEffect(() => {
    if (isSeasonCompleted && !hasCelebratedVictory) {
      fireSeasonVictoryConfetti();
      setHasCelebratedVictory(true);
    } else if (!isSeasonCompleted) {
      setHasCelebratedVictory(false);
    }
  }, [isSeasonCompleted, hasCelebratedVictory]);

  // Archive the active season
  const handleArchiveSeason = () => {
    const newHistoryItem: RegattaHistoryItem = {
      id: Date.now().toString(),
      theme: config.theme || 'Regatta Season',
      totalPoints: currentTotal,
      date: config.startDate,
      weeks: { ...points },
      weeklyGoal,
    };

    setHistory(prev => [...prev, newHistoryItem]);

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

        setConfig(prev => ({
          ...prev,
          theme: '',
          startDate: formatDate(nextStart),
        }));
      }
    } catch (e) {
      console.error('Error advancing date:', e);
    }

    setPoints({ 1: 0, 2: 0, 3: 0, 4: 0 });
    setHasCelebratedVictory(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
  };

  const handleImportSuccess = (imported: { config: RegattaConfig; points: RegattaPoints; history: RegattaHistoryItem[] }) => {
    if (imported.config) setConfig(imported.config);
    if (imported.points) setPoints(imported.points);
    if (imported.history) setHistory(imported.history);
  };

  const seasonProgressPct = Math.min(100, Math.round((currentTotal / seasonGoal) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300 pb-20 sm:pb-8 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar with Frosted Glass & Neon Glow */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 animate-glow">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent uppercase flex items-center gap-1.5">
                Regatta Tracker
                <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest hidden sm:inline-block">
                  Co-op
                </span>
              </h1>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-bold tracking-wider uppercase">
                Township Co-op Score Companion
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pwaPrompt && (
              <button
                onClick={handleInstallPWA}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}

            <button
              id="settings-toggle-btn"
              onClick={() => setShowSettingsModal(prev => !prev)}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
              title="Open Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              id="help-toggle-btn"
              onClick={() => setShowSyncTutorial(prev => !prev)}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
              title="Show guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* Season Overall Progress Banner (Glowing Tactile Bar) */}
        <div className="glass-panel border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-sky-400 tracking-widest block flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Co-op Season Goal Progress
              </span>
              <h2 className="text-lg md:text-xl font-black text-slate-100 mt-0.5 flex items-center gap-2">
                {config.theme ? `Theme: "${config.theme}"` : 'Active Season'}
                <span className="text-xs font-bold text-slate-400">
                  ({currentTotal.toLocaleString()} / {seasonGoal.toLocaleString()} PTS)
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-xl">
                Target: {weeklyGoal.toLocaleString()} pts / wk
              </span>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="text-xs font-extrabold text-slate-400 hover:text-sky-300 underline cursor-pointer"
              >
                Change Goal
              </button>
            </div>
          </div>

          {/* Progress Bar with Glow */}
          <div className="space-y-1.5">
            <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  seasonProgressPct >= 100
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 glow-emerald'
                    : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 glow-cyan'
                }`}
                style={{ width: `${seasonProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
              <span>0 PTS</span>
              <span className={seasonProgressPct >= 100 ? 'text-emerald-400 font-black' : 'text-sky-400'}>
                {seasonProgressPct}% COMPLETE {seasonProgressPct >= 100 ? '🎉 GOAL REACHED!' : ''}
              </span>
              <span>{seasonGoal.toLocaleString()} PTS</span>
            </div>
          </div>
        </div>

        {/* Dynamic Help Tutorial */}
        {showSyncTutorial && (
          <div className="bg-gradient-to-br from-indigo-900/90 via-sky-900/90 to-slate-900/90 text-white rounded-3xl p-5 md:p-6 shadow-2xl animate-fade-in relative overflow-hidden border border-sky-500/30">
            <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
              <Ship className="w-64 h-64" />
            </div>
            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="bg-sky-500/30 text-sky-300 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border border-sky-400/20">
                  Cloud & Auto Sync
                </span>
                <h3 className="font-extrabold text-sm md:text-base">How does JSONBin.io Cloud Sync work?</h3>
              </div>
              <p className="text-xs text-sky-100 leading-relaxed">
                No more copying long strings manually! You can link your free <strong>JSONBin.io</strong> key to keep scores automatically updated between your PC and Mobile phone:
              </p>
              <ol className="text-xs text-sky-300 bg-slate-950/80 p-4 rounded-2xl space-y-2 font-medium border border-sky-500/20">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Open <strong>Cloud & Device Sync Center</strong> below, enter your JSONBin API Key.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Click <strong>"Auto-Create Bin"</strong> or enter an existing Bin ID.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Enable <strong>Auto-Sync</strong>! Any score updates are automatically saved to the cloud.</span>
                </li>
              </ol>
              <button
                onClick={() => setShowSyncTutorial(false)}
                className="text-xs font-bold text-sky-400 bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-all cursor-pointer border border-sky-500/30"
              >
                Close guide
              </button>
            </div>
          </div>
        )}

        {/* Modal: Settings (Dynamic Weekly Goal & JSONBin setup) */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-panel border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                  <Target className="w-5 h-5 text-sky-500" />
                  Tracker & Co-op Settings
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Co-op Goal Setting */}
              <div className="space-y-2">
                <label htmlFor="setting-weekly-goal" className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Weekly Point Goal</span>
                  <span className="text-[10px] text-sky-400 font-normal">(Default: 5000 pts)</span>
                </label>
                <div className="relative">
                  <input
                    id="setting-weekly-goal"
                    type="number"
                    min="1000"
                    step="500"
                    value={config.weeklyGoal}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      setConfig(prev => ({
                        ...prev,
                        weeklyGoal: isNaN(parsed) ? 5000 : Math.max(100, parsed),
                      }));
                    }}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    PTS / WEEK
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Season target will automatically scale to {((config.weeklyGoal || 5000) * 4).toLocaleString()} points across 4 weeks.
                </p>
              </div>

              {/* Theme & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="regatta-theme-input" className="text-xs font-bold text-slate-300">
                    Season Theme
                  </label>
                  <input
                    id="regatta-theme-input"
                    type="text"
                    value={config.theme}
                    onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value }))}
                    placeholder="e.g. Space, Pirate"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="start-date-input" className="text-xs font-bold text-slate-300">
                    Start Date
                  </label>
                  <input
                    id="start-date-input"
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Master Layout Grid (Single-Column on Mobile < 640px) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: The 4 Interactive Weeks (1 Column on Mobile) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base md:text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <span className="text-sky-400">🏆</span>
                  Active Series Roadmap
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Input scores weekly. Weekly goal is set to {weeklyGoal.toLocaleString()} pts.
                </p>
              </div>

              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-black px-2.5 py-1 rounded-lg border border-sky-500/30 uppercase tracking-wider">
                {config.theme || 'Untitled'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {[1, 2, 3, 4].map((num) => (
                <RegattaWeekCard
                  key={num}
                  weekNum={num}
                  theme={config.theme}
                  startDateStr={config.startDate}
                  value={points[num] || 0}
                  weeklyGoal={weeklyGoal}
                  onChange={(val) => handlePointChange(num, val)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT PANEL: Stats, Archive Prompts, Syncing */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Archive Notification Area */}
            {isSeasonCompleted ? (
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 md:p-6 shadow-xl shadow-emerald-500/20 relative overflow-hidden border border-emerald-400/40 glow-emerald">
                <div className="absolute right-0 top-0 translate-y-1/3 translate-x-1/3 opacity-10">
                  <Trophy className="w-40 h-40" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-800/60 px-2 py-0.5 rounded-md">
                      Regatta Complete!
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base md:text-lg">
                    Congratulations on completing "{config.theme || 'the season'}"!
                  </h3>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    All 4 weeks have achieved the goal target of {weeklyGoal.toLocaleString()} points ({seasonGoal.toLocaleString()} total season score).
                    Archive this regatta to save it to your long-term statistics log!
                  </p>
                  <button
                    id="archive-season-btn"
                    onClick={handleArchiveSeason}
                    className="w-full py-3.5 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs md:text-sm rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Archive Season & Start Next 🚀
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel border border-slate-800/80 rounded-3xl p-4.5 flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-sky-500/10 rounded-xl shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xs space-y-1 leading-relaxed">
                  <span className="font-bold text-slate-200">How to unlock season archiving:</span>
                  <p className="text-slate-400">
                    Reach your weekly goal of {weeklyGoal.toLocaleString()} points on all 4 weeks. Once cleared, an archive prompt will appear here to save your victory to the stats history!
                  </p>
                </div>
              </div>
            )}

            {/* Enhanced Statistics and Interactive Charts */}
            <StatisticsPanel
              history={history}
              currentPoints={points}
              currentTheme={config.theme}
              weeklyGoal={weeklyGoal}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearAllHistory={handleClearAllHistory}
            />

            {/* Cloud & Device Syncing Manager (JSONBin) */}
            <SyncManager
              config={config}
              points={points}
              history={history}
              jsonBinConfig={jsonBinConfig}
              onUpdateJSONBinConfig={handleUpdateJSONBinConfig}
              onImportSuccess={handleImportSuccess}
            />

          </div>

        </div>
      </main>

      {/* Floating Action Dock for Mobile (<640px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 p-2.5 sm:hidden flex items-center justify-around">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-sky-400 text-[10px] font-bold"
        >
          <Target className="w-5 h-5 text-sky-500" />
          <span>Goal ({weeklyGoal})</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('sync-manager-container');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-sky-400 text-[10px] font-bold"
        >
          <Cloud className="w-5 h-5 text-indigo-400" />
          <span>Cloud Sync</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('statistics-panel');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-sky-400 text-[10px] font-bold"
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Stats</span>
        </button>
      </div>

      <footer className="border-t border-slate-900 mt-12 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-slate-500 font-bold tracking-wide uppercase">
            Township Regatta Tracker Companion
          </p>
          <p className="text-[11px] text-slate-600">
            Cloud Auto-Sync • Dynamic Goals • Tactile PWA Interface
          </p>
        </div>
      </footer>
    </div>
  );
}
