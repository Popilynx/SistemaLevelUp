import { motion } from 'framer-motion';
import { Check, Flame, Zap, Coins } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface GoodHabitCardProps {
  habit: any;
  isCompleted: boolean;
  onComplete: (habit: any) => void;
}

export default function GoodHabitCard({ habit, isCompleted, onComplete }: GoodHabitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: isCompleted ? 1 : 1.01, y: isCompleted ? 0 : -2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 cursor-pointer group backdrop-blur-md",
        isCompleted
          ? "bg-green-500/10 border-green-500/20"
          : "bg-slate-900/40 border-slate-800/50 hover:border-cyan-500/40 shadow-lg hover:shadow-cyan-500/10"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
            isCompleted ? "bg-green-500/20" : "bg-cyan-500/20"
          )}>
            {habit.icon || '⭐'}
          </div>
          <div>
            <h3 className={cn(
              "font-semibold",
              isCompleted ? "text-green-400 line-through" : "text-white"
            )}>
              {habit.name}
              {isCompleted && <span className="text-[8px] ml-2 font-black text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full decoration-none inline-block">CONCLUÍDO!</span>}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                +{habit.exp_reward || 10} EXP
              </span>
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-400" />
                +{habit.gold_reward || 5}
              </span>
              {habit.streak > 0 && (
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  {habit.streak} dias
                </span>
              )}
            </div>
          </div>
        </div>

        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => !isCompleted && onComplete(habit)}
          disabled={isCompleted}
        />
      </div>
    </motion.div>
  );
}