/**
 * TimeSaved — shown after export completes.
 * Shows how long processing took and, when applicable, the size reduction achieved.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";

interface TimeSavedProps {
  startTime: number; // Date.now() when processing started
  savedBytes?: number; // bytes saved vs original
  originalBytes?: number;
}

const TimeSaved = ({ startTime, savedBytes, originalBytes }: TimeSavedProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed((Date.now() - startTime) / 1000);
  }, [startTime]);

  const elapsedStr = elapsed < 60
    ? `${elapsed.toFixed(1)}s`
    : `${Math.floor(elapsed / 60)}m ${Math.round(elapsed % 60)}s`;

  const savingsPct = savedBytes && originalBytes && originalBytes > 0
    ? Math.round((savedBytes / originalBytes) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
      className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20 border border-blue-200/60 dark:border-blue-800/40"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-black text-gray-900 dark:text-white">
            ⚡ Concluído em {elapsedStr}
          </p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
            Processado localmente, sem envio a servidores
          </p>
        </div>
      </div>

      {savingsPct > 0 && (
        <>
          <div className="w-px h-8 bg-blue-200 dark:bg-blue-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 dark:text-white">
                Economizou {savingsPct}% do tamanho
              </p>
              <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold">
                Otimizado para envio e anexo
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TimeSaved;
