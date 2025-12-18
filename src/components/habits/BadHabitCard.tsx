import { motion } from 'framer-motion';
import { X, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  red: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  gray: { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-400' },
  purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
};

interface BadHabitCardProps {
  habit: any;
  onFail: (habit: any) => void;
}

export default function BadHabitCard({ habit, onFail }: BadHabitCardProps) {
  const colors = colorMap[habit.color] || colorMap.red;
  const isClean = habit.days_clean > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all duration-300",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg", colors.bg)}>
            {habit.icon || '🚫'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{habit.name}</h3>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className={cn("flex items-center gap-1", isClean ? "text-green-400" : colors.text)}>
                <Calendar className="w-3 h-3" />
                {habit.days_clean || 0} dias limpo
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <AlertTriangle className="w-3 h-3" />
                -{habit.health_penalty || 50} vida
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isClean ? (
            <span className="text-green-400 text-sm font-medium">✅ Indo bem!</span>
          ) : (
            <span className="text-red-400 text-sm font-medium">⚠️ Cuidado</span>
          )}
          <Button
            onClick={() => onFail(habit)}
            size="sm"
            variant="ghost"
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20"
          >
            Eu fiz 😞
          </Button>
        </div>
      </div>

      {habit.monthly_falls > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="text-xs text-slate-400">
            Quedas este mês: <span className={colors.text}>{habit.monthly_falls}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}