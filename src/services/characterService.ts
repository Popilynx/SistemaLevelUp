import { Character, MarketItem, Pet } from '@/types';
import { petService } from './petService';

const STORAGE_KEY = 'levelup_character';

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const characterService = {
    getCharacter: (): Character | null => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    saveCharacter: (character: Character): void => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...character,
            updated_date: new Date().toISOString()
        }));
        window.dispatchEvent(new Event('levelup_data_update'));
    },

    calculateExpRequirement: (level: number): number => {
        // Linear scaling for now: Level 1 = 500, Level 2 = 1000, etc.
        return level * 500;
    },

    calculateRank: (level: number): string => {
        if (level <= 10) return "🟤 Bronze";
        if (level <= 20) return "⚪ Prata";
        if (level <= 40) return "🟡 Ouro";
        if (level <= 70) return "💎 Platina";
        return "🌌 Diamante";
    },

    updateCharacter: (updates: Partial<Character> & { category?: string, exp_gain?: number }): Character | null => {
        const current = characterService.getCharacter();
        if (!current) return null;

        let { category, exp_gain, ...rest } = updates;
        let updated = { ...current, ...rest };

        // --- CATEGORY XP TRACKING ---
        if (category && exp_gain) {
            if (!updated.category_xp) updated.category_xp = {};
            updated.category_xp[category] = (updated.category_xp[category] || 0) + exp_gain;
            updated.current_exp = (updated.current_exp || 0) + exp_gain;
            updated.total_exp = (updated.total_exp || 0) + exp_gain;

            // --- PET EXP ---
            if (updated.active_pet) {
                const petXpGain = petService.calculatePetXpGain(exp_gain);
                updated.active_pet = petService.updatePetXp(updated.active_pet, petXpGain);
            }
        }

        // --- RECURSIVE LEVELING LOGIC ---
        // If current_exp exceeds or equals requirement, level up and carry over remainder.
        // We do this in a loop to handle multiple levels at once (e.g. from a huge boss reward).
        let levelUps = 0;
        while (updated.current_exp >= characterService.calculateExpRequirement(updated.level)) {
            const requirement = characterService.calculateExpRequirement(updated.level);
            updated.current_exp -= requirement;
            updated.level += 1;
            levelUps++;
        }

        if (levelUps > 0) {
            // DISPATCH LEVEL UP EVENT
            window.dispatchEvent(new CustomEvent('levelup_event', {
                detail: { levels: levelUps, newLevel: updated.level }
            }));

            // Increase HP per level
            updated.max_health = (updated.max_health || 1000) + (levelUps * 100);
            updated.health = updated.max_health;

            // Update Rank
            updated.rank = characterService.calculateRank(updated.level);
        }

        characterService.saveCharacter(updated);
        return updated;
    },

    // --- INVENTORY & EQUIPMENT ---

    toggleEquip: (itemId: string): Character | null => {
        const character = characterService.getCharacter();
        if (!character || !character.inventory) return character;

        const inventory = [...character.inventory];
        const targetItemIndex = inventory.findIndex(i => i.id === itemId);
        if (targetItemIndex === -1) return character;

        const targetItem = inventory[targetItemIndex];
        const isEquipping = !targetItem.is_equipped;

        // Slot Conflict Logic
        if (isEquipping && targetItem.slot) {
            inventory.forEach((item, index) => {
                // Unequip current item in slot
                if (item.is_equipped && item.slot === targetItem.slot && item.id !== itemId) {
                    inventory[index] = { ...item, is_equipped: false };
                }
            });
        }

        inventory[targetItemIndex] = { ...targetItem, is_equipped: isEquipping };

        return characterService.updateCharacter({ inventory });
    },

    calculateStats: (character: Character) => {
        let stats = {
            damage: 0,
            defense: 0, // health bonus effectively works as defense buffer or we can add explicit def
            bonus_exp: 0,
            bonus_gold: 0,
        };

        const equipped = (character.inventory || []).filter((i: any) => i.is_equipped) as MarketItem[];
        equipped.forEach(item => {
            if (item.damage) stats.damage += item.damage;
            if (item.bonus_exp) stats.bonus_exp += item.bonus_exp;
            if (item.bonus_gold) stats.bonus_gold += item.bonus_gold;
            // Health bonus is usually applied directly to max_health or current health logic elsewhere
        });

        return stats;
    }
};
