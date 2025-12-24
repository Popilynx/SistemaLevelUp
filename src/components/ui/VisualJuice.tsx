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


export function LevelUpCelebration({ level }: { level: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="text-center"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-8xl mb-4"
                >
                    🌟
                </motion.div>
                <h2 className="text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]">
                    LEVEL UP!
                </h2>
                <p className="text-2xl font-bold text-cyan-400 uppercase tracking-[0.2em]">
                    Você alcançou o Nível {level}
                </p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-slate-400 animate-pulse"
                >
                    Clique em qualquer lugar para continuar
                </motion.div>
            </motion.div>

            {/* Background Confetti (Simple) */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: "50%",
                        y: "50%",
                        scale: 0
                    }}
                    animate={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        scale: Math.random() * 2 + 1,
                        rotate: Math.random() * 360,
                        opacity: [1, 0]
                    }}
                    transition={{
                        duration: 2,
                        delay: Math.random() * 0.5,
                        repeat: Infinity
                    }}
                    className="absolute w-4 h-4 rounded-sm bg-cyan-500"
                    style={{
                        backgroundColor: i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#818cf8' : '#fbbf24'
                    }}
                />
            ))}
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
