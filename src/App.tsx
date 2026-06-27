import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Youtube, 
  Instagram, 
  Settings, 
  FolderSync, 
  CheckCircle2, 
  X, 
  Clock, 
  AlertCircle, 
  HelpCircle,
  HelpCircle as InfoIcon,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Platform, VideoMetadata, Format, DownloadJob, DownloaderSettings, DownloadStatus } from './types';
import TabContent from './components/TabContent';
import DownloadHistory, { formatBytes } from './components/DownloadHistory';
import DirectorySelector from './components/DirectorySelector';
import SettingsPanel from './components/SettingsPanel';
import { generateDummyMediaBlob } from './utils/mediaHelper';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  message: string;
}

export default function App() {
  // Navigation tabs: 'youtube' | 'tiktok' | 'instagram'
  const [activeTab, setActiveTab] = useState<Platform>('tiktok');
  
  // File System Access States
  const [dirHandle, setDirHandle] = useState<any | null>(null);
  const [selectedDirName, setSelectedDirName] = useState<string>('');

  // Downloader Configuration Engine Settings
  const [settings, setSettings] = useState<DownloaderSettings>({
    maxSpeedMbps: 0, // Uncapped
    autoMerge: true,
    notifyOnComplete: true,
    preferredAudioBitrate: '320',
    simulateFailure: false
  });

  // Active Download Jobs and Queues State
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  
  // Custom interactive toasts/notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Clock state for beautiful header
  const [currentTime, setCurrentTime] = useState<string>('');

  // Load UTC time continuously
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDirectorySelected = (handle: any | null, name: string) => {
    setDirHandle(handle);
    setSelectedDirName(name);
    if (name) {
      addToast('success', `Output directory changed to "${name}"`);
    } else {
      addToast('info', 'Defaulted to browser standard Downloads');
    }
  };

  // Triggering the media download transfer
  const handleStartDownload = (metadata: VideoMetadata, format: Format) => {
    // Check if job already active in queue
    const jobId = `${activeTab}-${metadata.title.substring(0, 10)}-${format.id}`;
    const alreadyExists = jobs.some(j => j.id === jobId && ['downloading', 'fetching', 'merging', 'writing'].includes(j.status));
    
    if (alreadyExists) {
      addToast('warning', 'A download for this media format is already active.');
      return;
    }

    const newJob: DownloadJob = {
      id: jobId,
      platform: activeTab,
      url: metadata.thumbnail, // temporary storage of source info
      title: metadata.title,
      author: metadata.author,
      format: format,
      sizeBytes: format.sizeBytes,
      downloadedBytes: 0,
      speedBytesPerSec: 0,
      status: 'fetching',
      progress: 0,
      timestamp: Date.now(),
      folderPath: selectedDirName || 'Standard Downloads'
    };

    setJobs((prev) => [newJob, ...prev]);
    addToast('info', `Connecting and initiating transfer for "${metadata.title.substring(0, 20)}..."`);
  };

  // Job Actions
  const handlePauseJob = (id: string) => {
    setJobs((prev) => prev.map((job) => {
      if (job.id === id) {
        return {
          ...job,
          status: 'paused',
          speedBytesPerSec: 0
        };
      }
      return job;
    }));
    addToast('info', 'Media file transfer suspended.');
  };

  const handleResumeJob = (id: string) => {
    setJobs((prev) => prev.map((job) => {
      if (job.id === id) {
        return {
          ...job,
          status: 'downloading',
          errorMsg: undefined
        };
      }
      return job;
    }));
    addToast('info', 'Resuming media stream transfer.');
  };

  const handleCancelJob = (id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
    addToast('warning', 'Download job cancelled.');
  };

  const handleClearHistory = () => {
    setJobs([]);
    addToast('info', 'Download histories cleared.');
  };

  // Background Stream Simulation Ticker Engine
  useEffect(() => {
    const activeJobsExist = jobs.some(j => 
      ['fetching', 'downloading', 'merging', 'writing'].includes(j.status)
    );

    if (!activeJobsExist) return;

    // Simulation tick runs every 400ms
    const timer = setInterval(() => {
      setJobs((prevJobs) => {
        return prevJobs.map((job) => {
          if (job.status === 'fetching') {
            // Spend 1.2s connecting to stream source
            const elapsed = Date.now() - job.timestamp;
            if (elapsed > 1200) {
              return {
                ...job,
                status: 'downloading'
              };
            }
            return job;
          }

          if (job.status === 'downloading') {
            // Calculate tick speed
            let speedBytesPerSec = 0;
            if (settings.maxSpeedMbps > 0) {
              // Convert Mbps to Bytes per second and add small variation
              const baseSpeed = (settings.maxSpeedMbps * 1024 * 1024) / 8;
              speedBytesPerSec = baseSpeed * (0.85 + Math.random() * 0.3);
            } else {
              // Uncapped fast simulation (30MB/s to 90MB/s)
              speedBytesPerSec = (35 + Math.random() * 55) * 1024 * 1024;
            }

            // In 400ms, bytes transferred is speedBytesPerSec * 0.4
            const tickBytes = speedBytesPerSec * 0.4;
            const newDownloadedBytes = Math.min(job.sizeBytes, job.downloadedBytes + tickBytes);
            const progress = (newDownloadedBytes / job.sizeBytes) * 100;

            // Trigger packet-loss/simulation failures if toggled
            if (settings.simulateFailure && progress > 45 && progress < 55) {
              return {
                ...job,
                status: 'failed',
                progress: 50,
                speedBytesPerSec: 0,
                errorMsg: 'Remote server timed out. Connection reset.'
              };
            }

            if (newDownloadedBytes >= job.sizeBytes) {
              // Completed downloading chunk
              if (job.platform === 'youtube' && settings.autoMerge) {
                return {
                  ...job,
                  downloadedBytes: job.sizeBytes,
                  progress: 100,
                  speedBytesPerSec: 0,
                  status: 'merging'
                };
              } else {
                return {
                  ...job,
                  downloadedBytes: job.sizeBytes,
                  progress: 100,
                  speedBytesPerSec: 0,
                  status: 'writing'
                };
              }
            }

            return {
              ...job,
              downloadedBytes: newDownloadedBytes,
              progress,
              speedBytesPerSec
            };
          }

          if (job.status === 'merging') {
            // YouTube high definition demuxing holds for a few ticks
            // We use standard timestamp calculation
            return {
              ...job,
              status: 'writing'
            };
          }

          if (job.status === 'writing') {
            // Trigger actual disk write
            const triggerWrite = async () => {
              const filename = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_${job.format.resolution}.${job.format.ext}`;
              const blob = generateDummyMediaBlob(job.title, job.format.label, job.platform);

              if (dirHandle) {
                try {
                  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
                  const writable = await fileHandle.createWritable();
                  await writable.write(blob);
                  await writable.close();
                } catch (e) {
                  console.error('Directory write failed, falling back to anchor trigger:', e);
                  triggerBrowserDownload(blob, filename);
                }
              } else {
                // Trigger standard anchor download fallback
                triggerBrowserDownload(blob, filename);
              }
            };

            triggerWrite();

            if (settings.notifyOnComplete) {
              addToast('success', `"${job.title.substring(0, 20)}..." downloaded successfully!`);
            }

            return {
              ...job,
              status: 'completed'
            };
          }

          return job;
        });
      });
    }, 400);

    return () => clearInterval(timer);
  }, [jobs, settings, dirHandle]);

  const triggerBrowserDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Toast Overlay Notifications */}
      <div id="toast-container" className="fixed top-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              id={`toast-${toast.id}`}
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-xl border shadow-2xl pointer-events-auto flex items-start gap-3.5 ${
                toast.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                  : toast.type === 'error'
                    ? 'bg-red-950/90 border-red-500/40 text-red-200'
                    : toast.type === 'warning'
                      ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/90 border-slate-800 text-slate-200'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                {toast.type === 'info' && <InfoIcon className="w-4 h-4 text-cyan-400" />}
              </div>
              
              <div className="flex-1">
                <p className="text-xs font-medium font-sans leading-relaxed">{toast.message}</p>
              </div>

              <button
                id={`close-toast-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                type="button"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Body Section */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        
        {/* Header Hero Area */}
        <header id="main-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                <Download className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100 font-sans">
                Pep<span className="text-cyan-400">Downloader</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-cyan-400/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-400/20">
                V3.0 Stable
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mt-1.5 font-sans">
              Secure, server-less high-definition media transfer for TikTok, YouTube, and Instagram.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              🕒 {currentTime || 'Loading clock...'}
            </span>
          </div>
        </header>

        {/* Directory Destination Picker */}
        <DirectorySelector 
          onDirectorySelected={handleDirectorySelected}
          selectedDirName={selectedDirName}
        />

        {/* Platform Tabs Control Board */}
        <div id="tabs-navigation-panel" className="bg-slate-900/30 border border-slate-900 rounded-3xl p-2.5 flex flex-wrap gap-2.5">
          <button
            id="tab-tiktok"
            type="button"
            onClick={() => setActiveTab('tiktok')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'tiktok'
                ? 'bg-slate-950 text-slate-100 shadow-xl border border-slate-800/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <span className="text-sm">𝅘𝅥𝅮</span>
            TikTok HD
          </button>

          <button
            id="tab-youtube"
            type="button"
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'youtube'
                ? 'bg-red-950/20 text-red-400 shadow-xl border border-red-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Youtube className="w-4 h-4" />
            YouTube HD
          </button>

          <button
            id="tab-instagram"
            type="button"
            onClick={() => setActiveTab('instagram')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'instagram'
                ? 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 text-pink-400 shadow-xl border border-pink-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Instagram className="w-4 h-4" />
            Instagram Reels
          </button>
        </div>

        {/* Tab Content Window Container */}
        <div id="tab-window" className="bg-slate-900/10 border border-slate-900 rounded-3xl p-1">
          <TabContent 
            platform={activeTab} 
            onDownloadStart={handleStartDownload}
            isDownloadingAny={jobs.some(j => ['fetching', 'downloading'].includes(j.status))}
          />
        </div>

        {/* Transfer manager list */}
        <DownloadHistory 
          jobs={jobs}
          onPauseJob={handlePauseJob}
          onResumeJob={handleResumeJob}
          onCancelJob={handleCancelJob}
          onClearHistory={handleClearHistory}
        />

        {/* Engine Configuration Module */}
        <SettingsPanel 
          settings={settings}
          onChange={setSettings}
        />

      </div>

      {/* Aesthetic human footer */}
      <footer id="main-footer" className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6">
        <div className="max-w-6xl w-full mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>PepDownloader Engine is fully compliant and sandboxed offline‑ready client app.</span>
          </div>

          <div>
            <span>Developed in React • Vite • Tailwind</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
