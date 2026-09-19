import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UseCase {
  icon: string;
  label: string;
  subtext: string;
  toolId: string;
  preset?: string;
  border: string;
  bg: string;
}

const USE_CASES: UseCase[] = [
  { icon: "🔄", label: "Converter DVR para MP4", subtext: "Formato compatível com qualquer sistema", toolId: "convert",     preset: "processo",     border: "hover:border-blue-400 dark:hover:border-blue-600",     bg: "hover:bg-blue-50 dark:hover:bg-blue-950/20" },
  { icon: "📦", label: "Compactar para envio",   subtext: "Compactação inteligente do arquivo",     toolId: "compress",    preset: undefined,   border: "hover:border-cyan-400 dark:hover:border-cyan-600",     bg: "hover:bg-cyan-50 dark:hover:bg-cyan-950/20" },
  { icon: "✂️", label: "Cortar trecho relevante",subtext: "Com base na duração da gravação",        toolId: "timeline",    preset: undefined,   border: "hover:border-blue-400 dark:hover:border-blue-600", bg: "hover:bg-blue-50 dark:hover:bg-blue-950/20" },
  { icon: "🎧", label: "Extrair áudio",          subtext: "Otimizado para o formato de origem",     toolId: "audiostudio", preset: undefined,   border: "hover:border-blue-400 dark:hover:border-blue-600",bg: "hover:bg-blue-50 dark:hover:bg-blue-950/20" },
  { icon: "🎬", label: "Melhorar qualidade",     subtext: "Realce recomendado para a gravação",     toolId: "proeditor",   preset: undefined,   border: "hover:border-blue-400 dark:hover:border-blue-600", bg: "hover:bg-blue-50 dark:hover:bg-blue-950/20" },
  { icon: "📸", label: "Extrair frame/still",    subtext: "Melhor captura como evidência",          toolId: "thumbnail",   preset: undefined,   border: "hover:border-amber-400 dark:hover:border-amber-600",   bg: "hover:bg-amber-50 dark:hover:bg-amber-950/20" },
  { icon: "🔎", label: "Preparar para perícia",  subtext: "Máxima qualidade de imagem",             toolId: "convert",     preset: "evidencia_hd",   border: "hover:border-red-400 dark:hover:border-red-600",       bg: "hover:bg-red-50 dark:hover:bg-red-950/20" },
  { icon: "💬", label: "Adicionar legenda",      subtext: "Grava identificação no vídeo",           toolId: "subtitle",    preset: undefined,   border: "hover:border-blue-400 dark:hover:border-blue-600",     bg: "hover:bg-blue-50 dark:hover:bg-blue-950/20" },
];

interface UseCaseBarProps {
  onOpen: (toolId: string, preset?: string) => void;
}

const UseCaseBar = ({ onOpen }: UseCaseBarProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className="space-y-3"
  >
    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
      O que você precisa fazer?
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {USE_CASES.map((uc, i) => (
        <motion.button
          key={`${uc.toolId}-${uc.preset ?? i}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 + i * 0.04 }}
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onOpen(uc.toolId, uc.preset)}
          className={cn(
            "flex flex-col items-start gap-1 px-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700",
            "bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm",
            "text-left transition-all duration-200 group shadow-sm",
            uc.border, uc.bg
          )}
        >
          <span className="text-xl transition-transform duration-200 group-hover:scale-110">
            {uc.icon}
          </span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-tight">
            {uc.label}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
            {uc.subtext}
          </span>
        </motion.button>
      ))}
    </div>
  </motion.div>
);

export default UseCaseBar;
