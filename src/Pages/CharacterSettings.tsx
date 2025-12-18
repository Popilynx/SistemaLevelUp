import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Target, Zap, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from '@/components/storage/LocalStorage';
import { toast } from "sonner";
import { Character } from '@/types';

export default function CharacterSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    main_objective: '',
    strengths: '',
    weaknesses: '',
    max_health: 1000,
  });

  useEffect(() => {
    loadCharacter();
  }, []);

  const loadCharacter = async () => {
    try {
      const char = await storage.getCharacter();
      if (char) {
        setCharacter(char);
        setFormData({
          name: char.name || '',
          main_objective: char.main_objective || '',
          strengths: char.strengths || '',
          weaknesses: char.weaknesses || '',
          max_health: char.max_health || 1000,
        });
      }
    } catch (error) {
      console.error('Error loading character:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (character) {
        await storage.updateCharacter(formData);
      } else {
        const newCharacter: Character = {
          id: Date.now().toString(),
          name: formData.name,
          level: 1,
          current_exp: 0,
          total_exp: 0,
          gold: 0,
          health: 1000,
          max_health: formData.max_health,
          profile_image: '',
          main_objective: formData.main_objective,
          strengths: formData.strengths,
          weaknesses: formData.weaknesses,
          hit_points: 1000,
          created_date: new Date().toISOString(),
        };
        await storage.createCharacter(newCharacter);
      }

      toast.success(character ? 'Personagem atualizado!' : 'Personagem criado!');
      await loadCharacter();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao salvar personagem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Configurações do Personagem</h1>
            <p className="text-slate-400 text-sm">Personalize seu avatar e atributos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Avatar e Identidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nome do Personagem</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome de guerreiro"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Objectives Section */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Objetivo Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Qual é o seu propósito?</Label>
                <Textarea
                  value={formData.main_objective}
                  onChange={(e) => setFormData({ ...formData, main_objective: e.target.value })}
                  placeholder="Ex: Ser uma pessoa melhor a cada dia"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Atributos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  Pontos Fortes
                </Label>
                <Input
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  placeholder="Ex: Aprender rápido, foco"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  Fraquezas
                </Label>
                <Input
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                  placeholder="Ex: Emocional, procrastinação"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Vida Máxima</Label>
                <Input
                  type="number"
                  value={formData.max_health}
                  onChange={(e) => setFormData({ ...formData, max_health: parseInt(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Display (if character exists) */}
          {character && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Estatísticas Atuais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-cyan-400">{character.level || 1}</p>
                    <p className="text-xs text-slate-400">Nível</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">{character.total_exp || 0}</p>
                    <p className="text-xs text-slate-400">EXP Total</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{character.gold || 0}</p>
                    <p className="text-xs text-slate-400">Moedas</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">{character.health || 0}</p>
                    <p className="text-xs text-slate-400">Vida</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white py-6"
          >
            <Save className="w-5 h-5 mr-2" />
            {character ? 'Salvar Alterações' : 'Criar Personagem'}
          </Button>
        </form>
      </div>
    </div>
  );
}