import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Swords, BookOpen, Scroll, Settings, ShoppingBag, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { storage } from '@/components/storage/LocalStorage';
import CharacterCard from '@/components/character/CharacterCard';
import GoodHabitCard from '@/components/habits/GoodHabitCard';
import BadHabitCard from '@/components/habits/BadHabitCard';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export default function Home() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [character, setCharacter] = useState(null);
  const [goodHabits, setGoodHabits] = useState([]);
  const [badHabits, setBadHabits] = useState([]);
  const [dailyChecks, setDailyChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [char, gHabits, bHabits, checks] = await Promise.all([
      storage.getCharacter(),
      storage.getGoodHabits(),
      storage.getBadHabits(),
      storage.getDailyChecks(today),
    ]);
    setCharacter(char);
    setGoodHabits(gHabits);
    setBadHabits(bHabits);
    setDailyChecks(checks);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteGoodHabit = async (habit) => {
    if (!character) return;

    const expGain = habit.exp_reward || 10;
    const goldGain = habit.gold_reward || 5;
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

    await loadData();
  };

  const handleBadHabitFail = async (habit) => {
    if (!character) return;

    const healthPenalty = habit.health_penalty || 50;
    const expPenalty = habit.exp_penalty || 20;

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

          {/* Character Card */}
          <div className="max-w-lg mx-auto">
            <CharacterCard character={character} />
          </div>
        </div>
      </div>

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

        {/* Daily Evolution Section */}
        <div className="grid md:grid-cols-2 gap-6">
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
                {goodHabits.slice(0, 5).map((habit) => (
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
                {badHabits.slice(0, 5).map((habit) => (
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