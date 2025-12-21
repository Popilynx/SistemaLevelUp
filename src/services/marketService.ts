import { storage } from '@/components/storage/LocalStorage';
import { Item } from '@/types/gameTypes';
import { format } from 'date-fns';

const STORAGE_KEYS = {
    MARKET_ITEMS: 'levelup_market_items',
    SHOP_DATE: 'levelup_shop_date'
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- RPG CLASS & ITEM DEFINITIONS ---
const RPG_CLASSES = ['Guerreiro', 'Mago', 'Arqueiro', 'Ladino', 'Sacerdote', 'Bárbaro'];

const PERMANENT_ITEMS = [
    { name: "Poção Simples", description: "Restaura +50 HP", icon: "🧪", price: 100, category: "boost", health_gain: 50, is_consumable: true },
    { name: "Poção Mediana", description: "Restaura +150 HP", icon: "⚗️", price: 200, category: "boost", health_gain: 150, is_consumable: true },
    { name: "Recuperar Hábito Perdido", description: "Recupera um hábito esquecido de ontem", icon: "⏳", price: 50, category: "mercado_negro" },
    { name: "Dia de Folga", description: "Um dia sem obrigações para relaxar", icon: "🏖️", price: 200, category: "recompensa" },
    { name: "Poção de Claridade", description: "Remove todos os debuffs negativos", icon: "✨", price: 80, category: "consumivel", is_consumable: true },
];

const ITEM_POOL = [
    // --- GUERREIRO (Warrior) ---
    { name: "Espada Longa de Aço", description: "+15 Dano. Confiável e letal.", icon: "⚔️", price: 500, category: "equipment", slot: "main_hand", damage: 15, class: "Guerreiro" },
    { name: "Escudo do Defensor", description: "+80 HP. Bloqueia o medo.", icon: "🛡️", price: 600, category: "equipment", slot: "off_hand", health_bonus: 80, class: "Guerreiro" },
    { name: "Elmo de Batalha", description: "+40 HP. Visão tática.", icon: "🪖", price: 450, category: "equipment", slot: "head", health_bonus: 40, class: "Guerreiro" },
    { name: "Peitoral de Placas", description: "+120 HP. Imparável.", icon: "🦾", price: 1500, category: "equipment", slot: "body", health_bonus: 120, class: "Guerreiro" },
    { name: "Manoplas de Ferro", description: "+5 Dano. Punhos de aço.", icon: "🥊", price: 300, category: "equipment", slot: "main_hand", damage: 5, class: "Guerreiro" },

    // --- MAGO (Mage) ---
    { name: "Cajado Arcano", description: "+25% EXP Estudo.", icon: "🔮", price: 800, category: "equipment", slot: "main_hand", exp_bonus: 0.25, exp_category: "estudo", class: "Mago" },
    { name: "Manto Estelar", description: "+15% EXP Geral.", icon: "🌌", price: 1200, category: "equipment", slot: "body", exp_bonus: 0.15, class: "Mago" },
    { name: "Grimório do Saber", description: "+20% EXP Leitura.", icon: "📖", price: 700, category: "equipment", slot: "off_hand", exp_bonus: 0.20, exp_category: "leitura", class: "Mago" },
    { name: "Diadema da Inteligência", description: "+10% Ouro ganho.", icon: "👑", price: 600, category: "equipment", slot: "head", bonus_gold: 0.10, class: "Mago" },
    { name: "Anel de Mana", description: "Regenera foco (+10 HP).", icon: "💍", price: 400, category: "equipment", slot: "ring", health_bonus: 10, class: "Mago" },

    // --- ARQUEIRO (Ranger) ---
    { name: "Arco Recurvo", description: "+18 Dano. Ataque rápido.", icon: "🏹", price: 700, category: "equipment", slot: "main_hand", damage: 18, class: "Arqueiro" },
    { name: "Aljava de Alta Capacidade", description: "+10% Crítico.", icon: "🎯", price: 500, category: "equipment", slot: "off_hand", crit_chance: 0.10, class: "Arqueiro" },
    { name: "Botas de Caçador", description: "+10% EXP Saúde.", icon: "👢", price: 450, category: "equipment", slot: "feet", exp_bonus: 0.10, exp_category: "saude", class: "Arqueiro" },
    { name: "Capa de Camuflagem", description: "Reduz queda de hábitos em 10%.", icon: "🍃", price: 900, category: "equipment", slot: "body", reduction_penalty: 0.10, class: "Arqueiro" },

    // --- LADINO (Rogue) ---
    { name: "Adagas Gêmeas", description: "+12 Dano, +15% Crítico.", icon: "🗡️", price: 850, category: "equipment", slot: "main_hand", damage: 12, crit_chance: 0.15, class: "Ladino" },
    { name: "Capa da Sombra", description: "+20% Ouro ganho (Roubo hábil).", icon: "🌑", price: 1100, category: "equipment", slot: "body", bonus_gold: 0.20, class: "Ladino" },
    { name: "Luvas de Gatuno", description: "+10% Ouro.", icon: "🧤", price: 400, category: "equipment", slot: "hands", bonus_gold: 0.10, class: "Ladino" },
    { name: "Máscara Silenciosa", description: "Reduz penalidade de falha em 20%.", icon: "🎭", price: 600, category: "equipment", slot: "head", reduction_penalty: 0.20, class: "Ladino" },

    // --- BÁRBARO (Barbarian) ---
    { name: "Machado de Duas Mãos", description: "+30 Dano. Brutal.", icon: "🪓", price: 1000, category: "equipment", slot: "main_hand", damage: 30, class: "Bárbaro" },
    { name: "Pele de Lobo", description: "+150 HP. Selvagem.", icon: "🐺", price: 800, category: "equipment", slot: "body", health_bonus: 150, class: "Bárbaro" },
    { name: "Braceletes de Força", description: "+5 Dano.", icon: "🧱", price: 300, category: "equipment", slot: "hands", damage: 5, class: "Bárbaro" },
    { name: "Cinto de Campeão", description: "+100 HP.", icon: "🥋", price: 700, category: "equipment", slot: "legs", health_bonus: 100, class: "Bárbaro" },

    // --- SACERDOTE (Priest) ---
    { name: "Martelo da Justiça", description: "+10 Dano, +50 HP.", icon: "🔨", price: 600, category: "equipment", slot: "main_hand", damage: 10, health_bonus: 50, class: "Sacerdote" },
    { name: "Túnica Sagrada", description: "Imune a 30% das penalidades.", icon: "⛪", price: 1300, category: "equipment", slot: "body", reduction_penalty: 0.30, class: "Sacerdote" },
    { name: "Amuleto da Vida", description: "Regenera muito HP (+200 Max HP).", icon: "✝️", price: 900, category: "equipment", slot: "neck", health_bonus: 200, class: "Sacerdote" },

    // --- SPECIAL & RARE ---
    { name: "Anel do Infinito", description: "+50% EXP em TUDO (Lendário).", icon: "♾️", price: 5000, category: "especial", slot: "ring", exp_bonus: 0.50, class: "Lendário" },
    { name: "Espada do Admin", description: "+999 Dano (Debug). Brincadeira, +50 Dano.", icon: "💻", price: 3000, category: "especial", slot: "main_hand", damage: 50, class: "Lendário" },
];

export const marketService = {
    getMarketItems: (): any[] => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const lastUpdate = localStorage.getItem(STORAGE_KEYS.SHOP_DATE);
        let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKET_ITEMS) || '[]');

        if (lastUpdate !== today || items.length === 0 || items.length < 5) {
            // New Day or Empty Shop: Generate Rotation
            return marketService.refreshShop();
        }

        return items;
    },

    refreshShop: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const dailySelection: any[] = [];
        const pool = [...ITEM_POOL];

        // 1. Pick 1 Permanent from each category logic? No, add all permanents.
        const permanents = PERMANENT_ITEMS.map(i => ({
            ...i,
            id: generateId(),
            created_date: new Date().toISOString()
        }));

        // 2. Pick 8 Random Items from Rotation Pool
        // Shuffle Pool
        pool.sort(() => Math.random() - 0.5);

        // Enhance randomization: guarantee at least one item of a few classes
        const selectedPool = pool.slice(0, 8).map(i => ({
            ...i,
            id: generateId(),
            created_date: new Date().toISOString()
        }));

        const finalItems = [...permanents, ...selectedPool];

        localStorage.setItem(STORAGE_KEYS.MARKET_ITEMS, JSON.stringify(finalItems));
        localStorage.setItem(STORAGE_KEYS.SHOP_DATE, today);
        return finalItems;
    },

    // Bridge to LocalStorage logic for updating items (purchasing)
    updateItem: (id: string, updates: any) => {
        const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKET_ITEMS) || '[]');
        const index = items.findIndex((i: any) => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.MARKET_ITEMS, JSON.stringify(items));
        }
    },

    getTimeUntilReset: () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const diff = tomorrow.getTime() - now.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { hours, minutes, seconds };
    }
};
