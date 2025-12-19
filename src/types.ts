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
  difficulty?: number;
  reset_count?: number;
  last_reset_date?: string;
  inventory?: MarketItem[];
  active_debuffs?: Debuff[];
  active_buffs?: Buff[];
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
  health_gain?: number;
  bonus_exp?: number;
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

export interface DailyBoss {
  id: string;
  name: string;
  image: string;
  health: number;
  max_health: number;
  status: 'alive' | 'defeated';
  last_update: string;
  base_gold_reward: number;
  base_exp_reward: number;
}
