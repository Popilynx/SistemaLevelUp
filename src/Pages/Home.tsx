import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Swords, BookOpen, Scroll, Settings, ShoppingBag, Activity, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { storage } from '@/components/storage/LocalStorage';
import CharacterCard from '@/components/character/CharacterCard';
import DailyBossCard from '@/components/character/DailyBossCard';
import { ComboCounter, ParticleExplosion } from '@/components/ui/VisualJuice';
import GoodHabitCard from '@/components/habits/GoodHabitCard';
import BadHabitCard from '@/components/habits/BadHabitCard';
import ObjectiveCard from '@/components/objectives/ObjectiveCard';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { toast } from 'sonner';

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

  const loadData = async () => {
    const [char, gHabits, bHabits, obj, checks, boss] = await Promise.all([
      storage.getCharacter(),
      storage.getGoodHabits(),
      storage.getBadHabits(),
      storage.getObjectives(),
      storage.getDailyChecks(today),
      storage.getDailyBoss(),
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

    // Listen for storage updates (e.g. from DailySystem penalties)
    const handleUpdate = () => loadData();
    window.addEventListener('levelup_data_update', handleUpdate);
    return () => {
      window.removeEventListener('levelup_data_update', handleUpdate);
      clearInterval(debuffInterval);
    };
  }, []);

  const handleCompleteGoodHabit = async (habit) => {
    if (!character) return;

    const inventory = character?.inventory || [];
    const debuffs = character?.active_debuffs || [];
    const buffs = character?.active_buffs || [];

    const bonusExpMult = inventory.reduce((acc: number, item: any) => acc + (item.bonus_exp || 0), 0);
    const expBuffMult = buffs.some((b: any) => b.type === 'exp_boost') ? 1.5 : 1.0;
    const expDebuffMult = debuffs.some((d: any) => d.type === 'tired') ? 0.5 : 1.0;
    const goldDebuffMult = debuffs.some((d: any) => d.type === 'weak') ? 0.8 : 1.0;

    let expGain = Math.floor((habit.exp_reward || 10) * (1 + bonusExpMult) * expBuffMult * expDebuffMult);
    const goldGain = Math.floor((habit.gold_reward || 5) * goldDebuffMult);
    const newStreak = (habit.streak || 0) + 1;

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

    const newExp = (character.current_exp || 0) + expGain;
    const expForNextLevel = (character.level || 1) * 500;
    let newLevel = character.level || 1;
    let remainingExp = newExp;

    if (newExp >= expForNextLevel) {
      newLevel += 1;
      remainingExp = newExp - expForNextLevel;
    }

    await storage.updateCharacter({
      current_exp: remainingExp,
      total_exp: (character.total_exp || 0) + expGain,
      gold: (character.gold || 0) + goldGain,
      level: newLevel,
    });

    await storage.addActivityLog({
      activity: `Completou: ${habit.name}`,
      type: 'habit_complete',
      exp_change: expGain,
      gold_change: goldGain,
    });

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
      const newBossHealth = Math.max(dailyBoss.health - damage, 0);
      const isDefeated = newBossHealth === 0;

      const bossUpdates: any = { health: newBossHealth };
      if (isDefeated) {
        bossUpdates.status = 'defeated';
        // Award boss rewards
        await storage.updateCharacter({
          gold: (character.gold || 0) + goldGain + dailyBoss.base_gold_reward,
          total_exp: (character.total_exp || 0) + expGain + dailyBoss.base_exp_reward,
          current_exp: remainingExp + dailyBoss.base_exp_reward, // Note: Simplified level up here
        });

        await storage.addActivityLog({
          activity: `DERROTOU O BOSS: ${dailyBoss.name}!`,
          type: 'boss_defeat',
          gold_change: dailyBoss.base_gold_reward,
          exp_change: dailyBoss.base_exp_reward,
        });

        toast.success(`💥 VOCÊ DERROTOU ${dailyBoss.name.toUpperCase()}!`);
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

    await storage.updateCharacter({
      current_exp: (character.current_exp || 0) + expGain,
      gold: (character.gold || 0) + goldGain,
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
    { icon: Scroll, label: 'Habilidades', page: 'Skills', color: 'text-purple-400' },
    { icon: ShoppingBag, label: 'Mercado', page: 'Market', color: 'text-yellow-400' },
    { icon: Package, label: 'Inventário', page: 'Inventory', color: 'text-orange-400' },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_682b8b38ba3eb37fec6f9edb/dfc4f39d9_Design_sem_nome_5.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/80 to-slate-950" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-2">
              <span className="text-slate-300">SISTEMA</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                LEVEL UP
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              Seja bem-vindo, {character?.name || 'Caçador'}
            </p>
          </motion.div>

          {/* Character and Boss Section */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CharacterCard character={character} />
            <DailyBossCard boss={dailyBoss} isDefeated={dailyBoss?.status === 'defeated'} />
          </div>
        </div>
      </div>

      <ComboCounter combo={combo} />
      {particles.map(p => (
        <ParticleExplosion key={p.id} x={p.x} y={p.y} />
      ))}

      {/* Navigation Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {navItems.map((item) => (
            <Link key={item.page} to={createPageUrl(item.page)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 text-center hover:border-cyan-500/30 transition-all"
              >
                <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                <span className="text-xs text-slate-300">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Objectives Section */}
        {objectives.filter(o => o.status === 'ativo').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                </div>
                <h2 className="font-bold text-white">Objetivos Ativos</h2>
              </div>
              <Link to={createPageUrl('Objectives')}>
                <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                  Ver Todos
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectives
                .filter(o => o.status === 'ativo')
                .slice(0, 2)
                .map((objective) => (
                  <ObjectiveCard
                    key={objective.id}
                    objective={objective}
                    onUpdateProgress={handleUpdateObjectiveProgress}
                    onComplete={handleCompleteObjective}
                  />
                ))}
            </div>
          </motion.div>
        )}

        {/* Daily Evolution Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Good Habits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-400" />
                </div>
                <h2 className="font-bold text-white">Evolução Diária</h2>
              </div>
              <Link to={createPageUrl('GoodHabits')}>
                <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {goodHabits.map((habit) => (
                  <GoodHabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={isHabitCompletedToday(habit.id, 'good')}
                    onComplete={handleCompleteGoodHabit}
                  />
                ))}
              </AnimatePresence>
              {goodHabits.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  Nenhum hábito cadastrado ainda
                </p>
              )}
            </div>
          </motion.div>

          {/* Bad Habits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Swords className="w-4 h-4 text-red-400" />
                </div>
                <h2 className="font-bold text-white">Batalhas</h2>
              </div>
              <Link to={createPageUrl('BadHabits')}>
                <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {badHabits.map((habit) => (
                  <BadHabitCard
                    key={habit.id}
                    habit={habit}
                    onFail={handleBadHabitFail}
                  />
                ))}
              </AnimatePresence>
              {badHabits.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  Nenhuma batalha cadastrada ainda
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Settings Link */}
        <div className="mt-8 text-center">
          <Link to={createPageUrl('CharacterSettings')}>
            <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white hover:border-cyan-500">
              <Settings className="w-4 h-4 mr-2" />
              Configurações do Personagem
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}