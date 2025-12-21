export interface Item {
    id: string;
    name: string;
    description: string;
    icon: string;
    price: number;
    category: 'boost' | 'equipment' | 'especial' | 'cosmetic' | 'consumivel' | 'mercado_negro' | 'recompensa';
    slot?: 'head' | 'body' | 'legs' | 'feet' | 'main_hand' | 'off_hand' | 'ring' | 'neck';
    health_gain?: number;
    damage?: number;
    crit_chance?: number;
    exp_bonus?: number;
    exp_category?: string;
    bonus_gold?: number;
    bonus_exp?: number; // Some items use this key instead of exp_bonus, standardized?
    reduction_penalty?: number;
    is_consumable?: boolean;
    max_uses?: number;
    current_uses?: number;
    is_equipped?: boolean;
    created_date?: string;
}

export interface Buff {
    id: string;
    name: string;
    type: string;
    description: string;
    icon: string;
    duration_minutes: number;
    start_time: string;
}

export interface Character {
    id: string;
    name: string;
    profile_image?: string;
    level: number;
    current_exp: number;
    total_exp: number;
    health: number;
    max_health: number;
    gold: number;
    strengths?: string;
    weaknesses?: string;
    main_objective?: string;
    secondary_objective?: string;
    difficulty?: number;
    inventory?: Item[];
    active_buffs?: Buff[];
    active_debuffs?: any[];
    created_date?: string;
    updated_date?: string;
}

export interface Boss {
    id: string;
    name: string;
    image: string;
    level: number;
    stats: {
        health: number;
        max_health: number;
        attack: number;
        defense: number;
    };
    rewards: {
        gold: number;
        exp: number;
        items?: string[];
    };
    status: 'alive' | 'defeated';
    reward_claimed?: boolean;
    last_update?: string;
}
