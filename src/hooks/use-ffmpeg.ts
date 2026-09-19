import { useRef, useState, useEffect, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { FONT_FILE } from "@/lib/ffmpeg-pipeline";

// ── Singleton: one FFmpeg instance shared across all tools ──────────────────
let globalFFmpeg: FFmpeg | null = null;
let globalLoaded = false;
let globalLoading = false;
let globalProgress = 0;
let loadPromise: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();
const notifyAll = () => listeners.forEach(fn => fn());

export const useFFmpeg = () => {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [, forceUpdate] = useState(0);

  // Sync local ref to global instance
  if (globalFFmpeg) ffmpegRef.current = globalFFmpeg;

  // Subscribe to global state changes (proper useEffect, not useState)
  useEffect(() => {
    const listener: Listener = () => forceUpdate(n => n + 1);
    listeners.add(listener);
    // Sync immediately in case FFmpeg loaded between render and effect
    if (globalFFmpeg) ffmpegRef.current = globalFFmpeg;
    return () => { listeners.delete(listener); };
  }, []);

  const load = useCallback(async () => {
    // Already loaded — just sync ref
    if (globalLoaded && globalFFmpeg) {
      ffmpegRef.current = globalFFmpeg;
      forceUpdate(n => n + 1);
      return;
    }
    // Already loading — wait for the existing promise
    if (loadPromise) return loadPromise;

    globalLoading = true;
    globalProgress = 5;
    notifyAll();

    loadPromise = (async () => {
      try {
        const ffmpeg = new FFmpeg();
        // jsDelivr CDN — faster global delivery than unpkg
        const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";

        globalProgress = 20;
        notifyAll();

        const [coreURL, wasmURL] = await Promise.all([
          toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        ]);

        globalProgress = 70;
        notifyAll();

        await ffmpeg.load({ coreURL, wasmURL });

        // Write a shared font into the virtual FS so drawtext/subtitles have
        // something to render with. Never blocks readiness — tools that don't
        // draw text work fine even if this fetch fails.
        try {
          const fontData = await fetchFile(`${import.meta.env.BASE_URL}fonts/DejaVuSans.ttf`);
          await ffmpeg.writeFile(FONT_FILE, fontData);
        } catch {
          // Text overlays/legends will silently render without text if this fails —
          // acceptable degradation, not worth failing the whole load for.
        }

        globalFFmpeg = ffmpeg;
        globalLoaded = true;
        globalLoading = false;
        globalProgress = 100;
        ffmpegRef.current = ffmpeg;
        notifyAll();
      } catch (e) {
        globalLoading = false;
        globalProgress = 0;
        loadPromise = null;
        notifyAll();
        throw e;
      }
    })();

    return loadPromise;
  }, []);

  return {
    ffmpeg: ffmpegRef,
    loaded: globalLoaded,
    loading: globalLoading,
    loadProgress: globalProgress,
    load,
  };
};
