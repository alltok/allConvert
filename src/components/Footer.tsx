import { motion } from "framer-motion";
import { Github, Globe, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const TOOLS = ["Editor Avançado", "Linha do Tempo", "Sobreposição", "Remover Marca", "Converter", "Compactar", "Redimensionar", "Criar GIF", "Áudio", "Juntar Vídeos", "Legenda", "Extrair Frame", "Otimizar", "Transcrição", "Remover Silêncio"];

const Footer = () => (
  <footer className="bg-gradient-to-b from-gray-950 to-gray-950 border-t border-blue-900/30 text-gray-400 mt-auto">
    {/* Top accent line matching header gradient */}
    <div className="h-px bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600" />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10">

        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/20 cursor-default shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <polygon points="6,4 20,12 6,20" fill="#5b21b6" />
                <rect x="3" y="4" width="2.5" height="16" rx="1.25" fill="#5b21b6" />
              </svg>
            </motion.div>
            <span className="text-lg font-black text-white tracking-tight">
              all<span className="text-yellow-300">Convert</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Ferramentas para preparar gravações de CFTV como evidência — converta, compacte, corte e identifique vídeos de segurança direto no navegador, sem upload.
          </p>
          <div className="flex items-center gap-1 text-xs text-blue-400 flex-wrap">
            <span>Feito com</span>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}>
              <Heart className="w-3 h-3 fill-blue-400 inline" />
            </motion.span>
            <span>para quem trabalha com evidências em vídeo</span>
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-3">
          <p className="text-white font-semibold text-sm uppercase tracking-wider">Ferramentas</p>
          <ul className="grid grid-cols-2 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {TOOLS.map(t => (
              <motion.li key={t} whileHover={{ x: 3 }}
                className="text-sm text-gray-400 hover:text-blue-300 transition-colors cursor-default">{t}</motion.li>
            ))}
          </ul>
        </div>

        {/* Pages + info */}
        <div className="space-y-3">
          <p className="text-white font-semibold text-sm uppercase tracking-wider">Páginas</p>
          <ul className="space-y-1.5">
            {[{ to: "/", label: "Início" }, { to: "/about", label: "Sobre" }, { to: "/contact", label: "Contato" }].map(p => (
              <motion.li key={p.to} whileHover={{ x: 3 }}>
                <Link to={p.to} className="text-sm text-gray-400 hover:text-blue-300 transition-colors">{p.label}</Link>
              </motion.li>
            ))}
          </ul>
          <div className="pt-2 space-y-1.5 text-xs text-gray-500">
            <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Nenhum arquivo é enviado a servidores</p>
            <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> FFmpeg WebAssembly</p>
            <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> Gratuito</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} allConvert. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <motion.a href="https://github.com/alltok/allConvert" target="_blank" rel="noreferrer"
            whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Github className="w-3.5 h-3.5" /> GitHub
          </motion.a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
