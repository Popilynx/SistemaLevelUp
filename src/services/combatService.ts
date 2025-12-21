import { Boss } from '../types/gameTypes';
import { characterService } from './characterService';

const STORAGE_KEY = 'levelup_daily_boss';

// Predefined Bosses
const BOSS_TEMPLATE = [
    { name: "Dragão da Procrastinação", image: "🐲", base_hp: 500, attack: 15, defense: 5, gold: 150, exp: 200 },
    { name: "Gigante do Desânimo", image: "👹", base_hp: 400, attack: 12, defense: 3, gold: 120, exp: 180 },
    { name: "Sombra da Preguiça", image: "👻", base_hp: 300, attack: 10, defense: 2, gold: 100, exp: 150 },
    { name: "Gólem da Inércia", image: "🗿", base_hp: 600, attack: 20, defense: 10, gold: 250, exp: 300 },
    { name: "Feiticeiro do Caos", image: "🧙‍♂️", base_hp: 350, attack: 25, defense: 1, gold: 200, exp: 250 },
];

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const combatService = {
    getDailyBoss: (): Boss => {
        const today = new Date().toISOString().split('T')[0];
        const data = localStorage.getItem(STORAGE_KEY);
        let boss: Boss = data ? JSON.parse(data) : null;

        // Reset or Create Boss if explicitly null, outdated, or invalid
        // STRICT LOGIC: New Day = New Boss. No carrying over dead bodies or half-dead bosses.
        if (!boss || !boss.stats || (boss.last_update && boss.last_update.split('T')[0] !== today)) {
            const template = BOSS_TEMPLATE[Math.floor(Math.random() * BOSS_TEMPLATE.length)];

            boss = {
                id: generateId(),
                name: template.name,
                image: template.image,
                level: 1,
                stats: {
                    health: template.base_hp,
                    max_health: template.base_hp,
                    attack: template.attack,
                    defense: template.defense,
                },
                rewards: {
                    gold: template.gold,
                    exp: template.exp,
                },
                status: 'alive',
                last_update: new Date().toISOString()
            };

            combatService.saveBoss(boss);
        } else if (!boss.rewards) {
            // MIGRATION: Add rewards if missing from old data
            const template = BOSS_TEMPLATE.find(t => t.name === boss.name) || BOSS_TEMPLATE[0];
            boss.rewards = {
                gold: template.gold,
                exp: template.exp
            };
            combatService.saveBoss(boss);
        }

        return boss;
    },

    saveBoss: (boss: Boss): void => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...boss,
            last_update: new Date().toISOString()
        }));
        window.dispatchEvent(new Event('levelup_boss_update'));
        window.dispatchEvent(new Event('levelup_data_update')); // Sync with Home
    },

    dealDamage: (amount: number): { boss: Boss, damageDealt: number, isKill: boolean } => {
        const boss = combatService.getDailyBoss();
        if (boss.status === 'defeated') return { boss, damageDealt: 0, isKill: false };

        // Defense Calculation
        const damageDealt = Math.max(1, amount - boss.stats.defense);
        const newHealth = Math.max(0, boss.stats.health - damageDealt);

        boss.stats.health = newHealth;
        let isKill = false;

        if (newHealth <= 0) {
            boss.status = 'defeated';
            isKill = true;
        }

        combatService.saveBoss(boss);
        return { boss, damageDealt, isKill };
    },

    // New: Calculate generic Boss Damage against Player
    calculateBossDamage: (boss: Boss, playerDefense: number): number => {
        // Simple formula: Boss Attack - Player Def (Min 1, Max Boss Attack)
        // Add random variance +/- 20%
        const base = Math.max(1, boss.stats.attack - playerDefense);
        const variance = (Math.random() * 0.4) + 0.8; // 0.8 to 1.2
        return Math.floor(base * variance);
    },

    claimBossReward: async (): Promise<{ gold: number, exp: number } | null> => {
        const boss = combatService.getDailyBoss();
        if (!boss || boss.status !== 'defeated' || boss.reward_claimed) return null;

        const character = characterService.getCharacter();
        if (!character) return null;

        const stats = characterService.calculateStats(character);
        const finalGold = Math.floor(boss.rewards.gold * (1 + (stats.bonus_gold || 0)));
        const finalExp = Math.floor(boss.rewards.exp * (1 + (stats.bonus_exp || 0)));

        // Update Character via centralized service (handles leveling)
        const updatedExp = (character.current_exp || 0) + finalExp;
        const updatedTotalExp = (character.total_exp || 0) + finalExp;
        const updatedGold = (character.gold || 0) + finalGold;

        characterService.updateCharacter({
            current_exp: updatedExp,
            total_exp: updatedTotalExp,
            gold: updatedGold
        });

        // Mark boss reward as claimed
        boss.reward_claimed = true;
        combatService.saveBoss(boss);

        return { gold: finalGold, exp: finalExp };
    }
};
