import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Sparkles, 
  Search, 
  Loader2, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  Youtube, 
  Instagram, 
  Download, 
  ChevronRight,
  Monitor,
  Music,
  Tv,
  Eye,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Platform, VideoMetadata, Format } from '../types';
import { detectPlatform, fetchMediaMetadata, extractIdFromUrl } from '../utils/mediaHelper';

interface TabContentProps {
  platform: Platform;
  onDownloadStart: (metadata: VideoMetadata, format: Format) => void;
  isDownloadingAny: boolean;
}

export default function TabContent({ platform, onDownloadStart, isDownloadingAny }: TabContentProps) {
  const [url, setUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear states when platform changes
  useEffect(() => {
    setUrl('');
    setError(null);
    setWarning(null);
    setMetadata(null);
    setSelectedFormat(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [platform]);

  const validateUrl = (input: string) => {
    if (!input.trim()) {
      setError(null);
      setWarning(null);
      return;
    }

    const detected = detectPlatform(input);
    if (!detected) {
      setError(`Invalid link format. Please provide a valid ${platform === 'youtube' ? 'YouTube (e.g., youtube.com/watch?v=...)' : platform === 'tiktok' ? 'TikTok' : 'Instagram'} link.`);
      setWarning(null);
    } else if (detected !== platform) {
      setError(null);
      setWarning(`This looks like a ${detected.toUpperCase()} link. You are currently in the ${platform.toUpperCase()} tab. Switch tabs to process.`);
    } else {
      setError(null);
      setWarning(null);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    validateUrl(value);
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const detected = detectPlatform(url);
    if (!detected || detected !== platform) {
      validateUrl(url);
      return;
    }

    setIsFetching(true);
    setError(null);
    setMetadata(null);
    setSelectedFormat(null);

    try {
      const data = await fetchMediaMetadata(url, platform);
      setMetadata(data);
      // Auto-select the premium/highest resolution format
      const premiumFormat = data.formats.find(f => !f.isAudio) || data.formats[0];
      setSelectedFormat(premiumFormat || null);
    } catch (err) {
      setError('Could not fetch video details. Please verify your internet connection and try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handlePasteDemoLink = () => {
    let demoLink = '';
    if (platform === 'youtube') {
      demoLink = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    } else if (platform === 'tiktok') {
      demoLink = 'https://www.tiktok.com/@dev_dan/video/7391823901';
    } else if (platform === 'instagram') {
      demoLink = 'https://www.instagram.com/reel/C8_AmalfiCoast';
    }
    setUrl(demoLink);
    setError(null);
    setWarning(null);

    // Auto trigger resolve after setting state
    setIsFetching(true);
    setMetadata(null);
    setSelectedFormat(null);
    
    fetchMediaMetadata(demoLink, platform).then((data) => {
      setMetadata(data);
      const premiumFormat = data.formats.find(f => !f.isAudio) || data.formats[0];
      setSelectedFormat(premiumFormat || null);
      setIsFetching(false);
    });
  };

  const handleDownloadClick = () => {
    if (metadata && selectedFormat) {
      onDownloadStart(metadata, selectedFormat);
    }
  };

  const getPlatformBrandColor = () => {
    if (platform === 'youtube') return 'bg-red-600 hover:bg-red-700 text-white';
    if (platform === 'tiktok') return 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white';
    return 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 text-white';
  };

  const getPlatformIcon = () => {
    if (platform === 'youtube') return <Youtube className="w-5 h-5 text-red-500" />;
    if (platform === 'tiktok') return <span className="font-bold text-base text-cyan-400 font-mono">𝅘𝅥𝅮</span>;
    return <Instagram className="w-5 h-5 text-pink-500" />;
  };

  return (
    <div id={`tab-content-${platform}`} className="font-sans">
      {/* Search Input Bar */}
      <form onSubmit={handleResolve} className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {getPlatformIcon()}
            </span>
            <input
              ref={inputRef}
              id="video-url-input"
              type="text"
              placeholder={`Paste your high-definition ${platform === 'youtube' ? 'YouTube video, Short, or Playlist' : platform === 'tiktok' ? 'TikTok link' : 'Instagram Reel / Photo'} link here...`}
              value={url}
              onChange={handleUrlChange}
              disabled={isFetching}
              className={`w-full pl-11 pr-4 py-3.5 bg-slate-950/60 hover:bg-slate-950/80 focus:bg-slate-950 text-sm rounded-2xl border ${
                error 
                  ? 'border-red-500/80 focus:ring-1 focus:ring-red-500' 
                  : warning 
                    ? 'border-amber-500/80 focus:ring-1 focus:ring-amber-500' 
                    : 'border-slate-800 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20'
              } text-slate-100 placeholder-slate-500 transition-all font-sans outline-none`}
            />
          </div>
          <button
            id="resolve-video-btn"
            type="submit"
            disabled={isFetching || !url.trim() || !!error}
            className={`px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              isFetching || !url.trim() || !!error
                ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                : getPlatformBrandColor()
            }`}
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>

        {/* Validation Errors & Dynamic Suggestions */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-0 right-0 mt-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-xl flex items-center gap-2 z-10"
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {warning && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-0 right-0 mt-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs py-2 px-3 rounded-xl flex items-center gap-2 z-10"
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{warning}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Demo Links if empty */}
      {!url && !metadata && !isFetching && (
        <div id="demo-links-container" className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/20 mb-6">
          <p className="text-xs text-slate-400 mb-3 text-center px-4">
            Don't have a video link handy? Paste our high-definition test link to experience the downloading engine:
          </p>
          <button
            id="use-demo-link-btn"
            type="button"
            onClick={handlePasteDemoLink}
            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 text-xs font-semibold rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-950/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Paste Premium HD Demo Link
          </button>
        </div>
      )}

      {/* Skeleton Fetching state */}
      {isFetching && (
        <div id="fetching-skeleton" className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 mb-6 animate-pulse">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="w-full md:w-56 h-32 bg-slate-800 rounded-xl" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-slate-800 rounded-md w-3/4" />
              <div className="h-3 bg-slate-800 rounded-md w-1/4" />
              <div className="space-y-2 pt-2">
                <div className="h-2 bg-slate-800 rounded-md" />
                <div className="h-2 bg-slate-800 rounded-md w-5/6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Metadata Display & Format Selector */}
      <AnimatePresence>
        {metadata && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            id="metadata-display"
            className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 mb-6"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Media Card Info */}
              <div className="w-full lg:w-2/5 flex flex-col gap-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black group shadow-xl">
                  <img
                    src={metadata.thumbnail}
                    alt={metadata.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-3">
                    <span className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded text-slate-300">
                      {metadata.duration}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-100 line-clamp-2 leading-relaxed font-sans mb-1">
                    {metadata.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Creator: <span className="text-cyan-400 font-mono">{metadata.author}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-sans">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{metadata.views || 'N/A'} Views</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-sans">
                    <Heart className="w-3.5 h-3.5 text-slate-500" />
                    <span>{metadata.likes || 'N/A'} Likes</span>
                  </div>
                </div>
              </div>

              {/* Formats Selection Column */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    Choose Download Resolution
                  </h4>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {metadata.formats.map((format) => {
                      const isSelected = selectedFormat?.id === format.id;
                      return (
                        <button
                          id={`format-item-${format.id}`}
                          key={format.id}
                          type="button"
                          onClick={() => setSelectedFormat(format)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/10 border-cyan-500/80 shadow-md shadow-cyan-500/5'
                              : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${
                              format.isAudio 
                                ? 'bg-indigo-500/10 text-indigo-400' 
                                : format.quality === 'UHD' 
                                  ? 'bg-purple-500/10 text-purple-400' 
                                  : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {format.isAudio ? <Music className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-200">{format.resolution}</span>
                                {format.fps && (
                                  <span className="text-[9px] font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">
                                    {format.fps} FPS
                                  </span>
                                )}
                                {format.quality === 'UHD' && (
                                  <span className="text-[9px] font-bold text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded">
                                    Ultra HD
                                  </span>
                                )}
                                {format.quality === 'HD' && (
                                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/15 px-1.5 py-0.5 rounded">
                                    HD
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                                {format.label} • {format.ext.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                              {format.size}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-800'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/40">
                  <motion.button
                    id="trigger-download-btn"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleDownloadClick}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
                    type="button"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    Download in High-Definition
                  </motion.button>
                  <p className="text-[10px] text-center text-slate-500 mt-2 font-sans">
                    By clicking download, files are written onto your configured output folder directory directly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
