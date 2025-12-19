import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ComboCounterProps {
    combo: number;
}

export function ComboCounter({ combo }: ComboCounterProps) {
    if (combo < 2) return null;

    return (
        <motion.div
            key={combo}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: [1.5, 1], opacity: 1, y: 0 }}
            className="fixed bottom-24 right-8 z-50 flex flex-col items-center"
        >
            <div className="relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full blur-xl opacity-50"
                />
                <div className="relative bg-slate-900 border-2 border-orange-500 px-6 py-2 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500 italic">
                        {combo}x COMBO!
                    </span>
                </div>
            </div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-orange-400 font-bold text-xs mt-2 tracking-widest uppercase flex items-center gap-1"
            >
                <Sparkles className="w-3 h-3" /> Fogo nos Hábito!
            </motion.p>
        </motion.div>
    );
}

export function ParticleExplosion({ x, y }: { x: number, y: number }) {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            {[...Array(20)].map((_, i) => {
                const angle = (Math.PI * 2 * i) / 20;
                const velocity = 5 + Math.random() * 5;
                const targetX = x + Math.cos(angle) * 100 * velocity;
                const targetY = y + Math.sin(angle) * 100 * velocity;

                return (
                    <motion.div
                        key={i}
                        initial={{ x, y, opacity: 1, scale: 1 }}
                        animate={{
                            x: targetX,
                            y: targetY,
                            opacity: 0,
                            scale: 0,
                            rotate: Math.random() * 360
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(253,224,71,0.5)]"
                    />
                );
            })}
        </div>
    );
}
