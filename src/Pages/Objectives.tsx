import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ObjectiveCard from '@/components/objectives/ObjectiveCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { storage } from '@/components/storage/LocalStorage';
import { Character, Objective } from '@/types';

export default function Objectives() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    is_main: false,
    exp_reward: 500,
    gold_reward: 100,
    due_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const objectivesData = await storage.getObjectives();
      const characterData = await storage.getCharacter();
      setObjectives(objectivesData);
      setCharacter(characterData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateObjective = async () => {
    try {
      const objective: Objective = {
        id: Date.now().toString(),
        title: newObjective.title,
        description: newObjective.description,
        is_main: newObjective.is_main,
        progress: 0,
        status: 'ativo',
        exp_reward: newObjective.exp_reward,
        gold_reward: newObjective.gold_reward,
      };
      await storage.createObjective(objective);
      await loadData();
      setIsDialogOpen(false);
      setNewObjective({ title: '', description: '', is_main: false, exp_reward: 500, gold_reward: 100, due_date: '' });
    } catch (error) {
      console.error('Error creating objective:', error);
    }
  };

  const handleUpdateProgress = async (objective: Objective, newProgress: number) => {
    try {
      await storage.updateObjective(objective.id, { progress: newProgress });
      await storage.addActivityLog({
        activity: `Progresso em: ${objective.title} (${newProgress}%)`,
        type: 'objective_progress',
        exp_change: 0,
        gold_change: 0,
      });
      await loadData();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleCompleteObjective = async (objective: Objective) => {
    if (!character) return;

    try {
      const expGain = objective.exp_reward || 500;
      const goldGain = objective.gold_reward || 100;

      await storage.updateObjective(objective.id, { status: 'concluido', progress: 100 });

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
        activity: `Objetivo concluído: ${objective.title}`,
        type: 'objective_progress',
        exp_change: expGain,
        gold_change: goldGain,
      });

      await loadData();
    } catch (error) {
      console.error('Error completing objective:', error);
    }
  };

  const handleDeleteObjective = async (id: string) => {
    try {
      await storage.deleteObjective(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  const mainObjectives = objectives.filter((o: Objective) => o.is_main);
  const secondaryObjectives = objectives.filter((o: Objective) => !o.is_main);

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
              <h1 className="text-2xl font-bold text-white">Objetivos</h1>
              <p className="text-slate-400 text-sm">Defina suas metas e conquiste-as</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400">
                <Plus className="w-4 h-4 mr-2" /> Novo Objetivo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Novo Objetivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Título</Label>
                  <Input
                    value={newObjective.title}
                    onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                    placeholder="Ex: Entrar em forma"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Descrição</Label>
                  <Textarea
                    value={newObjective.description}
                    onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                    placeholder="Descreva seu objetivo..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Objetivo Principal</Label>
                  <Switch
                    checked={newObjective.is_main}
                    onCheckedChange={(checked) => setNewObjective({ ...newObjective, is_main: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Data Limite</Label>
                  <Input
                    type="date"
                    value={newObjective.due_date}
                    onChange={(e) => setNewObjective({ ...newObjective, due_date: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">EXP Recompensa</Label>
                    <Input
                      type="number"
                      value={newObjective.exp_reward}
                      onChange={(e) => setNewObjective({ ...newObjective, exp_reward: parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Moedas Recompensa</Label>
                    <Input
                      type="number"
                      value={newObjective.gold_reward}
                      onChange={(e) => setNewObjective({ ...newObjective, gold_reward: parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateObjective}
                  disabled={!newObjective.title}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  Criar Objetivo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Objectives */}
        {mainObjectives.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Objetivos Principais</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {mainObjectives.map((objective, index) => (
                  <motion.div
                    key={objective.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <ObjectiveCard
                      objective={objective}
                      onUpdateProgress={handleUpdateProgress}
                      onComplete={handleCompleteObjective}
                    />
                    <Button
                      onClick={() => handleDeleteObjective(objective.id)}
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Secondary Objectives */}
        <div>
          <h2 className="text-lg font-semibold text-slate-400 mb-4">Objetivos Secundários</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {secondaryObjectives.map((objective, index) => (
                <motion.div
                  key={objective.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <ObjectiveCard
                    objective={objective}
                    onUpdateProgress={handleUpdateProgress}
                    onComplete={handleCompleteObjective}
                  />
                  <Button
                    onClick={() => handleDeleteObjective(objective.id)}
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            {objectives.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700"
              >
                <p className="text-slate-400 mb-4">Nenhum objetivo cadastrado ainda</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Objetivo
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}