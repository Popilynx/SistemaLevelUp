import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { petService } from '@/services/petService';
import { ArrowLeft, Sword, Shield, Skull, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { storage } from '@/components/storage/LocalStorage'; // Still needed for some global data or fallback
import { combatService } from '@/services/combatService';
import { characterService } from '@/services/characterService';
import { questService } from '@/services/questService';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { juiceService } from '@/services/juiceService';

export default function BossArena() {
    const [boss, setBoss] = useState<any>(null);
    const [character, setCharacter] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [turn, setTurn] = useState<'player' | 'enemy'>('player');
    const [isAttacking, setIsAttacking] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [showDefeat, setShowDefeat] = useState(false);
    const navigate = useNavigate();

    // Initial Load & Event Listeners
    const loadData = () => {
        const currentBoss = combatService.getDailyBoss();
        const char = characterService.getCharacter();
        setBoss(currentBoss);
        setCharacter(char);

        if (currentBoss?.status === 'defeated') {
            setShowVictory(true);
        }

        // Security Check: Redirect if reward claimed
        if (currentBoss?.reward_claimed) {
            toast.info("Você já concluiu este desafio por hoje!");
            navigate(createPageUrl('Home'));
            return;
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

    const handlePlayerAttack = async (skillType: 'quick' | 'heavy' | 'focus' = 'quick') => {
        if (!boss || boss.status === 'defeated' || turn !== 'player') return;

        setIsAttacking(true);
        juiceService.play('click');

        const stats = characterService.calculateStats(character);
        let baseDamage = 25;
        let multiplier = 1;
        let skipTurn = false;
        let heal = 0;

        if (skillType === 'heavy') {
            multiplier = 2.5;
            skipTurn = true;
            juiceService.play('bossHit');
        } else if (skillType === 'focus') {
            multiplier = 0.5;
            heal = 50;
            juiceService.play('success');
        } else {
            juiceService.play('click');
        }

        const totalDamage = Math.floor((baseDamage + stats.damage) * multiplier);

        const playerElement = character?.active_pet?.element || 'neutral';
        // Visual Feedback Delay
        setTimeout(async () => {
            const result = combatService.dealDamage(totalDamage, playerElement);
            setBoss(result.boss);

            if (result.multiplier > 1) {
                toast.success(`CRÍTICO ELEMENTAL! (${playerElement.toUpperCase()} vs ${boss.element.toUpperCase()})`, { icon: '🔥' });
            } else if (result.multiplier < 1) {
                toast.error(`ATAQUE FRACO! ${boss.element.toUpperCase()} é resistente a ${playerElement.toUpperCase()}`);
            }

            if (heal > 0) {
                const newHealth = Math.min(character.max_health, (character.health || 0) + heal);
                await characterService.updateCharacter({ health: newHealth });
                setCharacter(prev => ({ ...prev, health: newHealth }));
                toast.success(`Você focou e recuperou ${heal} de HP!`);
            }

            questService.updateProgress('boss_damage', result.damageDealt);
            juiceService.vibrate(50);

            if (result.damageDealt > 0) {
                juiceService.flashScreen();
            }

            if (result.isKill) {
                setShowVictory(true);
                juiceService.play('levelUp');
                setIsAttacking(false);
            } else {
                setTurn('enemy');
                setIsAttacking(false);
                const enemyDelay = skipTurn ? 2000 : 1000;
                if (skipTurn) toast.info("Golpe Pesado! Você precisa de tempo para se recuperar...");
                setTimeout(handleEnemyTurn, enemyDelay);
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
            navigate(createPageUrl('Home'));
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

                    {boss.element && boss.element !== 'neutral' && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className={cn(
                                "text-sm font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg",
                                boss.element === 'fire' && "bg-orange-500 text-white",
                                boss.element === 'water' && "bg-blue-500 text-white",
                                boss.element === 'earth' && "bg-emerald-500 text-white",
                                boss.element === 'air' && "bg-cyan-500 text-white",
                            )}>
                                {boss.element === 'fire' && '🔥 ELEMENTO: FOGO'}
                                {boss.element === 'water' && '💧 ELEMENTO: ÁGUA'}
                                {boss.element === 'earth' && '🌿 ELEMENTO: TERRA'}
                                {boss.element === 'air' && '🌪️ ELEMENTO: AR'}
                            </span>
                        </div>
                    )}

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

                    {character?.active_pet && (
                        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{character.active_pet.icon}</span>
                                <div className="text-[10px] leading-tight font-bold text-slate-300 uppercase">
                                    Ataque Elemental:
                                    <span className={cn(
                                        "block text-xs",
                                        character.active_pet.element === 'fire' && "text-orange-400",
                                        character.active_pet.element === 'water' && "text-blue-400",
                                        character.active_pet.element === 'earth' && "text-emerald-400",
                                        character.active_pet.element === 'air' && "text-cyan-400",
                                    )}>
                                        {character.active_pet.element.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-slate-800 px-2 py-1 rounded text-[9px] font-black text-slate-400 uppercase">
                                {petService.getPetBonus(character.active_pet, 'damage_boost') > 0 ? `+${Math.round(petService.getPetBonus(character.active_pet, 'damage_boost') * 100)}% Dano` : "Bônus Ativo"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => handlePlayerAttack('quick')}
                        disabled={boss.status === 'defeated' || turn !== 'player'}
                        className={cn(
                            "font-black py-6 px-8 text-xl rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest",
                            turn === 'player'
                                ? "bg-red-700 hover:bg-red-600 text-white shadow-[0_5px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none"
                                : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        )}
                    >
                        <Sword className="w-6 h-6" /> Ataque Rápido
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => handlePlayerAttack('heavy')}
                            disabled={boss.status === 'defeated' || turn !== 'player'}
                            className={cn(
                                "font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase",
                                turn === 'player'
                                    ? "bg-orange-700 hover:bg-orange-600 text-white shadow-[0_4px_0_rgb(194,65,12)] active:translate-y-1 active:shadow-none"
                                    : "bg-slate-800 text-slate-600 cursor-not-allowed"
                            )}
                        >
                            <Skull className="w-4 h-4" /> Golpe Pesado
                        </Button>
                        <Button
                            onClick={() => handlePlayerAttack('focus')}
                            disabled={boss.status === 'defeated' || turn !== 'player'}
                            className={cn(
                                "font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase",
                                turn === 'player'
                                    ? "bg-blue-700 hover:bg-blue-600 text-white shadow-[0_4px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none"
                                    : "bg-slate-800 text-slate-600 cursor-not-allowed"
                            )}
                        >
                            <Shield className="w-4 h-4" /> Foco/Cura
                        </Button>
                    </div>
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
