import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Zap, Code2, Heart, Github, Shield, Globe } from "lucide-react";
import { fadeUp, stagger, scaleIn } from "@/lib/motion";

const FEATURES = [
  { icon: "🎬", title: "15 Ferramentas Profissionais", desc: "Editor Avançado, Linha do Tempo, Sobreposição, Remover Marca, Converter, Compactar, Redimensionar, Criar GIF, Áudio, Juntar Vídeos, Legenda, Extrair Frame, Otimização Automática, Transcrição e Remover Silêncio." },
  { icon: "🔒", title: "100% Privado", desc: "Nada sai do seu computador. Todo o processamento acontece no seu navegador via WebAssembly — sem servidores, sem upload, nunca." },
  { icon: "⚡", title: "Motorizado por FFmpeg", desc: "Construído sobre o FFmpeg compilado para WebAssembly — o mesmo motor usado por profissionais, rodando inteiramente no seu dispositivo." },
  { icon: "🆓", title: "Totalmente Gratuito", desc: "Sem cadastro, sem assinatura, sem limites. O allConvert é e sempre será gratuito." },
  { icon: "📱", title: "Funciona em Qualquer Lugar", desc: "Totalmente responsivo — computador, tablet e celular. Funciona em qualquer navegador moderno." },
  { icon: "🧠", title: "Workspace Inteligente", desc: "Modelos de fluxo de trabalho, memória de sessão, sugestões automáticas e histórico de exportações da sessão atual." },
];

const STACK = ["React 18", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "FFmpeg WASM", "Framer Motion", "GitHub Pages", "Memória de Sessão", "Fluxos de Trabalho"];

const About = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0b14] transition-colors relative overflow-x-hidden">

    {/* Background blobs */}
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/8 dark:bg-blue-600/12 blur-3xl" />
      <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-500/8 dark:bg-blue-600/12 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,98,254,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,98,254,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(15,98,254,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,98,254,0.06)_1px,transparent_1px)]" />
    </div>

    <Header />

    <main className="flex-grow px-3 sm:px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-10 sm:space-y-14">

        {/* Hero */}
        <motion.section variants={stagger} initial="hidden" animate="show" className="text-center space-y-4 pt-2">
          <motion.div variants={fadeUp} className="flex justify-center">
            <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 shadow-sm shadow-blue-500/10">
              <Zap className="w-4 h-4" /> Sobre o allConvert
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
            Sua estação de edição<br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 bg-clip-text text-transparent text-glow">
              de evidências em vídeo
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed px-2">
            O allConvert é gratuito e roda inteiramente no navegador. Sem upload de arquivos, sem cadastro, sem rastreamento — 15 ferramentas para preparar gravações de CFTV como evidência, direto no seu dispositivo.
          </motion.p>

          {/* Quick stats */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 pt-1">
            {[
              { icon: <Shield className="w-3.5 h-3.5" />, text: "Sem upload" },
              { icon: <Zap className="w-3.5 h-3.5" />, text: "FFmpeg WASM" },
              { icon: <Globe className="w-3.5 h-3.5" />, text: "Qualquer navegador" },
            ].map(f => (
              <span key={f.text} className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                <span className="text-blue-500">{f.icon}</span>{f.text}
              </span>
            ))}
          </motion.div>
        </motion.section>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              variants={scaleIn} initial="hidden" whileInView="show"
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass-card p-5 space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{f.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Por que rodar localmente importa para evidências */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="glass-card p-5 sm:p-6 space-y-3 border-blue-200 dark:border-blue-800/60">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> Por que isso importa para evidências
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Como o processamento acontece localmente, a gravação original não passa por nenhum servidor de terceiros durante a conversão, compactação ou corte —
            reduzindo pontos de exposição do material. Ainda assim, mantenha sempre uma cópia intacta do arquivo original antes de qualquer edição,
            e documente as etapas realizadas para preservar a cadeia de custódia conforme exigido no seu processo ou perícia.
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass-card p-5 sm:p-8 space-y-5 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center">Como funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {[
              { step: "1", emoji: "📂", title: "Enviar", desc: "Arraste ou clique para selecionar a gravação. Ela permanece no seu computador." },
              { step: "2", emoji: "⚙️", title: "Processar", desc: "Escolha a ferramenta e as configurações. O FFmpeg WASM processa tudo no navegador." },
              { step: "3", emoji: "⬇️", title: "Baixar", desc: "O arquivo processado fica pronto na hora. Baixe direto — sem espera." },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-3 sm:flex-col sm:gap-3 sm:text-center sm:items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.emoji} {s.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech stack */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="glass-card p-5 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" /> Construído com
          </h2>
          <div className="flex flex-wrap gap-2">
            {STACK.map((t, i) => (
              <motion.span key={t} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.06, y: -1 }}
                className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium cursor-default">
                {t}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white text-center space-y-3"
          style={{ background: "linear-gradient(135deg, #0f62fe 0%, #4589ff 50%, #78a9ff 100%)" }}>
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            className="relative z-10">
            <Heart className="w-8 h-8 mx-auto fill-white" />
          </motion.div>
          <h2 className="relative z-10 text-xl sm:text-2xl font-bold">Código aberto</h2>
          <p className="relative z-10 text-blue-100 max-w-md mx-auto text-sm sm:text-base">
            O allConvert é um projeto de código aberto focado em ferramentas que preservam a privacidade de quem lida com evidências em vídeo.
          </p>
          <motion.a href="https://github.com/alltok/allConvert" target="_blank" rel="noreferrer"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            className="relative z-10 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-medium transition-colors mt-1">
            <Github className="w-4 h-4" /> Ver no GitHub
          </motion.a>
        </motion.div>

      </div>
    </main>

    <Footer />
  </div>
);

export default About;
