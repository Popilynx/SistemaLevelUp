import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SkillCard from '@/components/skills/SkillCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { storage } from '@/components/storage/LocalStorage';
import { Skill, Objective } from '@/types';

export default function Skills() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'estudo',
    linked_objective: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const skillsData = await storage.getSkills();
      const objectivesData = await storage.getObjectives();
      setSkills(skillsData);
      setObjectives(objectivesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateSkill = async () => {
    try {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name,
        category: newSkill.category as any,
        current_exp: 0,
        level: 1,
      };
      await storage.createSkill(skill);
      await loadData();
      setIsDialogOpen(false);
      setNewSkill({ name: '', category: 'estudo', linked_objective: '' });
    } catch (error) {
      console.error('Error creating skill:', error);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await storage.deleteSkill(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const categoryLabels = {
    estudo: '💻 Estudo ERP e Programação',
    leitura: '📖 Leitura',
    saude: '💪 Saúde',
    lazer: '🎮 Lazer',
    musculacao: '🏋️ Musculação',
    financas: '💰 Finanças',
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc: Record<string, Skill[]>, skill: Skill) => {
    const cat = skill.category || 'estudo';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Habilidades</h1>
              <p className="text-slate-400 text-sm">Evolua suas competências</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400">
                <Plus className="w-4 h-4 mr-2" /> Nova Habilidade
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Nova Habilidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome da Habilidade</Label>
                  <Input
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="Ex: Estudo ERP e Programação"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Categoria</Label>
                  <Select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  >
                    <SelectItem value="estudo">💻 Estudo</SelectItem>
                    <SelectItem value="leitura">📖 Leitura</SelectItem>
                    <SelectItem value="saude">💪 Saúde</SelectItem>
                    <SelectItem value="lazer">🎮 Lazer</SelectItem>
                    <SelectItem value="musculacao">🏋️ Musculação</SelectItem>
                    <SelectItem value="financas">💰 Finanças</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Objetivo Vinculado (opcional)</Label>
                  <Select
                    value={newSkill.linked_objective}
                    onChange={(e) => setNewSkill({ ...newSkill, linked_objective: e.target.value })}
                  >
                    <SelectItem value="">Nenhum</SelectItem>
                    {objectives.map((obj) => (
                      <SelectItem key={obj.id} value={obj.title}>{obj.title}</SelectItem>
                    ))}
                  </Select>
                </div>

                <Button
                  onClick={handleCreateSkill}
                  disabled={!newSkill.name}
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-500"
                >
                  Criar Habilidade
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Skills Grid */}
        {Object.entries(categoryLabels).map(([category, label]) => {
          const categorySkills = skillsByCategory[category] || [];
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-semibold text-slate-300 mb-4">{label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {categorySkills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <SkillCard skill={skill} />
                      <Button
                        onClick={() => handleDeleteSkill(skill.id)}
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
          );
        })}

        {skills.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700"
          >
            <p className="text-slate-400 mb-4">Nenhuma habilidade cadastrada ainda</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-violet-500"
            >
              <Plus className="w-4 h-4 mr-2" /> Criar Primeira Habilidade
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}