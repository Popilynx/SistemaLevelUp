import { format, subDays, parseISO } from 'date-fns';
import { characterService } from '../../services/characterService';

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
  DAILY_BOSS: 'levelup_daily_boss',
};

const POTENTIAL_BOSSES = [
  { name: "Dragão da Procrastinação", image: "🐲", max_health: 1200, reward_gold: 150, reward_exp: 200 },
  { name: "Gigante do Desânimo", image: "👹", max_health: 1000, reward_gold: 120, reward_exp: 180 },
  { name: "Sombra da Preguiça", image: "👻", max_health: 800, reward_gold: 100, reward_exp: 150 },
  { name: "Mestre da Distração", image: "🧙‍♂️", max_health: 1100, reward_gold: 200, reward_exp: 250 },
  { name: "Gólem da Inércia", image: "🗿", max_health: 1500, reward_gold: 250, reward_exp: 300 },
];

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- MARKET ROTATION SYSTEM ---
const PERMANENT_MARKET_ITEMS = [
  { id: 'perm_1', name: "Poção Simples", description: "Restaura +50 HP", icon: "🧪", price: 100, category: "boost", health_gain: 50, is_consumable: true },
  { id: 'perm_2', name: "Poção Mediana", description: "Restaura +150 HP", icon: "⚗️", price: 200, category: "boost", health_gain: 150, is_consumable: true },
  { id: 'perm_3', name: "Recuperar Hábito Perdido", description: "Recupera um hábito esquecido de ontem", icon: "⏳", price: 50, category: "mercado_negro" },
  { id: 'perm_4', name: "Dia de Folga", description: "Um dia sem obrigações para relaxar", icon: "🏖️", price: 200, category: "recompensa" },
  { id: 'perm_5', name: "Poção de Claridade", description: "Remove todos os debuffs negativos", icon: "✨", price: 80, category: "consumivel", is_consumable: true },
];

