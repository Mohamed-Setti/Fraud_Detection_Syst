/* eslint-disable react-hooks/set-state-in-effect */
import React, { useMemo, useRef, useState, useEffect } from "react";

export type Point = {
  label?: string;
  value: number;
};

type Props = {
  data: Point[];
  height?: number; // viewBox height
  strokeWidth?: number;
  className?: string;
  // If you want to force a color you can pass it, otherwise the component reads --color-fg-brand
  color?: string;
  // show/hide area fill (Apex example uses area)
  showArea?: boolean;
  // show/hide visible point circles
  showPoints?: boolean;
};

export default function LineChart({
  data,
  height = 160,
  strokeWidth = 6,
  className,
  color,
  showArea = true,
  showPoints = false,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [brandColor, setBrandColor] = useState<string>(color ?? "#1447E6");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ leftPct: number; topPct: number } | null>(null);

  // Read CSS variable --color-fg-brand on mount (client-only)
  useEffect(() => {
    if (color) {
      setBrandColor(color);
      return;
    }
    if (typeof window === "undefined") return;
    try {
      const computed = getComputedStyle(document.documentElement);
      const val = computed.getPropertyValue("--color-fg-brand").trim();
      if (val) setBrandColor(val);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // ignore and keep default
    }
  }, [color]);

  const viewWidth = 720;
  const margin = { top: 12, right: 12, bottom: 24, left: 12 };

  const { points, pathD, areaD } = useMemo(() => {
    const n = data.length;
    const values = data.map((d) => d.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      min = min - 1;
      max = max + 1;
    }

    const innerW = viewWidth - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const stepX = n > 1 ? innerW / (n - 1) : innerW / 2;

    const mapX = (i: number) => margin.left + i * stepX;
    const mapY = (v: number) => margin.top + innerH - ((v - min) / (max - min)) * innerH;

    const pts = data.map((d, i) => ({ x: mapX(i), y: mapY(d.value), label: d.label, value: d.value }));

    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

    const area = `${path} L ${margin.left + innerW} ${margin.top + innerH} L ${margin.left} ${margin.top + innerH} Z`;

    return { points: pts, pathD: path, areaD: area };
  }, [data, height, margin.top, margin.right, margin.bottom, margin.left]);

  // pointer handling: find nearest point and compute tooltip percentages (relative to viewBox)
  const onPointerMove = (e: React.PointerEvent) => {
    if (!svgRef.current || !containerRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let bestIdx = -1;
    let bestDist = Infinity;
    let bestX = 0;
    let bestY = 0;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      // scale to CSS px
      const scaledX = (p.x / viewWidth) * rect.width;
      const scaledY = (p.y / height) * rect.height;
      const d = Math.abs(scaledX - px);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
        bestX = scaledX;
        bestY = scaledY;
      }
    }

    if (bestIdx >= 0) {
      setHoverIndex(bestIdx);
      // compute left/top as percentage of container for absolute positioning
      const leftPct = (bestX / rect.width) * 100;
      const topPct = (bestY / rect.height) * 100;
      setTooltipPos({ leftPct, topPct });
    }
  };

  const onPointerLeave = () => {
    setHoverIndex(null);
    setTooltipPos(null);
  };

  return (
    <div ref={containerRef} className={`w-full ${className ?? ""}`}>
      <div className="relative bg-white rounded-md p-0" style={{ overflow: "visible" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewWidth} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full"
          style={{ display: "block", height: 200 }}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={brandColor} stopOpacity={0.55} />
              <stop offset="100%" stopColor={brandColor} stopOpacity={0} />
            </linearGradient>
            <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor={brandColor} floodOpacity="0.06" />
            </filter>
          </defs>

          {/* area fill */}
          {showArea && <path d={areaD} fill="url(#areaGrad)" />}

          {/* line */}
          <path
            d={pathD}
            fill="none"
            stroke={brandColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "none" }}
          />

          {/* optional points */}
          {showPoints &&
            points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={i === hoverIndex ? 5 : 3}
                fill={i === hoverIndex ? "#fff" : brandColor}
                stroke={brandColor}
                strokeWidth={i === hoverIndex ? 2 : 1}
                onPointerEnter={() => setHoverIndex(i)}
                onPointerLeave={() => setHoverIndex(null)}
              />
            ))}

          {/* invisible overlay to capture pointer inside plotting area */}
          <rect
            x={margin.left}
            y={margin.top}
            width={viewWidth - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            fill="transparent"
            style={{ cursor: "crosshair" }}
          />
        </svg>

        {/* Tooltip (simple, anchored by percentage) */}
        {hoverIndex !== null && tooltipPos && (
          <div
            className="absolute pointer-events-none -translate-y-full"
            style={{
              left: `${tooltipPos.leftPct}%`,
              top: `${tooltipPos.topPct}%`,
              transform: "translate(-50%, -8px)",
            }}
          >
            <div className="bg-slate-800 text-white text-xs rounded px-2 py-1 shadow-md whitespace-nowrap">
              <div className="text-[11px] leading-4">{data[hoverIndex].label ?? `#${hoverIndex + 1}`}</div>
              <div className="font-medium text-sm leading-5">{data[hoverIndex].value}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}