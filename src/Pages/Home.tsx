import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Swords, BookOpen, Scroll, Settings, ShoppingBag, Activity, Package, TrendingUp, Hammer, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { storage } from '@/components/storage/LocalStorage';
import { combatService } from '@/services/combatService';
import CharacterCard from '@/components/character/CharacterCard';
import DailyBossCard from '@/components/character/DailyBossCard';
import { ComboCounter, ParticleExplosion, LevelUpCelebration } from '@/components/ui/VisualJuice';
import PetCard from '@/components/character/PetCard';
import PetSelection from '@/components/character/PetSelection';
import LoreChronicles from '@/components/character/LoreChronicles';
import { petService } from '@/services/petService';
import { loreService } from '@/services/loreService';
import { eventService } from '@/services/eventService';
import { juiceService } from '@/services/juiceService';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GoodHabitCard from '@/components/habits/GoodHabitCard';
import BadHabitCard from '@/components/habits/BadHabitCard';
import ObjectiveCard from '@/components/objectives/ObjectiveCard';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { toast } from 'sonner';

import { questService } from '@/services/questService';

export default function Home() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [character, setCharacter] = useState(null);
  const [goodHabits, setGoodHabits] = useState([]);
  const [badHabits, setBadHabits] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [dailyChecks, setDailyChecks] = useState([]);
  const [dailyBoss, setDailyBoss] = useState(null);
  const [combo, setCombo] = useState(0);
  const [particles, setParticles] = useState<{ x: number, y: number, id: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState<{ levels: number, level: number } | null>(null);
  const [isLoreOpen, setIsLoreOpen] = useState(false);
  const [isPetOpen, setIsPetOpen] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    const [char, gHabits, bHabits, obj, checks, boss] = await Promise.all([
      storage.getCharacter(),
      storage.getGoodHabits(),
      storage.getBadHabits(),
      storage.getObjectives(),
      storage.getDailyChecks(today),
      combatService.getDailyBoss(),
    ]);
    setCharacter(char);
    setGoodHabits(gHabits);
    setBadHabits(bHabits);
    setObjectives(obj);
    setDailyChecks(checks);
    setDailyBoss(boss);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Debuff expiration check every minute
    const debuffInterval = setInterval(async () => {
      const char = await storage.getCharacter();
      if (!char) return;

      const now = new Date();
      let changed = false;
      const updates: any = {};

      if (char.active_debuffs && char.active_debuffs.length > 0) {
        const validDebuffs = char.active_debuffs.filter((d: any) => {
          const startTime = new Date(d.start_time);
          const diffMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
          return diffMinutes < d.duration_minutes;
        });
        if (validDebuffs.length !== char.active_debuffs.length) {
          updates.active_debuffs = validDebuffs;
          changed = true;
        }
      }

      if (char.active_buffs && char.active_buffs.length > 0) {
        const validBuffs = char.active_buffs.filter((b: any) => {
          const startTime = new Date(b.start_time);
          const diffMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
          return diffMinutes < b.duration_minutes;
        });
        if (validBuffs.length !== char.active_buffs.length) {
          updates.active_buffs = validBuffs;
          changed = true;
        }

        // Health Regeneration Logic
        if (validBuffs.some((b: any) => b.type === 'health_regen')) {
          const currentHealth = char.health || 0;
          const maxHealth = char.max_health || 1000;
          if (currentHealth < maxHealth) {
            updates.health = Math.min(currentHealth + 10, maxHealth);
            changed = true;
          }
        }
      }

      if (changed) {
        await storage.updateCharacter(updates);
        loadData();
        // Only toast if status changed (buffs/debuffs removed)
        if (updates.active_debuffs || updates.active_buffs) {
          toast.info("O status do seu personagem mudou!");
        }
      }
    }, 60000);

    // Listen for level up events
    const handleLevelUp = (e: any) => {
      setShowLevelUp(e.detail);
      juiceService.play('levelUp');
      juiceService.vibrate([100, 50, 100]);
      juiceService.flashScreen();
    };

    const handleUpdate = () => loadData();

    // Check for random events on load
    const checkEvent = () => {
      const event = eventService.generateRandomEvent();
      if (event) {
        toast.info(`MISSÃO DE EMERGÊNCIA: ${event.title}!`, {
          description: event.description,
          icon: '⏳',
          duration: 5000
        });
        juiceService.play('achievement');
      }
    };
    checkEvent();

    window.addEventListener('levelup_data_update', handleUpdate);
    window.addEventListener('levelup_event', handleLevelUp);
    return () => {
      window.removeEventListener('levelup_data_update', handleUpdate);
      window.removeEventListener('levelup_event', handleLevelUp);
      clearInterval(debuffInterval);
    };
  }, []);

  const handleCompleteGoodHabit = async (habit) => {
    if (!character) return;

    const inventory = character?.inventory || [];
    const debuffs = character?.active_debuffs || [];
    const buffs = character?.active_buffs || [];

    const bonusExpMult = inventory.reduce((acc: number, item: any) => acc + (item.bonus_exp || 0), 0);
    const petExpBonus = petService.getPetBonus(character.active_pet, 'exp_boost');
    const expBuffMult = buffs.some((b: any) => b.type === 'exp_boost') ? 1.5 : 1.0;
    const expDebuffMult = debuffs.some((d: any) => d.type === 'tired') ? 0.5 : 1.0;
    const goldDebuffMult = debuffs.some((d: any) => d.type === 'weak') ? 0.8 : 1.0;
    const petGoldBonus = petService.getPetBonus(character.active_pet, 'gold_boost');

    let expGain = Math.floor((habit.exp_reward || 10) * (1 + bonusExpMult + petExpBonus) * expBuffMult * expDebuffMult);
    const goldGain = Math.floor((habit.gold_reward || 5) * (1 + petGoldBonus) * goldDebuffMult);
    const newStreak = (habit.streak || 0) + 1;

    // Quest Updates
    const habitCategory = habit.skill_category || habit.category;
    questService.updateProgress('habit_count', 1, habitCategory);
    questService.updateProgress('earn_gold', goldGain);

    await storage.addDailyCheck({
      habit_id: habit.id,
      habit_type: 'good',
      date: today,
      completed: true,
    });

    await storage.updateGoodHabit(habit.id, {
      streak: newStreak,
      best_streak: Math.max(newStreak, habit.best_streak || 0),
    });

    // --- FRAGMENT DROPS ---
    let extraFragments = 0;
    if (newStreak === 7) extraFragments = 1;
    if (newStreak === 14) extraFragments = 3;
    if (newStreak === 30) extraFragments = 10;

    if (extraFragments > 0) {
      const currentFragments = character.discipline_fragments || 0;
      await storage.updateCharacter({ discipline_fragments: currentFragments + extraFragments });
      toast.success(`FRAGMENTO DE DISCIPLINA OBTIDO! (+${extraFragments})`, { icon: '🔨' });
    }

    const updatedExp = (character.current_exp || 0) + expGain;
    const updatedTotalExp = (character.total_exp || 0) + expGain;
    const updatedGold = (character.gold || 0) + goldGain;

    await storage.updateCharacter({
      current_exp: updatedExp,
      total_exp: updatedTotalExp,
      gold: updatedGold,
      category: habitCategory,
      exp_gain: expGain,
    });

    await storage.addActivityLog({
      activity: `Completou: ${habit.name}`,
      type: 'habit_complete',
      exp_change: expGain,
      gold_change: goldGain,
    });

    // --- JUICE ---
    juiceService.play('success');
    juiceService.vibrate(50);

    // --- COMBO & PARTICLES ---
    setCombo(prev => prev + 1);
    const newParticle = { x: window.innerWidth / 2, y: window.innerHeight / 2, id: Date.now() };
    setParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);

    // --- BOSS DAMAGE LOGIC ---
    if (dailyBoss && dailyBoss.status === 'alive') {
      const bonusBossDamage = inventory.reduce((acc: number, item: any) =>
        item.name === 'Espada da Disciplina' ? acc + 0.2 : acc, 0
      );

      const damageBuffMult = buffs.some((b: any) => b.type === 'boss_damage') ? 1.3 : 1.0;
      const damageDebuffMult = debuffs.some((d: any) => d.type === 'confused') ? 0.7 : 1.0;

      const damage = Math.floor(expGain * 15 * (1 + bonusBossDamage) * damageBuffMult * damageDebuffMult);

      // FIX: Access stats.health instead of health directly
      const currentHealth = dailyBoss.stats?.health ?? 0;
      const newBossHealth = Math.max(currentHealth - damage, 0);
      const isDefeated = newBossHealth === 0;

      const bossUpdates: any = {
        stats: {
          ...dailyBoss.stats,
          health: newBossHealth
        }
      };
      if (isDefeated) {
        bossUpdates.status = 'defeated';

        // Quest Update for Boss Defeat
        questService.updateProgress('boss_damage', damage);

        // Award boss rewards
        const bossGold = dailyBoss.rewards?.gold || dailyBoss.base_gold_reward || 0;
        const bossExp = dailyBoss.rewards?.exp || dailyBoss.base_exp_reward || 0;

        await storage.updateCharacter({
          gold: (character.gold || 0) + goldGain + bossGold,
          total_exp: (character.total_exp || 0) + expGain + bossExp,
          current_exp: (character.current_exp || 0) + expGain + bossExp,
        });

        // Quest Update for Boss Gold
        questService.updateProgress('earn_gold', bossGold);

        await storage.addActivityLog({
          activity: `DERROTOU O BOSS: ${dailyBoss.name}!`,
          type: 'boss_defeat',
          gold_change: dailyBoss.base_gold_reward,
          exp_change: dailyBoss.base_exp_reward,
        });

        toast.success(`💥 VOCÊ DERROTOU ${dailyBoss.name.toUpperCase()}!`);
      } else {
        // Just damage update
        questService.updateProgress('boss_damage', damage);
      }

      await storage.updateDailyBoss(bossUpdates);
    }

    await loadData();
  };

  const handleBadHabitFail = async (habit) => {
    if (!character) return;

    const inventory = character?.inventory || [];
    const reductionMult = inventory.reduce((acc: number, item: any) => acc + (item.reduction_penalty || 0), 0);

    const healthPenalty = Math.floor((habit.health_penalty || 50) * (1 - reductionMult));
    const expPenalty = habit.exp_penalty || 20;

    setCombo(0); // Reset combo on fail

    await storage.addDailyCheck({
      habit_id: habit.id,
      habit_type: 'bad',
      date: today,
      completed: true,
    });

    await storage.updateBadHabit(habit.id, {
      days_clean: 0,
      total_falls: (habit.total_falls || 0) + 1,
      monthly_falls: (habit.monthly_falls || 0) + 1,
    });

    await storage.updateCharacter({
      health: Math.max((character.health || 1000) - healthPenalty, 0),
      current_exp: Math.max((character.current_exp || 0) - expPenalty, 0),
    });

    await storage.addActivityLog({
      activity: `Caiu em: ${habit.name}`,
      type: 'penalty',
      exp_change: -expPenalty,
      health_change: -healthPenalty,
    });

    // --- DEBUFF LOGIC ---
    if (Math.random() > 0.5) {
      const potentialDebuffs = [
        { type: 'tired', name: 'Cansaço', icon: '😫', description: 'Você se sente exausto.', duration_minutes: 60 },
        { type: 'confused', name: 'Confusão', icon: '🌀', description: 'Difícil se concentrar.', duration_minutes: 30 },
        { type: 'weak', name: 'Fraqueza', icon: '🤢', description: 'Menos força hoje.', duration_minutes: 45 },
      ];
      const debuff = potentialDebuffs[Math.floor(Math.random() * potentialDebuffs.length)];
      await storage.addDebuff({
        ...debuff,
        id: Date.now().toString(),
        start_time: new Date().toISOString()
      });
      toast.error(`STATUS: ${debuff.name.toUpperCase()}! ${debuff.description}`);
    }

    await loadData();
  };

  const handleUpdateObjectiveProgress = async (objective, newProgress) => {
    await storage.updateObjective(objective.id, { progress: newProgress });
    await loadData();
  };

  const handleCompleteObjective = async (objective) => {
    if (!character) return;
    const expGain = objective.exp_reward || 500;
    const goldGain = objective.gold_reward || 100;

    await storage.updateObjective(objective.id, { status: 'concluido', progress: 100 });

    // Quest Update
    questService.updateProgress('earn_gold', goldGain);

    const updatedExp = (character.current_exp || 0) + expGain;
    const updatedTotalExp = (character.total_exp || 0) + expGain;
    const updatedGold = (character.gold || 0) + goldGain;

    await storage.updateCharacter({
      current_exp: updatedExp,
      total_exp: updatedTotalExp,
      gold: updatedGold
    });

    await storage.addActivityLog({
      activity: `Objetivo concluído: ${objective.title}`,
      type: 'objective_progress',
      exp_change: expGain,
      gold_change: goldGain,
    });

    await loadData();
  };

  const isHabitCompletedToday = (habitId, type) => {
    return dailyChecks.some(
      (check) => check.habit_id === habitId && check.habit_type === type && check.completed
    );
  };

  const navItems = [
    { icon: Target, label: 'Bons Hábitos', page: 'GoodHabits', color: 'text-green-400' },
    { icon: Swords, label: 'Maus Hábitos', page: 'BadHabits', color: 'text-red-400' },
    { icon: BookOpen, label: 'Objetivos', page: 'Objectives', color: 'text-cyan-400' },
    { icon: TrendingUp, label: 'Insights', page: 'Dashboard', color: 'text-indigo-400' },
    { icon: Scroll, label: 'Habilidades', page: 'Skills', color: 'text-purple-400' },
    { icon: ShoppingBag, label: 'Mercado', page: 'Market', color: 'text-yellow-400' },
    { icon: Package, label: 'Inventário', page: 'Inventory', color: 'text-orange-400' },
    { icon: Hammer, label: 'Forja', page: 'Forge', color: 'text-cyan-500' },
    { icon: Swords, label: 'Boss Arena', page: 'BossArena', color: 'text-red-500' },
    { icon: Scroll, label: 'Missões', page: 'Quests', color: 'text-pink-400' },
    { icon: Activity, label: 'Atividade', page: 'ActivityLog', color: 'text-blue-400' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Hero Banner 2.0: Animated & Depth-based */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden flex items-center justify-center">
        {/* Background Layers */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_682b8b38ba3eb37fec6f9edb/dfc4f39d9_Design_sem_nome_5.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-[#020617]" />

        {/* Animated Glows */}
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"
        />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">SISTEMA</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                LEVEL UP
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm md:text-base font-medium uppercase tracking-[0.3em]">
              <div className="h-px w-8 bg-slate-800" />
              Seja bem-vindo, {character?.name || 'Caçador'}
              <div className="h-px w-8 bg-slate-800" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Grid: Glassmorphism Pass */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 -mt-20 relative z-20 px-4">
        {/* Left Column: Character & Pet */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <CharacterCard character={character} />

          {character?.active_pet ? (
            <PetCard pet={character.active_pet} />
          ) : (
            <motion.div
              whileHover={{ scale: 1.01, y: -2 }}
              className="group relative overflow-hidden rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 transition-all hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-slate-950 flex items-center justify-center text-4xl border border-slate-800 group-hover:border-cyan-500/50 transition-all duration-500 shadow-2xl rotate-3 group-hover:rotate-0">
                      🐾
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700 shadow-xl">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1">Companheiro de Jornada</h4>
                    <p className="text-sm text-slate-400 max-w-[240px] leading-relaxed">Libere o verdadeiro poder adotando um pet sagrado para sua evolução.</p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsPetOpen(true)}
                  className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-widest px-10 py-7 rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  Adotar Agora
                </Button>

                <AnimatePresence>
                  {isPetOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsPetOpen(false)}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col m-4"
                      >
                        <div className="relative p-0 overflow-y-auto custom-scrollbar flex-1 pb-8">
                          <Button
                            variant="ghost"
                            onClick={() => setIsPetOpen(false)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white z-50"
                          >
                            <Plus className="w-6 h-6 rotate-45" />
                          </Button>
                          <PetSelection onSelect={() => { loadData(); setIsPetOpen(false); }} />
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Boss */}
        <div className="lg:col-span-4">
          <div
            onClick={() => {
              if (dailyBoss?.reward_claimed) {
                toast.error("Arena selada! Você já coletou as recompensas de hoje.");
              } else {
                navigate(createPageUrl('BossArena'));
              }
            }}
            className="transform transition-all hover:scale-[1.02] cursor-pointer h-full active:scale-[0.98]"
          >
            <DailyBossCard boss={dailyBoss} isDefeated={dailyBoss?.status === 'defeated'} />
          </div>
        </div>
      </div>

      {/* Evolution Dashboard: Dynamic Sections */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Navigation Grid 2.0: Floating Glass Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3 relative z-30">
          {navItems.map((item, idx) => (
            <motion.div
              key={item.page}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-3 sm:p-4 rounded-2xl hover:border-cyan-500/30 transition-all min-h-[100px] sm:aspect-square text-center shadow-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {item.page === 'BossArena' ? (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    const boss = combatService.getDailyBoss();
                    if (boss.reward_claimed) {
                      toast.error("Você já coletou a recompensa de hoje! Volte amanhã.");
                    } else {
                      navigate(createPageUrl(item.page));
                    }
                  }}
                  variant="ghost"
                  className="w-full h-full flex flex-col items-center justify-center p-0 hover:bg-transparent"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:bg-slate-800 group-hover:border-slate-500/50 shadow-2xl relative",
                    item.page === 'BossArena' && dailyBoss?.reward_claimed && "opacity-50 grayscale"
                  )}>
                    <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 blur-xl transition-opacity" />
                    <item.icon className={cn("w-7 h-7", item.color)} />
                    {item.page === 'BossArena' && dailyBoss?.reward_claimed && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-slate-900">
                        <CheckCircle className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">{item.label}</span>
                  {item.page === 'BossArena' && dailyBoss?.reward_claimed && (
                    <span className="text-[8px] font-bold text-green-500/70 uppercase tracking-tighter mt-1">Concluído</span>
                  )}
                </Button>
              ) : (
                <Link to={createPageUrl(item.page)} className="w-full h-full flex flex-col items-center justify-center p-0">
                  <item.icon className={`w-7 h-7 mb-3 ${item.color} group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] transition-all`} />
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-black uppercase tracking-widest leading-tight">{item.label}</span>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quests Quick-Access Banner */}
        <div className="max-w-5xl mx-auto">
          <Link to="/quests">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative h-40 rounded-[2.5rem] bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 border border-indigo-500/20 overflow-hidden flex items-center px-12 gap-8 shadow-2xl"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
              <div className="hidden sm:flex p-5 rounded-3xl bg-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-indigo-400/20">
                <Scroll className="w-12 h-12 text-indigo-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mb-2 block">Available Missions</span>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Mural de Missões</h3>
                <p className="text-sm text-indigo-300 opacity-70">Complete desafios e conquiste recompensas lendárias</p>
              </div>
              <div className="hidden md:block">
                <Button variant="ghost" className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-black uppercase text-xs px-8 py-6 rounded-2xl gap-3">
                  Check In <Target className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Objectives & Habits Split Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Daily Evolution & Habits */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tighter">Evolução Diária</h2>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Rotinas de Elite</p>
                </div>
              </div>
              <Link to={createPageUrl('GoodHabits')}>
                <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300 font-black uppercase text-[10px] tracking-widest">
                  <Plus className="w-4 h-4 mr-1" /> Novo Hábito
                </Button>
              </Link>
            </div>

            <motion.div
              layout
              className="bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-slate-800/50 p-6 space-y-4"
            >
              <AnimatePresence>
                {goodHabits.length > 0 ? (
                  goodHabits.map((habit) => (
                    <GoodHabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={isHabitCompletedToday(habit.id, 'good')}
                      onComplete={handleCompleteGoodHabit}
                    />
                  ))
                ) : (
                  <p className="text-center text-slate-600 py-12 text-sm italic">O silêncio antes da tempestade... adicione um hábito.</p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Batalhas & Desafios */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Swords className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tighter">Batalhas de Ontem</h2>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Vença suas fraquezas</p>
                </div>
              </div>
              <Link to={createPageUrl('BadHabits')}>
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 font-black uppercase text-[10px] tracking-widest">
                  <Plus className="w-4 h-4 mr-1" /> Novo Desafio
                </Button>
              </Link>
            </div>

            <motion.div
              layout
              className="bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-slate-800/50 p-6 space-y-4"
            >
              <AnimatePresence>
                {badHabits.length > 0 ? (
                  badHabits.map((habit) => (
                    <BadHabitCard
                      key={habit.id}
                      habit={habit}
                      onFail={handleBadHabitFail}
                    />
                  ))
                ) : (
                  <p className="text-center text-slate-600 py-12 text-sm italic">Nenhum demônio à vista por enquanto.</p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Narrative Section 2.0: Epic Ancestral Gate */}
      {character && (
        <div className="max-w-5xl mx-auto px-4 mt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto mb-6" />
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.6em]">Registro de Memórias</h2>
          </motion.div>

          <div className="relative">
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLoreOpen(true)}
              className="group relative cursor-pointer overflow-hidden rounded-[4rem] bg-slate-950 border border-slate-800/80 p-1 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-[#020617] to-blue-500/10 opacity-60" />

              <div className="relative bg-[#020617] rounded-[3.8rem] p-12 flex flex-col items-center justify-center gap-10 border border-slate-800/50 overflow-hidden shadow-inner">
                {/* Inner Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

                <div className="relative">
                  <div className="w-28 h-28 rounded-3xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-cyan-500/40 transition-all duration-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] rotate-45 group-hover:rotate-0">
                    <Scroll className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] -rotate-45 group-hover:rotate-0 transition-transform duration-700" />
                  </div>
                  <div className="absolute -top-3 -right-3 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-cyan-500/50 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></span>
                  </div>
                </div>

                <div className="text-center max-w-2xl px-4">
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 decoration-cyan-500/30 decoration-4 underline-offset-8 group-hover:underline">Crônicas do Caçador</h3>
                  <div className="h-4 flex items-center justify-center gap-2 mb-4 opacity-50">
                    <div className="w-8 h-px bg-slate-800" />
                    <div className="w-1 h-1 bg-cyan-500 rounded-full" />
                    <div className="w-8 h-px bg-slate-800" />
                  </div>
                  <p className="text-lg text-slate-300 italic font-medium leading-relaxed font-serif">
                    "{loreService.getLatestUnlocked(character.level)?.content || "As estrelas observam o início do seu destino..."}"
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <Button variant="ghost" className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-black uppercase text-xs tracking-[0.2em] px-12 py-8 rounded-[2rem] border border-cyan-500/30 shadow-xl shadow-cyan-500/5 group-hover:shadow-cyan-500/20 transition-all">
                    Abrir Arquivo Sagrado
                  </Button>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">Unlock more at level {Math.floor((character.level / 10) + 1) * 10}</span>
                </div>
              </div>
            </motion.div>

            {/* Lore Dialog Content Control */}
            <AnimatePresence>
              {isLoreOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLoreOpen(false)}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-3xl bg-[#020617] border border-slate-800/80 rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20 pointer-events-none" />
                    <div className="relative p-8 md:p-12 overflow-y-auto custom-scrollbar flex-1">
                      <Button
                        variant="ghost"
                        onClick={() => setIsLoreOpen(false)}
                        className="absolute top-6 right-6 text-slate-500 hover:text-white"
                      >
                        <Plus className="w-6 h-6 rotate-45" />
                      </Button>

                      <div className="mb-10 space-y-4 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
                          <Scroll className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                          <h2 className="text-3xl text-white font-black tracking-tighter uppercase mb-2">Crônicas do Caçador</h2>
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-10 bg-slate-800" />
                            <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.3em]">Registro de Ascensão</p>
                            <div className="h-px w-10 bg-slate-800" />
                          </div>
                        </div>
                      </div>
                      <LoreChronicles chapters={loreService.getChapters(character.level)} />
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Footer Settings Area */}
      <div className="relative bg-slate-950/20 pt-20 pb-20 border-t border-slate-900/50 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
        <Link to={createPageUrl('CharacterSettings')}>
          <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
            <Button variant="outline" className="border-slate-800/80 text-slate-500 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all rounded-full px-10 py-7 text-xs font-black uppercase tracking-widest gap-2 bg-[#020617]/40 shadow-xl">
              <Settings className="w-5 h-5" />
              Santuário de Configurações
            </Button>
          </motion.div>
        </Link>
        <p className="mt-8 text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Level Up System • Hunter Chronicles V2.1</p>
      </div>
    </div>
  );
}