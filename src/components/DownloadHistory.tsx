import React from 'react';
import { 
  Play, 
  Pause, 
  X, 
  CheckCircle2, 
  XCircle, 
  FolderCheck, 
  Clock, 
  Trash2, 
  Sparkles,
  TrendingUp,
  HardDrive,
  Cpu,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DownloadJob } from '../types';

interface DownloadHistoryProps {
  jobs: DownloadJob[];
  onPauseJob: (id: string) => void;
  onResumeJob: (id: string) => void;
  onCancelJob: (id: string) => void;
  onClearHistory: () => void;
}

// Utility to format sizes into human-readable strings
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Utility to format transfer rate speed
export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec === 0) return '0 B/s';
  return `${formatBytes(bytesPerSec, 1)}/s`;
}

export default function DownloadHistory({
  jobs,
  onPauseJob,
  onResumeJob,
  onCancelJob,
  onClearHistory
}: DownloadHistoryProps) {
  
  // Statistics calculations
  const totalDownloadedBytes = jobs
    .filter(j => j.status === 'completed')
    .reduce((acc, job) => acc + job.sizeBytes, 0);

  const activeCount = jobs.filter(j => 
    ['downloading', 'fetching', 'merging', 'writing'].includes(j.status)
  ).length;

  const successfulCount = jobs.filter(j => j.status === 'completed').length;
  
  const getStatusBadge = (job: DownloadJob) => {
    switch (job.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Finished
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
            <Clock className="w-3 h-3" />
            Paused
          </span>
        );
      case 'fetching':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Connecting
          </span>
        );
      case 'merging':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 animate-pulse">
            <Cpu className="w-3 h-3" />
            Demuxing
          </span>
        );
      case 'writing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 animate-pulse">
            <HardDrive className="w-3 h-3" />
            Writing Disk
          </span>
        );
      default: // downloading
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-400 animate-pulse">
            <TrendingUp className="w-3 h-3" />
            Active
          </span>
        );
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <span className="text-xs bg-red-600/10 text-red-500 font-bold px-2 py-0.5 rounded font-mono">YT</span>;
      case 'tiktok':
        return <span className="text-xs bg-slate-950/80 border border-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded font-mono">TT</span>;
      default:
        return <span className="text-xs bg-pink-500/10 text-pink-500 font-bold px-2 py-0.5 rounded font-mono">IG</span>;
    }
  };

  return (
    <div id="download-history-section" className="font-sans space-y-6">
      {/* Analytics Bento Grid Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">
              Total Downloaded
            </p>
            <p className="text-base font-black text-slate-100 font-mono mt-0.5">
              {formatBytes(totalDownloadedBytes)}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">
              Successful Videos
            </p>
            <p className="text-base font-black text-slate-100 font-mono mt-0.5">
              {successfulCount} <span className="text-xs font-normal text-slate-500">files</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">
              Active Queues
            </p>
            <p className="text-base font-black text-slate-100 font-mono mt-0.5">
              {activeCount} <span className="text-xs font-normal text-slate-500 font-sans">running</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Download Queue List Container */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-sans">
              Download File Transfer Manager
            </h3>
          </div>
          
          {jobs.length > 0 && (
            <button
              id="clear-all-history-btn"
              type="button"
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer font-sans font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Manager
            </button>
          )}
        </div>

        <div className="p-5">
          {jobs.length === 0 ? (
            <div id="empty-history" className="flex flex-col items-center justify-center py-12 text-center">
              <FolderCheck className="w-12 h-12 text-slate-700 mb-3" />
              <h4 className="text-sm font-semibold text-slate-400 mb-1 font-sans">
                No active file transfers found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm font-sans leading-relaxed">
                Paste a TikTok, YouTube, or Instagram video URL above and click Analyze to choose a resolution and start downloading.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {jobs.map((job) => {
                  const isActive = ['downloading', 'fetching', 'merging', 'writing'].includes(job.status);
                  const isFinished = job.status === 'completed';
                  const isPaused = job.status === 'paused';
                  const isFailed = job.status === 'failed';

                  return (
                    <motion.div
                      id={`job-item-${job.id}`}
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-3"
                    >
                      {/* Header row of list item */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {getPlatformIcon(job.platform)}
                          
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-200 truncate pr-2 font-sans" title={job.title}>
                              {job.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[10px] text-slate-400 font-sans">
                              <span>Format: <strong className="text-slate-300 font-mono">{job.format.resolution} ({job.format.ext.toUpperCase()})</strong></span>
                              <span>•</span>
                              <span>Creator: <strong className="text-slate-300 font-mono">{job.author}</strong></span>
                              {job.folderPath && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-xs text-cyan-400 font-mono">
                                    📁 {job.folderPath}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {getStatusBadge(job)}
                          
                          {/* Transfer actions */}
                          <div className="flex items-center gap-1.5">
                            {isActive && (
                              <button
                                id={`pause-btn-${job.id}`}
                                type="button"
                                onClick={() => onPauseJob(job.id)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg hover:text-cyan-400 transition-all border border-slate-800"
                                title="Pause transfer"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isPaused && (
                              <button
                                id={`resume-btn-${job.id}`}
                                type="button"
                                onClick={() => onResumeJob(job.id)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg hover:text-emerald-400 transition-all border border-slate-800"
                                title="Resume transfer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </button>
                            )}

                            {isFailed && (
                              <button
                                id={`retry-btn-${job.id}`}
                                type="button"
                                onClick={() => onResumeJob(job.id)}
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[10px] font-bold rounded-lg border border-red-500/25 transition-all"
                              >
                                Retry
                              </button>
                            )}

                            {/* Cancel / Remove */}
                            {!isFinished && (
                              <button
                                id={`cancel-btn-${job.id}`}
                                type="button"
                                onClick={() => onCancelJob(job.id)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-all border border-slate-800"
                                title="Cancel and delete"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Progress bar with active simulation */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/40">
                          <motion.div
                            id={`progress-bar-${job.id}`}
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFailed 
                                ? 'bg-red-500' 
                                : isFinished 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                  : isPaused 
                                    ? 'bg-amber-500' 
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse'
                            }`}
                            style={{ width: `${job.progress}%` }}
                            initial={{ width: 0 }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono font-medium text-slate-400">
                          {isActive ? (
                            <div className="flex items-center gap-3">
                              <span>Speed: <strong className="text-cyan-400">{formatSpeed(job.speedBytesPerSec)}</strong></span>
                              <span>•</span>
                              <span>ETA: <strong className="text-slate-300">
                                {job.speedBytesPerSec > 0 
                                  ? `${Math.ceil((job.sizeBytes - job.downloadedBytes) / job.speedBytesPerSec)}s` 
                                  : 'Calculating...'}
                              </strong></span>
                            </div>
                          ) : isFailed ? (
                            <div className="flex items-center gap-1.5 text-red-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Error: {job.errorMsg || 'Connection reset by peer.'}</span>
                            </div>
                          ) : isFinished ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 font-sans">
                              ✨ High-definition download successfully written.
                            </span>
                          ) : (
                            <span>Transfer suspended at {Math.round(job.progress)}%</span>
                          )}

                          <span>
                            {formatBytes(job.downloadedBytes)} / {formatBytes(job.sizeBytes)} ({Math.round(job.progress)}%)
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
