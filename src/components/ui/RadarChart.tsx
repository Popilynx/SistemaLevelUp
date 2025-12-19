import { motion } from 'framer-motion';

interface RadarChartProps {
    data: { label: string; value: number; max: number }[];
    size?: number;
}

export default function RadarChart({ data, size = 300 }: RadarChartProps) {
    const center = size / 2;
    const radius = (size / 2) * 0.7;
    const angleStep = (Math.PI * 2) / data.length;

    const getPoint = (value: number, max: number, angle: number) => {
        const r = (value / max) * radius;
        const x = center + r * Math.cos(angle - Math.PI / 2);
        const y = center + r * Math.sin(angle - Math.PI / 2);
        return { x, y };
    };

    const points = data.map((d, i) => getPoint(d.value, d.max, i * angleStep));
    const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

    // Grid levels (0.2, 0.4, 0.6, 0.8, 1.0)
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

    return (
        <div className="flex flex-col items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Radar Grids */}
                {gridLevels.map((level, i) => {
                    const gridPoints = data.map((_, j) => {
                        const p = getPoint(level * 5, 5, j * angleStep);
                        return `${p.x},${p.y}`;
                    }).join(' ');

                    return (
                        <polygon
                            key={i}
                            points={gridPoints}
                            className="fill-none stroke-slate-700/50 stroke-1"
                        />
                    );
                })}

                {/* Axis Lines */}
                {data.map((_, i) => {
                    const p = getPoint(5, 5, i * angleStep);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={p.x}
                            y2={p.y}
                            className="stroke-slate-700/50 stroke-1"
                        />
                    );
                })}

                {/* Data Area */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "circOut" }}
                    points={polygonPath}
                    className="fill-cyan-500/30 stroke-cyan-400 stroke-2"
                />

                {/* Labels and values */}
                {data.map((d, i) => {
                    const p = getPoint(6.5, 5, i * angleStep);
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            className="fill-slate-400 text-[10px] font-bold uppercase tracking-tighter"
                        >
                            {d.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
