import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Zap, Coins, CheckCircle2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ObjectiveCard({ objective, onUpdateProgress, onComplete }) {
  const isCompleted = objective.status === 'concluido';
  const progress = objective.progress || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border p-6 transition-all backdrop-blur-xl shadow-xl",
        objective.is_main
          ? "bg-slate-900/60 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.05)]"
          : isCompleted
            ? "bg-green-500/[0.03] border-green-500/20"
            : "bg-slate-900/40 border-slate-800/60 hover:border-cyan-500/30"
      )}
    >
      {objective.is_main && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-2xl uppercase shadow-lg">
          Prioridade Máxima
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          isCompleted ? "bg-green-500/20" : "bg-cyan-500/20"
        )}>
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <Target className="w-6 h-6 text-cyan-400" />
          )}
        </div>

        <div className="flex-1">
          <h3 className={cn(
            "font-bold text-lg mb-1",
            isCompleted ? "text-green-400" : "text-white"
          )}>
            {objective.title}
          </h3>

          {objective.description && (
            <p className="text-sm text-slate-400 mb-3">{objective.description}</p>
          )}

          {/* Progress bar */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progresso</span>
              <span className={cn(
                "font-bold",
                progress >= 100 ? "text-green-400" : "text-cyan-400"
              )}>
                {progress}%
              </span>
            </div>
            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  progress >= 100
                    ? "bg-gradient-to-r from-green-500 to-emerald-400"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500"
                )}
              />
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {objective.due_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(objective.due_date), "dd MMM yyyy", { locale: ptBR })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              +{objective.exp_reward || 500} EXP
            </span>
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-yellow-400" />
              +{objective.gold_reward || 100}
            </span>
          </div>
        </div>
      </div>

      {!isCompleted && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/30">
          <Button
            onClick={() => onUpdateProgress(objective, Math.min(progress + 10, 100))}
            size="sm"
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
          >
            +10%
          </Button>
          {progress >= 100 && (
            <Button
              onClick={() => onComplete(objective)}
              size="sm"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              Concluir
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}