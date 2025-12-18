import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Coins, Heart, TrendingUp, TrendingDown, ShoppingBag, Target, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const typeConfig = {
  habit_complete: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' },
  habit_fail: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/20' },
  objective_progress: { icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  purchase: { icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  level_up: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  penalty: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
};

export default function ActivityItem({ activity }) {
  const config = typeConfig[activity.type] || typeConfig.habit_complete;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 border-b border-slate-700/30 last:border-0"
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>

      <div className="flex-1">
        <p className="text-sm text-white">{activity.activity}</p>
        <p className="text-xs text-slate-500">
          {format(new Date(activity.created_date), "dd MMM, HH:mm", { locale: ptBR })}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        {activity.exp_change !== 0 && (
          <span className={cn(
            "text-xs font-medium flex items-center gap-1",
            activity.exp_change > 0 ? "text-cyan-400" : "text-red-400"
          )}>
            <Zap className="w-3 h-3" />
            {activity.exp_change > 0 ? '+' : ''}{activity.exp_change}
          </span>
        )}
        {activity.gold_change !== 0 && (
          <span className={cn(
            "text-xs font-medium flex items-center gap-1",
            activity.gold_change > 0 ? "text-yellow-400" : "text-red-400"
          )}>
            <Coins className="w-3 h-3" />
            {activity.gold_change > 0 ? '+' : ''}{activity.gold_change}
          </span>
        )}
        {activity.health_change !== 0 && (
          <span className={cn(
            "text-xs font-medium flex items-center gap-1",
            activity.health_change > 0 ? "text-green-400" : "text-red-400"
          )}>
            <Heart className="w-3 h-3" />
            {activity.health_change > 0 ? '+' : ''}{activity.health_change}
          </span>
        )}
      </div>
    </motion.div>
  );
}