import React from 'react';
import { Sliders, Zap, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { DownloaderSettings } from '../types';

interface SettingsPanelProps {
  settings: DownloaderSettings;
  onChange: (settings: DownloaderSettings) => void;
}

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const updateSetting = <K extends keyof DownloaderSettings>(key: K, value: DownloaderSettings[K]) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div id="settings-panel-container" className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 font-sans">
      <div className="flex items-center gap-2.5 mb-5">
        <Sliders className="w-5 h-5 text-cyan-400" />
        <h3 className="text-base font-bold text-slate-100 tracking-wide">
          Downloader Engine Configurations
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Speed & Failures */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                Connection Speed Limit
              </label>
              <span className="text-xs font-mono font-semibold text-cyan-400">
                {settings.maxSpeedMbps === 0 ? '🏎️ Uncapped (Full Bandwidth)' : `${settings.maxSpeedMbps} Mbps`}
              </span>
            </div>
            <input
              id="speed-limit-slider"
              type="range"
              min="0"
              max="1000"
              step="50"
              value={settings.maxSpeedMbps}
              onChange={(e) => updateSetting('maxSpeedMbps', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              Simulates a throttled connection speed. Uncapped uses your browser's full network speed capabilities.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-0.5">
                Simulate Network Interruption
              </label>
              <p className="text-[10px] text-slate-500 leading-normal">
                Trigger a mock temporary packet loss/connection failure mid-transfer.
              </p>
            </div>
            <button
              id="simulate-failure-btn"
              type="button"
              onClick={() => updateSetting('simulateFailure', !settings.simulateFailure)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                settings.simulateFailure ? 'bg-red-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.simulateFailure ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Column: Audio Bitrates & Post-processing */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Preferred Audio Transcoding Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['128', '192', '320'] as const).map((bitrate) => (
                <button
                  id={`bitrate-${bitrate}-btn`}
                  key={bitrate}
                  type="button"
                  onClick={() => updateSetting('preferredAudioBitrate', bitrate)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    settings.preferredAudioBitrate === bitrate
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/5'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {bitrate} kbps
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              High-definition formats will be transcoded to this target audio bitrate.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Auto-Merge Audio/Video
              </label>
              <p className="text-[10px] text-slate-500 leading-normal">
                YouTube requires separate streams for high definition. Merge automatically upon download completion.
              </p>
            </div>
            <button
              id="auto-merge-btn"
              type="button"
              onClick={() => updateSetting('autoMerge', !settings.autoMerge)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                settings.autoMerge ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.autoMerge ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