const ROTATING_MARKET_POOL = [
  // --- WEAPONS ---
  { name: "Faca de Caça", description: "+8 Dano. Boa para sobrevivência.", icon: "🔪", price: 250, category: "equipment", slot: "main_hand", damage: 8 },
  { name: "Espada Bastarda", description: "+18 Dano. Pesada mas letal.", icon: "⚔️", price: 650, category: "equipment", slot: "main_hand", damage: 18 },
  { name: "Adaga de Cristal", description: "+12 Dano, +10% Crítico. Brilha no escuro.", icon: "💎", price: 800, category: "equipment", slot: "main_hand", damage: 12, crit_chance: 0.10 },
  { name: "Cajado das Sombras", description: "+25% EXP em Estudos (Sombrio).", icon: "🌑", price: 1200, category: "equipment", slot: "main_hand", exp_bonus: 0.25, exp_category: "estudo" },
  { name: "Varinha de Teixo", description: "+12% EXP Geral. Foco mágico.", icon: "🪄", price: 750, category: "equipment", slot: "main_hand", exp_bonus: 0.12 },
  { name: "Arco Longo Élfico", description: "+25 Dano. Precisão mortal.", icon: "🏹", price: 1100, category: "equipment", slot: "main_hand", damage: 25 },
  { name: "Maça de Guerra", description: "+22 Dano. Esmaga obstáculos.", icon: "🔨", price: 700, category: "equipment", slot: "main_hand", damage: 22 },
  { name: "Lança Montada", description: "+30 Dano. Ataque perfurante.", icon: "🔱", price: 1400, category: "equipment", slot: "main_hand", damage: 30 },
  { name: "Grimório Antigo", description: "+30% EXP em Leitura.", icon: "📖", price: 900, category: "equipment", slot: "off_hand", exp_bonus: 0.30, exp_category: "leitura" },
  { name: "Escudo Torre", description: "+50 HP. Proteção total.", icon: "🛡️", price: 600, category: "equipment", slot: "off_hand", health_bonus: 50 },

  // --- ARMOR ---
  { name: "Elmo de Gladiador", description: "+35 HP. Intimidador.", icon: "💂", price: 550, category: "equipment", slot: "head", health_bonus: 35 },
  { name: "Coroa Real", description: "+15% Ouro ganho.", icon: "👑", price: 2000, category: "equipment", slot: "head", bonus_gold: 0.15 },
  { name: "Manto de Mago", description: "+15% EXP Geral. Tecido encantado.", icon: "👘", price: 1200, category: "equipment", slot: "body", exp_bonus: 0.15 },
  { name: "Cota de Malha", description: "+60 HP. Resistente e flexível.", icon: "👕", price: 800, category: "equipment", slot: "body", health_bonus: 60 },
  { name: "Armadura de Placas", description: "+100 HP. Tanque de guerra.", icon: "🥋", price: 1800, category: "equipment", slot: "body", health_bonus: 100 },
  { name: "Calças de Couro Batido", description: "+25 HP. Resistente a rasgos.", icon: "👖", price: 300, category: "equipment", slot: "legs", health_bonus: 25 },
  { name: "Grevas de Aço", description: "+40 HP. Proteção robusta.", icon: "🦵", price: 500, category: "equipment", slot: "legs", health_bonus: 40 },
  { name: "Botas Aladas", description: "+10% EXP em Saúde. Leve como o vento.", icon: "🧚", price: 900, category: "equipment", slot: "feet", exp_bonus: 0.10, exp_category: "saude" },
  { name: "Botas de Caminhada", description: "+20 HP. Conforto duradouro.", icon: "🥾", price: 250, category: "equipment", slot: "feet", health_bonus: 20 },

  // --- ACCESSORIES ---
  { name: "Anel da Sabedoria", description: "+8% EXP em Estudos.", icon: "💍", price: 600, category: "equipment", slot: "ring", exp_bonus: 0.08, exp_category: "estudo" },
  { name: "Anel da Vitalidade", description: "+50 HP.", icon: "🩸", price: 500, category: "equipment", slot: "ring", health_bonus: 50 },
  { name: "Colar de Pérolas", description: "+30% Ouro em Lazer.", icon: "📿", price: 800, category: "equipment", slot: "neck", bonus_gold: 0.30 },
  { name: "Talismã da Sorte", description: "+5% Crítico.", icon: "🍀", price: 1500, category: "equipment", slot: "neck", crit_chance: 0.05 },

  // --- CONSUMABLES & SCROLLS ---
  { name: "Elixir de Força", description: "+50 Dano no próximo Boss (1 uso).", icon: "💪", price: 200, category: "boost", max_uses: 1, current_uses: 1, is_consumable: true },
  { name: "Pergaminho Proibido", description: "+100% EXP (3 usos). Perigoso.", icon: "📜", price: 3000, category: "boost", bonus_exp: 1.0, max_uses: 3, current_uses: 3, is_consumable: true },
  { name: "Incenso Calmante", description: "Recupera 10 HP/min por 1h.", icon: "🕯️", price: 150, category: "boost", is_consumable: true },
];

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
        inventory: [],
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
        // Potions & Consumables
        { id: generateId(), name: "Poção Simples", description: "Restaura +50 HP", icon: "🧪", price: 100, category: "boost", health_gain: 50, times_purchased: 0, is_consumable: true, created_date: new Date().toISOString() },
        { id: generateId(), name: "Poção Mediana", description: "Restaura +150 HP", icon: "⚗️", price: 200, category: "boost", health_gain: 150, times_purchased: 0, is_consumable: true, created_date: new Date().toISOString() },
        { id: generateId(), name: "Poção Premium", description: "Restaura +500 HP", icon: "💎", price: 300, category: "boost", health_gain: 500, times_purchased: 0, is_consumable: true, created_date: new Date().toISOString() },
        { id: generateId(), name: "Recuperar Hábito Perdido", description: "Recupera um hábito esquecido de ontem", icon: "⏳", price: 50, category: "mercado_negro", times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Dia de Folga", description: "Um dia sem obrigações para relaxar", icon: "🏖️", price: 200, category: "recompensa", times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Jogo Novo", description: "Comprar aquele jogo que você queria", icon: "🎮", price: 300, category: "recompensa", times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Boost de EXP 2x", description: "Próximo hábito vale EXP em dobro", icon: "⚡", price: 100, category: "boost", times_purchased: 0, is_consumable: true, current_uses: 1, created_date: new Date().toISOString() },
        { id: generateId(), name: "Café Expresso", description: "+20% Dano Boss (3 usos)", icon: "☕", price: 50, category: "boost", max_uses: 3, current_uses: 3, is_consumable: true, created_date: new Date().toISOString() },
        { id: generateId(), name: "Poção de Claridade", description: "Remove todos os debuffs negativos", icon: "✨", price: 80, category: "consumivel", is_consumable: true, created_date: new Date().toISOString() },
        { id: generateId(), name: "Elixir de Vitalidade", description: "Restaura 300 HP e limpa Cansaço", icon: "🧪", price: 250, category: "boost", health_gain: 300, is_consumable: true, created_date: new Date().toISOString() },
        { id: generateId(), name: "Pergaminho do Aprendiz", description: "+15% EXP em Estudos (1 uso)", icon: "📜", price: 120, category: "boost", bonus_exp: 0.15, is_consumable: true, current_uses: 1, created_date: new Date().toISOString() },
        { id: generateId(), name: "Poção de Regeneração", description: "Regenera 10 HP por minuto (30 min)", icon: "🧪", price: 150, category: "boost", is_consumable: true, created_date: new Date().toISOString() },

        // WEAPONS (MainHand / OffHand)
        { id: generateId(), name: "Faca de Iniciante", description: "+5 Dano. Uma lâmina simples para começar.", icon: "🗡️", price: 150, category: "equipment", slot: "main_hand", damage: 5, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Espada Longa", description: "+15 Dano. Arma balanceada para guerreiros.", icon: "⚔️", price: 500, category: "equipment", slot: "main_hand", damage: 15, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Adaga Sombria", description: "+10 Dano, +5% Crítico.", icon: "🌑", price: 450, category: "equipment", slot: "main_hand", damage: 10, crit_chance: 0.05, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Cajado do Sábio", description: "+20% EXP em Estudo.", icon: "🔮", price: 800, category: "equipment", slot: "main_hand", exp_bonus: 0.20, exp_category: "estudo", times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Varinha Mágica", description: "+10% EXP Geral.", icon: "🪄", price: 600, category: "equipment", slot: "main_hand", exp_bonus: 0.10, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Arco do Caçador", description: "+12 Dano. Bom para alvos distantes.", icon: "🏹", price: 550, category: "equipment", slot: "main_hand", damage: 12, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Escudo de Madeira", description: "+10 HP.", icon: "🛡️", price: 200, category: "equipment", slot: "off_hand", health_bonus: 10, times_purchased: 0, created_date: new Date().toISOString() },

        // ARMOR (Head, Body, Legs, Feet)
        { id: generateId(), name: "Capacete de Ferro", description: "+20 HP.", icon: "🪖", price: 300, category: "equipment", slot: "head", health_bonus: 20, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Peitoral de Couro", description: "+30 HP.", icon: "🧥", price: 400, category: "equipment", slot: "body", health_bonus: 30, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Armadura da Resiliência", description: "Reduz penalidades de hábitos ruins em 20%.", icon: "🛡️", price: 1000, category: "equipment", slot: "body", reduction_penalty: 0.2, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Calças de Tecido", description: "+10 HP. Leves e confortáveis.", icon: "👖", price: 150, category: "equipment", slot: "legs", health_bonus: 10, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Botas de Velocidade", description: "+5% EXP em Esportes.", icon: "👢", price: 350, category: "equipment", slot: "feet", exp_bonus: 0.05, exp_category: "saude", times_purchased: 0, created_date: new Date().toISOString() },

        // ACCESSORIES (Finger, Neck)
        { id: generateId(), name: "Anel do Foco", description: "+10% EXP em todos os hábitos.", icon: "💍", price: 1500, category: "equipment", slot: "ring", bonus_exp: 0.1, times_purchased: 0, created_date: new Date().toISOString() },
        { id: generateId(), name: "Amuleto da Riqueza", description: "+10% Ouro em todos os hábitos.", icon: "🧿", price: 1200, category: "equipment", slot: "neck", bonus_gold: 0.1, times_purchased: 0, created_date: new Date().toISOString() },
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
  updateCharacter: async (updates: any) => {
    // We use the centralized characterService for leveling logic
    const updated = characterService.updateCharacter(updates);
    return updated;
  },
  getInventory: async () => {
    const character = await storage.getCharacter();
    return character?.inventory || [];
  },
  toggleEquip: async (itemId: string) => {
    const character = await storage.getCharacter();
    const inventory = [...(character.inventory || [])];
    const targetItemIndex = inventory.findIndex((i: any) => i.id === itemId);

    if (targetItemIndex === -1) return character;

    const targetItem = inventory[targetItemIndex];
    const isEquipping = !targetItem.is_equipped;

    // If equipping, check for slot conflicts
    if (isEquipping && targetItem.slot) {
      // Unequip any other item in the same slot
      inventory.forEach((item, index) => {
        if (item.is_equipped && item.slot === targetItem.slot && item.id !== itemId) {
          inventory[index] = { ...item, is_equipped: false };
        }
      });
    }

    // Toggle the target item
    inventory[targetItemIndex] = { ...targetItem, is_equipped: isEquipping };

    return storage.updateCharacter({ inventory });
  },
  useItem: async (itemId: string) => {
    const character = await storage.getCharacter();
    let inventory = [...(character.inventory || [])];
    const itemIndex = inventory.findIndex((i: any) => i.id === itemId);
    if (itemIndex === -1) return character;

    const item = inventory[itemIndex];
    let updates: any = {};

    // Handle health recovery items
    if (item.health_gain) {
      updates.health = Math.min((character.health || 0) + item.health_gain, character.max_health || 1000);
    }

    // Handle status cure items
    if (item.name === 'Poção de Claridade' || item.name === 'Elixir de Vitalidade') {
      updates.active_debuffs = [];
    }

    // Handle temporary buffs from consumables
    if (item.category === 'boost' || item.is_consumable) {
      const buffs = [...(character.active_buffs || [])];

      let buffType: any = null;
      if (item.name === 'Café Expresso') buffType = 'boss_damage';
      if (item.name === 'Pergaminho do Aprendiz') buffType = 'exp_boost';
      if (item.name.includes('EXP 2x')) buffType = 'exp_boost';
      if (item.name === 'Poção de Regeneração') buffType = 'health_regen';

      if (buffType) {
        buffs.push({
          id: `${item.id}_buff_${Date.now()}`,
          name: item.name,
          type: buffType,
          description: item.description,
          icon: item.icon,
          duration_minutes: item.name === 'Poção de Regeneração' ? 30 : 60, // 30 min for regen
          start_time: new Date().toISOString()
        });
        updates.active_buffs = buffs;
      }
    }

    if (item.is_consumable || item.max_uses) {
      const currentUses = (item.current_uses || 1) - 1;
      if (currentUses <= 0) {
        inventory.splice(itemIndex, 1);
      } else {
        inventory[itemIndex] = { ...item, current_uses: currentUses };
      }
      updates.inventory = inventory;
    }

    return storage.updateCharacter(updates);
  },
  addDebuff: async (debuff: any) => {
    const character = await storage.getCharacter();
    const debuffs = [...(character.active_debuffs || []), debuff];
    return storage.updateCharacter({ active_debuffs: debuffs });
  },
  removeDebuff: async (debuffId: string) => {
    const character = await storage.getCharacter();
    const debuffs = (character.active_debuffs || []).filter((d: any) => d.id !== debuffId);
    return storage.updateCharacter({ active_debuffs: debuffs });
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
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastUpdate = localStorage.getItem('levelup_shop_date');
    let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKET_ITEMS) || '[]');

    if (lastUpdate !== today || items.length === 0) {
      // GENERATE DAILY SHOP
      const dailySelection = [];
      const pool = [...ROTATING_MARKET_POOL];

      // Select 6 random items from pool
      for (let i = 0; i < 6; i++) {
        if (pool.length === 0) break;
        const randomIndex = Math.floor(Math.random() * pool.length);
        const item = pool.splice(randomIndex, 1)[0];
        dailySelection.push({
          ...item,
          id: generateId(),
          created_date: new Date().toISOString()
        });
      }

      // Add permanent items
      const permanentItems = PERMANENT_MARKET_ITEMS.map(item => ({
        ...item,
        id: generateId(),
        created_date: new Date().toISOString()
      }));

      items = [...permanentItems, ...dailySelection];
      localStorage.setItem(STORAGE_KEYS.MARKET_ITEMS, JSON.stringify(items));
      localStorage.setItem('levelup_shop_date', today);
    }

    return items;
  },

  addMarketItem: async (item) => {
    const items = await storage.getMarketItems();
    const newItem = { ...item, id: generateId(), created_date: new Date().toISOString() };
    items.push(newItem);
    localStorage.setItem(STORAGE_KEYS.MARKET_ITEMS, JSON.stringify(items));
    return newItem;
  },

  // ... (rest of methods)

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

  getActivityLogs: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
    const logs = data ? JSON.parse(data) : [];
    return logs.sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
  },
  addActivityLog: async (log: any) => {
    const logs = await storage.getActivityLogs();
    const newLog = { ...log, id: generateId(), timestamp: new Date().toISOString() };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(logs.slice(0, 100)));
    return newLog;
  },

  // Daily Boss Logic
  getDailyBoss: async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_BOSS);
    let boss = data ? JSON.parse(data) : null;

    if (!boss || boss.last_update !== today) {
      // Create new boss for the day
      const randomBoss = POTENTIAL_BOSSES[Math.floor(Math.random() * POTENTIAL_BOSSES.length)];
      boss = {
        id: generateId(),
        name: randomBoss.name,
        image: randomBoss.image,
        health: randomBoss.max_health,
        max_health: randomBoss.max_health,
        status: 'alive',
        last_update: today,
        base_gold_reward: randomBoss.reward_gold,
        base_exp_reward: randomBoss.reward_exp,
      };
      localStorage.setItem(STORAGE_KEYS.DAILY_BOSS, JSON.stringify(boss));
    }
    return boss;
  },
  updateDailyBoss: async (updates: any) => {
    const current = await storage.getDailyBoss();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.DAILY_BOSS, JSON.stringify(updated));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('levelup_data_update'));
    return updated;
  },

  getDailyChecks: async (date?: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_CHECKS);
    const checks = data ? JSON.parse(data) : [];
    return date ? checks.filter((c: any) => c.date === date) : checks;
  },
  getMissedHabitsYesterday: async () => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const goodHabits: any[] = await storage.getGoodHabits();
    const dailyHabits = goodHabits.filter(h => h.is_daily);
    const checksYesterday = await storage.getDailyChecks(yesterday);

    return dailyHabits.filter(habit => {
      // Check if habit existed yesterday
      const habitCreated = new Date(habit.created_date);
      if (habitCreated > new Date(yesterday + 'T23:59:59')) return false;

      // Check if it was NOT completed
      const completed = checksYesterday.find((c: any) => c.habit_id === habit.id && c.completed);
      return !completed;
    });
  },
  addDailyCheck: async (check: any) => {
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

    if (lastProcessed === today) return null;

    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    if (!lastProcessed) {
      localStorage.setItem(STORAGE_KEYS.LAST_PROCESSED_LOGIN, today);
      return null;
    }

    const goodHabits: any[] = await storage.getGoodHabits();
    const dailyHabits = goodHabits.filter(h => h.is_daily);
    const checksYesterday = await storage.getDailyChecks(yesterday);
    const character = await storage.getCharacter();
    const difficulty = character?.difficulty || 1;
    const penaltyMultiplier = 1 + ((difficulty - 1) * 0.5);

    const missedHabits: any[] = [];
    let totalHealthPenalty = 0;
    let totalXpPenalty = 0;

    dailyHabits.forEach(habit => {
      const habitCreated = new Date(habit.created_date);
      if (habitCreated > new Date(yesterday + 'T23:59:59')) return;

      const completed = checksYesterday.find((c: any) => c.habit_id === habit.id && c.completed);
      if (!completed) {
        missedHabits.push(habit);
        totalHealthPenalty += Math.floor(50 * penaltyMultiplier);
        totalXpPenalty += Math.floor(20 * penaltyMultiplier);
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

    localStorage.setItem(STORAGE_KEYS.LAST_PROCESSED_LOGIN, today);
    return { missedHabits, totalHealthPenalty, totalXpPenalty, isDead };
  },
  resetGame: async () => {
    const character = await storage.getCharacter();
    const currentDifficulty = character.difficulty || 1;
    const newDifficulty = currentDifficulty + 1;
    const newCharacter = {
      ...character,
      level: 1,
      current_exp: 0,
      total_exp: 0,
      health: 1000,
      max_health: 1000,
      gold: 0,
      inventory: [], // Clear inventory
      active_buffs: [], // Clear buffs
      active_debuffs: [], // Clear debuffs
      difficulty: newDifficulty,
      reset_count: (character.reset_count || 0) + 1,
      last_reset_date: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(newCharacter));

    // Reset good habits streaks
    const goodHabits = await storage.getGoodHabits();
    const resetHabits = goodHabits.map((h: any) => ({ ...h, streak: 0, best_streak: 0 }));
    localStorage.setItem(STORAGE_KEYS.GOOD_HABITS, JSON.stringify(resetHabits));

    // Reset bad habits
    const badHabits = await storage.getBadHabits();
    const resetBadHabits = badHabits.map((h: any) => ({
      ...h,
      days_clean: 0,
      total_falls: 0,
      monthly_falls: 0
    }));
    localStorage.setItem(STORAGE_KEYS.BAD_HABITS, JSON.stringify(resetBadHabits));

    // Reset skills to level 1
    const skills = await storage.getSkills();
    console.log('Resetting skills:', skills.length);
    const resetSkills = skills.map((s: any) => ({
      ...s,
      current_exp: 0,
      level: 1
    }));
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(resetSkills));
    console.log('Skills reset complete');

    // Reset objectives progress
    const objectives = await storage.getObjectives();
    console.log('Resetting objectives:', objectives.length);
    const resetObjectives = objectives.map((o: any) => ({
      ...o,
      progress: 0,
      status: 'ativo' // Reset ALL objectives to active
    }));
    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(resetObjectives));
    console.log('Objectives reset complete');

    // Clear all daily checks
    localStorage.setItem(STORAGE_KEYS.DAILY_CHECKS, JSON.stringify([]));

    // Reset daily boss (will generate new one on next load)
    localStorage.removeItem(STORAGE_KEYS.DAILY_BOSS);

    // Clear activity logs (keep only the reset message)
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify([]));

    // Add reset activity log
    await storage.addActivityLog({
      activity: `🔄 RENASCIMENTO: Dificuldade Aumentada para ${newDifficulty}`,
      type: 'system',
      exp_change: 0,
      gold_change: 0,
    });

    return newCharacter;
  },
};
