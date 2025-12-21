import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sword, Shield, Skull, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { storage } from '@/components/storage/LocalStorage'; // Still needed for some global data or fallback
import { combatService } from '@/services/combatService';
import { characterService } from '@/services/characterService';
import { questService } from '@/services/questService';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function BossArena() {
    const [boss, setBoss] = useState<any>(null);
    const [character, setCharacter] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [turn, setTurn] = useState<'player' | 'enemy'>('player');
    const [isAttacking, setIsAttacking] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [showDefeat, setShowDefeat] = useState(false);

    // Initial Load & Event Listeners
    const loadData = () => {
        const currentBoss = combatService.getDailyBoss();
        const char = characterService.getCharacter();
        setBoss(currentBoss);
        setCharacter(char);

        if (currentBoss?.status === 'defeated') {
            setShowVictory(true);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        const handleUpdate = () => loadData();
        window.addEventListener('levelup_boss_update', handleUpdate);
        window.addEventListener('levelup_data_update', handleUpdate);
        return () => {
            window.removeEventListener('levelup_boss_update', handleUpdate);
            window.removeEventListener('levelup_data_update', handleUpdate);
        };
    }, []);

    // --- COMBAT LOGIC ---

    const handlePlayerAttack = async () => {
        if (!boss || boss.status === 'defeated' || turn !== 'player') return;

        setIsAttacking(true); // Trigger Player Attack Animation (Sword Shake?)

        const stats = characterService.calculateStats(character);
        const baseDamage = 25;
        const totalDamage = baseDamage + stats.damage;

        // Visual Feedback Delay
        setTimeout(() => {
            const result = combatService.dealDamage(totalDamage);
            setBoss(result.boss);

            questService.updateProgress('boss_damage', result.damageDealt);
            toast.success(`Você causou ${result.damageDealt} de dano!`);

            if (result.isKill) {
                setShowVictory(true);
                setIsAttacking(false);
            } else {
                // End Player Turn -> Start Enemy Turn
                setTurn('enemy');
                setIsAttacking(false);
                setTimeout(handleEnemyTurn, 1000); // 1s delay before Boss responds
            }
        }, 400);
    };

    const handleEnemyTurn = async () => {
        if (!boss || boss.status === 'defeated') return;

        // Boss Attack Logic
        const stats = characterService.calculateStats(character);
        const damage = combatService.calculateBossDamage(boss, stats.defense); // New function in service

        // Apply Damage to Player
        const newHealth = Math.max(0, (character.health || 0) - damage);

        await characterService.updateCharacter({ health: newHealth });
        setCharacter({ ...character, health: newHealth }); // Optimistic UI update

        toast.error(`${boss.name} atacou! Você sofreu ${damage} de dano!`);

        // Shake visual effect on screen? (Handled by CSS/Motion maybe)

        if (newHealth <= 0) {
            setShowDefeat(true);
        } else {
            setTurn('player');
        }
    };

    const handleClaimRewards = async () => {
        if (!boss || !character || boss.reward_claimed) return;

        const result = await combatService.claimBossReward();

        if (result) {
            questService.updateProgress('earn_gold', result.gold);
            toast.success(`Recompensas Coletadas: +${result.gold} Ouro, +${result.exp} XP!`);

            // Return to Home
            window.location.href = createPageUrl('Home');
        } else {
            toast.error("Você já coletou a recompensa de hoje!");
        }
    };

    if (loading) return <div className="p-8 text-white">Carregando Arena...</div>;
    if (!boss) return <div className="p-8 text-white">Carregando Boss...</div>;

    const bossHpPercent = boss.stats ? Math.max(0, (boss.stats.health / boss.stats.max_health) * 100) : 0;
    const playerHpPercent = character ? Math.max(0, (character.health / character.max_health) * 100) : 0;

    return (
        <div className={cn(
            "min-h-screen p-4 md:p-8 flex flex-col items-center transition-colors duration-500",
            turn === 'enemy' ? "bg-slate-950" : "bg-gradient-to-br from-red-950 via-slate-900 to-slate-950"
        )}>

            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-8">
                <Link to={createPageUrl('Home')}>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-xl md:text-3xl font-bold text-red-500 tracking-wider uppercase text-center flex-1">
                    {turn === 'player' ? "SUA VEZ DE ATACAR" : `${boss.name} ESTÁ ATACANDO...`}
                </h1>
                <div className="w-10"></div>
            </div>

            {/* Boss Card */}
            <div className={cn(
                "relative w-full max-w-md md:max-w-5xl aspect-square md:aspect-video bg-black/60 rounded-3xl border-4 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)] transition-all duration-300",
                turn === 'enemy' ? "border-red-500 scale-105 shadow-[0_0_80px_rgba(220,38,38,0.6)]" : "border-red-900/50"
            )}>

                {/* Boss Sprite Animation */}
                <motion.div
                    animate={
                        turn === 'enemy'
                            ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } // Attack animation
                            : isAttacking
                                ? { x: [0, -10, 10, -10, 10, 0], color: ['#fff', '#f00', '#fff'] } // Hit animation
                                : { y: [0, -10, 0] } // Idle
                    }
                    transition={turn === 'enemy' ? { duration: 0.5, repeat: Infinity } : isAttacking ? { duration: 0.5 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="text-[100px] md:text-[220px] filter drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] relative z-10 transition-all duration-300"
                >
                    {boss.image}
                </motion.div>

                {/* Boss UI */}
                <div className="absolute bottom-0 w-full bg-linear-to-t from-black via-black/90 to-transparent p-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-2 truncate px-4 tracking-tight drop-shadow-lg">{boss.name}</h2>

                    {/* Boss HP Bar */}
                    <div className="w-full max-w-2xl mx-auto h-8 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative shadow-inner">
                        <motion.div
                            className="h-full bg-gradient-to-r from-red-700 to-red-500 relative overflow-hidden"
                            initial={{ width: '100%' }}
                            animate={{ width: `${bossHpPercent}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white drop-shadow-md tracking-wider">
                            {boss.stats?.health ?? 0} / {boss.stats?.max_health ?? 1} HP
                        </div>
                    </div>
                </div>
            </div>

            {/* Battle Control & Player Stats */}
            <div className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Player Status */}
                <div className="bg-slate-900/80 border border-slate-700 p-6 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-white font-bold text-lg">{character?.name || 'Herói'}</span>
                        <span className="text-slate-400 text-sm">Nível {character?.level || 1}</span>
                    </div>
                    {/* Player HP Bar */}
                    <div className="w-full h-6 bg-slate-950 rounded-full overflow-hidden border border-slate-700 relative">
                        <motion.div
                            className="h-full bg-green-600 relative overflow-hidden"
                            animate={{ width: `${playerHpPercent}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                            {Math.floor(character?.health || 0)} / {character?.max_health || 100} HP
                        </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1"><Sword className="w-4 h-4 text-orange-400" /> Dano: {25 + (characterService.calculateStats(character).damage || 0)}</div>
                        <div className="flex items-center gap-1"><Shield className="w-4 h-4 text-blue-400" /> Def: {characterService.calculateStats(character).defense || 0}</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center md:justify-end">
                    <Button
                        onClick={handlePlayerAttack}
                        disabled={boss.status === 'defeated' || turn !== 'player'}
                        className={cn(
                            "font-black py-8 px-12 text-2xl rounded-2xl shadow-[0_10px_0_rgba(0,0,0,0.5)] border-t transition-all flex items-center gap-4 uppercase tracking-widest w-full",
                            turn === 'player'
                                ? "bg-red-700 hover:bg-red-600 text-white shadow-[0_10px_0_rgb(153,27,27)] border-red-500 active:translate-y-2 active:shadow-none"
                                : "bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed"
                        )}
                    >
                        {turn === 'player' ? <><Sword className="w-8 h-8" /> ATACAR</> : "AGUARDE..."}
                    </Button>
                </div>
            </div>

            {/* Victory Modal */}
            <AnimatePresence>
                {showVictory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
                            {/* Victory Content (Same as before) */}
                            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2">VITÓRIA ÉPICA!</h2>
                            <p className="text-slate-300 mb-6">Você superou o {boss.name}!</p>
                            <Button onClick={handleClaimRewards} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 text-lg">
                                COLETAR RECOMPENSAS
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Defeat Modal */}
            <AnimatePresence>
                {showDefeat && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-sm"
                    >
                        <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
                            <Skull className="w-20 h-20 text-red-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2">VOCÊ FOI DERROTA!</h2>
                            <p className="text-slate-300 mb-6">
                                O {boss.name} foi forte demais hoje.<br />
                                <span className="text-red-400 italic text-sm">Descanse, recupere sua vida com hábitos saudáveis e tente novamente amanhã!</span>
                            </p>
                            <Link to={createPageUrl('Home')}>
                                <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 text-lg">
                                    VOLTAR E RECUPERAR
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
