import { motion } from 'framer-motion';
import { Heart, Zap, Shield, Coins, TrendingUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface CharacterCardProps {
  character: any;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const expForNextLevel = character?.level ? character.level * 500 : 500;
  const expProgress = character?.current_exp ? (character.current_exp / expForNextLevel) * 100 : 0;
  const healthProgress = character?.health && character?.max_health ? (character.health / character.max_health) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/20 p-6"
    >
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header with avatar and name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                {character?.profile_image ? (
                  <img src={character.profile_image} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-cyan-400">
                    {character?.name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full px-2 py-0.5 text-xs font-bold text-white">
              LV {character?.level || 1}
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">{character?.name || 'Caçador'}</h2>
            <p className="text-cyan-400/80 text-sm">{character?.main_objective || 'Definir objetivo...'}</p>
          </div>
        </div>

        {/* Stats bars */}
        <div className="space-y-4">
          {/* Health bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-red-400">
                <Heart className="w-4 h-4" />
                <span>Vida</span>
              </div>
              <span className="text-slate-400">{character?.health || 1000} / {character?.max_health || 1000}</span>
            </div>
            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
              />
            </div>
          </div>

          {/* EXP bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-cyan-400">
                <Zap className="w-4 h-4" />
                <span>EXP</span>
              </div>
              <span className="text-slate-400">{character?.current_exp || 0} / {expForNextLevel}</span>
            </div>
            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${expProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
              <Coins className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-white">{character?.gold || 0}</p>
            <p className="text-xs text-slate-500">Moedas</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-white">{character?.total_exp || 0}</p>
            <p className="text-xs text-slate-500">EXP Total</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
              <Shield className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-white">{character?.hit_points || 100}</p>
            <p className="text-xs text-slate-500">Hit Points</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}