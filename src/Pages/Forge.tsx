import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Hammer, Sparkles, Diamond } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { storage } from '@/components/storage/LocalStorage';
import { characterService } from '@/services/characterService';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { MarketItem, Character } from '@/types';

const RECIPES = [
    {
        id: 'legendary_blade',
        name: 'Lâmina do Destino',
        icon: '⚔️',
        cost: 15,
        base_item: 'Espada Básica',
        stats: { damage: 150, crit_chance: 0.2, bonus_exp: 0.2 },
        description: 'Uma arma forjada com pura disciplina.'
    },
    {
        id: 'sage_amulet',
        name: 'Amuleto da Sabedoria',
        icon: '📿',
        cost: 10,
        base_item: 'Amuleto Comum',
        stats: { bonus_exp: 0.5, bonus_gold: 0.1 },
        description: 'Aumenta drasticamente o ganho de XP.'
    },
    {
        id: 'titan_armor',
        name: 'Armadura de Titã',
        icon: '🛡️',
        cost: 20,
        base_item: 'Cota de Malha',
        stats: { defense: 80, health_gain: 300 },
        description: 'A defesa absoluta contra a procrastinação.'
    }
];

export default function Forge() {
    const [character, setCharacter] = useState<Character | null>(null);
    const [fragments, setFragments] = useState(0);

    useEffect(() => {
        const char = characterService.getCharacter();
        if (char) {
            setCharacter(char);
            setFragments(char.discipline_fragments || 0);
        }
    }, []);

    const handleCraft = async (recipe: typeof RECIPES[0]) => {
        if (fragments < recipe.cost) {
            toast.error('Fragmentos insuficientes!');
            return;
        }

        // Logic for crafting
        const newItem: MarketItem = {
            id: `crafted_${Date.now()}`,
            name: recipe.name,
            description: recipe.description,
            icon: recipe.icon,
            price: 0,
            category: 'equipment',
            is_equipped: false,
            ...recipe.stats
        } as any;

        const updatedFragments = fragments - recipe.cost;
        const currentInventory = character?.inventory || [];

        await storage.updateCharacter({
            discipline_fragments: updatedFragments,
            inventory: [...currentInventory, newItem]
        });

        setFragments(updatedFragments);
        toast.success(`${recipe.name} forjado com sucesso!`, { icon: '🔨' });
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" className="text-slate-400">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 shadow-inner">
                        <Diamond className="w-4 h-4 text-cyan-400" />
                        <span className="text-white font-black">{fragments} FRAGMENTOS</span>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="inline-block p-4 bg-cyan-500/10 rounded-full mb-4"
                    >
                        <Hammer className="w-12 h-12 text-cyan-500" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">A Forja da Disciplina</h1>
                    <p className="text-slate-400">Transmute seus fragmentos de streak em equipamentos lendários.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {RECIPES.map((recipe) => (
                        <div key={recipe.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="w-16 h-16 text-cyan-500" />
                            </div>

                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-slate-700/50">
                                {recipe.icon}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white">{recipe.name}</h3>
                                <p className="text-xs text-slate-500 mt-1">{recipe.description}</p>
                            </div>

                            <div className="bg-slate-950 rounded-xl p-3 space-y-2">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Atributos</div>
                                <div className="text-xs text-cyan-400 font-bold">
                                    {recipe.stats.damage && `+${recipe.stats.damage} Dano `}
                                    {recipe.stats.defense && `+${recipe.stats.defense} Defesa `}
                                    {recipe.stats.bonus_exp && `+${recipe.stats.bonus_exp * 100}% XP `}
                                    {recipe.stats.bonus_gold && `+${recipe.stats.bonus_gold * 100}% Ouro `}
                                </div>
                            </div>

                            <Button
                                onClick={() => handleCraft(recipe)}
                                className={cn(
                                    "w-full mt-auto py-6 font-black uppercase tracking-widest",
                                    fragments >= recipe.cost ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "bg-slate-800 text-slate-600 cursor-not-allowed"
                                )}
                            >
                                Forjar ({recipe.cost} <Diamond className="w-3 h-3 mx-1" />)
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
