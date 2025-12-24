import { motion } from 'framer-motion';
import { Pet } from '@/types';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Heart, Zap, Shield, TrendingUp } from 'lucide-react';

interface PetCardProps {
    pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
    const progress = (pet.current_exp / pet.max_exp) * 100;

    const bonusIcons: Record<string, any> = {
        exp_boost: TrendingUp,
        gold_boost: Zap,
        damage_boost: Shield,
        cooldown_reduction: Zap,
    };

    const BonusIcon = bonusIcons[pet.bonus_type] || Zap;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/40 border border-slate-700/30 rounded-2xl p-4 flex items-center gap-4 hover:shadow-cyan-500/5 transition-all"
        >
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-4xl shadow-inner border border-slate-700/50">
                    {pet.icon}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-900">
                    Lvl {pet.level}
                </div>
            </div>

            <div className="flex-1 space-y-1.5">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white">{pet.name}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold uppercase">
                        <BonusIcon className="w-3 h-3" />
                        {Math.round(pet.bonus_value * 100)}% {pet.bonus_type.split('_')[0]}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-cyan-500"
                        />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                        <span>Progressão</span>
                        <span>{pet.current_exp} / {pet.max_exp} XP</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                        <div role="progressbar" className="h-full bg-red-500" style={{ width: `${pet.hunger}%` }} />
                    </div>
                    <span className="text-[8px] text-slate-500 font-black uppercase">Fome</span>
                </div>
            </div>
        </motion.div>
    );
}
