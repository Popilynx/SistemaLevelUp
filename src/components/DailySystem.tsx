import { useState, useEffect } from 'react';
import { differenceInSeconds, format, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { storage } from '@/components/storage/LocalStorage';
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from 'lucide-react';

export default function DailySystem() {
    const [timeLeft, setTimeLeft] = useState('');
    const [isPunishmentOpen, setIsPunishmentOpen] = useState(false);
    const [punishmentData, setPunishmentData] = useState<any>(null);
    const [lastNotifiedHour, setLastNotifiedHour] = useState<number | null>(null);

    useEffect(() => {
        // 1. Initial Punishment Check
        checkPunishments();

        // 2. Request Notification Permission (Moved to settings for iOS compatibility)
        // if ('Notification' in window) {
        //     Notification.requestPermission();
        // }

        // 3. Timer Interval
        const interval = setInterval(() => {
            updateTimer();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const checkPunishments = async () => {
        try {
            const result = await storage.processMissedHabits();
            if (result && result.missedHabits.length > 0) {
                setPunishmentData(result);
                setIsPunishmentOpen(true);

                // Dispatch event to refresh UI in other components
                window.dispatchEvent(new CustomEvent('levelup_data_update'));

                if (result.isDead) {
                    // Character death logic
                    setTimeout(async () => {
                        const char = await storage.getCharacter();
                        const difficulty = char?.difficulty || 1;
                        await storage.resetGame();
                        alert(`☠️ DIAS DE GLÓRIA CHEGARAM AO FIM ☠️\n\nSua vida chegou a zero por falhas no treinamento.\nO mundo se tornou mais perigoso (Dificuldade ${difficulty + 1}).`);
                        window.location.reload(); // Hard reload to reset everything
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Failed to check punishments', error);
        }
    };

    const updateTimer = () => {
        const now = new Date();
        const end = endOfDay(now);
        const diff = differenceInSeconds(end, now);

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

        // Check Notifications (1h remaining and 30m remaining)
        if (diff <= 3600 && diff > 3540 && lastNotifiedHour !== 1) { // Approx 1 hour (with 60s buffer)
            sendNotification('Atenção Caçador!', 'Falta apenas 1 hora para o fim do dia. Complete suas tarefas!');
            setLastNotifiedHour(1);
        }

        // Timer zero - Transition to next day
        if (diff <= 0) {
            checkPunishments();
        }
    };

    const sendNotification = (title: string, body: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/icon-192x192.png' });
        } else {
            toast.warning(`${title}: ${body}`);
        }
    };

    return (
        <>
            {/* Fixed Timer Badge */}
            <div className="fixed bottom-4 right-4 z-50">
                <div className="bg-slate-900/90 border border-slate-700 text-cyan-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="font-mono font-bold text-lg">{timeLeft}</span>
                </div>
            </div>

            {/* Punishment Dialog - Only render if open AND has data */}
            {isPunishmentOpen && punishmentData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-slate-950 border border-red-500/50 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4 text-red-500">
                                <AlertTriangle className="w-8 h-8" />
                                <h2 className="text-xl font-bold">Relatório de Falhas</h2>
                            </div>

                            <p className="text-slate-300 mb-6">
                                Você não completou todas as tarefas diárias de ontem.
                                O sistema aplicou as devidas punições.
                            </p>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-3 mb-6">
                                <div className="flex justify-between items-center text-red-300">
                                    <span>Tarefas Perdidas:</span>
                                    <span className="font-bold text-lg">{punishmentData.missedHabits?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-300">
                                    <span>Vida Perdida:</span>
                                    <span className="font-bold text-lg">-{punishmentData.totalHealthPenalty || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-300">
                                    <span>EXP Perdido:</span>
                                    <span className="font-bold text-lg">-{punishmentData.totalXpPenalty || 0}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsPunishmentOpen(false)}
                                variant="destructive"
                                className="w-full py-6 text-lg font-bold shadow-lg shadow-red-900/20"
                            >
                                Aceitar Punição
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
