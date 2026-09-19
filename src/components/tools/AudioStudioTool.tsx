import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFFmpeg } from "@/hooks/use-ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { formatBytes, readOutputBlob, validateVideoFile } from "@/lib/ffmpeg-run";
import DropZone from "@/components/DropZone";
import ResultCard from "@/components/ResultCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AnimatedProgress from "@/components/ui/AnimatedProgress";
import { X, Music, VolumeX, Volume2 } from "lucide-react";
import VideoPreview from "@/components/VideoPreview";
import ErrorRecovery from "@/components/ErrorRecovery";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sessionStore } from "@/lib/session-store";
import { startJob, finishJob, failJob } from "@/lib/job-tracker";

type Mode = "adjust" | "mute" | "extract" | "convert";
type OutputFmt = "mp3" | "wav" | "aac";

const AudioStudioTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mode, setMode] = useState<Mode>("adjust");
  const [volume, setVolume] = useState(100);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeDuration, setFadeDuration] = useState(2);
  const [outputFmt, setOutputFmt] = useState<OutputFmt>("mp3");
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; filename: string; size: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { ffmpeg, loaded, load } = useFFmpeg();

  useEffect(() => {
    const session = sessionStore.get();
    if (session.file && !file) handleFile(session.file);
  }, []);

  const handleFile = (f: File) => {
    const isValid = f.type.startsWith("audio/") || f.type.startsWith("video/");
    if (!isValid) { toast({ variant: "destructive", title: "Envie um arquivo de vídeo ou áudio" }); return; }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f); setPreviewUrl(URL.createObjectURL(f)); setResult(null); setDone(false);
    sessionStore.set(f);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (result) URL.revokeObjectURL(result.url);
    setFile(null); setPreviewUrl(""); setResult(null); setDone(false); setError(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    if (!loaded) { toast({ title: "Carregando FFmpeg…" }); await load(); }
    setProcessing(true); setProgress(0); setResult(null); setDone(false);
    const ff = ffmpeg.current!;
    const jobId = startJob({ toolId: "audiostudio", toolLabel: "Áudio", icon: "🎵", fileName: file.name });

    let fakeTimer: ReturnType<typeof setInterval> | null = null;
    if (mode === "mute") {
      fakeTimer = setInterval(() => setProgress(p => Math.min(p + 20, 90)), 100);
    } else {
      const handler = ({ progress: p }: { progress: number }) => setProgress(Math.round(p * 100));
      ff.on("progress", handler);
    }

    try {
      const ext = file.name.split(".").pop();
      await ff.writeFile(`input.${ext}`, await fetchFile(file));
      const base = file.name.replace(/\.[^.]+$/, "");

      if (mode === "mute") {
        await ff.exec(["-i", `input.${ext}`, "-an", "-c:v", "copy", "muted.mp4"]);
        if (fakeTimer) clearInterval(fakeTimer);
        await ff.deleteFile(`input.${ext}`);
        const blob = await readOutputBlob(ff, "muted.mp4", "video/mp4");
        const url = URL.createObjectURL(blob);
        const filename = `${base}-sem-audio.mp4`;
        const sizeStr = formatBytes(blob.size);
        setProgress(100); setDone(true);
        setResult({ url, filename, size: sizeStr });
        finishJob(jobId, { url, name: filename, size: sizeStr, rawSize: blob.size }, "audiostudio", "Áudio");
        toast({ title: "✓ Áudio removido!" });

      } else if (mode === "extract") {
        const outFile = `audio.${outputFmt}`;
        const args = ["-i", `input.${ext}`, "-vn"];
        if (outputFmt === "mp3") args.push("-acodec", "libmp3lame", "-q:a", "2");
        else if (outputFmt === "wav") args.push("-acodec", "pcm_s16le");
        else args.push("-acodec", "aac", "-b:a", "192k");
        args.push(outFile);
        await ff.exec(args);
        await ff.deleteFile(`input.${ext}`);
        const mimeMap: Record<OutputFmt, string> = { mp3: "audio/mpeg", wav: "audio/wav", aac: "audio/aac" };
        const blob = await readOutputBlob(ff, outFile, mimeMap[outputFmt]);
        const url = URL.createObjectURL(blob);
        const filename = `${base}-audio.${outputFmt}`;
        const sizeStr = formatBytes(blob.size);
        setDone(true);
        setResult({ url, filename, size: sizeStr });
        finishJob(jobId, { url, name: filename, size: sizeStr, rawSize: blob.size }, "audiostudio", "Áudio");
        toast({ title: "✓ Áudio extraído!" });

      } else if (mode === "convert") {
        const outFile = `converted.${outputFmt}`;
        const args = ["-i", `input.${ext}`, "-vn"];
        if (outputFmt === "mp3") args.push("-acodec", "libmp3lame", "-q:a", "2");
        else if (outputFmt === "wav") args.push("-acodec", "pcm_s16le");
        else args.push("-acodec", "aac", "-b:a", "192k");
        args.push(outFile);
        await ff.exec(args);
        await ff.deleteFile(`input.${ext}`);
        const mimeMap: Record<OutputFmt, string> = { mp3: "audio/mpeg", wav: "audio/wav", aac: "audio/aac" };
        const blob = await readOutputBlob(ff, outFile, mimeMap[outputFmt]);
        const url = URL.createObjectURL(blob);
        const filename = `${base}.${outputFmt}`;
        const sizeStr = formatBytes(blob.size);
        setDone(true);
        setResult({ url, filename, size: sizeStr });
        finishJob(jobId, { url, name: filename, size: sizeStr, rawSize: blob.size }, "audiostudio", "Áudio");
        toast({ title: "✓ Convertido!" });

      } else {
        // adjust mode
        const audioFilters: string[] = [];
        if (volume !== 100) audioFilters.push(`volume=${(volume / 100).toFixed(2)}`);
        if (fadeIn) audioFilters.push(`afade=t=in:st=0:d=${fadeDuration}`);
        if (fadeOut && duration > 0) audioFilters.push(`afade=t=out:st=${Math.max(0, duration - fadeDuration).toFixed(2)}:d=${fadeDuration}`);

        const isVideoFile = file.type.startsWith("video/");
        const outFile = isVideoFile ? "adjusted.mp4" : `adjusted.${outputFmt}`;
        const args = ["-i", `input.${ext}`];
        if (audioFilters.length) args.push("-af", audioFilters.join(","));
        if (isVideoFile) {
          args.push("-c:v", "copy");
        } else {
          args.push("-vn");
          if (outputFmt === "mp3") args.push("-acodec", "libmp3lame", "-q:a", "2");
          else if (outputFmt === "wav") args.push("-acodec", "pcm_s16le");
          else args.push("-acodec", "aac", "-b:a", "192k");
        }
        args.push(outFile);
        await ff.exec(args);
        await ff.deleteFile(`input.${ext}`);
        const mime = isVideoFile ? "video/mp4" : (outputFmt === "mp3" ? "audio/mpeg" : outputFmt === "wav" ? "audio/wav" : "audio/aac");
        const blob = await readOutputBlob(ff, outFile, mime);
        const url = URL.createObjectURL(blob);
        const filename = `${base}-ajustado.${isVideoFile ? "mp4" : outputFmt}`;
        const sizeStr = formatBytes(blob.size);
        setDone(true);
        setResult({ url, filename, size: sizeStr });
        finishJob(jobId, { url, name: filename, size: sizeStr, rawSize: blob.size }, "audiostudio", "Áudio");
        toast({ title: "✓ Concluído!" });
      }
    } catch (e) {
      if (fakeTimer) clearInterval(fakeTimer);
      const msg = String(e); setError(msg);
      failJob(jobId, msg);
      toast({ variant: "destructive", title: "Falha", description: msg });
    } finally {
      setProcessing(false);
    }
  };

  const MODES: { id: Mode; icon: React.ReactNode; label: string; desc: string }[] = [
    { id: "adjust",  icon: <Volume2 className="w-4 h-4" />,  label: "Ajustar",  desc: "Volume, fade in/out" },
    { id: "mute",    icon: <VolumeX className="w-4 h-4" />,  label: "Silenciar",desc: "Remove o áudio (instantâneo)" },
    { id: "extract", icon: <Music className="w-4 h-4" />,    label: "Extrair",  desc: "Salva o áudio como arquivo" },
    { id: "convert", icon: <Music className="w-4 h-4" />,    label: "Converter",desc: "Muda o formato do áudio" },
  ];

  return (
    <div className="space-y-4">
      {!file ? (
        <DropZone onFile={handleFile} accept="video/*,audio/*" label="Solte o vídeo ou áudio" />
      ) : (
        <div className="space-y-3">
          {file.type.startsWith("audio/") ? (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/40 to-blue-900/40 border border-blue-500/20 shadow-xl">
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Music className="w-12 h-12 text-blue-400" />
                <audio src={previewUrl} controls className="w-full max-w-xs"
                  onLoadedMetadata={e => setDuration((e.target as HTMLAudioElement).duration)} />
              </div>
              <button onClick={reset} className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full p-1.5 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <VideoPreview ref={videoRef} file={file} previewUrl={previewUrl} onReset={reset}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)} />
          )}
        </div>
      )}

      {file && !result && (
        <>
          {/* Mode selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MODES.map(m => (
              <motion.button key={m.id} onClick={() => setMode(m.id)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition-all space-y-1",
                  mode === m.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                )}>
                <span className={cn("block", mode === m.id ? "text-blue-600" : "text-gray-400")}>{m.icon}</span>
                <p className={cn("text-xs font-semibold", mode === m.id ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200")}>{m.label}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{m.desc}</p>
              </motion.button>
            ))}
          </div>

          {/* Adjust controls */}
          {mode === "adjust" && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Volume: {volume}%</Label>
                  <button onClick={() => setVolume(100)} className="text-xs text-blue-500 hover:underline">Redefinir</button>
                </div>
                <Slider min={0} max={200} step={5} value={[volume]} onValueChange={([v]) => setVolume(v)} />
                <p className="text-xs text-gray-400">
                  {volume === 0 ? "🔇 Silenciado" : volume < 100 ? "🔉 Reduzido" : volume === 100 ? "🔊 Original" : "📢 Amplificado"}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Switch id="fi" checked={fadeIn} onCheckedChange={setFadeIn} />
                  <Label htmlFor="fi" className="text-sm cursor-pointer">Fade in</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="fo" checked={fadeOut} onCheckedChange={setFadeOut} />
                  <Label htmlFor="fo" className="text-sm cursor-pointer">Fade out</Label>
                </div>
                {(fadeIn || fadeOut) && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Duração do fade: {fadeDuration}s</Label>
                    <Slider min={0.5} max={5} step={0.5} value={[fadeDuration]} onValueChange={([v]) => setFadeDuration(v)} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Format selector for extract/convert */}
          {(mode === "extract" || mode === "convert" || (mode === "adjust" && file.type.startsWith("audio/"))) && (
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Formato de Saída</Label>
              <Select value={outputFmt} onValueChange={v => setOutputFmt(v as OutputFmt)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 (mais compatível)</SelectItem>
                  <SelectItem value="wav">WAV (sem perdas)</SelectItem>
                  <SelectItem value="aac">AAC (alta qualidade)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "mute" && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-xs text-blue-700 dark:text-blue-300">
              ⚡ Cópia direta do stream — remove o áudio sem reencodar. Praticamente instantâneo.
            </div>
          )}

          <AnimatedButton onClick={handleProcess} loading={processing} className="w-full" size="lg">
            {processing ? "Processando…" : mode === "mute" ? "⚡ Silenciar Vídeo" : mode === "extract" ? "Extrair Áudio" : mode === "convert" ? "Converter Áudio" : "Aplicar e Exportar"}
          </AnimatedButton>

          {processing && <AnimatedProgress value={progress} label="Processando áudio…" done={done} />}
          {error && <ErrorRecovery error={error} onRetry={() => setError(null)} />}
        </>
      )}

      {result && (
        <ResultCard url={result.url} filename={result.filename} size={result.size}
          onAgain={() => { URL.revokeObjectURL(result.url); setResult(null); setDone(false); }}
          onReset={reset} />
      )}
    </div>
  );
};

export default AudioStudioTool;
