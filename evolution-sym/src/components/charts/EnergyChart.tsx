import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Creature } from "../../lib/creatures/creature";
import { CreatureState } from "../../lib/creatures/creatureTypes";

interface EnergyChartProps {
  creatures: Creature[];
  currentTick: number;
  maxDataPoints?: number;
}

interface EnergyDataPoint {
  tick: number;
  avgEnergy: number;
  minEnergy: number;
  maxEnergy: number;
}

export const EnergyChart: React.FC<EnergyChartProps> = ({
  creatures,
  currentTick,
  maxDataPoints = 100,
}) => {
  const [energyHistory, setEnergyHistory] = useState<EnergyDataPoint[]>([]);

  // Update energy history when creatures change
  useEffect(() => {
    const alive = creatures.filter((c) => c.state === CreatureState.Alive);
    if (alive.length === 0) return;

    const energyLevels = alive.map((c) => c.physics.energy);
    const avgEnergy =
      energyLevels.reduce((sum, e) => sum + e, 0) / energyLevels.length;
    const minEnergy = Math.min(...energyLevels);
    const maxEnergy = Math.max(...energyLevels);

    const energyData = {
      tick: currentTick,
      avgEnergy: Math.round(avgEnergy * 100) / 100, // Round to 2 decimals
      minEnergy: Math.round(minEnergy * 100) / 100,
      maxEnergy: Math.round(maxEnergy * 100) / 100,
    };

    setEnergyHistory((prev) => {
      // Only add if it's a new tick to avoid duplicates
      if (prev.length === 0 || prev[prev.length - 1].tick !== currentTick) {
        const newHistory = [...prev, energyData];
        // Keep last maxDataPoints for performance
        return newHistory.slice(-maxDataPoints);
      }
      return prev;
    });
  }, [creatures, currentTick, maxDataPoints]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: "#1f2937",
            border: "1px solid #4b5563",
            borderRadius: "0.5rem",
            padding: "0.75rem",
            color: "white",
            fontSize: "0.875rem",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0", fontWeight: "600" }}>
            Tick {label}
          </p>
          <p style={{ margin: "0.25rem 0", color: "#10b981" }}>
            Average: {data.avgEnergy}
          </p>
          <p style={{ margin: "0.25rem 0", color: "#ef4444" }}>
            Min: {data.minEnergy}
          </p>
          <p style={{ margin: "0.25rem 0", color: "#3b82f6" }}>
            Max: {data.maxEnergy}
          </p>
        </div>
      );
    }
    return null;
  };

  if (energyHistory.length === 0) {
    return (
      <div
        style={{
          height: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "0.875rem",
        }}
      >
        Collecting energy data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={energyHistory}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
        <XAxis
          dataKey="tick"
          stroke="#9ca3af"
          fontSize={12}
          tickFormatter={(tick: number) => `${tick}`}
        />
        <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />

        {/* Reference lines for energy thresholds */}
        <ReferenceLine
          y={20}
          stroke="#ef4444"
          strokeDasharray="3 3"
          strokeOpacity={0.6}
        />
        <ReferenceLine
          y={50}
          stroke="#f59e0b"
          strokeDasharray="3 3"
          strokeOpacity={0.6}
        />
        <ReferenceLine
          y={80}
          stroke="#10b981"
          strokeDasharray="3 3"
          strokeOpacity={0.6}
        />

        {/* Average energy line - main focus */}
        <Line
          type="monotone"
          dataKey="avgEnergy"
          stroke="#10b981"
          strokeWidth={3}
          dot={false}
          name="Average Energy"
        />

        {/* Min/Max energy - lighter lines for context */}
        <Line
          type="monotone"
          dataKey="minEnergy"
          stroke="#ef4444"
          strokeWidth={1}
          dot={false}
          strokeOpacity={0.7}
          name="Min Energy"
        />
        <Line
          type="monotone"
          dataKey="maxEnergy"
          stroke="#3b82f6"
          strokeWidth={1}
          dot={false}
          strokeOpacity={0.7}
          name="Max Energy"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
