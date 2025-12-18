import React from 'react';
import { motion } from 'framer-motion';
import { Coins, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categoryColors = {
  recompensa: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  boost: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
  cosmetic: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  especial: 'from-red-500/20 to-rose-500/20 border-red-500/30',
};

const categoryIcons = {
  recompensa: '🎁',
  boost: '⚡',
  cosmetic: '✨',
  especial: '💎',
};

export default function MarketItemCard({ item, userGold, onPurchase }) {
  const canAfford = userGold >= item.price;
  const colors = categoryColors[item.category] || categoryColors.recompensa;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 bg-gradient-to-br",
        colors
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 rounded-xl bg-slate-800/80 flex items-center justify-center text-2xl">
          {item.icon || categoryIcons[item.category] || '📦'}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{item.name}</h3>
          <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className={cn(
            "font-bold text-lg",
            canAfford ? "text-yellow-400" : "text-red-400"
          )}>
            {item.price}
          </span>
        </div>

        <Button
          onClick={() => canAfford && onPurchase(item)}
          disabled={!canAfford}
          size="sm"
          className={cn(
            "gap-2",
            canAfford
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          {canAfford ? 'Comprar' : 'Sem moedas'}
        </Button>
      </div>

      {item.times_purchased > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/30 text-xs text-slate-500">
          Comprado {item.times_purchased}x
        </div>
      )}
    </motion.div>
  );
}