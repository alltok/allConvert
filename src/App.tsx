import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FFmpegLoader from "./components/FFmpegLoader";
import LandingPage, { LandingConfig } from "./pages/LandingPage";

const basename = import.meta.env.BASE_URL || "/";

// ── Fábrica de páginas de SEO ──────────────────────────────────────────────────
const lp = (
  title: string, headline: string, subheadline: string, description: string,
  toolId: string, preset: string | undefined, emoji: string,
  gradient: string, features: { icon: string; text: string }[]
): LandingConfig => ({ title, headline, subheadline, description, toolId, preset, emoji, gradient, keywords: [], features });

// ── Categoria: Conversão de gravações ──────────────────────────────────────────
const C = {
  DVR_MP4:   lp("Conversor de DVR para MP4","Converta gravações de DVR/CFTV para MP4","Formato proprietário do seu DVR? Converta para MP4 em segundos","Converta arquivos de DVR e CFTV (H.264, AVI, MOV) para MP4 padrão. Sem upload, sem instalar nada. Roda no seu navegador com FFmpeg WASM.","convert",undefined,"🎥","from-blue-500 to-cyan-500",[{icon:"🎥",text:"DVR → MP4"},{icon:"⚡",text:"H.264 rápido"},{icon:"🔒",text:"Sem upload"}]),
  MOV_MP4:   lp("Conversor de MOV para MP4","Converta arquivos MOV para MP4","Converta gravações MOV — instantaneamente no navegador","Converta vídeos MOV (câmeras Apple/celulares) para MP4. Sem upload, sem cadastro. Roda inteiramente no seu navegador com FFmpeg WASM.","convert",undefined,"🔄","from-blue-500 to-cyan-500",[{icon:"🔄",text:"MOV → MP4"},{icon:"⚡",text:"H.264 rápido"},{icon:"🔒",text:"Sem upload"}]),
  AVI_MP4:   lp("Conversor de AVI para MP4","Converta vídeos AVI para MP4","Converta gravações AVI de câmeras antigas para MP4","Converta arquivos AVI de sistemas de CFTV antigos para o formato MP4, compatível com qualquer sistema. Sem upload, 100% privado.","convert",undefined,"🔄","from-blue-500 to-cyan-500",[{icon:"🔄",text:"AVI → MP4"},{icon:"⚡",text:"Conversão rápida"},{icon:"🔒",text:"Privado"}]),
  MKV_MP4:   lp("Conversor de MKV para MP4","Converta arquivos MKV para MP4","Converta gravações MKV para MP4 — direto no navegador","Converta vídeos MKV para o formato MP4. Sem instalar software. Roda no seu navegador.","convert",undefined,"🔄","from-blue-500 to-cyan-500",[{icon:"🔄",text:"MKV → MP4"},{icon:"⚡",text:"Rápido"},{icon:"🔒",text:"Privado"}]),
  WEBM_MP4:  lp("Conversor de WebM para MP4","Converta WebM para MP4","Converta para MP4 e garanta compatibilidade máxima","Converta vídeos WebM para MP4 — o formato aceito por qualquer sistema de processo eletrônico ou visualizador.","convert",undefined,"🔄","from-blue-500 to-cyan-500",[{icon:"🔄",text:"WebM → MP4"},{icon:"📎",text:"Pronto para anexar"},{icon:"🔒",text:"Sem upload"}]),
  VIDEO_MP3: lp("Extrair Áudio de Vídeo","Extraia o áudio de uma gravação","Separe o áudio de qualquer vídeo — instantaneamente","Converta MP4, MOV, AVI ou WebM em MP3 ou WAV. Útil para isolar áudio de interfones, escutas ambientais ou depoimentos gravados.","audiostudio",undefined,"🎵","from-blue-500 to-blue-500",[{icon:"🎵",text:"MP3/WAV/AAC"},{icon:"🔒",text:"Sem upload"},{icon:"⚡",text:"Instantâneo"}]),
  VIDEO_GIF: lp("Converter Vídeo para GIF","Transforme um trecho em GIF animado","Crie um GIF de um trecho do vídeo — direto no navegador","Crie GIFs animados de qualquer vídeo. FPS, tamanho e duração personalizáveis. Sem upload.","gif",undefined,"🎞","from-sky-500 to-blue-600",[{icon:"🎞",text:"GIF animado"},{icon:"🎨",text:"FPS ajustável"},{icon:"🔒",text:"Privado"}]),
};

