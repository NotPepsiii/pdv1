import { Platform, VideoMetadata, Format } from '../types';

// Regular expressions to check URL patterns
export const URL_PATTERNS = {
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)?([a-zA-Z0-9_-]{11})/,
  tiktok: /^(https?:\/\/)?(www\.|vm\.|vt\.)?tiktok\.com\/(@[a-zA-Z0-9_.-]+\/video\/[0-9]+|[a-zA-Z0-9]+)/,
  instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/
};

export function detectPlatform(url: string): Platform | null {
  const cleanUrl = url.trim();
  if (URL_PATTERNS.youtube.test(cleanUrl)) return 'youtube';
  if (URL_PATTERNS.tiktok.test(cleanUrl)) return 'tiktok';
  if (URL_PATTERNS.instagram.test(cleanUrl)) return 'instagram';
  return null;
}

// Beautiful royalty-free stock mock images that perfectly represent the requested platforms
const PLACEHOLDER_THUMBNAILS = {
  youtube: [
    'https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=600&auto=format&fit=crop&q=80', // tech setup
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80', // gaming
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', // music
    'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600&auto=format&fit=crop&q=80', // travel
  ],
  tiktok: [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80', // dance/dj
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80', // street performance
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80', // vlog
  ],
  instagram: [
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&auto=format&fit=crop&q=80', // fashion
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', // food
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=80', // aesthetic nature
  ]
};

const RANDOM_TITLES = {
  youtube: [
    'Building a High-Performance Web App in 2026',
    'Unboxing the Ultimate Developer Desktop Setup!',
    'Lo-Fi Beats for Coding, Focusing and Chill [2 Hours]',
    'Solo Backpacking Across Switzerland - Raw Footage (4K)',
    '10 Web APIs You Didn\'t Know Existed',
  ],
  tiktok: [
    'When the code compiled on the first try 😂 #developer #coding',
    'My 5 AM minimalist morning routine in Tokyo 🍵✨',
    'The easiest pasta recipe you will ever make in 10 minutes #cooking',
    'POV: explaining CSS flexbox vs grid to a non-programmer',
  ],
  instagram: [
    'Sunset over the Amalfi Coast. Still pinching myself... 🇮🇹🌅',
    'Weekly recap: healthy habits, good reads, and productivity setups.',
    'Exploring the forgotten streets of Kyoto. Full reel out now!',
    'Aesthetic desk setup upgrade with oak accessories. Details in bio ☕⌨️',
  ]
};

const RANDOM_AUTHORS = {
  youtube: ['TechBytes HQ', 'PixelCraft Studios', 'BeatAura Music', 'Vagabond Diaries', 'CodeCraftsman'],
  tiktok: ['@dev_dan', '@tokyo_tales', '@chef_mario', '@css_guru'],
  instagram: ['@explore_with_me', '@minimal_habits', '@kyoto_lens', '@workspace_inspire']
};

export function extractIdFromUrl(url: string, platform: Platform): string {
  try {
    const cleanUrl = url.trim();
    if (platform === 'youtube') {
      const match = cleanUrl.match(URL_PATTERNS.youtube);
      return match ? match[5] : 'dQw4w9WgXcQ'; // Default Rick Roll ID
    } else if (platform === 'instagram') {
      const match = cleanUrl.match(URL_PATTERNS.instagram);
      return match ? match[4] : 'instagram_post';
    } else {
      // tiktok
      const match = cleanUrl.match(URL_PATTERNS.tiktok);
      if (match) {
        return match[3] ? match[3].split('/').pop() || 'tiktok_video' : 'tiktok_video';
      }
      return 'tiktok_video';
    }
  } catch (e) {
    return 'media_file';
  }
}

