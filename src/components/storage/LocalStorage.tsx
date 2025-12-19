import { format, subDays, parseISO } from 'date-fns';

const STORAGE_KEYS = {
  CHARACTER: 'levelup_character',
  GOOD_HABITS: 'levelup_good_habits',
  BAD_HABITS: 'levelup_bad_habits',
  SKILLS: 'levelup_skills',
  OBJECTIVES: 'levelup_objectives',
  MARKET_ITEMS: 'levelup_market_items',
  ACTIVITY_LOG: 'levelup_activity_log',
  DAILY_CHECKS: 'levelup_daily_checks',
  LAST_PROCESSED_LOGIN: 'levelup_last_processed_login',
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const initializeDefaultData = () => {
  const character = localStorage.getItem(STORAGE_KEYS.CHARACTER);
  if (!character) {
    const defaultData = {
      character: {
        id: generateId(),
        name: "Renato Rocha de Souza Junior",
        profile_image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_682b8b38ba3eb37fec6f9edb/e6cb2c7fc_ChatGPT_Image_28_de_abr_de_2025_13_33_411.png",
        main_objective: "Ser uma pessoa melhor a cada dia",
        secondary_objective: "Superar todos os meus problemas",
        strengths: "Aprender rápido e foco",
        weaknesses: "Procrastinação",
        current_exp: 0,
        total_exp: 0,
        level: 1,
        health: 1000,
        max_health: 1000,
        gold: 100,
        hit_points: 100,
        created_date: new Date().toISOString(),
      },
      goodHabits: [
        { id: generateId(), name: "Acordar às 5 horas da manhã", icon: "🌅", exp_reward: 15, gold_reward: 8, skill_category: "saude", is_daily: true, streak: 0, best_streak: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Anotação Diária", icon: "📝", exp_reward: 10, gold_reward: 5, skill_category: "estudo", is_daily: true, streak: 0, best_streak: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Treino", icon: "💪", exp_reward: 20, gold_reward: 10, skill_category: "musculacao", is_daily: true, streak: 0, best_streak: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Estudo", icon: "📚", exp_reward: 25, gold_reward: 12, skill_category: "estudo", is_daily: true, streak: 0, best_streak: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Economizar", icon: "💰", exp_reward: 15, gold_reward: 20, skill_category: "financas", is_daily: true, streak: 0, best_streak: 0, created_date: new Date().toISOString() },
      ],
      badHabits: [
        { id: generateId(), name: "Beber", icon: "🍺", health_penalty: 100, exp_penalty: 50, color: "blue", days_clean: 0, total_falls: 0, monthly_falls: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Não beber energéticos", icon: "🥤", health_penalty: 30, exp_penalty: 15, color: "red", days_clean: 0, total_falls: 0, monthly_falls: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Redes Sociais (excesso)", icon: "📱", health_penalty: 20, exp_penalty: 10, color: "gray", days_clean: 0, total_falls: 0, monthly_falls: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Fumar", icon: "🚬", health_penalty: 150, exp_penalty: 75, color: "purple", days_clean: 0, total_falls: 0, monthly_falls: 0, created_date: new Date().toISOString() },
      ],
      skills: [
        { id: generateId(), name: "Estudo ERP e Programação", category: "estudo", current_exp: 0, level: 1, level_1_exp: 500, level_2_exp: 1200, level_3_exp: 2400, level_4_exp: 5000, level_5_exp: 9000, created_date: new Date().toISOString() },
        { id: generateId(), name: "Leitura", category: "leitura", current_exp: 0, level: 1, level_1_exp: 500, level_2_exp: 1200, level_3_exp: 2400, level_4_exp: 5000, level_5_exp: 9000, created_date: new Date().toISOString() },
        { id: generateId(), name: "Saúde", category: "saude", current_exp: 0, level: 1, level_1_exp: 500, level_2_exp: 1200, level_3_exp: 2400, level_4_exp: 5000, level_5_exp: 9000, created_date: new Date().toISOString() },
        { id: generateId(), name: "Lazer", category: "lazer", current_exp: 0, level: 1, level_1_exp: 500, level_2_exp: 1200, level_3_exp: 2400, level_4_exp: 5000, level_5_exp: 9000, created_date: new Date().toISOString() },
        { id: generateId(), name: "Musculação", category: "musculacao", current_exp: 0, level: 1, level_1_exp: 500, level_2_exp: 1200, level_3_exp: 2400, level_4_exp: 5000, level_5_exp: 9000, linked_objective: "Entrar em forma", created_date: new Date().toISOString() },
        { id: generateId(), name: "Finanças", category: "financas", current_exp: 0, level: 1, level_1_exp: 500, level_2_exp: 1200, level_3_exp: 2400, level_4_exp: 5000, level_5_exp: 9000, created_date: new Date().toISOString() },
      ],
      objectives: [
        { id: generateId(), title: "Ser uma pessoa melhor a cada dia", description: "Objetivo principal de vida", is_main: true, progress: 0, status: "em_andamento", exp_reward: 1000, gold_reward: 500, created_date: new Date().toISOString() },
        { id: generateId(), title: "Entrar em forma", description: "Alcançar condicionamento físico ideal", is_main: false, progress: 0, status: "em_andamento", exp_reward: 500, gold_reward: 200, created_date: new Date().toISOString() },
        { id: generateId(), title: "Comprar um carro novo", description: "Economizar para o carro dos sonhos", is_main: false, progress: 0, status: "em_andamento", exp_reward: 500, gold_reward: 200, created_date: new Date().toISOString() },
      ],
      marketItems: [
        { id: generateId(), name: "Poção Simples", description: "Restaura +50 HP", icon: "🧪", price: 100, category: "boost", health_gain: 50, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Poção Mediana", description: "Restaura +150 HP", icon: "⚗️", price: 200, category: "boost", health_gain: 150, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Poção Premium", description: "Restaura +500 HP", icon: "💎", price: 300, category: "boost", health_gain: 500, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Recuperar Hábito Perdido", description: "Recupera um hábito esquecido de ontem", icon: "⏳", price: 50, category: "mercado_negro", times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Dia de Folga", description: "Um dia sem obrigações para relaxar", icon: "🏖️", price: 200, category: "recompensa", times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Jogo Novo", description: "Comprar aquele jogo que você queria", icon: "🎮", price: 300, category: "recompensa", times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Boost de EXP 2x", description: "Próximo hábito vale EXP em dobro", icon: "⚡", price: 100, category: "boost", times_purchased: 0, created_date: new Date().toISOString() },
      ],
    };

    localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(defaultData.character));
    localStorage.setItem(STORAGE_KEYS.GOOD_HABITS, JSON.stringify(defaultData.goodHabits));
    localStorage.setItem(STORAGE_KEYS.BAD_HABITS, JSON.stringify(defaultData.badHabits));
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(defaultData.skills));
    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(defaultData.objectives));
    localStorage.setItem(STORAGE_KEYS.MARKET_ITEMS, JSON.stringify(defaultData.marketItems));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DAILY_CHECKS, JSON.stringify([]));
  }
};

