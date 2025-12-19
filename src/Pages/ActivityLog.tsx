import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ActivityItem from '@/components/activity/ActivityItem';
import { Button } from "@/components/ui/button";
import { storage } from '@/components/storage/LocalStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityLog } from '@/types';

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await storage.getActivityLogs();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((acc: Record<string, ActivityLog[]>, activity: ActivityLog) => {
    const date = format(new Date(activity.timestamp || new Date()), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Hoje';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Ontem';
    } else {
      return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Diário de Aventuras</h1>
            <p className="text-slate-400 text-sm">A crônica de sua jornada rumo ao topo</p>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-6">
          <AnimatePresence>
            {Object.entries(groupedActivities).map(([date, dateActivities]: [string, ActivityLog[]], groupIndex: number) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden"
              >
                {/* Date Header */}
                <div className="bg-slate-800/50 px-5 py-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formatDateHeader(date)}</span>
                    <span className="text-slate-500 text-sm ml-auto">
                      {dateActivities.length} {dateActivities.length === 1 ? 'atividade' : 'atividades'}
                    </span>
                  </div>
                </div>

                {/* Activities */}
                <div className="px-5 py-2">
                  {dateActivities.map((activity, index) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {activities.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700"
            >
              <Activity className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">Nenhum registro no diário ainda</p>
              <p className="text-slate-500 text-sm mt-2">
                Suas conquistas e batalhas aparecerão nestas páginas
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}