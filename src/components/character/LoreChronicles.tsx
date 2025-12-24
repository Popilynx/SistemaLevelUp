import { motion } from 'framer-motion';
import { Scroll, Lock, CheckCircle2 } from 'lucide-react';
import { LoreChapter } from '@/types';
import { cn } from "@/lib/utils";

interface LoreChroniclesProps {
    chapters: LoreChapter[];
}

export default function LoreChronicles({ chapters }: LoreChroniclesProps) {
    return (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {chapters.map((ch, index) => (
                <motion.div
                    key={ch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                        "relative p-4 rounded-2xl border transition-all duration-300",
                        ch.unlocked
                            ? "bg-slate-900/40 border-cyan-500/20 hover:border-cyan-500/40"
                            : "bg-slate-950/20 border-slate-800/40 opacity-40 grayscale"
                    )}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                ch.unlocked ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-800/50 text-slate-600"
                            )}>
                                {ch.unlocked ? <Scroll className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </div>
                            <div>
                                <h3 className={cn(
                                    "text-sm font-black uppercase tracking-tight",
                                    ch.unlocked ? "text-white" : "text-slate-500"
                                )}>
                                    {ch.unlocked ? ch.title : "Capítulo Bloqueado"}
                                </h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                                    {ch.unlocked ? `CAPÍTULO ${index + 1}` : `DESBLOQUEIA NO NÍVEL ${ch.level_required}`}
                                </p>
                            </div>
                        </div>
                        {ch.unlocked && (
                            <div className="bg-cyan-500/10 p-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-cyan-500/50" />
                            </div>
                        )}
                    </div>

                    {ch.unlocked && (
                        <div className="mt-3 pt-3 border-t border-slate-800/50">
                            <p className="text-xs leading-relaxed text-slate-400 italic font-medium">
                                "{ch.content}"
                            </p>
                        </div>
                    )}

                    {ch.unlocked && (
                        <div className="absolute right-0 bottom-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                    )}
                </motion.div>
            ))}
        </div>
    );
}
