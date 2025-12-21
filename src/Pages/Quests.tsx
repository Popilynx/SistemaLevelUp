import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Scroll, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { questService, Quest } from '@/services/questService';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function Quests() {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        // Ensure dailies exist
        questService.generateDailyQuests();
        const data = questService.getQuests();
        setQuests(data);
        setLoading(false);
    };

    const handleClaim = async (questId: string) => {
        const rewards = await questService.claimReward(questId);
        if (rewards) {
            toast.success(`Quest Completada: +${rewards.gold} Ouro, +${rewards.exp} XP!`);
            loadData();
        }
    };

    if (loading) return <div className="p-8 text-white">Carregando Missões...</div>;

    const activeQuests = quests.filter(q => q.status !== 'claimed');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Scroll className="w-6 h-6 text-yellow-500" />
                                Mural de Missões
                            </h1>
                            <p className="text-slate-400 text-sm">Complete tarefas para ganhar recompensas extras.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {activeQuests.length === 0 && (
                            <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <p className="text-slate-400">Nenhuma missão ativa no momento.</p>
                            </div>
                        )}
                        {activeQuests.map((quest) => {
                            const progress = Math.min(100, (quest.requirements.current_value / quest.requirements.target_value) * 100);
                            const isCompleted = quest.status === 'completed';

                            return (
                                <motion.div
                                    key={quest.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative p-5 rounded-2xl border transition-all ${isCompleted
                                            ? 'bg-green-950/30 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                                            : 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded">
                                                    {quest.type === 'daily' ? 'Diária' : 'Semanal'}
                                                </span>
                                                <h3 className="font-bold text-white">{quest.title}</h3>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-3">{quest.description}</p>

                                            {/* Progress Bar */}
                                            <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
                                                <div
                                                    className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-cyan-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {quest.requirements.current_value} / {quest.requirements.target_value}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <div className="text-yellow-400 font-bold text-sm">+{quest.rewards.gold} Gold</div>
                                                <div className="text-purple-400 font-bold text-sm">+{quest.rewards.exp} XP</div>
                                            </div>

                                            {isCompleted ? (
                                                <Button
                                                    onClick={() => handleClaim(quest.id)}
                                                    className="bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 animate-pulse"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    RESGATAR
                                                </Button>
                                            ) : (
                                                <div className="bg-slate-800 px-4 py-2 rounded-lg text-slate-400 text-sm flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    Em andamento
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
