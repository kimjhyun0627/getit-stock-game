import { useState } from 'react';

export interface PricePoint {
  year: number;
  price: number;
}

const PAD = 32;

interface PriceLineChartProps {
  data: PricePoint[];
  height: number;
}

export function PriceLineChart({ data, height }: PriceLineChartProps) {
  const [selected, setSelected] = useState<PricePoint | null>(null);
  if (data.length === 0) return null;
  const minYear = Math.min(...data.map((d) => d.year));
  const maxYear = Math.max(...data.map((d) => d.year));
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const rangeYear = maxYear - minYear || 1;
  const rangePrice = maxPrice - minPrice || 1;
  const w = 400;
  const h = height - PAD * 2;
  const points = data
    .map((d) => {
      const x = PAD + ((d.year - minYear) / rangeYear) * (w - PAD * 2);
      const y = PAD + h - ((d.price - minPrice) / rangePrice) * h;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${w + PAD * 2} ${height}`}
      className="w-full"
      style={{ maxHeight: height }}
      preserveAspectRatio="xMidYMid meet"
    >
      {data.length >= 2 && (
        <polyline
          fill="none"
          stroke="rgb(34, 197, 94)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      )}
      {selected &&
        (() => {
          const x = PAD + ((selected.year - minYear) / rangeYear) * (w - PAD * 2);
          const y = PAD + h - ((selected.price - minPrice) / rangePrice) * h;
          const label = `${selected.year}년: ₩${selected.price.toLocaleString()}`;
          const tw = label.length * 6 + 16;
          const th = 22;
          const tx = Math.max(8, Math.min(w + PAD * 2 - tw - 8, x - tw / 2));
          const ty = Math.max(4, y - th - 10);
          return (
            <g>
              <rect x={tx} y={ty} width={tw} height={th} rx={4} fill="#1f2937" fillOpacity={0.95} />
              <text x={tx + tw / 2} y={ty + th / 2 + 4} textAnchor="middle" fontSize="11" fill="white">
                {label}
              </text>
            </g>
          );
        })()}
      {data.map((d) => {
        const x = PAD + ((d.year - minYear) / rangeYear) * (w - PAD * 2);
        const y = PAD + h - ((d.price - minPrice) / rangePrice) * h;
        const isSelected = selected?.year === d.year;
        return (
          <g
            key={d.year}
            onClick={(e) => {
              e.stopPropagation();
              setSelected((prev) => (prev?.year === d.year ? null : d));
            }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={x} cy={y} r="6" fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r="4"
              fill="rgb(34, 197, 94)"
              stroke={isSelected ? '#166534' : 'none'}
              strokeWidth="2"
            />
            <text x={x} y={height - 4} textAnchor="middle" fontSize="10" fill="#6b7280">
              {d.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
