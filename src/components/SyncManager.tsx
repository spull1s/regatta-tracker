import { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  Key,
  Database,
  Check,
  Upload,
  Download,
  Smartphone,
  Laptop,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Lock,
  Plus
} from 'lucide-react';
import { RegattaConfig, RegattaPoints, RegattaHistoryItem, JSONBinConfig } from '../types';

interface SyncManagerProps {
  config: RegattaConfig;
  points: RegattaPoints;
  history: RegattaHistoryItem[];
  jsonBinConfig: JSONBinConfig;
  onUpdateJSONBinConfig: (cfg: Partial<JSONBinConfig>) => void;
  onImportSuccess: (data: { config: RegattaConfig; points: RegattaPoints; history: RegattaHistoryItem[] }) => void;
}

export default function SyncManager({
  config,
  points,
  history,
  jsonBinConfig,
  onUpdateJSONBinConfig,
  onImportSuccess,
}: SyncManagerProps) {
  const [activeTab, setActiveTab] = useState<'cloud' | 'export' | 'import'>('cloud');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Manual string token states
  const [copied, setCopied] = useState(false);
  const [importToken, setImportToken] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    config: RegattaConfig;
    points: RegattaPoints;
    history: RegattaHistoryItem[];
  } | null>(null);

  // Function to push data to JSONBin.io
  const pushToJSONBin = useCallback(async (customBinId?: string, customKey?: string) => {
    const key = customKey || jsonBinConfig.apiKey;
    const binId = customBinId || jsonBinConfig.binId;

    if (!key || !binId) {
      setSyncStatusMsg({ type: 'error', text: 'Please enter both your JSONBin API Key and Bin ID first.' });
      return false;
    }

    setIsSyncing(true);
    setSyncStatusMsg({ type: 'info', text: 'Uploading app state to JSONBin.io...' });

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': key,
        },
        body: JSON.stringify({ config, points, history, updatedAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${response.status}: Failed to sync data`);
      }

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      onUpdateJSONBinConfig({ lastSyncedAt: nowStr });
      setSyncStatusMsg({ type: 'success', text: `Successfully synced to cloud at ${nowStr}!` });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown sync error';
      setSyncStatusMsg({ type: 'error', text: `Push failed: ${msg}` });
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [jsonBinConfig.apiKey, jsonBinConfig.binId, config, points, history, onUpdateJSONBinConfig]);

  // Function to pull data from JSONBin.io
  const pullFromJSONBin = useCallback(async () => {
    if (!jsonBinConfig.apiKey || !jsonBinConfig.binId) {
      setSyncStatusMsg({ type: 'error', text: 'Please enter both your JSONBin API Key and Bin ID first.' });
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg({ type: 'info', text: 'Fetching latest data from JSONBin.io...' });

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinConfig.binId}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': jsonBinConfig.apiKey,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${response.status}: Could not fetch bin`);
      }

      const resData = await response.json();
      const record = resData.record;

      if (!record || (!record.config && !record.points)) {
        throw new Error('Bin found but record format was missing regatta data.');
      }

      onImportSuccess({
        config: record.config || config,
        points: record.points || points,
        history: record.history || history,
      });

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      onUpdateJSONBinConfig({ lastSyncedAt: nowStr });
      setSyncStatusMsg({ type: 'success', text: `Cloud data pulled & applied at ${nowStr}!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown sync error';
      setSyncStatusMsg({ type: 'error', text: `Pull failed: ${msg}` });
    } finally {
      setIsSyncing(false);
    }
  }, [jsonBinConfig.apiKey, jsonBinConfig.binId, config, points, history, onImportSuccess, onUpdateJSONBinConfig]);

  // Function to create a new Bin automatically
  const handleCreateBin = async () => {
    if (!jsonBinConfig.apiKey) {
      setSyncStatusMsg({ type: 'error', text: 'Enter your JSONBin API Key (Master Key) first to create a Bin.' });
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg({ type: 'info', text: 'Creating a new private Bin on JSONBin.io...' });

    try {
      const response = await fetch('https://api.jsonbin.io/v3/b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': jsonBinConfig.apiKey,
          'X-Bin-Name': 'Regatta-Tracker-Coop',
          'X-Bin-Private': 'true',
        },
        body: JSON.stringify({ config, points, history, createdAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create new bin on JSONBin');
      }

      const data = await response.json();
      const newBinId = data.metadata?.id;

      if (!newBinId) {
        throw new Error('Created bin but no ID returned');
      }

      onUpdateJSONBinConfig({ binId: newBinId, autoSync: true });
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      onUpdateJSONBinConfig({ lastSyncedAt: nowStr });
      setSyncStatusMsg({ type: 'success', text: `✨ Created Bin ID ${newBinId}! Auto-sync enabled.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating bin';
      setSyncStatusMsg({ type: 'error', text: `Bin creation failed: ${msg}` });
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper for manual export token
  const getExportToken = () => {
    try {
      const allData = { config, points, history };
      return btoa(encodeURIComponent(JSON.stringify(allData)));
    } catch (e) {
      console.error(e);
      return '';
    }
  };

  const handleCopy = () => {
    const token = getExportToken();
    if (!token) return;

    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      const textarea = document.getElementById('sync-token-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.select();
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    });
  };

  const handleTokenChange = (val: string) => {
    setImportToken(val);
    setImportError(null);
    setParsedData(null);

    const trimmed = val.trim();
    if (!trimmed) return;

    try {
      const decoded = JSON.parse(decodeURIComponent(atob(trimmed)));
      if (decoded && (decoded.config || decoded.points || decoded.history)) {
        setParsedData({
          config: decoded.config || { theme: '', startDate: '', weeklyGoal: 5000 },
          points: decoded.points || {},
          history: decoded.history || [],
        });
      } else {
        setImportError('Invalid token format. Could not locate regatta tracker data.');
      }
    } catch (e) {
      setImportError('Invalid sync token. Make sure you copied the entire code block.');
    }
  };

  const handleManualImport = () => {
    if (!parsedData) return;
    onImportSuccess(parsedData);
    setImportToken('');
    setParsedData(null);
  };

  return (
    <div id="sync-manager-container" className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-500 animate-pulse" />
            Cloud & Device Sync Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Keep your co-op score updated seamlessly across all your devices using JSONBin.io or direct codes.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100/90 dark:bg-slate-950 p-1 rounded-2xl self-start sm:self-auto border border-slate-200/60 dark:border-slate-850">
          <button
            id="sync-tab-cloud"
            onClick={() => setActiveTab('cloud')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            JSONBin Cloud
          </button>
          <button
            id="sync-tab-export"
            onClick={() => { setActiveTab('export'); setImportError(null); setParsedData(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Export Code
          </button>
          <button
            id="sync-tab-import"
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Import Code
          </button>
        </div>
      </div>

      {/* JSONBin Cloud Tab */}
      {activeTab === 'cloud' && (
        <div className="space-y-5 animate-fade-in">
          {/* Status Alert Banner */}
          {syncStatusMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 transition-all ${
                syncStatusMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : syncStatusMsg.type === 'error'
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300'
                  : 'bg-sky-500/15 border border-sky-500/30 text-sky-800 dark:text-sky-300'
              }`}
            >
              {syncStatusMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : syncStatusMsg.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-sky-500 animate-spin shrink-0" />
              )}
              <span>{syncStatusMsg.text}</span>
            </div>
          )}

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-850">
            {/* API Key Input */}
            <div className="space-y-1.5">
              <label htmlFor="jsonbin-api-key" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-sky-500" />
                  JSONBin Master Key / Access Key
                </span>
                <a
                  href="https://jsonbin.io/app/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-sky-500 hover:underline font-semibold"
                >
                  Get Key ↗
                </a>
              </label>
              <input
                id="jsonbin-api-key"
                type="password"
                value={jsonBinConfig.apiKey}
                onChange={(e) => onUpdateJSONBinConfig({ apiKey: e.target.value })}
                placeholder="e.g. $2a$10$..."
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Bin ID Input */}
            <div className="space-y-1.5">
              <label htmlFor="jsonbin-bin-id" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-500" />
                  Bin ID
                </span>
                {jsonBinConfig.apiKey && !jsonBinConfig.binId && (
                  <button
                    onClick={handleCreateBin}
                    disabled={isSyncing}
                    className="text-[10px] bg-sky-500 hover:bg-sky-600 text-white font-black px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    Auto-Create Bin
                  </button>
                )}
              </label>
              <input
                id="jsonbin-bin-id"
                type="text"
                value={jsonBinConfig.binId}
                onChange={(e) => onUpdateJSONBinConfig({ binId: e.target.value })}
                placeholder="e.g. 660f..."
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Action Row & Auto Sync Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            {/* Auto Sync Switch */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-850">
              <button
                type="button"
                role="switch"
                aria-checked={jsonBinConfig.autoSync}
                onClick={() => onUpdateJSONBinConfig({ autoSync: !jsonBinConfig.autoSync })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  jsonBinConfig.autoSync ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    jsonBinConfig.autoSync ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Auto-Sync Changes
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  {jsonBinConfig.autoSync ? 'Live saving changes to cloud' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Sync Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                id="jsonbin-force-pull-btn"
                onClick={pullFromJSONBin}
                disabled={isSyncing || !jsonBinConfig.apiKey || !jsonBinConfig.binId}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <CloudDownload className="w-4 h-4 text-sky-500" />
                Force Pull
              </button>

              <button
                id="jsonbin-force-push-btn"
                onClick={() => pushToJSONBin()}
                disabled={isSyncing || !jsonBinConfig.apiKey || !jsonBinConfig.binId}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <CloudUpload className="w-4 h-4" />
                Force Push
              </button>
            </div>
          </div>

          {jsonBinConfig.lastSyncedAt && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 text-right font-medium">
              Last synced: {jsonBinConfig.lastSyncedAt}
            </div>
          )}
        </div>
      )}

      {/* Export Code Tab */}
      {activeTab === 'export' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-sky-50/50 dark:bg-sky-500/5 p-4 rounded-2xl border border-sky-100/50 dark:border-sky-500/10">
            <div className="flex items-center gap-3 justify-center text-slate-600 dark:text-slate-400">
              <Smartphone className="w-8 h-8 text-sky-500 shrink-0" />
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Laptop className="w-10 h-10 text-sky-500 shrink-0" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Offline String Token Transfer</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Generate a compressed offline code block to paste on another device.
              </p>
            </div>
          </div>

          <div>
            <button
              id="export-action-btn"
              onClick={handleCopy}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Code Copied to Clipboard!
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Generate & Copy Sync Code
                </>
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sync-token-textarea" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Raw Backup String
            </label>
            <textarea
              id="sync-token-textarea"
              readOnly
              value={getExportToken()}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              className="w-full h-14 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-[10px] font-mono text-slate-500 dark:text-slate-400 resize-none focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Import Code Tab */}
      {activeTab === 'import' && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1.5">
            <label htmlFor="import-token-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Paste Sync Token (Base64)
            </label>
            <textarea
              id="import-token-input"
              rows={4}
              value={importToken}
              onChange={(e) => handleTokenChange(e.target.value)}
              placeholder="Paste exported token code here..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {importError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-bold">Parsing Error</p>
                <p className="text-[11px] mt-0.5">{importError}</p>
              </div>
            </div>
          )}

          {parsedData && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-2xl space-y-2 text-xs">
              <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" />
                Token Parsed Successfully!
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-200/40 dark:border-emerald-800/40 text-[11px]">
                <div>
                  <span className="font-semibold block text-slate-500">Theme:</span>
                  {parsedData.config.theme || 'No theme named'}
                </div>
                <div>
                  <span className="font-semibold block text-slate-500">Scores:</span>
                  {Object.keys(parsedData.points).filter(k => parsedData.points[Number(k)] > 0).length} week(s)
                </div>
              </div>
            </div>
          )}

          <button
            id="import-action-btn"
            disabled={!parsedData}
            onClick={handleManualImport}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              parsedData
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            Overwrite Device Data 🚀
          </button>
        </div>
      )}
    </div>
  );
}
