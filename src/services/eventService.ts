import { EmergencyQuest } from '@/types';

class EventService {
    private POTENTIAL_QUESTS: Partial<EmergencyQuest>[] = [
        {
            title: 'Hidratação de Emergência',
            description: 'Beba 2L de água nas próximas 2 horas.',
            type: 'habit_streak', // Generic for now
            target_value: 1,
            reward_exp: 200,
            reward_gold: 100,
        },
        {
            title: 'Febre de Ouro',
            description: 'Ganhe 500 de ouro hoje.',
            type: 'gold_earn',
            target_value: 500,
            reward_exp: 300,
            reward_gold: 250,
        },
        {
            title: 'Desafio do Boss',
            description: 'Causa 500 de dano ao Boss agora.',
            type: 'boss_dmg',
            target_value: 500,
            reward_exp: 500,
            reward_gold: 200,
        }
    ];

    public generateRandomEvent(): EmergencyQuest | null {
        // 10% chance to trigger an event? Or maybe once per day.
        const shouldTrigger = Math.random() < 0.1;
        if (!shouldTrigger) return null;

        const template = this.POTENTIAL_QUESTS[Math.floor(Math.random() * this.POTENTIAL_QUESTS.length)];
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 2); // 2 hour deadline

        return {
            id: `event_${Date.now()}`,
            current_value: 0,
            deadline: deadline.toISOString(),
            ...(template as EmergencyQuest)
        };
    }
}

export const eventService = new EventService();