// ── Categoria: Compactação para envio ──────────────────────────────────────────
const COMP = {
  PROCESSO:  lp("Compactar Vídeo para Processo Eletrônico","Compactar vídeo para processo eletrônico","Reduza o tamanho para anexar em sistemas de processo eletrônico","Compacte gravações de CFTV para o limite de anexo de sistemas como PJe, e-SAJ e Projudi, mantendo a legibilidade da imagem.","compress",undefined,"📎","from-blue-500 to-blue-600",[{icon:"📎",text:"Pronto para anexar"},{icon:"📦",text:"Tamanho reduzido"},{icon:"⚡",text:"Rápido"}]),
  WHATSAPP:  lp("Compactar Vídeo para WhatsApp","Compactar vídeo para WhatsApp","Deixe o vídeo pequeno o bastante para o WhatsApp — na hora","Compacte gravações para menos de 16MB para envio por WhatsApp. Compactação inteligente mantém a qualidade da imagem.","compress",undefined,"💬","from-green-500 to-emerald-500",[{icon:"💬",text:"Pronto para WhatsApp"},{icon:"📦",text:"Menos de 16MB"},{icon:"⚡",text:"Rápido"}]),
  EMAIL:     lp("Compactar Vídeo para E-mail","Compactar vídeo para e-mail","Reduza o tamanho da gravação para anexar por e-mail","Compacte vídeos para envio por e-mail. Reduza o tamanho em até 80% mantendo boa qualidade de imagem.","compress",undefined,"📧","from-cyan-500 to-teal-500",[{icon:"📧",text:"Pronto para e-mail"},{icon:"📦",text:"Até 80% menor"},{icon:"⚡",text:"Rápido"}]),
  BOLETIM:   lp("Compactar Vídeo para Boletim de Ocorrência","Compactar vídeo para boletim de ocorrência","Prepare a gravação para anexar ao registro","Compacte e otimize gravações de câmeras de segurança para anexar em boletins de ocorrência e registros policiais.","compress",undefined,"📋","from-pink-500 to-rose-500",[{icon:"📋",text:"Pronto para o registro"},{icon:"📦",text:"Arquivo menor"},{icon:"⚡",text:"Rápido"}]),
  K4:        lp("Compactar Vídeo 4K de CFTV","Compactar vídeo 4K sem perder qualidade","Reduza o tamanho de gravações 4K sem perder detalhes","Reduza o tamanho de gravações 4K de câmeras de alta resolução para facilitar o envio e o armazenamento, preservando os detalhes.","compress",undefined,"🎬","from-blue-500 to-blue-600",[{icon:"🎬",text:"Suporte a 4K"},{icon:"✨",text:"Detalhes preservados"},{icon:"📦",text:"Arquivo menor"}]),
};

