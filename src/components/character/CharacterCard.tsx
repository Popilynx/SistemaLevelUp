import { motion } from 'framer-motion';
import { Heart, Zap, Shield, Coins, TrendingUp } from 'lucide-react';

interface CharacterCardProps {
  character: any;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const expForNextLevel = character?.level ? character.level * 500 : 500;
  const expProgress = character?.current_exp ? (character.current_exp / expForNextLevel) * 100 : 0;

  const equippedItems = character?.inventory?.filter((i: any) => i.is_equipped) || [];
  const activeDebuffs = character?.active_debuffs || [];
  const activeBuffs = character?.active_buffs || [];

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
            <div className="absolute -bottom-1 -right-1 flex flex-col items-end gap-1">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full px-2 py-0.5 text-[8px] font-bold text-white shadow-lg">
                LV {character?.level || 1}
              </div>
              {character?.rank && (
                <div className="bg-slate-900/90 border border-cyan-500/30 rounded-full px-2 py-0.5 text-[8px] font-black text-cyan-300 shadow-xl whitespace-nowrap">
                  {character.rank}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">{character?.name || 'Caçador'}</h2>
            <p className="text-cyan-400/80 text-sm font-medium">{character?.main_objective || 'Definir objetivo...'}</p>
            {character?.secondary_objective && (
              <p className="text-slate-400 text-xs mt-0.5 italic">“{character.secondary_objective}”</p>
            )}
          </div>
        </div>

        {/* Stats bars */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm mb-1">
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[10px]">
                <Heart className="w-3 h-3 fill-red-500/20" />
                <span>Energia Vital</span>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">{character?.health || 1000} / {character?.max_health || 1000}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...Array(10)].map((_, i) => {
                const threshold = (i + 1) * 100;
                const prevThreshold = i * 100;
                const fillPercent = (character?.health || 0) >= threshold ? 100 : (character?.health || 0) > prevThreshold ? (((character?.health || 0) - prevThreshold) / 100) * 100 : 0;

                return (
                  <div key={i} className="relative w-5 h-5">
                    <Heart className="absolute inset-0 w-full h-full text-slate-700 fill-slate-800/50" />
                    <motion.div className="absolute inset-0" animate={{ clipPath: `inset(${100 - fillPercent}% 0 0 0)` }}>
                      <Heart className="w-full h-full text-red-500 fill-red-500" />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-cyan-400">
                <Zap className="w-4 h-4" />
                <span>EXP</span>
              </div>
              <span className="text-slate-400">{character?.current_exp || 0} / {expForNextLevel}</span>
            </div>
            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${expProgress}%` }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700/50">
          <div className="text-center">
            <Coins className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{character?.gold || 0}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black">Moedas</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{character?.total_exp || 0}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black">EXP Total</p>
          </div>
          <div className="text-center">
            <Shield className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{character?.hit_points || 100}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black">HP Stats</p>
          </div>
        </div>

        {/* Category XP Insights */}
        {character?.category_xp && Object.keys(character.category_xp).length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Domínio por Área</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(character.category_xp).map(([cat, xp]: [string, any]) => (
                <div key={cat} className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30 flex justify-between items-center text-[10px]">
                  <span className="capitalize text-slate-400">{cat}</span>
                  <span className="font-bold text-cyan-400">{xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Effects (Buffs & Debuffs) */}
        {(activeBuffs.length > 0 || activeDebuffs.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {/* Buffs */}
            {activeBuffs.map((buff: any) => {
              const startTime = new Date(buff.start_time);
              const elapsed = (Date.now() - startTime.getTime()) / (1000 * 60);
              const remaining = Math.max(0, Math.ceil(buff.duration_minutes - elapsed));

              return (
                <motion.div
                  key={buff.id}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="group relative w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center justify-center text-lg cursor-help"
                >
                  {buff.icon}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-2 py-1 bg-slate-900 text-[10px] text-white rounded border border-green-900 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 text-center shadow-xl">
                    <p className="font-bold text-green-400">{buff.name}</p>
                    <p className="text-[8px] opacity-70 leading-tight mb-1">{buff.description}</p>
                    <p className="text-[7px] font-mono text-green-500">{remaining} min restantes</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Debuffs */}
            {activeDebuffs.map((debuff: any) => {
              const startTime = new Date(debuff.start_time);
              const elapsed = (Date.now() - startTime.getTime()) / (1000 * 60);
              const remaining = Math.max(0, Math.ceil(debuff.duration_minutes - elapsed));

              return (
                <motion.div
                  key={debuff.id}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="group relative w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-lg cursor-help"
                >
                  {debuff.icon}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-2 py-1 bg-red-950 text-[10px] text-white rounded border border-red-900 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 text-center shadow-xl">
                    <p className="font-bold">{debuff.name}</p>
                    <p className="text-[8px] opacity-70 leading-tight mb-1">{debuff.description}</p>
                    <p className="text-[7px] font-mono text-red-400">{remaining} min restantes</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Equipment Section */}
        {equippedItems.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Equipamento Ativo</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {equippedItems.map((item: any) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="group relative w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xl cursor-help shadow-lg"
                >
                  {item.icon}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 px-2 py-1 bg-slate-900 text-[10px] text-white rounded border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 text-center">
                    <p className="font-bold text-cyan-400">{item.name}</p>
                    {item.bonus_exp && <p className="text-green-400">+{item.bonus_exp * 100}% EXP</p>}
                    {item.reduction_penalty && <p className="text-cyan-400">-{item.reduction_penalty * 100}% Dano</p>}
                    {item.max_uses && <p className="text-slate-500">Usos: {item.current_uses}/{item.max_uses}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}