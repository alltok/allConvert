/**
 * InstantAnalysis — shown within 200ms of upload.
 * Gives users immediate intelligent feedback about their file.
 * Creates the "this app understands my file" feeling.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatBytes } from "@/lib/ffmpeg-run";
import { CheckCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  icon: string;
  text: string;
  highlight?: string;
  type: "good" | "info" | "action";
}

interface InstantAnalysisProps {
  file: File;
  duration: number;
  width: number;
  height: number;
  onOpen: (toolId: string, preset?: string) => void;
}

const buildAnalysis = (file: File, duration: number, width: number, height: number): AnalysisResult[] => {
  const results: AnalysisResult[] = [];
  const mb = file.size / (1024 * 1024);
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isPortrait = height > width;
  const compressionSavings = Math.round((1 - 0.35) * 100);

  // Format detection
  if (["avi", "mov", "mkv"].includes(ext)) {
    results.push({ icon: "🔄", text: `Formato ${ext.toUpperCase()} detectado`, highlight: "MP4 recomendado", type: "action" });
  } else if (ext === "mp4") {
    results.push({ icon: "✓", text: "Formato MP4 detectado", highlight: "Máxima compatibilidade", type: "good" });
  }

  // Resolution
  if (width > 0 && height > 0) {
    if (width >= 3840) {
      results.push({ icon: "🎬", text: `Resolução 4K (${width}×${height})`, highlight: "Pode reduzir para 1080p", type: "action" });
    } else if (width >= 1920) {
      results.push({ icon: "✓", text: `Full HD ${width}×${height}`, highlight: "Ótima qualidade", type: "good" });
    } else {
      results.push({ icon: "📐", text: `Resolução ${width}×${height}`, type: "info" });
    }
  }

  // Aspect ratio
  if (isPortrait) {
    results.push({ icon: "📱", text: "Vídeo vertical detectado", highlight: "Formato retrato", type: "good" });
  } else if (width > 0 && Math.abs(width / height - 16 / 9) < 0.05) {
    results.push({ icon: "🖥", text: "16:9 widescreen", highlight: "Formato padrão", type: "good" });
  }

  // File size
  if (mb > 100) {
    results.push({ icon: "📦", text: `${formatBytes(file.size)} de tamanho`, highlight: `~${compressionSavings}% de compactação disponível`, type: "action" });
  } else if (mb > 20) {
    results.push({ icon: "📦", text: `${formatBytes(file.size)} de tamanho`, highlight: "Pode compactar para envio", type: "info" });
  } else {
    results.push({ icon: "✓", text: `${formatBytes(file.size)} — arquivo compacto`, type: "good" });
  }

  // Duration
  if (duration > 0) {
    if (duration > 600) {
      results.push({ icon: "✂️", text: `Vídeo de ${Math.round(duration / 60)}min`, highlight: "Considere cortar o trecho relevante", type: "action" });
    } else if (duration > 60) {
      const m = Math.floor(duration / 60);
      const s = Math.round(duration % 60);
      results.push({ icon: "⏱", text: `Duração de ${m}min ${s}s`, type: "info" });
    } else {
      results.push({ icon: "⚡", text: `Clipe de ${Math.round(duration)}s`, highlight: "Pronto para revisão", type: "good" });
    }
  }

  // Transcription availability
  results.push({ icon: "✨", text: "Transcrição de áudio disponível", highlight: "Experimental", type: "action" });

  return results.slice(0, 5);
};

const InstantAnalysis = ({ file, duration, width, height, onOpen }: InstantAnalysisProps) => {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    // Show within 200ms
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => {
      setItems(buildAnalysis(file, duration, width, height));
    }, 150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [file, duration, width, height]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="glass-card p-4 space-y-3 border-blue-200/60 dark:border-blue-800/40"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
            Análise Instantânea
          </p>
          <span className="ml-auto text-[10px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Pronto
          </span>
        </div>

        {/* Analysis items */}
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <span className={cn(
                "text-sm shrink-0 w-5 text-center",
                item.icon === "✓" ? "text-green-500" : ""
              )}>
                {item.icon === "✓" ? <CheckCircle className="w-4 h-4 text-green-500" /> : item.icon}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-300 flex-1">{item.text}</span>
              {item.highlight && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap",
                  item.type === "good"   && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                  item.type === "action" && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                  item.type === "info"   && "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
                )}>
                  {item.highlight}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick action row */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <button onClick={() => onOpen("autooptimize")}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Zap className="w-3 h-3" /> Otimizar Automaticamente
          </button>
          <button onClick={() => onOpen("aicaption")}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            ✨ Transcrever Áudio
          </button>
          <button onClick={() => onOpen("compress")}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-300 transition-colors">
            📦 Compactar
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstantAnalysis;
