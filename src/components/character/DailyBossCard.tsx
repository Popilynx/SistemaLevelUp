import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DailyBossCardProps {
    boss: any;
    isDefeated: boolean;
}

export default function DailyBossCard({ boss, isDefeated }: DailyBossCardProps) {
    if (!boss) return null;

    const healthPercentage = boss.stats ? (boss.stats.health / boss.stats.max_health) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-500 backdrop-blur-xl",
                isDefeated
                    ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/40 shadow-[0_0_40px_rgba(234,179,8,0.1)]"
                    : "bg-slate-900/40 border-slate-800/60 shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:border-red-500/30"
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-lg",
                        isDefeated ? "bg-yellow-500/30" : "bg-red-500/20"
                    )}>
                        {isDefeated ? '🏆' : boss.image}
                    </div>
                    <div>
                        <h2 className={cn(
                            "text-xl font-black tracking-tighter uppercase",
                            isDefeated ? "text-yellow-400" : "text-white"
                        )}>
                            {isDefeated ? 'BOSS DERROTADO!' : boss.name}
                        </h2>
                        <div className="flex items-center gap-2">
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">BOSS DO DIA</p>
                            {boss.element && boss.element !== 'neutral' && (
                                <span className={cn(
                                    "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase",
                                    boss.element === 'fire' && "bg-orange-500/20 text-orange-400",
                                    boss.element === 'water' && "bg-blue-500/20 text-blue-400",
                                    boss.element === 'earth' && "bg-emerald-500/20 text-emerald-400",
                                    boss.element === 'air' && "bg-cyan-500/20 text-cyan-400",
                                )}>
                                    {boss.element === 'fire' && '🔥 FOGO'}
                                    {boss.element === 'water' && '💧 ÁGUA'}
                                    {boss.element === 'earth' && '🌿 TERRA'}
                                    {boss.element === 'air' && '🌪️ AR'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {isDefeated && (
                    <motion.div
                        initial={{ rotate: -20, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="bg-yellow-500 text-slate-950 px-3 py-1 rounded-full text-[10px] font-black"
                    >
                        CONCLUÍDO
                    </motion.div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className={isDefeated ? "text-yellow-500" : "text-red-400"}>
                        {isDefeated ? "RECOMPENSA COLETADA" : "PONTOS DE VIDA"}
                    </span>
                    <span className="text-slate-400 font-mono">
                        {isDefeated ? "---" : `${Math.ceil(boss.stats?.health ?? 0)} / ${boss.stats?.max_health ?? 1}`}
                    </span>
                </div>
                <div className="h-4 bg-slate-950/50 rounded-full overflow-hidden border border-slate-700/30 p-0.5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${isDefeated ? 0 : healthPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={cn(
                            "h-full rounded-full transition-colors duration-500",
                            healthPercentage > 60 ? "bg-red-500" : healthPercentage > 25 ? "bg-orange-500" : "bg-yellow-500"
                        )}
                    />
                </div>
            </div>

            {!isDefeated && (
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Swords className="w-3 h-3 text-red-500" />
                        Complete hábitos para atacar!
                    </div>
                    <div className="flex items-center gap-3 font-mono font-bold">
                        <span className="flex items-center gap-1 text-yellow-500">💰 {boss.rewards?.gold || boss.base_gold_reward}</span>
                        <span className="flex items-center gap-1 text-cyan-400">✨ {boss.rewards?.exp || boss.base_exp_reward}</span>
                    </div>
                </div>
            )}

            {/* Defeat Overlay Effect */}
            <AnimatePresence>
                {isDefeated && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none overflow-hidden"
                    >
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    y: "100%",
                                    x: `${Math.random() * 100}%`,
                                    scale: 0
                                }}
                                animate={{
                                    y: "-100%",
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2
                                }}
                                className="absolute text-yellow-500/20 text-xl"
                            >
                                ✨
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
