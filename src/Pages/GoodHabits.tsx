import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GoodHabitCard from '@/components/habits/GoodHabitCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { storage } from '@/components/storage/LocalStorage';
import { format } from 'date-fns';

interface GoodHabit {
  id: string;
  name: string;
  icon: string;
  exp_reward: number;
  gold_reward: number;
  skill_category: string;
  is_daily: boolean;
  streak: number;
  best_streak: number;
  created_date: string;
}

interface Character {
  id: string;
  name: string;
  current_exp: number;
  total_exp: number;
  level: number;
  gold: number;
}

export default function GoodHabits() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goodHabits, setGoodHabits] = useState<GoodHabit[]>([]);
  const [dailyChecks, setDailyChecks] = useState<any[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState({
    name: '',
    icon: '⭐',
    exp_reward: 10,
    gold_reward: 5,
    skill_category: 'saude',
    is_daily: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [habits, checks, char] = await Promise.all([
      storage.getGoodHabits(),
      storage.getDailyChecks(today),
      storage.getCharacter(),
    ]);
    setGoodHabits(habits);
    setDailyChecks(checks || []);
    setCharacter(char);
    setLoading(false);
  };


  const handleCompleteHabit = async (habit: GoodHabit) => {
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

  const isHabitCompletedToday = (habitId: string): boolean => {
    return dailyChecks.some((check) => check.habit_id === habitId && check.habit_type === 'good' && check.completed);
  };

  const handleCreateHabit = async () => {
    if (!newHabit.name) return;
    await storage.addGoodHabit(newHabit);
    setNewHabit({ name: '', icon: '⭐', exp_reward: 10, gold_reward: 5, skill_category: 'saude', is_daily: true });
    setIsDialogOpen(false);
    await loadData();
  };

  const handleDeleteHabit = async (habitId: string) => {
    await storage.deleteGoodHabit(habitId);
    await loadData();
  };

  const emojiOptions = ['⭐', '🌅', '📝', '💪', '📚', '💰', '🧘', '🎯', '🚀', '💧', '🥗', '😴'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Bons Hábitos</h1>
              <p className="text-slate-400 text-sm">Construa sua evolução diária</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400">
                <Plus className="w-4 h-4 mr-2" /> Novo Hábito
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Novo Hábito</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome do Hábito</Label>
                  <Input
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    placeholder="Ex: Acordar às 5h"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Ícone</Label>
                  <div className="flex flex-wrap gap-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewHabit({ ...newHabit, icon: emoji })}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${newHabit.icon === emoji
                          ? 'bg-cyan-500/30 border-2 border-cyan-500'
                          : 'bg-slate-800 border border-slate-700 hover:border-slate-500'
                          }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">EXP Ganho</Label>
                    <Input
                      type="number"
                      value={newHabit.exp_reward}
                      onChange={(e) => setNewHabit({ ...newHabit, exp_reward: parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Moedas Ganhas</Label>
                    <Input
                      type="number"
                      value={newHabit.gold_reward}
                      onChange={(e) => setNewHabit({ ...newHabit, gold_reward: parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Categoria de Habilidade</Label>
                  <Select
                    value={newHabit.skill_category}
                    onChange={(e) => setNewHabit({ ...newHabit, skill_category: e.target.value })}
                  >
                    <SelectItem value="estudo">💻 Estudo</SelectItem>
                    <SelectItem value="leitura">📖 Leitura</SelectItem>
                    <SelectItem value="saude">💪 Saúde</SelectItem>
                    <SelectItem value="lazer">🎮 Lazer</SelectItem>
                    <SelectItem value="musculacao">🏋️ Musculação</SelectItem>
                    <SelectItem value="financas">💰 Finanças</SelectItem>
                  </Select>
                </div>

                <Button
                  onClick={handleCreateHabit}
                  disabled={!newHabit.name}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  Criar Hábito
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          <AnimatePresence>
            {goodHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <GoodHabitCard
                  habit={habit}
                  isCompleted={isHabitCompletedToday(habit.id)}
                  onComplete={handleCompleteHabit}
                />
                <Button
                  onClick={() => handleDeleteHabit(habit.id)}
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-14 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {goodHabits.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700"
            >
              <p className="text-slate-400 mb-4">Nenhum hábito cadastrado ainda</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Hábito
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}