// ── Categoria: Evidência e perícia ──────────────────────────────────────────────
const EVID = {
  PERICIA:    lp("Preparar Vídeo para Perícia","Prepare gravações para perícia técnica","Converta, compacte e otimize gravações para laudo pericial","Converta e ajuste a qualidade de gravações de CFTV para análise pericial. Máxima fidelidade de imagem, pronto para laudo.","convert","evidencia_hd","🔎","from-blue-500 to-cyan-500",[{icon:"🔎",text:"Qualidade pericial"},{icon:"📎",text:"Formato padrão"},{icon:"🔒",text:"100% local"}]),
  FRAME:      lp("Extrair Frame de Vídeo como Evidência","Extraia uma imagem still da gravação","Capture o frame exato como evidência fotográfica","Gere uma imagem still de alta resolução a partir de qualquer momento do vídeo — útil para identificação de pessoas, veículos ou placas.","thumbnail",undefined,"📸","from-amber-500 to-orange-500",[{icon:"📸",text:"Imagem em HD"},{icon:"🎯",text:"Frame exato"},{icon:"⚡",text:"Instantâneo"}]),
  LEGENDA:    lp("Adicionar Legenda a Vídeo de Segurança","Grave legendas na gravação","Adicione identificação, texto ou legendas — permanentemente","Envie o vídeo e um arquivo SRT. O texto é gravado diretamente nos frames — útil para identificar câmeras, horários ou observações.","subtitle",undefined,"💬","from-blue-500 to-cyan-500",[{icon:"💬",text:"Suporte a SRT"},{icon:"🎨",text:"Estilo ajustável"},{icon:"🔒",text:"Privado"}]),
  TRANSCRICAO:lp("Transcrever Áudio de Vídeo","Gere uma transcrição do áudio gravado","Transcreva depoimentos e diálogos automaticamente","Gere uma transcrição de texto a partir do áudio da gravação. Útil para revisar depoimentos e diálogos gravados.","aicaption",undefined,"✨","from-blue-600 to-pink-600",[{icon:"✨",text:"Transcrição automática"},{icon:"📝",text:"Exporta em SRT"},{icon:"⚠️",text:"Experimental"}]),
  SILENCIO:   lp("Remover Silêncio de Gravação","Remova trechos sem áudio automaticamente","Corte pausas e silêncio de gravações longas","Detecte e remova automaticamente trechos silenciosos de gravações longas, depoimentos e escutas. Acelera a revisão do material.","silenceremover",undefined,"🔇","from-slate-600 to-gray-700",[{icon:"🔇",text:"Detecção automática"},{icon:"🎙",text:"Ideal para depoimentos"},{icon:"⚡",text:"Rápido"}]),
  TRECHO:     lp("Cortar Trecho de Vídeo de Segurança","Extraia o trecho relevante da gravação","Corte apenas o momento que importa para o processo","Corte e extraia o trecho relevante de gravações longas de CFTV. Defina início e fim com precisão, sem reprocessar o vídeo inteiro.","timeline",undefined,"✂️","from-blue-500 to-blue-600",[{icon:"✂️",text:"Corte preciso"},{icon:"⚡",text:"Sem reencode"},{icon:"🔒",text:"Privado"}]),
  MARCACAO:   lp("Adicionar Marcação em Vídeo","Adicione texto, seta ou marca d'água","Identifique câmera, data e hora na gravação","Adicione texto, logotipos ou marcações visuais sobre a gravação — útil para identificar a câmera, o local ou o horário.","overlay",undefined,"🧩","from-blue-500 to-blue-600",[{icon:"🧩",text:"Sobreposição de texto"},{icon:"📍",text:"Identificação"},{icon:"🔒",text:"Privado"}]),
};

// ── Categoria: Utilitários ──────────────────────────────────────────────────────
const UTIL = {
  MUTE:      lp("Remover Áudio de Vídeo","Remova o áudio de uma gravação","Remova o áudio de qualquer vídeo — instantaneamente","Remova o áudio de gravações com um clique. Cópia direta do stream — sem reencode, praticamente instantâneo.","audiostudio",undefined,"🔇","from-gray-500 to-slate-600",[{icon:"🔇",text:"Sem áudio instantâneo"},{icon:"⚡",text:"Sem reencode"},{icon:"🔒",text:"Privado"}]),
  CORTAR:    lp("Cortar Vídeo Online","Corte e apare gravações no navegador","Corte trechos de vídeo — sem instalar nada","Corte gravações no tamanho exato necessário. Defina ponto de início e fim. Sem software, sem upload.","timeline",undefined,"✂️","from-blue-500 to-blue-600",[{icon:"✂️",text:"Corte preciso"},{icon:"⚡",text:"Rápido"},{icon:"🔒",text:"Sem upload"}]),
  REDIM:     lp("Redimensionar Vídeo Online","Ajuste resolução e proporção do vídeo","Mude a resolução da gravação para qualquer padrão","Redimensione vídeos para qualquer resolução — 4K, 1080p, 720p, 480p. Ajuste a proporção com bordas quando necessário.","resize",undefined,"📐","from-teal-500 to-emerald-500",[{icon:"📐",text:"Qualquer resolução"},{icon:"🎬",text:"Ajuste de proporção"},{icon:"🔒",text:"Privado"}]),
  GIRAR:     lp("Girar Vídeo Online","Gire ou inverta a orientação do vídeo","Corrija a orientação da gravação — instantaneamente","Gire vídeos 90°, 180°, 270° ou inverta horizontal/verticalmente. Útil para corrigir gravações de câmeras mal posicionadas.","convert",undefined,"🔄","from-blue-500 to-cyan-500",[{icon:"🔄",text:"Girar/inverter"},{icon:"⚡",text:"Instantâneo"},{icon:"🔒",text:"Privado"}]),
  JUNTAR:    lp("Juntar Vídeos de Câmeras Online","Combine gravações de múltiplas câmeras","Una gravações de diferentes câmeras em um único arquivo","Combine vídeos de múltiplas câmeras ou trechos em um único arquivo. Reordene por arraste. Cópia direta quando os formatos coincidem.","merge",undefined,"🔗","from-orange-500 to-amber-500",[{icon:"🔗",text:"Juntar vídeos"},{icon:"⚡",text:"Sem reencode"},{icon:"🔒",text:"Privado"}]),
  VELOCIDADE:lp("Alterar Velocidade do Vídeo","Acelere ou desacelere a gravação","Reduza a velocidade para analisar detalhes do vídeo","Altere a velocidade de reprodução de 0,25x a 4x. Útil para analisar movimentos rápidos quadro a quadro.","timeline",undefined,"⚡","from-blue-500 to-blue-500",[{icon:"⚡",text:"0,25x a 4x"},{icon:"🎬",text:"Saída fluida"},{icon:"🔒",text:"Privado"}]),
};

