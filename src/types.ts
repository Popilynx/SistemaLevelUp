// Types para o Sistema Level Up

export interface Character {
  id: string;
  name: string;
  profile_image: string;
  main_objective: string;
  secondary_objective?: string;
  strengths: string;
  weaknesses: string;
  current_exp: number;
  total_exp: number;
  level: number;
  health: number;
  max_health: number;
  gold: number;
  hit_points: number;
  created_date: string;
  category_xp?: Record<string, number>; // XP per category (Study, Health, etc.)
  rank?: string; // e.g., "Bronze", "Silver", "Gold"
  difficulty?: number;
  reset_count?: number;
  last_reset_date?: string;
  inventory?: MarketItem[];
  active_debuffs?: Debuff[];
  active_buffs?: Buff[];
  active_pet?: Pet;
  pet_inventory?: Pet[];
  discipline_fragments?: number;
  owned_themes?: string[];
  current_theme?: string;
}

export interface Buff {
  id: string;
  type: 'exp_boost' | 'boss_damage' | 'health_regen';
  name: string;
  description: string;
  icon: string;
  duration_minutes: number;
  start_time: string; // ISO string
}

export interface Debuff {
  id: string;
  type: 'tired' | 'confused' | 'weak' | 'poisoned';
  name: string;
  description: string;
  icon: string;
  duration_minutes: number;
  start_time: string; // ISO string
}

export interface GoodHabit {
  id: string;
  name: string;
  icon: string;
  exp_reward: number;
  gold_reward: number;
  skill_category: string;
  is_daily: boolean;
  streak: number;
  best_streak: number;
  created_date: string;
}

export interface BadHabit {
  id: string;
  name: string;
  icon: string;
  health_penalty: number;
  exp_penalty: number;
  color: string;
  days_clean: number;
  total_falls: number;
  monthly_falls: number;
  created_date: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  element: Element;
  current_exp: number;
  level: number;
  level_1_exp?: number;
  level_2_exp?: number;
  level_3_exp?: number;
  level_4_exp?: number;
  level_5_exp?: number;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  is_main: boolean;
  progress: number;
  status: 'ativo' | 'concluido' | 'cancelado';
  due_date?: string;
  exp_reward: number;
  gold_reward: number;
  created_date?: string;
}

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  category: string;
  times_purchased: number;
  created_date: string;
  slot?: 'head' | 'body' | 'legs' | 'feet' | 'main_hand' | 'off_hand' | 'ring' | 'neck';
  health_gain?: number;
  damage?: number;
  crit_chance?: number;
  bonus_exp?: number;
  exp_category?: string;
  bonus_gold?: number;
  bonus_health?: number;
  reduction_penalty?: number;
  is_equipped?: boolean;
  max_uses?: number; // For consumable buffs
  current_uses?: number;
  is_consumable?: boolean;
}

export interface ActivityLog {
  id: string;
  activity: string;
  type: string;
  exp_change?: number;
  gold_change?: number;
  health_change?: number;
  timestamp: string;
}

export interface DailyCheck {
  id: string;
  habit_id: string;
  habit_type: 'good' | 'bad';
  completed: boolean;
  date: string;
  timestamp: string;
}

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'neutral';

export interface DailyBoss {
  id: string;
  name: string;
  image: string;
  element: Element;
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

export type Boss = DailyBoss;

export interface LoreChapter {
  id: string;
  level_required: number;
  title: string;
  content: string;
  unlocked: boolean;
}

export interface EmergencyQuest {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  reward_exp: number;
  reward_gold: number;
  deadline: string; // ISO string
  type: 'habit_streak' | 'gold_earn' | 'boss_dmg';
}

export interface Pet {
  id: string;
  name: string;
  type: 'dragon' | 'owl' | 'slime' | 'wolf' | 'cat';
  element: Element;
  level: number;
  current_exp: number;
  max_exp: number;
  evolution_stage: 1 | 2 | 3;
  icon: string;
  bonus_type: 'exp_boost' | 'gold_boost' | 'damage_boost' | 'cooldown_reduction';
  bonus_value: number; // e.g., 0.05 for 5%
  hunger: number; // 0-100
  last_fed?: string;
}
