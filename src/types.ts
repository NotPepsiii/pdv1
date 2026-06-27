export type Platform = 'tiktok' | 'youtube' | 'instagram';

export type DownloadStatus = 
  | 'idle' 
  | 'fetching' 
  | 'ready' 
  | 'downloading' 
  | 'paused' 
  | 'merging' 
  | 'writing' 
  | 'completed' 
  | 'failed';

export interface Format {
  id: string;
  label: string;
  resolution: string;
  size: string;
  sizeBytes: number;
  fps?: number;
  ext: string;
  isAudio: boolean;
  bitrate?: string;
  quality: 'SD' | 'HD' | 'UHD' | 'AUDIO';
}

export interface VideoMetadata {
  title: string;
  author: string;
  duration: string;
  thumbnail: string;
  formats: Format[];
  views?: string;
  likes?: string;
}

export interface DownloadJob {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  author: string;
  format: Format;
  sizeBytes: number;
  downloadedBytes: number;
  speedBytesPerSec: number;
  status: DownloadStatus;
  progress: number;
  errorMsg?: string;
  timestamp: number;
  folderPath: string;
}

export interface DownloaderSettings {
  maxSpeedMbps: number; // 0 for unlimited
  autoMerge: boolean;
  notifyOnComplete: boolean;
  preferredAudioBitrate: '128' | '192' | '320';
  simulateFailure: boolean;
}
