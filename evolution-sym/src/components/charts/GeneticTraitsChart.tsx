import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Creature } from "../../lib/creatures/creature";
import { CreatureState } from "../../lib/creatures/creatureTypes";

interface GeneticTraitsChartProps {
  creatures: Creature[];
  currentTick: number;
}

interface TraitEvolutionPoint {
  tick: number;
  size: number;
  speed: number;
  aggression: number;
  plantPref: number;
  meatPref: number;
  visionRange: number;
  efficiency: number;
  sociability: number;
}

export const GeneticTraitsChart: React.FC<GeneticTraitsChartProps> = ({
  creatures,
  currentTick,
}) => {
  const [traitHistory, setTraitHistory] = useState<TraitEvolutionPoint[]>([]);

  // Update trait history when creatures change
  useEffect(() => {
    const alive = creatures.filter((c) => c.state === CreatureState.Alive);
    if (alive.length === 0) return;

    const traits = alive.map((c) => c.genetics);
    const avgTraits = {
      tick: currentTick,
      size: traits.reduce((sum, t) => sum + t.size, 0) / traits.length,
      speed: traits.reduce((sum, t) => sum + t.speed, 0) / traits.length,
      aggression:
        traits.reduce((sum, t) => sum + t.aggression, 0) / traits.length,
      plantPref:
        traits.reduce((sum, t) => sum + t.plantPreference, 0) / traits.length,
      meatPref:
        traits.reduce((sum, t) => sum + t.meatPreference, 0) / traits.length,
      visionRange:
        traits.reduce((sum, t) => sum + t.visionRange, 0) / traits.length,
      efficiency:
        traits.reduce((sum, t) => sum + t.efficiency, 0) / traits.length,
      sociability:
        traits.reduce((sum, t) => sum + t.sociability, 0) / traits.length,
    };

    setTraitHistory((prev) => {
      // Only add if it's a new tick to avoid duplicates
      if (prev.length === 0 || prev[prev.length - 1].tick !== currentTick) {
        const newHistory = [...prev, avgTraits];
        // Keep last 100 data points for performance
        return newHistory.slice(-100);
      }
      return prev;
    });
  }, [creatures, currentTick]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{
                margin: "0.25rem 0",
                color: entry.color,
              }}
            >
              {entry.name}: {entry.value.toFixed(3)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (traitHistory.length === 0) {
    return (
      <div
        style={{
          height: 350,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "0.875rem",
        }}
      >
        Collecting genetic trait data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={traitHistory}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
        <XAxis
          dataKey="tick"
          stroke="#9ca3af"
          fontSize={12}
          tickFormatter={(tick: number) => `${tick}`}
        />
        <YAxis stroke="#9ca3af" fontSize={12} domain={[0, "dataMax"]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: "#d1d5db", fontSize: "0.875rem" }} />
        <Line
          type="monotone"
          dataKey="size"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
          name="Size"
        />
        <Line
          type="monotone"
          dataKey="speed"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={false}
          name="Speed"
        />
        <Line
          type="monotone"
          dataKey="aggression"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          name="Aggression"
        />
        <Line
          type="monotone"
          dataKey="plantPref"
          stroke="#84cc16"
          strokeWidth={2}
          dot={false}
          name="Plant Preference"
        />
        <Line
          type="monotone"
          dataKey="meatPref"
          stroke="#dc2626"
          strokeWidth={2}
          dot={false}
          name="Meat Preference"
        />
        <Line
          type="monotone"
          dataKey="visionRange"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="Vision Range"
        />
        <Line
          type="monotone"
          dataKey="efficiency"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          name="Efficiency"
        />
        <Line
          type="monotone"
          dataKey="sociability"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="Sociability"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