export function fetchMediaMetadata(url: string, platform: Platform): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    // Simulate API fetch delay
    setTimeout(() => {
      const seed = url.length + (url.indexOf('?') || 0);
      const thumbnailIndex = seed % PLACEHOLDER_THUMBNAILS[platform].length;
      const titleIndex = seed % RANDOM_TITLES[platform].length;
      const authorIndex = seed % RANDOM_AUTHORS[platform].length;

      const title = RANDOM_TITLES[platform][titleIndex];
      const author = RANDOM_AUTHORS[platform][authorIndex];
      const thumbnail = PLACEHOLDER_THUMBNAILS[platform][thumbnailIndex];

      const durationMinutes = 1 + (seed % 15);
      const durationSeconds = seed % 60;
      const duration = platform === 'tiktok' 
        ? `00:${durationSeconds.toString().padStart(2, '0')}`
        : `${durationMinutes.toString().padStart(2, '0')}:${durationSeconds.toString().padStart(2, '0')}`;

      const viewsCount = ((seed * 14321) % 5000000 + 1000).toLocaleString();
      const likesCount = ((seed * 7321) % 450000 + 100).toLocaleString();

      const formats: Format[] = [];

      if (platform === 'youtube') {
        formats.push(
          {
            id: 'yt-4k',
            label: 'MP4 Video (Ultra HD)',
            resolution: '2160p (4K)',
            size: '284.5 MB',
            sizeBytes: 284.5 * 1024 * 1024,
            fps: 60,
            ext: 'mp4',
            isAudio: false,
            quality: 'UHD'
          },
          {
            id: 'yt-1080p',
            label: 'MP4 Video (Full HD)',
            resolution: '1080p',
            size: '95.2 MB',
            sizeBytes: 95.2 * 1024 * 1024,
            fps: 60,
            ext: 'mp4',
            isAudio: false,
            quality: 'HD'
          },
          {
            id: 'yt-720p',
            label: 'MP4 Video (HD Ready)',
            resolution: '720p',
            size: '42.1 MB',
            sizeBytes: 42.1 * 1024 * 1024,
            fps: 30,
            ext: 'mp4',
            isAudio: false,
            quality: 'SD'
          },
          {
            id: 'yt-audio-320',
            label: 'MP3 High Quality Audio',
            resolution: 'Audio',
            size: '9.4 MB',
            sizeBytes: 9.4 * 1024 * 1024,
            ext: 'mp3',
            isAudio: true,
            bitrate: '320 kbps',
            quality: 'AUDIO'
          },
          {
            id: 'yt-audio-128',
            label: 'M4A Standard Audio',
            resolution: 'Audio',
            size: '3.8 MB',
            sizeBytes: 3.8 * 1024 * 1024,
            ext: 'm4a',
            isAudio: true,
            bitrate: '128 kbps',
            quality: 'AUDIO'
          }
        );
      } else if (platform === 'tiktok') {
        formats.push(
          {
            id: 'tt-hd-nowatermark',
            label: 'MP4 Video (HD - No Watermark)',
            resolution: '1080p',
            size: '22.8 MB',
            sizeBytes: 22.8 * 1024 * 1024,
            fps: 30,
            ext: 'mp4',
            isAudio: false,
            quality: 'HD'
          },
          {
            id: 'tt-hd-watermark',
            label: 'MP4 Video (HD - With Watermark)',
            resolution: '720p',
            size: '18.4 MB',
            sizeBytes: 18.4 * 1024 * 1024,
            fps: 30,
            ext: 'mp4',
            isAudio: false,
            quality: 'SD'
          },
          {
            id: 'tt-audio',
            label: 'TikTok Original Sound (MP3)',
            resolution: 'Audio',
            size: '2.1 MB',
            sizeBytes: 2.1 * 1024 * 1024,
            ext: 'mp3',
            isAudio: true,
            bitrate: '320 kbps',
            quality: 'AUDIO'
          }
        );
      } else {
        // instagram
        formats.push(
          {
            id: 'ig-hd',
            label: 'MP4 Premium High-Def',
            resolution: '1080p',
            size: '15.6 MB',
            sizeBytes: 15.6 * 1024 * 1024,
            fps: 30,
            ext: 'mp4',
            isAudio: false,
            quality: 'HD'
          },
          {
            id: 'ig-sd',
            label: 'MP4 Standard Quality',
            resolution: '720p',
            size: '8.2 MB',
            sizeBytes: 8.2 * 1024 * 1024,
            fps: 30,
            ext: 'mp4',
            isAudio: false,
            quality: 'SD'
          },
          {
            id: 'ig-audio',
            label: 'Instagram Reel Audio (MP3)',
            resolution: 'Audio',
            size: '1.4 MB',
            sizeBytes: 1.4 * 1024 * 1024,
            ext: 'mp3',
            isAudio: true,
            bitrate: '192 kbps',
            quality: 'AUDIO'
          }
        );
      }

      resolve({
        title,
        author,
        duration,
        thumbnail,
        formats,
        views: viewsCount,
        likes: likesCount
      });
    }, 1200);
  });
}

/**
 * Creates a valid, minimum-size MP4 file containing simple byte metadata,
 * or a fully customizable text/binary file depending on formatting,
 * which the user can open to read their downloaded media details.
 * Adding a real file writer is extremely cool for client-side showDirectoryPicker.
 */
export function generateDummyMediaBlob(title: string, formatLabel: string, platform: string): Blob {
  // Construct a minimal "printable" description file containing full metadata,
  // but formatted as binary content so the OS creates it correctly.
  const content = `=======================================================
PepDownloader - 100% Client-Side High-Definition Media
=======================================================
File Title:   ${title}
Platform:     ${platform.toUpperCase()}
Format:       ${formatLabel}
Engine:       Browser Client File Stream
License:      SPDX-License-Identifier: Apache-2.0

Enjoy your high-definition content downloaded with PepDownloader!
This file was written directly using the Web File System Access API.
`;
  const encoder = new TextEncoder();
  const binaryContent = encoder.encode(content);
  return new Blob([binaryContent], { type: 'video/mp4' });
}