// ── Mapa de rotas ─────────────────────────────────────────────────────────────
const SEO_ROUTES: [string, LandingConfig][] = [
  // Conversão
  ["/converter-dvr-para-mp4",         C.DVR_MP4],
  ["/converter-mov-para-mp4",         C.MOV_MP4],
  ["/converter-avi-para-mp4",         C.AVI_MP4],
  ["/converter-mkv-para-mp4",         C.MKV_MP4],
  ["/converter-webm-para-mp4",        C.WEBM_MP4],
  ["/extrair-audio-de-video",         C.VIDEO_MP3],
  ["/converter-video-para-gif",       C.VIDEO_GIF],
  // Compactação
  ["/compactar-video",                COMP.PROCESSO],
  ["/compactar-video-processo-eletronico", COMP.PROCESSO],
  ["/compactar-video-whatsapp",       COMP.WHATSAPP],
  ["/compactar-video-email",          COMP.EMAIL],
  ["/compactar-video-boletim-ocorrencia", COMP.BOLETIM],
  ["/compactar-video-4k-cftv",        COMP.K4],
  // Evidência e perícia
  ["/preparar-video-para-pericia",    EVID.PERICIA],
  ["/extrair-frame-video-evidencia",  EVID.FRAME],
  ["/adicionar-legenda-video-seguranca", EVID.LEGENDA],
  ["/legendar-video",                 EVID.LEGENDA],
  ["/transcrever-audio-de-video",     EVID.TRANSCRICAO],
  ["/remover-silencio-de-gravacao",   EVID.SILENCIO],
  ["/cortar-trecho-video-seguranca",  EVID.TRECHO],
  ["/adicionar-marcacao-video",       EVID.MARCACAO],
  ["/adicionar-marca-dagua-video",    EVID.MARCACAO],
  // Utilitários
  ["/remover-audio-de-video",         UTIL.MUTE],
  ["/silenciar-video",                UTIL.MUTE],
  ["/cortar-video-online",            UTIL.CORTAR],
  ["/aparar-video-online",            UTIL.CORTAR],
  ["/redimensionar-video-online",     UTIL.REDIM],
  ["/girar-video-online",             UTIL.GIRAR],
  ["/juntar-videos-cameras",          UTIL.JUNTAR],
  ["/alterar-velocidade-video",       UTIL.VELOCIDADE],
];

const App = () => (
  <TooltipProvider>
    <Toaster />
    <FFmpegLoader />
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {SEO_ROUTES.map(([path, config]) => (
          <Route key={path} path={path} element={<LandingPage config={config} />} />
        ))}
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
