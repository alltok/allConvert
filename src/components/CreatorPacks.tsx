import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight } from "lucide-react";

interface EvidenceProfile {
  id: string;
  icon: string;
  name: string;
  context: string;
  desc: string;
  gradient: string;
  tags: string[];
  toolId: string;
  preset?: string;
  hot?: boolean;
}

const PROFILES: EvidenceProfile[] = [
  {
    id: "boletim",
    icon: "📋",
    name: "Boletim de Ocorrência",
    context: "Registro policial",
    desc: "MP4 compatível, tamanho equilibrado, pronto para anexar",
    gradient: "from-orange-500 to-red-600",
    tags: ["MP4 padrão", "Tamanho equilibrado", "Registro"],
    toolId: "convert",
    preset: "boletim",
    hot: true,
  },
  {
    id: "processo",
    icon: "📎",
    name: "Processo Eletrônico",
    context: "PJe / e-SAJ / Projudi",
    desc: "Arquivo leve, dentro do limite de anexo",
    gradient: "from-blue-500 to-blue-600",
    tags: ["Leve", "Compatível", "Anexo"],
    toolId: "convert",
    preset: "processo",
    hot: true,
  },
  {
    id: "pericia",
    icon: "🔎",
    name: "Laudo Pericial",
    context: "Perícia técnica",
    desc: "Máxima qualidade de imagem, sem perdas perceptíveis",
    gradient: "from-blue-500 to-blue-600",
    tags: ["Alta qualidade", "Sem perdas", "Laudo"],
    toolId: "convert",
    preset: "evidencia_hd",
  },
  {
    id: "email",
    icon: "📧",
    name: "Envio por E-mail",
    context: "Anexo de e-mail",
    desc: "Compactação para caber no limite de anexos",
    gradient: "from-cyan-500 to-teal-500",
    tags: ["Compactado", "Anexo", "E-mail"],
    toolId: "convert",
    preset: "email",
  },
  {
    id: "whatsapp",
    icon: "💬",
    name: "Compartilhamento Rápido",
    context: "WhatsApp / mensageiro",
    desc: "Arquivo pequeno para envio imediato",
    gradient: "from-cyan-500 to-blue-600",
    tags: ["Menor que 16MB", "Rápido", "Mensageiro"],
    toolId: "compress",
    preset: "mobile",
  },
  {
    id: "arquivo",
    icon: "🗄",
    name: "Arquivamento Interno",
    context: "Armazenamento longo prazo",
    desc: "Máxima compactação mantendo legibilidade",
    gradient: "from-slate-500 to-gray-700",
    tags: ["Compacto", "Armazenamento", "Longo prazo"],
    toolId: "compress",
    preset: "smallest",
  },
];

interface CreatorPacksProps {
  onOpen: (toolId: string, preset?: string) => void;
}

const CreatorPacks = ({ onOpen }: CreatorPacksProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="space-y-3"
  >
    <div className="flex items-center gap-2">
      <Sparkles className="w-4 h-4 text-blue-500" />
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Perfis Prontos — para cada destino
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {PROFILES.map((pack, i) => (
        <motion.button
          key={pack.id}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpen(pack.toolId, pack.preset)}
          className="group relative overflow-hidden rounded-2xl text-left transition-all"
        >
          {/* Gradient background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-90",
            pack.gradient
          )} />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />

          <div className="relative z-10 p-4 space-y-2.5">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{pack.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white leading-tight">{pack.name}</p>
                    {pack.hot && (
                      <span className="text-[9px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-full">
                        🔥 COMUM
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/70 mt-0.5">{pack.context}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-white/80 leading-relaxed">{pack.desc}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {pack.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1 text-xs font-bold text-white/90 group-hover:text-white transition-colors">
              Usar este perfil
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  </motion.div>
);

export default CreatorPacks;