export const storage = {
  getCharacter: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.CHARACTER);
    return data ? JSON.parse(data) : null;
  },
  createCharacter: async (character) => {
    const newCharacter = { ...character, id: generateId(), created_date: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(newCharacter));
    return newCharacter;
  },
  updateCharacter: async (updates) => {
    const current = await storage.getCharacter();
    const updated = { ...current, ...updates, updated_date: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(updated));
    return updated;
  },

  getGoodHabits: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.GOOD_HABITS);
    return data ? JSON.parse(data) : [];
  },
  addGoodHabit: async (habit) => {
    const habits = await storage.getGoodHabits();
    const newHabit = { ...habit, id: generateId(), created_date: new Date().toISOString() };
    habits.push(newHabit);
    localStorage.setItem(STORAGE_KEYS.GOOD_HABITS, JSON.stringify(habits));
    return newHabit;
  },
  updateGoodHabit: async (id, updates) => {
    const habits = await storage.getGoodHabits();
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.GOOD_HABITS, JSON.stringify(habits));
    }
    return habits[index];
  },
  deleteGoodHabit: async (id) => {
    const habits = await storage.getGoodHabits();
    const filtered = habits.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOOD_HABITS, JSON.stringify(filtered));
  },

  getBadHabits: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.BAD_HABITS);
    return data ? JSON.parse(data) : [];
  },
  addBadHabit: async (habit) => {
    const habits = await storage.getBadHabits();
    const newHabit = { ...habit, id: generateId(), created_date: new Date().toISOString() };
    habits.push(newHabit);
    localStorage.setItem(STORAGE_KEYS.BAD_HABITS, JSON.stringify(habits));
    return newHabit;
  },
  updateBadHabit: async (id, updates) => {
    const habits = await storage.getBadHabits();
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.BAD_HABITS, JSON.stringify(habits));
    }
    return habits[index];
  },
  deleteBadHabit: async (id) => {
    const habits = await storage.getBadHabits();
    const filtered = habits.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.BAD_HABITS, JSON.stringify(filtered));
  },

  getSkills: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.SKILLS);
    return data ? JSON.parse(data) : [];
  },
  createSkill: async (skill) => {
    const skills = await storage.getSkills();
    const newSkill = { ...skill, id: generateId(), created_date: new Date().toISOString() };
    skills.push(newSkill);
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
    return newSkill;
  },
  addSkill: async (skill) => {
    return storage.createSkill(skill);
  },
  updateSkill: async (id, updates) => {
    const skills = await storage.getSkills();
    const index = skills.findIndex(s => s.id === id);
    if (index !== -1) {
      skills[index] = { ...skills[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
    }
    return skills[index];
  },
  deleteSkill: async (id) => {
    const skills = await storage.getSkills();
    const filtered = skills.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(filtered));
  },

  getObjectives: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.OBJECTIVES);
    return data ? JSON.parse(data) : [];
  },
  createObjective: async (objective) => {
    const objectives = await storage.getObjectives();
    const newObjective = { ...objective, id: generateId(), created_date: new Date().toISOString() };
    objectives.push(newObjective);
    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(objectives));
    return newObjective;
  },
  addObjective: async (objective) => {
    return storage.createObjective(objective);
  },
  updateObjective: async (id, updates) => {
    const objectives = await storage.getObjectives();
    const index = objectives.findIndex(o => o.id === id);
    if (index !== -1) {
      objectives[index] = { ...objectives[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(objectives));
    }
    return objectives[index];
  },
  deleteObjective: async (id) => {
    const objectives = await storage.getObjectives();
    const filtered = objectives.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(filtered));
  },

  getMarketItems: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.MARKET_ITEMS);
    return data ? JSON.parse(data) : [];
  },
  addMarketItem: async (item) => {
    const items = await storage.getMarketItems();
    const newItem = { ...item, id: generateId(), created_date: new Date().toISOString() };
    items.push(newItem);
    localStorage.setItem(STORAGE_KEYS.MARKET_ITEMS, JSON.stringify(items));
    return newItem;
  },
  updateMarketItem: async (id, updates) => {
    const items = await storage.getMarketItems();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.MARKET_ITEMS, JSON.stringify(items));
    }
    return items[index];
  },
  deleteMarketItem: async (id) => {
    const items = await storage.getMarketItems();
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.MARKET_ITEMS, JSON.stringify(filtered));
  },

  getActivityLog: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
    const logs = data ? JSON.parse(data) : [];
    return logs.sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
  },
  addActivityLog: async (log) => {
    const logs = await storage.getActivityLog();
    const newLog = { ...log, id: generateId(), created_date: new Date().toISOString() };
    logs.push(newLog);
    const trimmed = logs.slice(-500);
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(trimmed));
    return newLog;
  },

  getDailyChecks: async (date?: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_CHECKS);
    const checks = data ? JSON.parse(data) : [];
    return date ? checks.filter((c: any) => c.date === date) : checks;
  },
  addDailyCheck: async (check) => {
    const checks = await storage.getDailyChecks();
    const newCheck = { ...check, id: generateId(), created_date: new Date().toISOString() };
    checks.push(newCheck);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filtered = checks.filter((c: any) => new Date(c.date) >= thirtyDaysAgo);
    localStorage.setItem(STORAGE_KEYS.DAILY_CHECKS, JSON.stringify(filtered));
    return newCheck;
  },

  processMissedHabits: async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastProcessed = localStorage.getItem(STORAGE_KEYS.LAST_PROCESSED_LOGIN);

    // If already processed today, skip
    if (lastProcessed === today) {
      return null;
    }

    // Determine "yesterday" relative to today
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // If we have never processed (first run), just mark today as processed and return
    if (!lastProcessed) {
      localStorage.setItem(STORAGE_KEYS.LAST_PROCESSED_LOGIN, today);
      return null;
    }

    // Logic: If lastProcessed is BEFORE today, we check if we missed "yesterday"
    // Ideally we should iterate all days missed, but strict requirement "punishment if not finished in time" implies checking yesterday.
    // Simpler approach: Check if yesterday's dailies were done.

    const goodHabits: any[] = await storage.getGoodHabits();
    const dailyHabits = goodHabits.filter(h => h.is_daily);

    // Get checks for yesterday
    const checksYesterday = await storage.getDailyChecks(yesterday);

    const character = await storage.getCharacter();
    const difficulty = character?.difficulty || 1;
    const penaltyMultiplier = 1 + ((difficulty - 1) * 0.5);

    const missedHabits: any[] = [];
    let totalHealthPenalty = 0;
    let totalXpPenalty = 0;

    dailyHabits.forEach(habit => {
      // Check if this habit existed yesterday (created_date <= yesterday end)
      const habitCreated = new Date(habit.created_date);
      if (habitCreated > new Date(yesterday + 'T23:59:59')) return;

      const completed = checksYesterday.find((c: any) => c.habit_id === habit.id && c.completed);

      if (!completed) {
        missedHabits.push(habit);
        // Apply difficulty multiplier
        totalHealthPenalty += Math.floor(50 * penaltyMultiplier);
        totalXpPenalty += Math.floor(20 * penaltyMultiplier);

        // Reset streak
        storage.updateGoodHabit(habit.id, { streak: 0 });
      }
    });

    let isDead = false;
    if (missedHabits.length > 0 && character) {
      const newHealth = Math.max((character.health || 0) - totalHealthPenalty, 0);
      isDead = newHealth <= 0;

      await storage.updateCharacter({
        health: newHealth,
        current_exp: Math.max((character.current_exp || 0) - totalXpPenalty, 0)
      });

      await storage.addActivityLog({
        activity: `Punição: Perdeu ${missedHabits.length} tarefas de ontem`,
        type: 'penalty',
        exp_change: -totalXpPenalty,
        health_change: -totalHealthPenalty,
      });
    }

    // Mark today as processed
    localStorage.setItem(STORAGE_KEYS.LAST_PROCESSED_LOGIN, today);

    return {
      missedHabits,
      totalHealthPenalty,
      totalXpPenalty,
      isDead
    };
  },

  resetGame: async () => {
    const character = await storage.getCharacter();
    const currentDifficulty = character.difficulty || 1;
    const newDifficulty = currentDifficulty + 1; // Increase difficulty

    const newCharacter = {
      ...character,
      level: 1,
      current_exp: 0,
      total_exp: 0,
      health: 1000,
      max_health: 1000,
      gold: 0,
      difficulty: newDifficulty,
      reset_count: (character.reset_count || 0) + 1,
      last_reset_date: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(newCharacter));

    // Optional: Reset habits streaks?
    const goodHabits = await storage.getGoodHabits();
    const resetHabits = goodHabits.map((h: any) => ({ ...h, streak: 0 }));
    localStorage.setItem(STORAGE_KEYS.GOOD_HABITS, JSON.stringify(resetHabits));

    // Clear Daily Checks? Maybe keep them for history, but streaks are gone.

    await storage.addActivityLog({
      activity: `RENASCIMENTO: Dificuldade Aumentada para ${newDifficulty}`,
      type: 'system',
      exp_change: 0,
      gold_change: 0,
    });

    return newCharacter;
  },
};