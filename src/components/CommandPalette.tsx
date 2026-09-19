import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  icon: string;
  label: string;
  description: string;
  category: string;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  onOpenTool: (toolId: string, preset?: string) => void;
}

const CommandPalette = ({ onOpenTool }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const COMMANDS: Command[] = [
    // Tools
    { id: "convert",      icon: "🔄", label: "Converter vídeo",        description: "Mudar formato — MP4, WebM, MP3…",      category: "Ferramentas", keywords: ["converter","formato","mp4","webm"],    action: () => onOpenTool("convert") },
    { id: "compress",     icon: "📦", label: "Compactar vídeo",        description: "Reduza o tamanho em até 80%",          category: "Ferramentas", keywords: ["compactar","tamanho","reduzir"],       action: () => onOpenTool("compress") },
    { id: "trim",         icon: "✂️", label: "Cortar / aparar vídeo",  description: "Corte trechos, ajuste velocidade, repita", category: "Ferramentas", keywords: ["cortar","aparar","trecho","velocidade"], action: () => onOpenTool("timeline") },
    { id: "resize",       icon: "📐", label: "Redimensionar vídeo",    description: "Mude a resolução ou proporção",        category: "Ferramentas", keywords: ["redimensionar","resolucao","proporcao"], action: () => onOpenTool("resize") },
    { id: "subtitle",     icon: "💬", label: "Adicionar legenda",      description: "Grave legendas .srt no vídeo",         category: "Ferramentas", keywords: ["legenda","srt","texto"],   action: () => onOpenTool("subtitle") },
    { id: "thumbnail",    icon: "📸", label: "Extrair frame",          description: "Extraia uma imagem still do vídeo",    category: "Ferramentas", keywords: ["frame","imagem","print","still"],   action: () => onOpenTool("thumbnail") },
    { id: "audio",        icon: "🎧", label: "Extrair áudio",          description: "Salve o áudio como MP3, WAV ou AAC",   category: "Ferramentas", keywords: ["audio","extrair","mp3","wav"],       action: () => onOpenTool("audiostudio") },
    { id: "gif",          icon: "🎞", label: "Criar GIF",              description: "Converta um trecho em GIF animado",    category: "Ferramentas", keywords: ["gif","animar","loop"],              action: () => onOpenTool("gif") },
    { id: "overlay",      icon: "🧩", label: "Adicionar marcação/texto", description: "Texto, identificação e camadas",     category: "Ferramentas", keywords: ["marcacao","texto","identificacao"], action: () => onOpenTool("overlay") },
    { id: "merge",        icon: "🔗", label: "Juntar vídeos",          description: "Combine várias gravações em uma só",   category: "Ferramentas", keywords: ["juntar","combinar","unir","cameras"],   action: () => onOpenTool("merge") },
    { id: "proeditor",    icon: "🎬", label: "Editor Avançado",        description: "Filtros, correção de cor, corte",      category: "Ferramentas", keywords: ["filtro","cor","corte","editar"],     action: () => onOpenTool("proeditor") },
    { id: "autooptimize", icon: "⚡", label: "Otimização Automática",  description: "Otimização inteligente em 1 clique",   category: "Ferramentas", keywords: ["auto","otimizar","1clique"],  action: () => onOpenTool("autooptimize") },
    { id: "aicaption",    icon: "✨", label: "Transcrição de Áudio",    description: "Gera legendas a partir do áudio (experimental)", category: "Ferramentas", keywords: ["transcricao","legenda","audio","texto"], action: () => onOpenTool("aicaption") },
    { id: "silenceremover",icon:"🔇",label: "Remover Silêncio",        description: "Remove trechos sem áudio automaticamente",category: "Ferramentas", keywords: ["silencio","remover","depoimento","audio","cortar"],       action: () => onOpenTool("silenceremover") },
    // Presets
    { id: "p-evidencia",  icon: "🔎", label: "Perfil Evidência HD",    description: "MP4 · 1080p · máxima qualidade",       category: "Perfis",   keywords: ["evidencia","pericia","hd","qualidade"],  action: () => onOpenTool("convert", "evidencia_hd") },
    { id: "p-processo",   icon: "📎", label: "Perfil Processo Eletrônico", description: "MP4 · 720p · pronto para anexar",  category: "Perfis",   keywords: ["processo","anexo","pje","email"],     action: () => onOpenTool("convert", "processo") },
    { id: "p-whatsapp",   icon: "💬", label: "Perfil WhatsApp",        description: "MP4 · 480p · arquivo pequeno",         category: "Perfis",   keywords: ["whatsapp","pequeno","envio"],  action: () => onOpenTool("convert", "whatsapp") },
    { id: "p-email",      icon: "📧", label: "Perfil E-mail",          description: "MP4 · reduzido para anexo",            category: "Perfis",   keywords: ["email","anexo"],  action: () => onOpenTool("convert", "email") },
    { id: "p-mp3",        icon: "🎵", label: "Extrair como MP3",       description: "Somente áudio — formato MP3",          category: "Perfis",   keywords: ["mp3","audio","extrair"],     action: () => onOpenTool("convert", "audio_mp3") },
  ];

  const filtered = query.trim()
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase()) ||
        c.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : COMMANDS;

  // Group by category
  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const flat = filtered;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && flat[selected]) {
      flat[selected].action();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <>
      {/* Trigger hint */}
      <button
        onClick={() => { setOpen(true); setQuery(""); setSelected(0); }}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Buscar ferramentas…</span>
        <kbd className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-mono">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[61] w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar ferramentas, perfis, ações…"
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  {query && (
                    <button onClick={() => setQuery("")}>
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-mono text-gray-400">ESC</kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {flat.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Nenhum resultado para "{query}"</div>
                ) : (
                  Object.entries(grouped).map(([category, cmds]) => (
                    <div key={category}>
                      <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {category}
                      </p>
                      {cmds.map(cmd => {
                        const globalIdx = flat.indexOf(cmd);
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => { cmd.action(); setOpen(false); setQuery(""); }}
                            onMouseEnter={() => setSelected(globalIdx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              globalIdx === selected
                                ? "bg-blue-50 dark:bg-blue-950/30"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            )}
                          >
                            <span className="text-lg shrink-0">{cmd.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-semibold", globalIdx === selected ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-100")}>
                                {cmd.label}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{cmd.description}</p>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 shrink-0 transition-colors", globalIdx === selected ? "text-blue-500" : "text-gray-300")} />
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">↑↓</kbd> navegar</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono">↵</kbd> abrir</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-blue-400" /> {flat.length} comandos</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommandPalette;
