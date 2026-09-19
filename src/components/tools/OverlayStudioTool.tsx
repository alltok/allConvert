import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFFmpeg } from "@/hooks/use-ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { formatBytes, readOutputBlob, validateVideoFile } from "@/lib/ffmpeg-run";
import { FONT_FILE } from "@/lib/ffmpeg-pipeline";
import DropZone from "@/components/DropZone";
import ResultCard from "@/components/ResultCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AnimatedProgress from "@/components/ui/AnimatedProgress";
import { Trash2, ImagePlus, Type } from "lucide-react";
import VideoPreview from "@/components/VideoPreview";
import ErrorRecovery from "@/components/ErrorRecovery";
import { sessionStore } from "@/lib/session-store";
import { startJob, updateJob, finishJob, failJob } from "@/lib/job-tracker";

type Align = "left" | "center" | "right";
type VPos = "top" | "middle" | "bottom";
type Animation = "none" | "fadein" | "fadeout" | "slide";

interface TextLayer {
  id: string; type: "text";
  text: string; fontSize: number; color: string;
  align: Align; vpos: VPos; startTime: number; endTime: number; animation: Animation;
}
interface ImageLayer {
  id: string; type: "image";
  file: File | null; previewUrl: string;
  position: "topleft" | "topright" | "bottomleft" | "bottomright" | "center";
  opacity: number; scale: number; startTime: number; endTime: number;
}
type Layer = TextLayer | ImageLayer;

const POS_FILTER: Record<ImageLayer["position"], string> = {
  topleft: "10:10",
  topright: "main_w-overlay_w-10:10",
  bottomleft: "10:main_h-overlay_h-10",
  bottomright: "main_w-overlay_w-10:main_h-overlay_h-10",
  center: "(main_w-overlay_w)/2:(main_h-overlay_h)/2",
};

const xExpr = (a: Align) => a === "left" ? "20" : a === "right" ? "w-tw-20" : "(w-tw)/2";
const yExpr = (v: VPos) => v === "top" ? "20" : v === "bottom" ? "h-th-20" : "(h-th)/2";

const defaultText = (): TextLayer => ({
  id: crypto.randomUUID(), type: "text",
  text: "Câmera 01 — 00:00:00", fontSize: 36, color: "#ffffff",
  align: "center", vpos: "bottom", startTime: 0, endTime: 5, animation: "none",
});

