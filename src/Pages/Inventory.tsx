import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Shield, Zap, Sword, Info, Trash2, Shirt, Footprints, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { storage } from '@/components/storage/LocalStorage';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const SLOTS = [
    { id: 'head', label: 'Cabeça', icon: <Crown className="w-6 h-6" /> },
    { id: 'neck', label: 'Pescoço', icon: <div className="w-6 h-6 text-xs flex items-center justify-center border rounded-full">NK</div> },
    { id: 'body', label: 'Corpo', icon: <Shirt className="w-6 h-6" /> },
    { id: 'main_hand', label: 'Mão Principal', icon: <Sword className="w-6 h-6" /> },
    { id: 'off_hand', label: 'Mão Secund.', icon: <Shield className="w-6 h-6" /> },
    { id: 'legs', label: 'Pernas', icon: <div className="w-6 h-6 text-xs flex items-center justify-center border rounded-md">LG</div> },
    { id: 'feet', label: 'Pés', icon: <Footprints className="w-6 h-6" /> },
    { id: 'ring', label: 'Anel', icon: <div className="w-6 h-6 text-xs flex items-center justify-center border rounded-full">RG</div> },
];

export default function Inventory() {
    const [character, setCharacter] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        const [char] = await Promise.all([
            storage.getCharacter(),
        ]);
        setCharacter(char);
        // Sort inventory: Equipped items first, then by category
        const sortedInv = (char?.inventory || []).sort((a: any, b: any) => {
            if (a.is_equipped === b.is_equipped) return 0;
            return a.is_equipped ? -1 : 1;
        });
        setInventory(sortedInv);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        const handleUpdate = () => loadData();
        window.addEventListener('levelup_data_update', handleUpdate);
        return () => window.removeEventListener('levelup_data_update', handleUpdate);
    }, []);

    const handleToggleEquip = async (itemId: string) => {
        await storage.toggleEquip(itemId);
        toast.success('Equipamento atualizado!');
        loadData();
    };

    const handleUseItem = async (item: any) => {
        await storage.useItem(item.id);
        toast.success(`${item.name} utilizado!`);
        loadData();
    };

    const handleDiscard = async (item: any) => {
        // Implement discard logic if needed
        toast.info("Descarte ainda não implementado.");
    };

    if (loading) return null;

    const equippedItems = inventory.filter(i => i.is_equipped);
    const backpackItems = inventory.filter(i => !i.is_equipped);

    const getEquippedInSlot = (slotId: string) => {
        return equippedItems.find(i => i.slot === slotId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Personagem</h1>
                        <p className="text-slate-400 text-sm">Nível {character?.level} • {character?.difficulty ? `Dificuldade ${character.difficulty}` : 'Iniciante'}</p>
                    </div>
                </div>

                {/* Equipment Slots Grid */}
                <div className="mb-12">
                    <h2 className="text-slate-300 font-bold mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" /> Equipamento
                    </h2>
                    <div className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-4 max-w-lg mx-auto">
                        {SLOTS.map((slot) => {
                            const item = getEquippedInSlot(slot.id);
                            return (
                                <div key={slot.id} className="aspect-square relative">
                                    <div className={cn(
                                        "w-full h-full rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all",
                                        item
                                            ? "bg-slate-800 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                            : "bg-slate-900/50 border-slate-800 border-dashed"
                                    )}>
                                        {item ? (
                                            <div className="text-center w-full">
                                                <div className="text-2xl mb-1">{item.icon}</div>
                                                <div className="text-[9px] font-bold text-cyan-300 truncate w-full px-1">{item.name}</div>
                                                <button
                                                    onClick={() => handleToggleEquip(item.id)}
                                                    className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 bg-black/60 flex items-center justify-center text-xs font-bold text-white transition-opacity rounded-xl"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-slate-700 flex flex-col items-center">
                                                {slot.icon}
                                                <span className="text-[9px] uppercase font-bold mt-1 opacity-50">{slot.label}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Active Buffs (from items) */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {equippedItems.map((item) => (
                        <div key={item.id} className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                            <span>{item.icon}</span>
                            <span className="text-xs text-slate-300">{item.description}</span>
                        </div>
                    ))}
                </div>

                {/* Backpack / Inventory List */}
                <div>
                    <h2 className="text-slate-300 font-bold mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-400" /> Mochila ({backpackItems.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <AnimatePresence>
                            {backpackItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-xl border border-slate-800">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-200 text-sm truncate">{item.name}</h3>
                                        <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                                        <div className="flex gap-2 mt-1">
                                            {item.health_gain && <span className="text-[9px] bg-red-500/10 text-red-400 px-1 rounded">+{item.health_gain} HP</span>}
                                            {item.damage && <span className="text-[9px] bg-orange-500/10 text-orange-400 px-1 rounded">+{item.damage} ATK</span>}
                                            {item.bonus_exp && <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-1 rounded">+{Math.round(item.bonus_exp * 100)}% EXP</span>}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(item.category === 'equipment' || item.category === 'especial' || item.category === 'cosmetic') && (
                                            <Button
                                                onClick={() => handleToggleEquip(item.id)}
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 text-xs bg-slate-800 hover:bg-cyan-900 hover:text-cyan-400"
                                            >
                                                Equipar
                                            </Button>
                                        )}
                                        {item.is_consumable && (
                                            <Button
                                                onClick={() => handleUseItem(item)}
                                                size="sm"
                                                className="h-8 text-xs bg-purple-600 hover:bg-purple-500"
                                            >
                                                Usar
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {backpackItems.length === 0 && (
                            <div className="col-span-full py-8 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                                Sua mochila está vazia.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
