import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { petService } from '@/services/petService';
import { storage } from '@/components/storage/LocalStorage';
import { Pet } from '@/types';

interface PetSelectionProps {
    onSelect: (pet: Pet) => void;
}

const PET_OPTIONS: { type: Pet['type'], icon: string, name: string, description: string, bonus: string }[] = [
    { type: 'dragon', icon: '🐲', name: 'Dragão', description: 'O senhor das chamas.', bonus: '+10% Dano no Boss' },
    { type: 'owl', icon: '🦉', name: 'Coruja', description: 'A guardiã do saber.', bonus: '+5% EXP Geral' },
    { type: 'wolf', icon: '🐺', name: 'Lobo', description: 'O caçador ágil.', bonus: '+8% Ouro Ganho' },
    { type: 'cat', icon: '🐱', name: 'Gato', description: 'O gato da fortuna.', bonus: '+15% Ouro Ganho' },
    { type: 'slime', icon: '🧊', name: 'Slime', description: 'Gelatina resiliente.', bonus: '+3% EXP Geral' },
];

export default function PetSelection({ onSelect }: PetSelectionProps) {
    const handleSelect = async (type: Pet['type']) => {
        const newPet = petService.createPet(type);
        await storage.updateCharacter({ active_pet: newPet });
        onSelect(newPet);
    };

    return (
        <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Escolha seu Companheiro</h2>
            <p className="text-slate-400 mb-6 text-sm">Um pet seguirá sua jornada e fornecerá bônus únicos conforme evolui.</p>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {PET_OPTIONS.map((opt) => (
                    <motion.div
                        key={opt.type}
                        whileHover={{ scale: 1.05 }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-cyan-500/50 transition-all cursor-pointer group"
                        onClick={() => handleSelect(opt.type)}
                    >
                        <span className="text-5xl group-hover:animate-bounce">{opt.icon}</span>
                        <div className="text-sm font-bold text-white">{opt.name}</div>
                        <p className="text-[10px] text-slate-500">{opt.description}</p>
                        <div className="mt-auto bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase px-2 py-1 rounded-full">
                            {opt.bonus}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
