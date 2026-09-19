/** Perfis prontos para as ferramentas de Converter e Compactar */

export interface ConvertPreset {
  id: string;
  label: string;
  icon: string;
  fmt: string;
  res: string;
  quality: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

export const CONVERT_PRESETS: ConvertPreset[] = [
  { id: "evidencia_hd", icon: "🔎", label: "Evidência HD",       fmt: "mp4",  res: "1080p",    quality: "high",   description: "H.264, 1080p, máxima qualidade para perícia",  badge: "⭐ Recomendado para perícia", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { id: "processo",     icon: "📎", label: "Processo Eletrônico", fmt: "mp4",  res: "720p",     quality: "medium", description: "MP4 leve, pronto para anexar ao processo",     badge: "🔥 Mais usado",              badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  { id: "boletim",      icon: "📋", label: "Boletim de Ocorrência", fmt: "mp4", res: "720p",    quality: "medium", description: "MP4 compatível, tamanho equilibrado",          badge: "🔥 Mais usado",              badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  { id: "whatsapp",     icon: "💬", label: "WhatsApp",           fmt: "mp4",  res: "480p",     quality: "low",    description: "MP4 pequeno, 480p",                            badge: "📱 Envio rápido",            badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { id: "email",        icon: "📧", label: "E-mail",             fmt: "mp4",  res: "480p",     quality: "medium", description: "MP4, tamanho reduzido para anexo",             badge: "⚡ Mais leve",               badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "web",          icon: "🌐", label: "Reprodução no navegador (WebM)", fmt: "webm", res: "720p", quality: "medium", description: "WebM VP9, ideal para assistir online",  badge: "🌐 Web",                      badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { id: "audio_mp3",    icon: "🎵", label: "Extrair Áudio (MP3)", fmt: "mp3", res: "original", quality: "high",   description: "Extrai apenas o áudio da gravação",            badge: "🎧 Só áudio",                badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "original",     icon: "📁", label: "Personalizado",      fmt: "mp4",  res: "original", quality: "medium", description: "Defina suas próprias configurações" },
];

export interface CompressPreset {
  id: string;
  label: string;
  icon: string;
  crf: string;
  res: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  /** Estimated size reduction % */
  savingsEst?: number;
}

export const COMPRESS_PRESETS: CompressPreset[] = [
  { id: "smallest", icon: "📦", label: "Máxima Compactação", crf: "38", res: "480p",     description: "Menor arquivo possível, para envio rápido",       badge: "📦 Maior economia",           badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", savingsEst: 80 },
  { id: "balanced", icon: "⚖️", label: "Balanceado",        crf: "28", res: "720p",     description: "Boa qualidade com tamanho razoável",              badge: "🔥 Mais usado",                badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",         savingsEst: 60 },
  { id: "quality",  icon: "✨", label: "Alta Qualidade",    crf: "18", res: "original", description: "Quase sem perdas — ideal para laudo e perícia",   badge: "⭐ Recomendado para perícia", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",    savingsEst: 20 },
  { id: "mobile",   icon: "📱", label: "Envio Rápido",      crf: "33", res: "360p",     description: "Otimizado para WhatsApp e e-mail",                badge: "📱 Envio rápido",             badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",    savingsEst: 70 },
];
