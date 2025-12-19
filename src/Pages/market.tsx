import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, Trash2, Coins, Package } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MarketItemCard from '@/components/market/MarketItemCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { storage } from '@/components/storage/LocalStorage';
import { toast } from "sonner";

export default function Market() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [marketItems, setMarketItems] = useState<any[]>([]);
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [missedHabits, setMissedHabits] = useState<any[]>([]);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    icon: '🎁',
    price: 50,
    category: 'recompensa',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [items, char] = await Promise.all([
      storage.getMarketItems(),
      storage.getCharacter(),
    ]);
    setMarketItems(items);
    setCharacter(char);
    setLoading(false);
  };

  const handleCreateItem = async (item: any) => {
    try {
      await storage.addMarketItem(item);
      toast.success('Item criado!');
      setIsDialogOpen(false);
      setNewItem({ name: '', description: '', icon: '🎁', price: 50, category: 'recompensa' });
      await loadData();
    } catch (error) {
      toast.error('Erro ao criar item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await storage.deleteMarketItem(id);
      toast.success('Item removido!');
      await loadData();
    } catch (error) {
      toast.error('Erro ao remover item');
    }
  };

  const handlePurchase = async (item: any) => {
    if (!character || character.gold < item.price) {
      toast.error('Moedas insuficientes!');
      return;
    }

    try {
      if (item.category === 'mercado_negro' && item.name === 'Recuperar Hábito Perdido') {
        const missed = await storage.getMissedHabitsYesterday();
        if (missed.length === 0) {
          toast.info('Não há hábitos pendentes de ontem para recuperar!');
          return;
        }
        setMissedHabits(missed);
        setIsRecoveryOpen(true);
        return; // Wait for selection
      }

      await executePurchase(item);
    } catch (error) {
      toast.error('Erro ao processar compra');
    }
  };

  const executePurchase = async (item: any) => {
    const updatedChar = { ...character, gold: character.gold - item.price };

    // --- INVENTORY & EQUIPMENT LOGIC ---
    const isPermanent = item.category === 'especial' || item.category === 'cosmetic';
    const isConsumable = item.category === 'boost' || item.category === 'consumivel' || item.is_consumable;

    const needsInventory = isPermanent || isConsumable;

    if (needsInventory) {
      const inventory = [...(updatedChar.inventory || [])];

      // Check for duplicates of permanent items
      if (isPermanent && inventory.find((i: any) => i.name === item.name)) {
        toast.error('Você já possui este item permanente!');
        return;
      }

      const newItemEntry = {
        ...item,
        id: `${item.id}_${Date.now()}`, // unique instance ID for inventory
        is_equipped: isPermanent,
        current_uses: item.current_uses ?? (isConsumable ? 1 : undefined)
      };

      updatedChar.inventory = [...inventory, newItemEntry];

      if (newItemEntry.is_equipped) {
        toast.success(`${item.name} adquirido e equipado!`);
      } else {
        toast.success(`${item.name} adicionado ao inventário!`);
      }
    } else {
      // Direct effect items (like health potions if they weren't in inventory)
      if (item.health_gain) {
        updatedChar.health = Math.min(updatedChar.health + item.health_gain, updatedChar.max_health);
      }
      toast.success(`${item.name} usado com sucesso!`);
    }

    await storage.updateCharacter(updatedChar);

    await storage.updateMarketItem(item.id, {
      ...item,
      times_purchased: (item.times_purchased || 0) + 1,
    });

    await storage.addActivityLog({
      activity: `Comprou: ${item.name}`,
      type: 'market_purchase',
      gold_change: -item.price,
      health_change: (!needsInventory && item.health_gain) ? item.health_gain : 0,
    });

    await loadData();
  };

  const handleRecoverHabit = async (habit: any) => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    try {
      // 1. Add Daily Check for yesterday
      await storage.addDailyCheck({
        habit_id: habit.id,
        habit_type: 'good',
        date: yesterday,
        completed: true,
      });

      // 2. Re-apply rewards (EXP and Gold)
      const expGain = habit.exp_reward || 10;
      const goldGain = habit.gold_reward || 5;

      // Calculate new level if needed
      const currentExp = (character.current_exp || 0) + expGain;
      const expForNextLevel = (character.level || 1) * 500;
      let newLevel = character.level || 1;
      let remainingExp = currentExp;

      if (currentExp >= expForNextLevel) {
        newLevel += 1;
        remainingExp = currentExp - expForNextLevel;
      }

      // Restore health/exp penalty that was likely applied by DailySystem
      // Default penalty is 50 health and 20 exp
      const healthRestore = 50;
      const expRestore = 20;

      await storage.updateCharacter({
        current_exp: remainingExp,
        total_exp: (character.total_exp || 0) + expGain + expRestore,
        gold: (character.gold || 0) + goldGain - 50, // Subtract item cost
        level: newLevel,
        health: Math.min((character.health || 0) + healthRestore, character.max_health),
      });

      await storage.addActivityLog({
        activity: `Recuperou hábito: ${habit.name}`,
        type: 'market_purchase',
        exp_change: expGain + expRestore,
        gold_change: -50,
        health_change: healthRestore,
      });

      toast.success(`Hábito "${habit.name}" recuperado!`);
      setIsRecoveryOpen(false);
      await loadData();
    } catch (error) {
      toast.error('Erro ao recuperar hábito');
    }
  };

  const emojiOptions = ['🎁', '⚡', '✨', '💎', '🏆', '🎮', '🍕', '☕', '🎬', '📚', '🎵', '💪'];

  const itemsByCategory = marketItems.reduce((acc, item) => {
    const cat = item.category || 'recompensa';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryLabels = {
    recompensa: { label: '🎁 Recompensas', color: 'text-purple-400' },
    boost: { label: '🧪 Poções e Boosts', color: 'text-cyan-400' },
    consumivel: { label: '🧼 Consumíveis', color: 'text-emerald-400' },
    mercado_negro: { label: '💀 Mercado Negro', color: 'text-red-400' },
    cosmetic: { label: '✨ Cosméticos', color: 'text-amber-400' },
    especial: { label: '💎 Especiais', color: 'text-orange-400' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{ backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_682b8b38ba3eb37fec6f9edb/56ab48e4f_ChatGPT_Image_28_de_abr_de_2025_13_26_34.png')` }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Mercado Negro</h1>
              <p className="text-slate-400 text-sm">Troque suas moedas por recompensas</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400">{character?.gold || 0}</span>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-900">
                  <Plus className="w-4 h-4 mr-2" /> Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Adicionar Item ao Mercado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nome do Item</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ex: Dia de folga"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Descrição</Label>
                    <Textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Descreva a recompensa..."
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Ícone</Label>
                    <div className="flex flex-wrap gap-2">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setNewItem({ ...newItem, icon: emoji })}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${newItem.icon === emoji
                            ? 'bg-yellow-500/30 border-2 border-yellow-500'
                            : 'bg-slate-800 border border-slate-700 hover:border-slate-500'
                            }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Preço</Label>
                      <Input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) })}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Categoria</Label>
                      <Select
                        value={newItem.category}
                        onChange={(e: any) => setNewItem({ ...newItem, category: e.target.value })}
                      >
                        <SelectItem value="recompensa">🎁 Recompensa</SelectItem>
                        <SelectItem value="boost">🧪 Boost/Poção</SelectItem>
                        <SelectItem value="consumivel">🧼 Consumível</SelectItem>
                        <SelectItem value="mercado_negro">💀 Mercado Negro</SelectItem>
                        <SelectItem value="cosmetic">✨ Cosmético</SelectItem>
                        <SelectItem value="especial">💎 Especial</SelectItem>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCreateItem(newItem)}
                    disabled={!newItem.name}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900"
                  >
                    Adicionar Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Recovery Dialog */}
        <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Qual hábito deseja recuperar?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {missedHabits.map((habit) => (
                <Button
                  key={habit.id}
                  onClick={() => handleRecoverHabit(habit)}
                  variant="outline"
                  className="w-full justify-start gap-3 border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 text-slate-300 hover:text-white py-6"
                >
                  <span className="text-xl">{habit.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold">{habit.name}</p>
                    <p className="text-xs text-slate-500">Recupere suas recompensas de ontem</p>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Items by Category */}
        {Object.entries(categoryLabels).map(([category, { label, color }]) => {
          const categoryItems = itemsByCategory[category] || [];
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h2 className={`text-lg font-semibold mb-4 ${color}`}>{label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {categoryItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <MarketItemCard
                        item={item}
                        userGold={character?.gold || 0}
                        onPurchase={handlePurchase}
                      />
                      <Button
                        onClick={() => handleDeleteItem(item.id)}
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {marketItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700"
          >
            <Package className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 mb-4">O mercado está vazio</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Primeiro Item
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}