import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface WorkflowStep {
  icon: string;
  label: string;
  toolId: string;
  preset?: string;
}

interface WorkflowTemplate {
  id: string;
  icon: string;
  title: string;
  desc: string;
  gradient: string;
  badge: string;
  steps: WorkflowStep[];
  firstTool: string;
  firstPreset?: string;
}

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: "processo",
    icon: "📎",
    title: "Pacote Processo Eletrônico",
    desc: "Converter → Compactar → Adicionar identificação",
    gradient: "from-blue-500 to-blue-600",
    badge: "🔥 Mais usado",
    firstTool: "convert",
    firstPreset: "processo",
    steps: [
      { icon: "🔄", label: "Converter", toolId: "convert", preset: "processo" },
      { icon: "📦", label: "Compactar",  toolId: "compress" },
      { icon: "🧩", label: "Identificar", toolId: "overlay" },
    ],
  },
  {
    id: "pericia",
    icon: "🔎",
    title: "Pacote Perícia HD",
    desc: "Qualidade máxima → Extrair frame → Legenda",
    gradient: "from-amber-500 to-orange-500",
    badge: "⭐ Melhor qualidade",
    firstTool: "convert",
    firstPreset: "evidencia_hd",
    steps: [
      { icon: "🔎", label: "Qualidade máxima", toolId: "convert",     preset: "evidencia_hd" },
      { icon: "📸", label: "Extrair frame",    toolId: "thumbnail" },
      { icon: "💬", label: "Legenda",          toolId: "subtitle" },
    ],
  },
  {
    id: "envio-rapido",
    icon: "💬",
    title: "Pacote Envio Rápido",
    desc: "Compactação máxima → Redimensionar para 480p",
    gradient: "from-green-500 to-emerald-500",
    badge: "📱 WhatsApp/E-mail",
    firstTool: "compress",
    firstPreset: undefined,
    steps: [
      { icon: "📦", label: "Compactar ao máximo", toolId: "compress" },
      { icon: "📐", label: "Redimensionar 480p",  toolId: "resize" },
    ],
  },
  {
    id: "multi-camera",
    icon: "🎥",
    title: "Pacote Múltiplas Câmeras",
    desc: "Juntar gravações → Cortar trecho → Otimizar",
    gradient: "from-blue-500 to-blue-600",
    badge: "🎯 Várias câmeras",
    firstTool: "merge",
    firstPreset: undefined,
    steps: [
      { icon: "🔗", label: "Juntar gravações", toolId: "merge" },
      { icon: "✂️", label: "Cortar trecho",     toolId: "timeline" },
      { icon: "⚡", label: "Otimizar",          toolId: "autooptimize" },
    ],
  },
];

interface WorkflowTemplatesProps {
  onOpen: (toolId: string, preset?: string) => void;
}

const WorkflowTemplates = ({ onOpen }: WorkflowTemplatesProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="space-y-3"
  >
    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      🎬 Modelos de Fluxo — um clique, processo completo
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {TEMPLATES.map((t, i) => (
        <motion.button
          key={t.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07 }}
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpen(t.firstTool, t.firstPreset)}
          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left p-4 space-y-3 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
        >
          {/* Gradient hover bg */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
            `bg-gradient-to-br ${t.gradient}`
          )} />

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.desc}</p>
              </div>
            </div>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap hidden sm:inline",
              "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            )}>{t.badge}</span>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-1 flex-wrap">
            {t.steps.map((step, si) => (
              <div key={step.toolId + si} className="flex items-center gap-1">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg text-gray-600 dark:text-gray-300 font-medium">
                  {step.icon} {step.label}
                </span>
                {si < t.steps.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className={cn(
            "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all",
            `bg-gradient-to-r ${t.gradient}`
          )}>
            Iniciar fluxo <ChevronRight className="w-3 h-3" />
          </div>
        </motion.button>
      ))}
    </div>
  </motion.div>
);

export default WorkflowTemplates;
