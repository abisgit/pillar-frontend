'use client';

import React from 'react';

interface RadarData {
    label: string;
    value: number; // 0 to 100
}

interface LifeBalanceRadarProps {
    data: RadarData[];
    size?: number;
}

export function LifeBalanceRadar({ data, size = 300 }: LifeBalanceRadarProps) {
    const categories = data.length;
    const center = size / 2;
    const radius = size * 0.35;
    const totalScore = (data.reduce((acc, curr) => acc + curr.value, 0) / (categories * 100)) * 100;

    const getCoordinates = (index: number, value: number) => {
        const angle = (Math.PI * 2 * index) / categories - Math.PI / 2;
        const dist = (value / 100) * radius;
        return {
            x: center + dist * Math.cos(angle),
            y: center + dist * Math.sin(angle),
        };
    };

    // Background polygons (rings)
    const rings = [0.2, 0.4, 0.6, 0.8, 1].map((scale) => {
        return Array.from({ length: categories }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / categories - Math.PI / 2;
            return `${center + radius * scale * Math.cos(angle)},${center + radius * scale * Math.sin(angle)}`;
        }).join(' ');
    });

    // Data polygon
    const dataPoints = data.map((d, i) => {
        const coords = getCoordinates(i, d.value);
        return `${coords.x},${coords.y}`;
    }).join(' ');

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Axes */}
                {Array.from({ length: categories }).map((_, i) => {
                    const coords = getCoordinates(i, 100);
                    return (
                        <line
                            key={`axis-${i}`}
                            x1={center}
                            y1={center}
                            x2={coords.x}
                            y2={coords.y}
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-muted-foreground/20"
                        />
                    );
                })}

                {/* Rings */}
                {rings.map((points, i) => (
                    <polygon
                        key={`ring-${i}`}
                        points={points}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-muted-foreground/10"
                    />
                ))}

                {/* Data Area */}
                <polygon
                    points={dataPoints}
                    fill="var(--primary)"
                    fillOpacity="0.2"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    className="transition-all duration-1000 ease-out"
                />

                {/* Data Points */}
                {data.map((d, i) => {
                    const coords = getCoordinates(i, d.value);
                    return (
                        <circle
                            key={`point-${i}`}
                            cx={coords.x}
                            cy={coords.y}
                            r="4"
                            fill="var(--primary)"
                            className="transition-all duration-1000 ease-out"
                        />
                    );
                })}

                {/* Labels */}
                {data.map((d, i) => {
                    const coords = getCoordinates(i, 115);
                    const isLeft = coords.x < center;
                    const isTop = coords.y < center;
                    return (
                        <g key={`label-${i}`}>
                            <text
                                x={coords.x}
                                y={coords.y}
                                textAnchor={Math.abs(coords.x - center) < 10 ? 'middle' : isLeft ? 'end' : 'start'}
                                className="text-[10px] font-black uppercase tracking-tighter fill-muted-foreground"
                            >
                                {d.label}
                            </text>
                            <text
                                x={coords.x}
                                y={coords.y + 12}
                                textAnchor={Math.abs(coords.x - center) < 10 ? 'middle' : isLeft ? 'end' : 'start'}
                                className={cn(
                                    "text-[10px] font-bold",
                                    d.value > 70 ? "fill-emerald-500" : d.value > 40 ? "fill-blue-500" : "fill-red-500"
                                )}
                            >
                                {d.value.toFixed(1)}/100.0
                            </text>
                        </g>
                    );
                })}

                {/* Center Score */}
                <g transform={`translate(${center}, ${center})`}>
                    <text textAnchor="middle" y="-5" className="text-2xl font-black italic tracking-tighter fill-foreground">
                        {totalScore.toFixed(2)}
                    </text>
                    <text textAnchor="middle" y="15" className="text-[8px] font-black uppercase tracking-widest opacity-40 fill-foreground">
                        Total Score
                    </text>
                </g>
            </svg>
        </div>
    );
}
