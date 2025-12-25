import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Target, Flame, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { storage } from '@/components/storage/LocalStorage';
import { Button } from "@/components/ui/button";
import RadarChart from '@/components/ui/RadarChart';

export default function Dashboard() {
    const [character, setCharacter] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [habits, setHabits] = useState<any[]>([]);
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [char, logs, gHabits, skillsData] = await Promise.all([
                storage.getCharacter(),
                storage.getActivityLogs(),
                storage.getGoodHabits(),
                storage.getSkills(),
            ]);
            setCharacter(char);
            setActivities(logs);
            setHabits(gHabits);
            setSkills(skillsData);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">Analizando dados da jornada...</div>;

    // Prepare Radar Data from Skills instead of category_xp
    const categoryLabels: Record<string, string> = {
        estudo: '💻 Estudo',
        leitura: '📖 Leitura',
        saude: '💪 Saúde',
        lazer: '🎮 Lazer',
        musculacao: '🏋️ Musculação',
        financas: '💰 Finanças',
    };

    const radarData = Object.keys(categoryLabels).map(cat => {
        const categorySkills = skills.filter(s => s.category === cat);
        const avgLevel = categorySkills.length > 0
            ? categorySkills.reduce((sum, s) => sum + (s.level || 1), 0) / categorySkills.length
            : 0;

        return {
            label: categoryLabels[cat].split(' ').pop() || cat,
            value: avgLevel,
            max: 5
        };
    });

    // Calculate Stats
    const totalExp = character?.total_exp || 0;
    const totalGold = character?.gold || 0;
    const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);
    const completedTasks = activities.filter(a => a.type === 'habit_complete').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Dashboard de Insights</h1>
                            <p className="text-slate-400 text-sm">A análise visual do seu crescimento</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Radar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 bg-slate-900/50 rounded-3xl border border-slate-700/50 p-8 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                        <div className="absolute top-6 left-6 flex items-center gap-2 text-cyan-400">
                            <Target className="w-5 h-5" />
                            <h2 className="font-bold uppercase tracking-widest text-sm">Domínio de Habilidades</h2>
                        </div>
                        <RadarChart data={radarData} size={400} />
                    </motion.div>

                    {/* Right Column: Key Metrics */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6"
                        >
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Métricas Globais</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-white">{totalExp}</p>
                                    <p className="text-[10px] text-purple-400 uppercase font-bold flex items-center gap-1">
                                        <Award className="w-3 h-3" /> XP Total
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-white">{totalGold}</p>
                                    <p className="text-[10px] text-yellow-400 uppercase font-bold flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> Ouro Acumulado
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-white border-t border-slate-800 pt-3">{bestStreak}</p>
                                    <p className="text-[10px] text-orange-400 uppercase font-bold flex items-center gap-1">
                                        <Flame className="w-3 h-3" /> Maior Streak
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-white border-t border-slate-800 pt-3">{completedTasks}</p>
                                    <p className="text-[10px] text-green-400 uppercase font-bold flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Tarefas Feitas
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 rounded-2xl border border-indigo-500/30 p-6 relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-white mb-1">Status de Rank</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-3xl">{character?.rank?.split(' ')[0] || '🟤'}</span>
                                    <div>
                                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                                            {character?.rank?.split(' ')[1] || 'Bronze'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Próximo Rank em LV {(Math.floor((character?.level || 0) / 10) + 1) * 10}</p>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-900/60 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((character?.level % 10) || 1) * 10}%` }}
                                        className="h-full bg-cyan-500"
                                    />
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 text-white/5 group-hover:text-white/10 transition-colors">
                                < Award size={140} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
