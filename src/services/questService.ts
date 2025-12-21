import { storage } from '@/components/storage/LocalStorage';

const STORAGE_KEY = 'levelup_quests';

export interface Quest {
    id: string;
    type: 'daily' | 'weekly';
    title: string;
    description: string;
    requirements: {
        target_type: 'habit_count' | 'earn_gold' | 'boss_damage';
        target_value: number;
        current_value: number;
        target_category?: string; // For habits
    };
    rewards: {
        gold: number;
        exp: number;
        item_id?: string;
    };
    status: 'active' | 'completed' | 'claimed';
    created_date: string;
    expiry_date?: string;
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const questService = {
    getQuests: (): Quest[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveQuests: (quests: Quest[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
        window.dispatchEvent(new Event('levelup_quest_update'));
    },

    generateDailyQuests: () => {
        const today = new Date().toISOString().split('T')[0];
        let quests = questService.getQuests();

        // Check if we have active daily quests for today
        const hasDaily = quests.some(q => q.type === 'daily' && q.created_date.startsWith(today));

        if (!hasDaily) {
            // Remove old dailies
            quests = quests.filter(q => q.type !== 'daily');

            const templates = [
                { title: "Foco nos Estudos", description: "Complete 3 hábitos de Estudo.", target_type: "habit_count", target_value: 3, target_category: "estudo", gold: 50, exp: 100 },
                { title: "Vida Saudável", description: "Complete 2 hábitos de Saúde.", target_type: "habit_count", target_value: 2, target_category: "saude", gold: 40, exp: 80 },
                { title: "Caçador de Recompensas", description: "Ganhe 100 de Ouro.", target_type: "earn_gold", target_value: 100, gold: 30, exp: 50 },
            ];

            // Pick 2 random
            const selected = templates.sort(() => 0.5 - Math.random()).slice(0, 2);

            selected.forEach(t => {
                quests.push({
                    id: generateId(),
                    type: 'daily',
                    title: t.title,
                    description: t.description,
                    requirements: {
                        target_type: t.target_type as any,
                        target_value: t.target_value,
                        current_value: 0,
                        target_category: t.target_category
                    },
                    rewards: {
                        gold: t.gold,
                        exp: t.exp
                    },
                    status: 'active',
                    created_date: new Date().toISOString()
                });
            });

            questService.saveQuests(quests);
        }
    },

    updateProgress: (type: 'habit_count' | 'earn_gold' | 'boss_damage', amount: number, category?: string) => {
        const quests = questService.getQuests();
        let updated = false;

        quests.forEach(q => {
            if (q.status === 'active' && q.requirements.target_type === type) {
                // Filter by category if needed (case-insensitive)
                if (type === 'habit_count' && q.requirements.target_category) {
                    const targetCat = q.requirements.target_category.toLowerCase();
                    const currentCat = (category || '').toLowerCase();
                    if (targetCat !== currentCat) {
                        return;
                    }
                }

                q.requirements.current_value += amount;
                if (q.requirements.current_value >= q.requirements.target_value) {
                    q.requirements.current_value = q.requirements.target_value;
                    q.status = 'completed';
                }
                updated = true;
            }
        });

        if (updated) {
            questService.saveQuests(quests);
        }
    },

    claimReward: async (questId: string) => {
        const quests = questService.getQuests();
        const quest = quests.find(q => q.id === questId);

        if (quest && quest.status === 'completed') {
            quest.status = 'claimed';

            const char = await storage.getCharacter();
            if (char) {
                let updates: any = {
                    gold: (char.gold || 0) + quest.rewards.gold,
                    current_exp: (char.current_exp || 0) + quest.rewards.exp,
                    total_exp: (char.total_exp || 0) + quest.rewards.exp
                };

                if (quest.rewards.item_id) {
                    // Find item definition (simplified: usually we fetch from a master list)
                    // For now, let's assume we construct a reward item or fetch from Market
                    // This is a placeholder for adding specific rare items
                    const newItem = {
                        id: generateId(),
                        name: "Recompensa de Missão",
                        description: "Item raro obtido em missão.",
                        icon: "🎁",
                        category: "recompensa",
                        price: 0,
                        created_date: new Date().toISOString()
                    };
                    const inventory = [...(char.inventory || []), newItem];
                    updates.inventory = inventory;
                }

                await storage.updateCharacter(updates);
            }

            questService.saveQuests(quests);
            return quest.rewards;
        }
        return null;
    }
};
