/**
 * Motor de Legendas
 *
 * Usa a Web Speech API (SpeechRecognition) nativa do navegador para
 * transcrição de fala — sem download adicional, funciona no Chrome/Edge/Safari.
 *
 * IMPORTANTE: no Chrome/Edge, a Web Speech API envia o áudio capturado a
 * servidores do Google para reconhecimento. Isso quebra a promessa de
 * "100% local" — evite usar este recurso com material sigiloso ou sob sigilo
 * de investigação. Considere revisar o áudio manualmente nesses casos.
 *
 * Com fallback gracioso quando não suportado.
 */

import { FONT_FILE } from "@/lib/ffmpeg-pipeline";

export interface CaptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface CaptionStyle {
  id: string;
  label: string;
  platform: string;
  emoji: string;
  fontSize: number;
  color: string;
  bgColor: string;
  bgOpacity: number;
  position: "bottom" | "top" | "middle";
  bold: boolean;
  uppercase: boolean;
  /** FFmpeg drawtext extra params */
  ffmpegExtra?: string;
}

// ── Estilos de Legenda ─────────────────────────────────────────────────────────
export const CAPTION_STYLES: CaptionStyle[] = [
  {
    id: "alto-contraste",
    label: "Alto Contraste",
    platform: "Geral",
    emoji: "⬜",
    fontSize: 42,
    color: "#ffffff",
    bgColor: "#000000",
    bgOpacity: 0.6,
    position: "bottom",
    bold: true,
    uppercase: true,
  },
  {
    id: "discreto",
    label: "Discreto",
    platform: "Geral",
    emoji: "💬",
    fontSize: 32,
    color: "#ffffff",
    bgColor: "#000000",
    bgOpacity: 0.4,
    position: "bottom",
    bold: false,
    uppercase: false,
  },
  {
    id: "documento",
    label: "Documento/Laudo",
    platform: "Perícia",
    emoji: "📄",
    fontSize: 28,
    color: "#ffffff",
    bgColor: "#000000",
    bgOpacity: 0.5,
    position: "bottom",
    bold: false,
    uppercase: false,
  },
  {
    id: "identificacao",
    label: "Identificação",
    platform: "Câmera/Data",
    emoji: "📍",
    fontSize: 24,
    color: "#ffffff",
    bgColor: "#000000",
    bgOpacity: 0.7,
    position: "top",
    bold: false,
    uppercase: false,
  },
  {
    id: "narracao",
    label: "Narração",
    platform: "Depoimento",
    emoji: "🎙",
    fontSize: 26,
    color: "#ffffff",
    bgColor: "#000000",
    bgOpacity: 0.5,
    position: "bottom",
    bold: false,
    uppercase: false,
  },
  {
    id: "oficial",
    label: "Oficial",
    platform: "Registro formal",
    emoji: "🛡",
    fontSize: 26,
    color: "#ffffff",
    bgColor: "#0066cc",
    bgOpacity: 0.85,
    position: "bottom",
    bold: false,
    uppercase: false,
  },
];

// ── SRT Generator ─────────────────────────────────────────────────────────────

const pad = (n: number, len = 2) => String(Math.floor(n)).padStart(len, "0");

const toSRTTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
};

export const segmentsToSRT = (segments: CaptionSegment[]): string => {
  return segments
    .map((seg, i) => `${i + 1}\n${toSRTTime(seg.start)} --> ${toSRTTime(seg.end)}\n${seg.text}`)
    .join("\n\n");
};

// ── Web Speech API ────────────────────────────────────────────────────────────

export const isSpeechSupported = (): boolean => {
  return typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
};

export interface TranscribeOptions {
  language?: string;
  onSegment?: (seg: CaptionSegment) => void;
  onProgress?: (text: string) => void;
}

/**
 * Transcreve o áudio de um vídeo/áudio usando a Web Speech API.
 * Reproduz o elemento de mídia e captura os resultados do reconhecimento de fala.
 *
 * Retorna um array de CaptionSegments.
 */
export const transcribeWithSpeechAPI = (
  mediaEl: HTMLVideoElement | HTMLAudioElement,
  opts: TranscribeOptions = {}
): Promise<CaptionSegment[]> => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error("Reconhecimento de voz não é suportado neste navegador. Use Chrome ou Edge."));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = opts.language ?? "pt-BR";
    recognition.maxAlternatives = 1;

    const segments: CaptionSegment[] = [];
    let lastFinalTime = 0;

    recognition.onresult = (event: any) => {
      const currentTime = mediaEl.currentTime;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (result.isFinal && transcript) {
          const seg: CaptionSegment = {
            start: lastFinalTime,
            end: currentTime,
            text: transcript,
          };
          segments.push(seg);
          lastFinalTime = currentTime;
          opts.onSegment?.(seg);
        } else if (!result.isFinal) {
          opts.onProgress?.(transcript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return; // ignore silence
      if (event.error === "aborted") return;
      reject(new Error(`Erro no reconhecimento de voz: ${event.error}`));
    };

    recognition.onend = () => {
      // If media is still playing, restart recognition
      if (!mediaEl.paused && !mediaEl.ended) {
        try { recognition.start(); } catch {}
      } else {
        resolve(segments);
      }
    };

    mediaEl.onended = () => {
      recognition.stop();
      resolve(segments);
    };

    // Start recognition and play media
    try {
      recognition.start();
      mediaEl.currentTime = 0;
      mediaEl.play().catch(() => {
        recognition.stop();
        reject(new Error("Não foi possível reproduzir a mídia para transcrição."));
      });
    } catch (e) {
      reject(e);
    }
  });
};

// ── FFmpeg drawtext builder for caption styles ────────────────────────────────

export const buildCaptionFilter = (
  segments: CaptionSegment[],
  style: CaptionStyle
): string[] => {
  const colorHex = style.color.replace("#", "");
  const bgHex = style.bgColor.replace("#", "");
  const y = style.position === "bottom" ? "h-th-40"
    : style.position === "top" ? "40"
    : "(h-th)/2";

  return segments.map(seg => {
    let text = seg.text;
    if (style.uppercase) text = text.toUpperCase();
    const escaped = text.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/:/g, "\\:");
    const boxOpacity = style.bgOpacity.toFixed(2);
    return `drawtext=fontfile=${FONT_FILE}:text='${escaped}':fontsize=${style.fontSize}:fontcolor=0x${colorHex}:x=(w-tw)/2:y=${y}:enable='between(t,${seg.start.toFixed(3)},${seg.end.toFixed(3)})':box=1:boxcolor=0x${bgHex}@${boxOpacity}:boxborderw=8${style.bold ? ":font=bold" : ""}`;
  });
};
