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
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { Creature } from "../../lib/creatures/creature";
import { CreatureState } from "../../lib/creatures/creatureTypes";

interface TraitEvolutionChartProps {
  creatures: Creature[];
  currentTick: number;
  maxDataPoints?: number;
}

interface TraitEvolutionPoint {
  tick: number;
  generation: number;
  size: { avg: number; min: number; max: number; variance: number };
  speed: { avg: number; min: number; max: number; variance: number };
  aggression: { avg: number; min: number; max: number; variance: number };
  plantPref: { avg: number; min: number; max: number; variance: number };
  meatPref: { avg: number; min: number; max: number; variance: number };
  visionRange: { avg: number; min: number; max: number; variance: number };
  selectionPressure: number;
}

export const TraitEvolutionChart: React.FC<TraitEvolutionChartProps> = ({
  creatures,
  currentTick,
  maxDataPoints = 100,
}) => {
  const [evolutionHistory, setEvolutionHistory] = useState<
    TraitEvolutionPoint[]
  >([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([
    "size",
    "speed",
    "aggression",
  ]);

  // Update evolution history when creatures change
  useEffect(() => {
    const alive = creatures.filter((c) => c.state === CreatureState.Alive);
    if (alive.length === 0) return;

    const evolutionData = calculateEvolutionMetrics(alive, currentTick);

    setEvolutionHistory((prev) => {
      if (prev.length === 0 || prev[prev.length - 1].tick !== currentTick) {
        const newHistory = [...prev, evolutionData];
        return newHistory.slice(-maxDataPoints);
      }
      return prev;
    });
  }, [creatures, currentTick, maxDataPoints]);

  const calculateEvolutionMetrics = (
    creatures: Creature[],
    tick: number
  ): TraitEvolutionPoint => {
    const traits = creatures.map((c) => c.genetics);

    const calculateTraitStats = (values: number[]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
        values.length;

      return {
        avg: Math.round(avg * 1000) / 1000,
        min: Math.round(min * 1000) / 1000,
        max: Math.round(max * 1000) / 1000,
        variance: Math.round(variance * 1000) / 1000,
      };
    };

    // Calculate selection pressure (fitness variance)
    const fitnesses = creatures.map((c) => c.stats.fitness);
    const avgFitness =
      fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
    const selectionPressure =
      fitnesses.reduce((sum, f) => sum + Math.pow(f - avgFitness, 2), 0) /
      fitnesses.length;

    // Estimate generation (simplified - based on average age)
    const avgAge =
      creatures.reduce((sum, c) => sum + c.physics.age, 0) / creatures.length;
    const generation = Math.floor(tick / 1000); // Rough generation estimate

    return {
      tick,
      generation,
      size: calculateTraitStats(traits.map((t) => t.size)),
      speed: calculateTraitStats(traits.map((t) => t.speed)),
      aggression: calculateTraitStats(traits.map((t) => t.aggression)),
      plantPref: calculateTraitStats(traits.map((t) => t.plantPreference)),
      meatPref: calculateTraitStats(traits.map((t) => t.meatPreference)),
      visionRange: calculateTraitStats(traits.map((t) => t.visionRange)),
      selectionPressure: Math.round(selectionPressure * 1000) / 1000,
    };
  };

  const traitConfigs = {
    size: { color: "#8b5cf6", label: "Size" },
    speed: { color: "#06b6d4", label: "Speed" },
    aggression: { color: "#ef4444", label: "Aggression" },
    plantPref: { color: "#84cc16", label: "Plant Preference" },
    meatPref: { color: "#dc2626", label: "Meat Preference" },
    visionRange: { color: "#3b82f6", label: "Vision Range" },
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

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
            maxWidth: "250px",
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
              {entry.name}: {entry.value}
              {entry.name === "Selection Pressure" &&
                ` (variance: ${entry.payload?.selectionPressure})`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (evolutionHistory.length === 0) {
    return (
      <div
        style={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "0.875rem",
        }}
      >
        Tracking evolutionary changes...
      </div>
    );
  }

  return (
    <div>
      {/* Trait Selection Controls */}
      <div style={{ marginBottom: "1rem" }}>
        <h4
          style={{
            color: "#d1d5db",
            fontSize: "0.875rem",
            margin: "0 0 0.5rem 0",
          }}
        >
          Select Traits to Display:
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {Object.entries(traitConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => toggleTrait(key)}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                border: "1px solid #4b5563",
                background: selectedTraits.includes(key)
                  ? config.color
                  : "transparent",
                color: selectedTraits.includes(key) ? "white" : "#9ca3af",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evolution Timeline */}
      <div style={{ marginBottom: "1rem" }}>
        <h4
          style={{
            color: "#d1d5db",
            fontSize: "0.875rem",
            margin: "0 0 0.5rem 0",
          }}
        >
          Trait Evolution Over Time
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={evolutionHistory}
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
            <Legend wrapperStyle={{ color: "#d1d5db", fontSize: "0.75rem" }} />

            {/* Render selected trait lines */}
            {selectedTraits.map((trait) => {
              const config = traitConfigs[trait as keyof typeof traitConfigs];
              return (
                <Line
                  key={trait}
                  type="monotone"
                  dataKey={`${trait}.avg`}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={false}
                  name={config.label}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Selection Pressure */}
      <div>
        <h4
          style={{
            color: "#d1d5db",
            fontSize: "0.875rem",
            margin: "0 0 0.5rem 0",
          }}
        >
          Selection Pressure (Fitness Variance)
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart
            data={evolutionHistory}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="tick" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              formatter={(value: any) => [value, "Selection Pressure"]}
              labelFormatter={(label: any) => `Tick ${label}`}
              contentStyle={{
                background: "#1f2937",
                border: "1px solid #4b5563",
                borderRadius: "0.5rem",
                color: "white",
                fontSize: "0.875rem",
              }}
            />

            <Area
              type="monotone"
              dataKey="selectionPressure"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
              strokeWidth={2}
            />

            {/* Reference lines for selection pressure levels */}
            <ReferenceLine
              y={0.1}
              stroke="#10b981"
              strokeDasharray="2 2"
              strokeOpacity={0.6}
              label={{
                value: "Low",
                fontSize: 10,
                fill: "#10b981",
              }}
            />
            <ReferenceLine
              y={0.5}
              stroke="#f59e0b"
              strokeDasharray="2 2"
              strokeOpacity={0.6}
              label={{
                value: "High",
                fontSize: 10,
                fill: "#f59e0b",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
