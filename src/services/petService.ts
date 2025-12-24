import { Pet, Character } from '@/types';
import { storage } from '@/components/storage/LocalStorage';

class PetService {
    private PET_TEMPLATES: Record<string, Partial<Pet>> = {
        dragon: {
            name: 'Filhote de Dragão',
            type: 'dragon',
            icon: '🐲',
            element: 'fire',
            bonus_type: 'damage_boost',
            bonus_value: 0.1,
        },
        owl: {
            name: 'Coruja Sábia',
            type: 'owl',
            icon: '🦉',
            element: 'air',
            bonus_type: 'exp_boost',
            bonus_value: 0.05,
        },
        wolf: {
            name: 'Lobo Solitário',
            type: 'wolf',
            icon: '🐺',
            element: 'earth',
            bonus_type: 'gold_boost',
            bonus_value: 0.08,
        },
        slime: {
            name: 'Gelatina Saltitante',
            type: 'slime',
            icon: '🧊',
            element: 'water',
            bonus_type: 'exp_boost',
            bonus_value: 0.03,
        },
        cat: {
            name: 'Gato da Sorte',
            type: 'cat',
            icon: '🐱',
            element: 'neutral',
            bonus_type: 'gold_boost',
            bonus_value: 0.15,
        }
    };

    public createPet(type: Pet['type'], name?: string): Pet {
        const template = this.PET_TEMPLATES[type];
        return {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name || template.name!,
            type: type,
            level: 1,
            current_exp: 0,
            max_exp: 100,
            evolution_stage: 1,
            icon: template.icon!,
            element: template.element!,
            bonus_type: template.bonus_type!,
            bonus_value: template.bonus_value!,
            hunger: 100,
            last_fed: new Date().toISOString(),
        };
    }

    public calculatePetXpGain(habitExp: number): number {
        // Pet gets 20% of habit XP
        return Math.floor(habitExp * 0.2);
    }

    public updatePetXp(pet: Pet, expGain: number): Pet {
        let updated = { ...pet };
        updated.current_exp += expGain;

        while (updated.current_exp >= updated.max_exp && updated.level < 50) {
            updated.current_exp -= updated.max_exp;
            updated.level += 1;
            updated.max_exp = Math.floor(updated.max_exp * 1.2);

            // Evolution Logic
            if (updated.level === 10) updated.evolution_stage = 2;
            if (updated.level === 30) updated.evolution_stage = 3;

            // Bonus Scaling
            updated.bonus_value = Number((updated.bonus_value * 1.05).toFixed(3));
        }

        return updated;
    }

    public getPetBonus(pet: Pet | undefined, type: Pet['bonus_type']): number {
        if (!pet) return 0;

        // Penalty if hungry? 
        const hungerPenalty = pet.hunger < 20 ? 0.5 : 1.0;

        if (pet.bonus_type === type) {
            return pet.bonus_value * hungerPenalty;
        }
        return 0;
    }
}

export const petService = new PetService();
