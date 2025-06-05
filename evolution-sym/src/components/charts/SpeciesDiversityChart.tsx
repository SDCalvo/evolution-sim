import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";
import { Creature } from "../../lib/creatures/creature";
import { CreatureState } from "../../lib/creatures/creatureTypes";
import { GeneticsHelper } from "../../lib/creatures/creatureTypes";

interface SpeciesDiversityChartProps {
  creatures: Creature[];
  currentTick: number;
  maxDataPoints?: number;
}

interface DiversityDataPoint {
  tick: number;
  speciesCount: number;
  averageGeneticDistance: number;
  populationDiversity: number;
  dominantSpeciesPercent: number;
}

interface SpeciesCluster {
  id: string;
  count: number;
  avgSize: number;
  avgSpeed: number;
  color: string;
  representatives: number;
}

export const SpeciesDiversityChart: React.FC<SpeciesDiversityChartProps> = ({
  creatures,
  currentTick,
  maxDataPoints = 50,
}) => {
  const [diversityHistory, setDiversityHistory] = useState<
    DiversityDataPoint[]
  >([]);
  const [currentSpecies, setCurrentSpecies] = useState<SpeciesCluster[]>([]);

  // Update diversity metrics when creatures change
  useEffect(() => {
    const alive = creatures.filter((c) => c.state === CreatureState.Alive);
    if (alive.length === 0) return;

    // Calculate genetic diversity metrics
    const speciesClusters = calculateSpeciesClusters(alive);
    const diversityMetrics = calculateDiversityMetrics(alive, speciesClusters);

    // Update current species for scatter plot
    setCurrentSpecies(speciesClusters);

    // Update diversity history
    setDiversityHistory((prev) => {
      if (prev.length === 0 || prev[prev.length - 1].tick !== currentTick) {
        const newHistory = [
          ...prev,
          {
            tick: currentTick,
            ...diversityMetrics,
          },
        ];
        return newHistory.slice(-maxDataPoints);
      }
      return prev;
    });
  }, [creatures, currentTick, maxDataPoints]);

  const calculateSpeciesClusters = (
    creatures: Creature[]
  ): SpeciesCluster[] => {
    // Group creatures by genetic similarity (simplified species classification)
    const clusters: Map<string, Creature[]> = new Map();

    creatures.forEach((creature) => {
      // Create a simple species key based on dominant traits
      const genetics = creature.genetics;
      const dietType =
        genetics.plantPreference > genetics.meatPreference
          ? "herbivore"
          : genetics.meatPreference > genetics.plantPreference
          ? "carnivore"
          : "omnivore";
      const sizeCategory =
        genetics.size < 0.7
          ? "small"
          : genetics.size > 1.3
          ? "large"
          : "medium";
      const speedCategory =
        genetics.speed < 0.7
          ? "slow"
          : genetics.speed > 1.3
          ? "fast"
          : "medium";

      const speciesKey = `${dietType}-${sizeCategory}-${speedCategory}`;

      if (!clusters.has(speciesKey)) {
        clusters.set(speciesKey, []);
      }
      clusters.get(speciesKey)!.push(creature);
    });

    // Convert to species clusters with metrics
    const speciesClusters: SpeciesCluster[] = [];
    const colors = [
      "#8b5cf6",
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
      "#84cc16",
      "#f97316",
    ];

    let colorIndex = 0;
    clusters.forEach((members, speciesId) => {
      const avgSize =
        members.reduce((sum, c) => sum + c.genetics.size, 0) / members.length;
      const avgSpeed =
        members.reduce((sum, c) => sum + c.genetics.speed, 0) / members.length;

      speciesClusters.push({
        id: speciesId,
        count: members.length,
        avgSize: Math.round(avgSize * 1000) / 1000,
        avgSpeed: Math.round(avgSpeed * 1000) / 1000,
        color: colors[colorIndex % colors.length],
        representatives: members.length,
      });

      colorIndex++;
    });

    return speciesClusters.sort((a, b) => b.count - a.count);
  };

  const calculateDiversityMetrics = (
    creatures: Creature[],
    species: SpeciesCluster[]
  ) => {
    const totalPopulation = creatures.length;

    // Species count
    const speciesCount = species.length;

    // Average genetic distance (simplified)
    let totalDistance = 0;
    let comparisons = 0;

    for (let i = 0; i < Math.min(creatures.length, 50); i++) {
      for (let j = i + 1; j < Math.min(creatures.length, 50); j++) {
        const distance = GeneticsHelper.calculateGeneticDistance(
          creatures[i].genetics,
          creatures[j].genetics
        );
        totalDistance += distance;
        comparisons++;
      }
    }

    const averageGeneticDistance =
      comparisons > 0 ? totalDistance / comparisons : 0;

    // Population diversity (Simpson's diversity index approximation)
    const populationDiversity =
      species.length > 1
        ? 1 -
          species.reduce(
            (sum, s) => sum + Math.pow(s.count / totalPopulation, 2),
            0
          )
        : 0;

    // Dominant species percentage
    const dominantSpeciesPercent =
      species.length > 0 ? (species[0].count / totalPopulation) * 100 : 100;

    return {
      speciesCount,
      averageGeneticDistance: Math.round(averageGeneticDistance * 1000) / 1000,
      populationDiversity: Math.round(populationDiversity * 1000) / 1000,
      dominantSpeciesPercent: Math.round(dominantSpeciesPercent * 10) / 10,
    };
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
              {entry.dataKey === "dominantSpeciesPercent" && "%"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const SpeciesScatterTooltip = ({ active, payload }: any) => {
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
          <p style={{ margin: "0 0 0.5rem 0", fontWeight: "600" }}>{data.id}</p>
          <p style={{ margin: "0.25rem 0" }}>Population: {data.count}</p>
          <p style={{ margin: "0.25rem 0" }}>Avg Size: {data.avgSize}</p>
          <p style={{ margin: "0.25rem 0" }}>Avg Speed: {data.avgSpeed}</p>
        </div>
      );
    }
    return null;
  };

  if (diversityHistory.length === 0) {
    return (
      <div
        style={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "0.875rem",
        }}
      >
        Analyzing species diversity...
      </div>
    );
  }

  return (
    <div>
      {/* Diversity Timeline */}
      <div style={{ marginBottom: "1rem" }}>
        <h4
          style={{
            color: "#d1d5db",
            fontSize: "0.875rem",
            margin: "0 0 0.5rem 0",
          }}
        >
          Diversity Timeline
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart
            data={diversityHistory}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="tick" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: "#d1d5db", fontSize: "0.75rem" }} />

            <Bar dataKey="speciesCount" fill="#8b5cf6" name="Species Count" />
            <Line
              type="monotone"
              dataKey="populationDiversity"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Diversity Index"
              yAxisId="right"
            />
            <Line
              type="monotone"
              dataKey="dominantSpeciesPercent"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Dominant %"
              yAxisId="right"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              fontSize={12}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Current Species Distribution */}
      <div>
        <h4
          style={{
            color: "#d1d5db",
            fontSize: "0.875rem",
            margin: "0 0 0.5rem 0",
          }}
        >
          Current Species (Size vs Speed)
        </h4>
        <ResponsiveContainer width="100%" height={180}>
          <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis
              type="number"
              dataKey="avgSize"
              name="Size"
              stroke="#9ca3af"
              fontSize={12}
              domain={[0.5, 2]}
            />
            <YAxis
              type="number"
              dataKey="avgSpeed"
              name="Speed"
              stroke="#9ca3af"
              fontSize={12}
              domain={[0.3, 1.5]}
            />
            <Tooltip content={<SpeciesScatterTooltip />} />
            <Scatter data={currentSpecies} fill="#8884d8">
              {currentSpecies.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
