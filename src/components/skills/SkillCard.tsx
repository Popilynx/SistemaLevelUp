import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const iconMap = {
  estudo: '💻',
  leitura: '📖',
  saude: '💪',
  lazer: '🎮',
  musculacao: '🏋️',
  financas: '💰',
};

const colorMap = {
  estudo: 'from-purple-500 to-violet-500',
  leitura: 'from-blue-500 to-cyan-500',
  saude: 'from-green-500 to-emerald-500',
  lazer: 'from-pink-500 to-rose-500',
  musculacao: 'from-orange-500 to-amber-500',
  financas: 'from-yellow-500 to-lime-500',
};

export default function SkillCard({ skill }) {
  const getExpForLevel = (level) => {
    switch (level) {
      case 1: return skill.level_1_exp || 500;
      case 2: return skill.level_2_exp || 1200;
      case 3: return skill.level_3_exp || 2400;
      case 4: return skill.level_4_exp || 5000;
      case 5: return skill.level_5_exp || 9000;
      default: return 500;
    }
  };

  const currentLevelExp = skill.level > 1 ? getExpForLevel(skill.level - 1) : 0;
  const nextLevelExp = getExpForLevel(skill.level);
  const progressInLevel = skill.current_exp - currentLevelExp;
  const expNeededForLevel = nextLevelExp - currentLevelExp;
  const progress = Math.min((progressInLevel / expNeededForLevel) * 100, 100);

  const gradient = colorMap[skill.category] || colorMap.estudo;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 hover:border-cyan-500/30 transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl",
          gradient
        )}>
          {iconMap[skill.category] || skill.icon || '⚡'}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{skill.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              LV {skill.level || 1}
            </span>
            {skill.linked_objective && (
              <span className="text-xs text-slate-500">• {skill.linked_objective}</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn("h-full bg-gradient-to-r rounded-full", gradient)}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{skill.current_exp || 0} EXP</span>
          <span>{nextLevelExp} EXP</span>
        </div>
      </div>

      {/* Level indicators */}
      <div className="flex justify-between mt-3 pt-3 border-t border-slate-700/30">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
              skill.level >= lvl
                ? "bg-cyan-500 text-white"
                : "bg-slate-700 text-slate-500"
            )}
          >
            {lvl}
          </div>
        ))}
      </div>
    </motion.div>
  );
}