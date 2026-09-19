import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { probeFile } from "@/lib/media-probe";
import { sessionStore } from "@/lib/session-store";

export const formatBytes = (b: number) =>
  b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`;

export const writeInputFile = async (ff: FFmpeg, file: File, name: string) => {
  await ff.writeFile(name, await fetchFile(file));
};

export const readOutputBlob = async (ff: FFmpeg, name: string, mime: string): Promise<Blob> => {
  const data = await ff.readFile(name);
  await ff.deleteFile(name);
  // Use the Uint8Array directly — no ArrayBuffer copy needed
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  return new Blob([bytes], { type: mime });
};

export const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // Small delay before removing to ensure download starts
  setTimeout(() => document.body.removeChild(a), 100);
};

/**
 * Validate file before processing.
 *
 * The real ceiling here isn't a policy choice — ffmpeg.wasm runs in a 32-bit
 * WASM address space, and the input file, its decoded frames and the output
 * all have to fit in it at once. In practice things start failing well before
 * 2 GB (especially on mobile), so 1 GB is a more honest cap than pretending
 * 2 GB will work.
 */
export const validateVideoFile = (file: File): string | null => {
  const MAX_SIZE = 1 * 1024 * 1024 * 1024; // 1 GB
  const ALLOWED = ["video/mp4","video/webm","video/quicktime","video/x-msvideo","video/x-matroska","video/avi","video/mov","video/mkv","video/ogg","video/3gpp","video/mpeg"];
  if (file.size > MAX_SIZE) return `Arquivo muito grande (${formatBytes(file.size)}). Máximo de 1 GB — o processamento roda na memória do navegador.`;
  if (!file.type.startsWith("video/") && !ALLOWED.includes(file.type)) return "Envie um arquivo de vídeo válido.";
  return null;
};

/** Warn if file is large */
export const getFileSizeWarning = (file: File): string | null => {
  const MB = file.size / (1024 * 1024);
  if (MB > 500) return `Arquivo grande (${formatBytes(file.size)}) — o processamento pode demorar, especialmente no celular.`;
  if (MB > 200) return `Arquivo de ${formatBytes(file.size)} — pode levar alguns minutos.`;
  return null;
};

/** Check if video likely has audio (heuristic by extension/type) */
export const likelyHasAudio = (file: File): boolean => {
  const noAudioExts = [".gif"];
  const name = file.name.toLowerCase();
  return !noAudioExts.some(e => name.endsWith(e));
};

/**
 * Probe file and update session store with full metadata.
 * Call this once on upload — all tools reuse the cached result.
 */
export const probeAndStore = async (file: File): Promise<void> => {
  try {
    const info = await probeFile(file);
    sessionStore.set(file, info.duration, info.width, info.height);
  } catch {
    sessionStore.set(file);
  }
};
