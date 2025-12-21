import { Character } from '../types/gameTypes';

const STORAGE_KEY = 'levelup_perks';

export interface Perk {
    id: string;
    skill_category: string;
    required_level: number;
    name: string;
    description: string;
    icon: string;
    effect: {
        type: 'stat_boost' | 'xp_boost' | 'gold_boost' | 'streak_shield';
        value: number;
        target?: string;
    };
}

const PERK_TREE: Perk[] = [
    // ESTUDO
    { id: 'perk_estudo_1', skill_category: 'estudo', required_level: 5, name: 'Mente Focada', description: '+10% XP em Estudos', icon: '🧠', effect: { type: 'xp_boost', value: 0.1, target: 'estudo' } },
    { id: 'perk_estudo_2', skill_category: 'estudo', required_level: 10, name: 'Leitura Rápida', description: '+20% XP em Leitura', icon: '📖', effect: { type: 'xp_boost', value: 0.2, target: 'leitura' } },
    { id: 'perk_estudo_3', skill_category: 'estudo', required_level: 15, name: 'Sabedoria Ancestral', description: '+50% Gold em Estudos', icon: '📜', effect: { type: 'gold_boost', value: 0.5, target: 'estudo' } },

    // SAUDE
    { id: 'perk_saude_1', skill_category: 'saude', required_level: 5, name: 'Corpo de Ferro', description: '+50 HP Máximo', icon: '💪', effect: { type: 'stat_boost', value: 50, target: 'hp' } },
    { id: 'perk_saude_2', skill_category: 'saude', required_level: 10, name: 'Metabolismo Acelerado', description: 'Recupera 5% HP por dia', icon: '🧬', effect: { type: 'stat_boost', value: 0.05, target: 'regen' } },

    // FINANCAS
    { id: 'perk_financas_1', skill_category: 'financas', required_level: 5, name: 'Investidor Iniciante', description: '+10% Gold Geral', icon: '💰', effect: { type: 'gold_boost', value: 0.1, target: 'all' } },
    { id: 'perk_financas_2', skill_category: 'financas', required_level: 10, name: 'Juros Compostos', description: '+20% Gold Geral', icon: '📈', effect: { type: 'gold_boost', value: 0.2, target: 'all' } },
];

export const perkService = {
    getAllPerks: () => PERK_TREE,

    getUnlockedPerks: (): string[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    unlockPerk: (perkId: string) => {
        const unlocked = perkService.getUnlockedPerks();
        if (!unlocked.includes(perkId)) {
            unlocked.push(perkId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
        }
    },

    checkUnlocks: (skills: any[]) => {
        // Logic to check if new perks should be unlocked based on skill levels
        let newUnlocks = false;
        const unlocked = perkService.getUnlockedPerks();

        PERK_TREE.forEach(perk => {
            const skill = skills.find(s => s.category === perk.skill_category);
            if (skill && skill.level >= perk.required_level && !unlocked.includes(perk.id)) {
                perkService.unlockPerk(perk.id);
                newUnlocks = true;
            }
        });

        return newUnlocks;
    },

    getGlobalMultipliers: () => {
        const unlockedIds = perkService.getUnlockedPerks();
        const unlockedPerks = PERK_TREE.filter(p => unlockedIds.includes(p.id));

        let multipliers = {
            xp_global: 1,
            gold_global: 1,
            max_health_bonus: 0,
            xp_categories: {} as Record<string, number>,
        };

        unlockedPerks.forEach(p => {
            if (p.effect.type === 'xp_boost') {
                if (p.effect.target === 'all') multipliers.xp_global += p.effect.value;
                else if (p.effect.target) {
                    multipliers.xp_categories[p.effect.target] = (multipliers.xp_categories[p.effect.target] || 1) + p.effect.value;
                }
            }
            if (p.effect.type === 'gold_boost') {
                if (p.effect.target === 'all') multipliers.gold_global += p.effect.value;
            }
            if (p.effect.type === 'stat_boost' && p.effect.target === 'hp') {
                multipliers.max_health_bonus += p.effect.value;
            }
        });

        return multipliers;
    }
};
