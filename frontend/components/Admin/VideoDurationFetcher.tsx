'use client';

import { useEffect, useRef, useState } from 'react';

type VideoDurationFetcherProps = {
    videoUrl: string;
    onDurationFound: (durationSeconds: number) => void;
};

export function VideoDurationFetcher({ videoUrl, onDurationFound }: VideoDurationFetcherProps) {
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const youtubePlayerRef = useRef<any>(null);

    useEffect(() => {
        setError(null);
        if (!videoUrl) return;

        const u = videoUrl.trim();
        if (!u) return;

        // Check for YouTube
        const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (ytMatch) {
            const videoId = ytMatch[1];
            loadYoutubeDuration(videoId);
            return;
        }

        // Check for direct video file (naive check, but acceptable for admin)
        // We try to load it in a hidden video tag
        if (videoRef.current) {
            videoRef.current.src = u;
            videoRef.current.load();
        }
    }, [videoUrl]);

    const loadYoutubeDuration = (videoId: string) => {
        // Basic Youtube Data API v3 requires key, but we can try IFrame player API or oEmbed.
        // IFrame Player API is cleaner but async.
        // For simplicity without API Key, we can use a headless player approach if possible, 
        // OR we can just rely on the user input if we can't fetch it easily without auth.
        // Actually, IFrame Player API `getDuration()` works after metadata load.

        // Ensure YT API is loaded
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            (window as any).onYouTubeIframeAPIReady = () => initPlayer(videoId);
        } else {
            initPlayer(videoId);
        }
    };

    const initPlayer = (videoId: string) => {
        if (youtubePlayerRef.current) {
            youtubePlayerRef.current.destroy();
        }

        // Create a hidden container for the player
        const containerId = `yt-player-${Math.random().toString(36).substr(2, 9)}`;
        const container = document.createElement('div');
        container.id = containerId;
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        document.body.appendChild(container);

        youtubePlayerRef.current = new (window as any).YT.Player(containerId, {
            height: '1',
            width: '1',
            videoId: videoId,
            events: {
                'onReady': (event: any) => {
                    const duration = event.target.getDuration();
                    if (duration > 0) {
                        onDurationFound(Math.ceil(duration));
                        cleanUpPlayer(container);
                    } else {
                        // Sometimes duration is not ready immediately, wait specifically for metadata
                        // But onReady is usually enough for data API. 
                        // If 0, maybe try playing muted for a split second? No that's annoying.
                        // Let's retry in a second
                        setTimeout(() => {
                            try {
                                const d = event.target.getDuration();
                                if (d > 0) onDurationFound(Math.ceil(d));
                            } catch (e) { }
                            cleanUpPlayer(container);
                        }, 1500);
                    }
                },
                'onError': () => {
                    setError('YouTube video yüklenemedi');
                    cleanUpPlayer(container);
                }
            }
        });
    };

    const cleanUpPlayer = (container: HTMLElement) => {
        // We keep the player instance refs but remove DOM to save memory if needed, 
        // though standard embedding is light enough.
        // Actually destroying the player is safer.
        setTimeout(() => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
            }
            if (container.parentNode) container.parentNode.removeChild(container);
        }, 2000);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current && videoRef.current.duration) {
            const d = videoRef.current.duration;
            if (Number.isFinite(d)) {
                onDurationFound(Math.ceil(d));
            }
        }
    };

    const handleError = () => {
        // Silent fail or just don't update duration
        // setError('Video yüklenemedi'); 
    };

    // Only render the video tag if it's NOT a youtube link
    const isYoutube = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)/);

    return (
        <div className="hidden">
            {!isYoutube && (
                <video
                    ref={videoRef}
                    onLoadedMetadata={handleLoadedMetadata}
                    onError={handleError}
                    className="hidden"
                    preload="metadata"
                />
            )}
        </div>
    );
}
