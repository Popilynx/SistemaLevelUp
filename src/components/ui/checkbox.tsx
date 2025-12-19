import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(
    ({ checked, onCheckedChange, disabled, className }, ref) => {
        return (
            <div
                ref={ref}
                onClick={() => !disabled && onCheckedChange?.(!checked)}
                className={cn(
                    "relative flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all cursor-pointer",
                    disabled ? "cursor-not-allowed opacity-50" : "hover:scale-105 active:scale-95",
                    checked
                        ? "bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                        : "bg-slate-800 border-slate-600 hover:border-cyan-500",
                    className
                )}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                    <Check className="w-5 h-5 text-slate-950 stroke-[3px]" />
                </motion.div>

                {/* Glow effect when checked */}
                {checked && (
                    <motion.div
                        layoutId="glow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-lg bg-green-400/20 blur-md pointer-events-none"
                    />
                )}
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
