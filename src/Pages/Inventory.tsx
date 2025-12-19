import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Shield, Zap, Sword, Info, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { storage } from '@/components/storage/LocalStorage';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function Inventory() {
    const [character, setCharacter] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        const [char, inv] = await Promise.all([
            storage.getCharacter(),
            storage.getInventory(),
        ]);
        setCharacter(char);
        setInventory(inv);
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
        toast.success('Equipamento alterado!');
        loadData();
    };

    const handleUseItem = async (item: any) => {
        await storage.useItem(item.id);
        toast.success(`${item.name} utilizado!`);
        loadData();
    };

    if (loading) return null;

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
                        <h1 className="text-2xl font-bold text-white">Inventário</h1>
                        <p className="text-slate-400 text-sm">Gerencie seus itens e equipamentos</p>
                    </div>
                </div>

                {/* Active Debuffs Section */}
                {character?.active_debuffs && character.active_debuffs.length > 0 && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                        <h2 className="text-red-400 text-xs font-black uppercase tracking-widest mb-3">Status Negativos</h2>
                        <div className="flex flex-wrap gap-3">
                            {character.active_debuffs.map((debuff: any) => (
                                <div key={debuff.id} className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-red-500/20">
                                    <span className="text-xl">{debuff.icon}</span>
                                    <div>
                                        <p className="text-xs font-bold text-white">{debuff.name}</p>
                                        <p className="text-[10px] text-red-400">{debuff.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {inventory.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={cn(
                                    "relative p-4 rounded-2xl border transition-all duration-300",
                                    item.is_equipped
                                        ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                        : "bg-slate-900 border-slate-800"
                                )}
                            >
                                {item.is_equipped && (
                                    <div className="absolute top-3 right-3 bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                        Equipado
                                    </div>
                                )}

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-tight">{item.name}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mt-1">
                                            {item.category}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 mb-4 h-8 line-clamp-2">
                                    {item.description}
                                </p>

                                {/* Stats / Durability */}
                                <div className="flex items-center gap-4 mb-6 text-[10px] font-bold text-slate-500">
                                    {item.max_uses && (
                                        <div className="flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            USOS: {item.current_uses}/{item.max_uses}
                                        </div>
                                    )}
                                    {item.bonus_exp && (
                                        <div className="flex items-center gap-1 text-green-400">
                                            <Zap className="w-3 h-3" />
                                            +{item.bonus_exp * 100}% EXP
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {(item.category === 'especial' || item.category === 'cosmetic') && (
                                        <Button
                                            onClick={() => handleToggleEquip(item.id)}
                                            className={cn(
                                                "flex-1 text-xs font-bold",
                                                item.is_equipped
                                                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                                                    : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                                            )}
                                        >
                                            {item.is_equipped ? 'Desequipar' : 'Equipar'}
                                        </Button>
                                    )}
                                    {item.is_consumable && (
                                        <Button
                                            onClick={() => handleUseItem(item)}
                                            className="flex-1 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold"
                                        >
                                            Usar Item
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {inventory.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
                            <Package className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                            <p className="text-slate-500">Seu inventário está vazio</p>
                            <Link to={createPageUrl('Market')}>
                                <Button variant="ghost" className="text-cyan-400 text-xs">Visitar o Mercado</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
