import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BadHabitCard from '@/components/habits/BadHabitCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { storage } from '@/components/storage/LocalStorage';
import { format } from 'date-fns';
import { Character, BadHabit } from '@/types';



export default function BadHabits() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [badHabits, setBadHabits] = useState<BadHabit[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState({
    name: '',
    icon: '🚫',
    health_penalty: 50,
    exp_penalty: 20,
    color: 'red',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [habits, char] = await Promise.all([
      storage.getBadHabits(),
      storage.getCharacter(),
    ]);
    setBadHabits(habits);
    setCharacter(char);
    setLoading(false);
  };

  const handleBadHabitFail = async (habit: BadHabit) => {
    if (!character) return;

    // Difficulty Multiplier
    const difficulty = character.difficulty || 1;
    const penaltyMultiplier = 1 + ((difficulty - 1) * 0.5); // +50% penalty per difficulty level

    const healthPenalty = Math.floor((habit.health_penalty || 50) * penaltyMultiplier);
    const expPenalty = Math.floor((habit.exp_penalty || 20) * penaltyMultiplier);

    // Check if dead
    const newHealth = (character.health || 1000) - healthPenalty;

    if (newHealth <= 0) {
      // GAME OVER
      await storage.resetGame();
      alert(`☠️ GAME OVER ☠️\n\nSua vida chegou a zero.\nO jogo foi reiniciado com Dificuldade ${difficulty + 1}.\nPenalidades aumentadas em 50%.`);
      await loadData();
      return;
    }

    await storage.updateBadHabit(habit.id, {
      days_clean: 0,
      total_falls: (habit.total_falls || 0) + 1,
      monthly_falls: (habit.monthly_falls || 0) + 1,
    });

    await storage.updateCharacter({
      health: Math.max(newHealth, 0),
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

  const handleCreateHabit = async () => {
    if (!newHabit.name) return;
    await storage.addBadHabit(newHabit);
    setNewHabit({ name: '', icon: '🚫', health_penalty: 50, exp_penalty: 20, color: 'red' });
    setIsDialogOpen(false);
    await loadData();
  };

  const handleDeleteHabit = async (habitId: string) => {
    await storage.deleteBadHabit(habitId);
    await loadData();
  };

  const emojiOptions = ['🚫', '🍺', '🚬', '📱', '🍔', '☕', '🎰', '💊', '😤', '🛋️'];

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
              <h1 className="text-2xl font-bold text-white">Maus Hábitos</h1>
              <p className="text-slate-400 text-sm">Batalhas que você precisa vencer</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400">
                <Plus className="w-4 h-4 mr-2" /> Nova Batalha
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Mau Hábito</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome do Hábito</Label>
                  <Input
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    placeholder="Ex: Beber álcool"
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
                          ? 'bg-red-500/30 border-2 border-red-500'
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
                    <Label className="text-slate-300">Penalidade de Vida</Label>
                    <Input
                      type="number"
                      value={newHabit.health_penalty}
                      onChange={(e) => setNewHabit({ ...newHabit, health_penalty: parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Penalidade de EXP</Label>
                    <Input
                      type="number"
                      value={newHabit.exp_penalty}
                      onChange={(e) => setNewHabit({ ...newHabit, exp_penalty: parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Cor</Label>
                  <Select
                    value={newHabit.color}
                    onChange={(e) => setNewHabit({ ...newHabit, color: e.target.value })}
                  >
                    <SelectItem value="red">🔴 Vermelho</SelectItem>
                    <SelectItem value="blue">🔵 Azul</SelectItem>
                    <SelectItem value="gray">⚫ Cinza</SelectItem>
                    <SelectItem value="purple">🟣 Roxo</SelectItem>
                    <SelectItem value="orange">🟠 Laranja</SelectItem>
                  </Select>
                </div>

                <Button
                  onClick={handleCreateHabit}
                  disabled={!newHabit.name}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500"
                >
                  Adicionar Batalha
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bad Habits List */}
        <div className="space-y-3">
          <AnimatePresence>
            {badHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <BadHabitCard habit={habit} onFail={handleBadHabitFail} />
                <Button
                  onClick={() => handleDeleteHabit(habit.id)}
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {badHabits.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700"
            >
              <p className="text-slate-400 mb-4">Nenhuma batalha cadastrada ainda</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-red-500 to-rose-500"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar Primeira Batalha
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}