import React, { useState, useEffect } from 'react';
import { Folder, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DirectorySelectorProps {
  onDirectorySelected: (handle: any | null, name: string) => void;
  selectedDirName: string;
}

export default function DirectorySelector({ onDirectorySelected, selectedDirName }: DirectorySelectorProps) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    // Check if File System Access API is supported
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const handlePickDirectory = async () => {
    if (!isSupported) return;

    try {
      // Clear security permissions just in case or request new picker
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      
      setPermissionState('granted');
      onDirectorySelected(handle, handle.name);
    } catch (err: any) {
      console.warn('Directory picking cancelled or failed:', err);
      if (err.name === 'NotAllowedError') {
        setPermissionState('denied');
      }
    }
  };

  return (
    <div id="directory-selector-container" className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-sans">
              Output Destination
            </h3>
            <div className="relative">
              <button 
                id="info-tooltip-btn"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                type="button"
                aria-label="How local downloads work"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl p-3 shadow-2xl z-50 leading-relaxed font-sans">
                  <p className="mb-1.5 font-semibold text-slate-100">About Local Folder Access:</p>
                  PepDownloader is a <span className="text-cyan-400 font-semibold">100% frontend</span> application. It uses the modern <span className="text-slate-100 font-medium">File System Access API</span> to stream and write videos directly onto your local disk. Your files never touch our servers!
                </div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-slate-400 font-sans">
            Select where PepDownloader will save your processed high-definition video files.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSupported ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl max-w-xs overflow-hidden">
                <Folder className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-xs font-mono truncate text-slate-300" title={selectedDirName}>
                  {selectedDirName || 'Default Browser Downloads'}
                </span>
              </div>

              <motion.button
                id="select-directory-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePickDirectory}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-100 text-xs font-semibold rounded-xl transition-all border border-slate-700/50 cursor-pointer shadow-lg hover:shadow-cyan-500/10"
                type="button"
              >
                <Folder className="w-4 h-4 text-cyan-400" />
                Change Folder
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl max-w-md">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-300 font-sans">
                  Browser Sandboxed Mode
                </p>
                <p className="text-[10px] text-amber-400/80 leading-relaxed font-sans">
                  Direct folder access is restricted by your browser. Videos will download automatically to your system's default <b>Downloads</b> folder.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {permissionState === 'denied' && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Folder permissions were denied. Defaulting to standard browser downloads. You can click "Change Folder" to retry.</span>
        </div>
      )}

      {permissionState === 'granted' && selectedDirName && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Success! Connected to directory: <strong className="font-semibold text-emerald-300 font-mono">{selectedDirName}</strong>. Ready for writing.</span>
        </div>
      )}
    </div>
  );
}