const OverlayStudioTool = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [layers, setLayers] = useState<Layer[]>([defaultText()]);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; filename: string; size: string } | null>(null);
  const { toast } = useToast();
  const { ffmpeg, loaded, load } = useFFmpeg();

  useEffect(() => {
    const session = sessionStore.get();
    if (session.file && !video) handleVideo(session.file);
  }, []);

  const handleVideo = (f: File) => {
    const err = validateVideoFile(f);
    if (err) { toast({ variant: "destructive", title: err }); return; }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setVideo(f); setPreviewUrl(URL.createObjectURL(f)); setResult(null); setDone(false);
    sessionStore.set(f);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (result) URL.revokeObjectURL(result.url);
    layers.forEach(l => { if (l.type === "image" && l.previewUrl) URL.revokeObjectURL(l.previewUrl); });
    setVideo(null); setPreviewUrl(""); setResult(null); setDone(false); setError(null);
    setLayers([defaultText()]);
  };

  const updateLayer = (id: string, patch: Partial<Layer>) =>
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } as Layer : l));

  const removeLayer = (id: string) => setLayers(prev => prev.filter(l => l.id !== id));

  const addTextLayer = () => setLayers(prev => [...prev, defaultText()]);

  const addImageLayer = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (!f) return;
      const layer: ImageLayer = {
        id: crypto.randomUUID(), type: "image",
        file: f, previewUrl: URL.createObjectURL(f),
        position: "bottomright", opacity: 0.8, scale: 15, startTime: 0, endTime: 999,
      };
      setLayers(prev => [...prev, layer]);
    };
    input.click();
  };

  const buildDrawtext = (l: TextLayer): string => {
    const hex = l.color.replace("#", "");
    const x = xExpr(l.align), y = yExpr(l.vpos);
    const escaped = l.text.replace(/'/g, "\\'").replace(/:/g, "\\:");
    let alpha = "1";
    if (l.animation === "fadein") alpha = `if(lt(t-${l.startTime},1),(t-${l.startTime}),1)`;
    if (l.animation === "fadeout") alpha = `if(gt(t,${l.endTime - 1}),${l.endTime}-t,1)`;
    if (l.animation === "slide") alpha = "1";
    const slideX = l.animation === "slide" ? `if(lt(t-${l.startTime},0.5),(t-${l.startTime})*2*${x === "(w-tw)/2" ? "(w-tw)/2" : "100"},${x})` : x;
    return `drawtext=fontfile=${FONT_FILE}:text='${escaped}':fontsize=${l.fontSize}:fontcolor=0x${hex}:x=${slideX}:y=${y}:enable='between(t,${l.startTime},${l.endTime})':alpha='${alpha}'`;
  };

  const handleProcess = async () => {
    if (!video || !layers.length) return;
    if (!loaded) { toast({ title: "Carregando FFmpeg…" }); await load(); }
    setProcessing(true); setProgress(0); setResult(null); setDone(false);
    const ff = ffmpeg.current!;
    const jobId = startJob({ toolId: "overlay", toolLabel: "Sobreposição", icon: "🧩", fileName: video.name });
    const handler = ({ progress: p }: { progress: number }) => {
      const pct = Math.round(p * 100); setProgress(pct); updateJob(jobId, pct);
    };
    ff.on("progress", handler);
    try {
      const vExt = video.name.split(".").pop();
      await ff.writeFile(`input.${vExt}`, await fetchFile(video));

      const textLayers = layers.filter(l => l.type === "text") as TextLayer[];
      const imageLayers = layers.filter(l => l.type === "image" && l.file) as ImageLayer[];

      const args = ["-i", `input.${vExt}`];
      const logoFiles: string[] = [];

      // Write every logo image as an extra input — all overlays render in one pass below
      for (let i = 0; i < imageLayers.length; i++) {
        const il = imageLayers[i];
        const ext = il.file!.name.split(".").pop();
        const logoFile = `logo_${i}.${ext}`;
        await ff.writeFile(logoFile, await fetchFile(il.file!));
        logoFiles.push(logoFile);
        args.push("-i", logoFile);
      }

      const out = "overlay_out.mp4";

      if (!textLayers.length && !imageLayers.length) {
        // Nothing to draw — plain stream copy, no re-encode needed
        args.push("-c", "copy", out);
      } else {
        // Single filter_complex graph: text drawtext chain first, then every
        // image overlay chained on top of it — one encode pass, no matter how
        // many layers exist (previously each image layer re-encoded the whole video).
        const clauses: string[] = [];
        let current = "0:v";

        if (textLayers.length) {
          clauses.push(`[${current}]${textLayers.map(buildDrawtext).join(",")}[vtext]`);
          current = "vtext";
        }

        imageLayers.forEach((il, i) => {
          clauses.push(`[${i + 1}:v]scale=iw*${il.scale / 100}:-1,format=rgba,colorchannelmixer=aa=${il.opacity}[wm${i}]`);
          const next = `vov${i}`;
          clauses.push(`[${current}][wm${i}]overlay=${POS_FILTER[il.position]}:enable='between(t,${il.startTime},${il.endTime})'[${next}]`);
          current = next;
        });

        args.push(
          "-filter_complex", clauses.join(";"),
          "-map", `[${current}]`,
          "-map", "0:a?",
          "-c:a", "copy",
          "-preset", "fast",
          out
        );
      }

      await ff.exec(args);
      await ff.deleteFile(`input.${vExt}`);
      await Promise.all(logoFiles.map(f => ff.deleteFile(f).catch(() => {})));

      const blob = await readOutputBlob(ff, out, "video/mp4");
      const url = URL.createObjectURL(blob);
      const base = video.name.replace(/\.[^.]+$/, "");
      const filename = `${base}-marcado.mp4`;
      const sizeStr = formatBytes(blob.size);
      setDone(true);
      setResult({ url, filename, size: sizeStr });
      finishJob(jobId, { url, name: filename, size: sizeStr, rawSize: blob.size }, "overlay", "Sobreposição");
      toast({ title: "✓ Concluído!" });
    } catch (e) {
      const msg = String(e); setError(msg);
      failJob(jobId, msg);
      toast({ variant: "destructive", title: "Falha", description: msg });
    } finally {
      ff.off("progress", handler); setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!video ? (
        <DropZone onFile={handleVideo} label="Solte o vídeo para adicionar marcações" />
      ) : (
        <VideoPreview
          file={video}
          previewUrl={previewUrl}
          onReset={reset}
        />
      )}

      {video && !result && (
        <>
          {/* Layer list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Camadas ({layers.length})</Label>
              <div className="flex gap-2">
                <AnimatedButton size="xs" variant="outline" onClick={addTextLayer}>
                  <Type className="w-3 h-3" /> Texto
                </AnimatedButton>
                <AnimatedButton size="xs" variant="outline" onClick={addImageLayer}>
                  <ImagePlus className="w-3 h-3" /> Imagem
                </AnimatedButton>
              </div>
            </div>

            {layers.map((layer, i) => (
              <div key={layer.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    {layer.type === "text" ? <Type className="w-3.5 h-3.5 text-blue-500" /> : <ImagePlus className="w-3.5 h-3.5 text-blue-500" />}
                    Camada de {layer.type === "text" ? "Texto" : "Imagem"} {i + 1}
                  </span>
                  {layers.length > 1 && (
                    <button onClick={() => removeLayer(layer.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {layer.type === "text" && (
                  <>
                    <Input value={layer.text} onChange={e => updateLayer(layer.id, { text: e.target.value })} placeholder="Digite o texto…" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Tamanho da fonte</Label>
                        <Input type="number" min={12} max={120} value={layer.fontSize} onChange={e => updateLayer(layer.id, { fontSize: +e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Cor</Label>
                        <input type="color" value={layer.color} onChange={e => updateLayer(layer.id, { color: e.target.value })}
                          className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Alinhamento H</Label>
                        <Select value={layer.align} onValueChange={v => updateLayer(layer.id, { align: v as Align })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Esquerda</SelectItem>
                            <SelectItem value="center">Centro</SelectItem>
                            <SelectItem value="right">Direita</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Posição V</Label>
                        <Select value={layer.vpos} onValueChange={v => updateLayer(layer.id, { vpos: v as VPos })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">Topo</SelectItem>
                            <SelectItem value="middle">Meio</SelectItem>
                            <SelectItem value="bottom">Base</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Início (s)</Label>
                        <Input type="number" min={0} step={0.5} value={layer.startTime} onChange={e => updateLayer(layer.id, { startTime: +e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Fim (s)</Label>
                        <Input type="number" min={0} step={0.5} value={layer.endTime} onChange={e => updateLayer(layer.id, { endTime: +e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Animação</Label>
                        <Select value={layer.animation} onValueChange={v => updateLayer(layer.id, { animation: v as Animation })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            <SelectItem value="fadein">Fade in</SelectItem>
                            <SelectItem value="fadeout">Fade out</SelectItem>
                            <SelectItem value="slide">Deslizar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {layer.type === "image" && (
                  <>
                    <div className="flex items-center gap-3">
                      {layer.previewUrl && <img src={layer.previewUrl} alt="imagem" className="h-10 w-10 object-contain rounded border border-gray-200 dark:border-gray-700" />}
                      <span className="text-xs text-gray-500 truncate">{layer.file?.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Posição</Label>
                        <Select value={layer.position} onValueChange={v => updateLayer(layer.id, { position: v as ImageLayer["position"] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="topleft">Superior esquerda</SelectItem>
                            <SelectItem value="topright">Superior direita</SelectItem>
                            <SelectItem value="bottomleft">Inferior esquerda</SelectItem>
                            <SelectItem value="bottomright">Inferior direita</SelectItem>
                            <SelectItem value="center">Centro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Tamanho: {layer.scale}%</Label>
                        <Slider min={5} max={50} step={1} value={[layer.scale]} onValueChange={([v]) => updateLayer(layer.id, { scale: v })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Opacidade: {layer.opacity.toFixed(1)}</Label>
                      <Slider min={0.1} max={1} step={0.1} value={[layer.opacity]} onValueChange={([v]) => updateLayer(layer.id, { opacity: v })} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <AnimatedButton onClick={handleProcess} loading={processing} className="w-full" size="lg">
            {processing ? "Renderizando…" : "Renderizar com Marcações"}
          </AnimatedButton>

          {processing && <AnimatedProgress value={progress} label="Renderizando marcações…" done={done} />}
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

export default OverlayStudioTool;
