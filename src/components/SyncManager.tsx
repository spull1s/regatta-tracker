import { useState } from 'react';
import { Copy, Check, Upload, Download, Smartphone, Laptop, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { RegattaConfig, RegattaPoints, RegattaHistoryItem } from '../types';

interface SyncManagerProps {
  config: RegattaConfig;
  points: RegattaPoints;
  history: RegattaHistoryItem[];
  onImportSuccess: (data: { config: RegattaConfig; points: RegattaPoints; history: RegattaHistoryItem[] }) => void;
}

export default function SyncManager({ config, points, history, onImportSuccess }: SyncManagerProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importToken, setImportToken] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    config: RegattaConfig;
    points: RegattaPoints;
    history: RegattaHistoryItem[];
  } | null>(null);

  // Helper to generate the export token
  const getExportToken = () => {
    try {
      const allData = { config, points, history };
      const jsonStr = JSON.stringify(allData);
      return btoa(encodeURIComponent(jsonStr));
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
      // Fallback if clipboard API is blocked
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
        // Validate basic structure
        setParsedData({
          config: decoded.config || { theme: '', startDate: '' },
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

  const handleImport = () => {
    if (!parsedData) return;
    onImportSuccess(parsedData);
    setImportToken('');
    setParsedData(null);
  };

  return (
    <div id="sync-manager-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-sky-500 animate-spin-slow" />
            Sync Across Devices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Seamlessly move your regatta tracking progress between Phone, Tablet, and PC.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl self-start sm:self-auto border border-transparent dark:border-slate-850">
          <button
            id="sync-tab-export"
            onClick={() => { setActiveTab('export'); setImportError(null); setParsedData(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Export (Device A)
          </button>
          <button
            id="sync-tab-import"
            onClick={() => { setActiveTab('import'); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Import (Device B)
          </button>
        </div>
      </div>

      {activeTab === 'export' ? (
        <div className="space-y-5 animate-fade-in">
          {/* Visual Step Map */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-sky-500/10 text-blue-600 dark:text-sky-400 border border-transparent dark:border-sky-500/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Copy Sync Token</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Click the export button below to secure your code.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:border-l md:border-slate-200 dark:md:border-slate-800/80 md:pl-4">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-sky-500/10 text-blue-600 dark:text-sky-400 border border-transparent dark:border-sky-500/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Send to Other Device</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Send it to yourself via email, chat, or a notes app.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:border-l md:border-slate-200 dark:md:border-slate-800/80 md:pl-4">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-sky-500/10 text-blue-600 dark:text-sky-400 border border-transparent dark:border-sky-500/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Paste and Enjoy</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Open this site on device B, select Import, and paste.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 bg-sky-50/50 dark:bg-sky-500/5 p-4 rounded-2xl border border-sky-100/50 dark:border-sky-500/10">
            <div className="flex items-center gap-3 justify-center text-slate-600 dark:text-slate-400">
              <Smartphone className="w-8 h-8 text-sky-500 shrink-0" />
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Laptop className="w-10 h-10 text-sky-500 shrink-0" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Ready to transfer?</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Your current configuration, week scores ({Object.keys(points).filter(k => points[Number(k)] > 0).length}/4 completed), and all-time history of {history.length} regatta{history.length !== 1 ? 's' : ''} will be packaged securely.
              </p>
            </div>
          </div>

          <div>
            <button
              id="export-action-btn"
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
                  : 'bg-sky-600 hover:bg-sky-500 text-white hover:shadow-lg hover:shadow-sky-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied Code to Clipboard!
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Generate & Copy Sync Code
                </>
              )}
            </button>
          </div>

          {/* Hidden/Backup text area in case browser clipboard API is blocked */}
          <div className="space-y-1.5">
            <label htmlFor="sync-token-textarea" className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
              Sync Token Backup Area
            </label>
            <textarea
              id="sync-token-textarea"
              readOnly
              value={getExportToken()}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              className="w-full h-14 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] font-mono text-slate-500 dark:text-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Click button above to generate"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1.5">
            <label htmlFor="import-token-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              Paste Sync Token
              <span className="text-[10px] text-slate-400 font-normal">(Base64 format)</span>
            </label>
            <textarea
              id="import-token-input"
              rows={4}
              value={importToken}
              onChange={(e) => handleTokenChange(e.target.value)}
              placeholder="Paste your exported token here..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          {importError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-bold">Parsing failed</p>
                <p className="text-[11px] mt-0.5">{importError}</p>
              </div>
            </div>
          )}

          {parsedData && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-xl space-y-2 text-xs">
              <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" />
                Valid Sync Token Decoded Successfully!
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-200/40 dark:border-emerald-800/40 text-[11px] text-emerald-700/90 dark:text-emerald-300/90">
                <div>
                  <span className="font-semibold block text-slate-500 dark:text-slate-400">Current Season Theme:</span>
                  {parsedData.config.theme || 'No theme named'} (Starts {parsedData.config.startDate || 'N/A'})
                </div>
                <div>
                  <span className="font-semibold block text-slate-500 dark:text-slate-400">Active Scores:</span>
                  {Object.keys(parsedData.points).filter(k => parsedData.points[Number(k)] > 0).length} week(s) scored
                </div>
                <div className="col-span-2">
                  <span className="font-semibold block text-slate-500 dark:text-slate-400">Archived History:</span>
                  {parsedData.history.length} past regatta season(s) saved
                </div>
              </div>

              <div className="pt-2 text-[10px] text-amber-600 dark:text-amber-400 italic">
                ⚠️ Warning: Importing will replace your current device's data. This action is irreversible.
              </div>
            </div>
          )}

          <div>
            <button
              id="import-action-btn"
              disabled={!parsedData}
              onClick={handleImport}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                parsedData
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 hover:shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Confirm & Overwrite Data 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
