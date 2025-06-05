/**
 * Movement Behavior Chart Component
 * Tracks movement patterns, territorial behavior, and spatial strategies
 */

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import { Creature } from "../../lib/creatures/creature";
import { CreatureState } from "../../lib/creatures/creatureTypes";

interface MovementBehaviorChartProps {
  creatures: Creature[];
  currentTick: number;
}

interface MovementDataPoint {
  tick: number;
  avgTerritorySize: number;
  movementEfficiency: number;
  speedUtilization: number;
  explorationTendency: number;
  spatialClustering: number;
}

interface TerritoryData {
  creatureId: string;
  x: number;
  y: number;
  territorySize: number;
  species: string;
}

const ChartContainer = styled.div`
  width: 100%;
  height: 45vh;
  min-height: 25rem;
  max-height: 60vh;
  padding: 0.75rem;
  background: #1f2937;
  border-radius: 0.5rem;
  border: 1px solid #374151;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ChartTitle = styled.h3`
  color: #e5e7eb;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  text-align: center;
`;

const DualChartContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1;
  min-height: 15rem;
`;

const SingleChartContainer = styled.div`
  height: 100%;
`;

const BehaviorMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #374151;
  border-radius: 0.375rem;
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricLabel = styled.div`
  color: #9ca3af;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div<{ $color?: string }>`
  color: ${(props) => props.$color || "#e5e7eb"};
  font-size: 1rem;
  font-weight: bold;
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#1f2937",
          border: "1px solid #374151",
          borderRadius: "0.375rem",
          padding: "0.75rem",
          color: "#e5e7eb",
        }}
      >
        <p style={{ margin: "0 0 0.5rem 0", color: "#60a5fa" }}>
          Tick: {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: "0.25rem 0", color: entry.color }}>
            {`${entry.name}: ${entry.value.toFixed(1)}${
              entry.dataKey.includes("Utilization") ||
              entry.dataKey.includes("Efficiency") ||
              entry.dataKey.includes("Tendency") ||
              entry.dataKey.includes("Clustering")
                ? "%"
                : entry.dataKey.includes("Size")
                ? " units"
                : ""
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TerritoryTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#1f2937",
          border: "1px solid #374151",
          borderRadius: "0.375rem",
          padding: "0.75rem",
          color: "#e5e7eb",
        }}
      >
        <p style={{ margin: "0 0 0.5rem 0", color: "#60a5fa" }}>
          Creature: {data.creatureId.slice(0, 8)}...
        </p>
        <p style={{ margin: "0.25rem 0", color: "#10b981" }}>
          Position: ({data.x.toFixed(0)}, {data.y.toFixed(0)})
        </p>
        <p style={{ margin: "0.25rem 0", color: "#f59e0b" }}>
          Territory: {data.territorySize.toFixed(1)} units²
        </p>
        <p style={{ margin: "0.25rem 0", color: "#a78bfa" }}>
          Species: {data.species}
        </p>
      </div>
    );
  }
  return null;
};

export const MovementBehaviorChart: React.FC<MovementBehaviorChartProps> = ({
  creatures,
  currentTick,
}) => {
  const [movementData, setMovementData] = useState<MovementDataPoint[]>([]);
  const [territoryData, setTerritoryData] = useState<TerritoryData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    avgTerritorySize: 0,
    movementEfficiency: 0,
    speedUtilization: 0,
    explorationTendency: 0,
    spatialClustering: 0,
  });

  // Track creature positions over time for territory calculation
  const [creatureHistory, setCreatureHistory] = useState<
    Map<string, Array<{ x: number; y: number; tick: number }>>
  >(new Map());

  useEffect(() => {
    let isUpdating = false;

    const interval = setInterval(() => {
      // Prevent concurrent updates
      if (isUpdating) return;
      isUpdating = true;

      const aliveCreatures = creatures.filter(
        (c) => c.state === CreatureState.Alive && c.physics.age > 5
      );

      if (aliveCreatures.length === 0) {
        isUpdating = false;
        return;
      }

      // Update creature position history
      const newHistory = new Map(creatureHistory);
      aliveCreatures.forEach((creature) => {
        const history = newHistory.get(creature.id) || [];
        history.push({
          x: creature.physics.position.x,
          y: creature.physics.position.y,
          tick: currentTick,
        });
        // Keep last 50 positions for territory calculation
        newHistory.set(creature.id, history.slice(-50));
      });
      setCreatureHistory(newHistory);

      // Calculate territory sizes based on position spread
      const territoryInfo = aliveCreatures
        .map((creature) => {
          const history = newHistory.get(creature.id) || [];
          if (history.length < 5) return null;

          // Calculate territory as standard deviation of positions
          const avgX =
            history.reduce((sum, pos) => sum + pos.x, 0) / history.length;
          const avgY =
            history.reduce((sum, pos) => sum + pos.y, 0) / history.length;

          const varianceX =
            history.reduce((sum, pos) => sum + Math.pow(pos.x - avgX, 2), 0) /
            history.length;
          const varianceY =
            history.reduce((sum, pos) => sum + Math.pow(pos.y - avgY, 2), 0) /
            history.length;

          const territorySize = Math.sqrt(varianceX + varianceY);

          // Determine species based on HSL color
          const hsl = creature.getHSLColor();
          const species =
            hsl.hue < 60
              ? "Carnivore"
              : hsl.hue < 180
              ? "Herbivore"
              : hsl.hue < 300
              ? "Omnivore"
              : "Specialist";

          return {
            creatureId: creature.id,
            x: creature.physics.position.x,
            y: creature.physics.position.y,
            territorySize,
            species,
          };
        })
        .filter(Boolean) as TerritoryData[];

      setTerritoryData(territoryInfo);

      // Calculate average territory size
      const avgTerritorySize =
        territoryInfo.length > 0
          ? territoryInfo.reduce((sum, info) => sum + info.territorySize, 0) /
            territoryInfo.length
          : 0;

      // Calculate movement efficiency (distance covered relative to speed trait)
      const movementEfficiency =
        (aliveCreatures.reduce((acc, creature) => {
          const history = newHistory.get(creature.id) || [];
          if (history.length < 2) return acc;

          const recentHistory = history.slice(-10);
          const totalDistance = recentHistory.reduce((dist, pos, index) => {
            if (index === 0) return dist;
            const prev = recentHistory[index - 1];
            return (
              dist +
              Math.sqrt(
                Math.pow(pos.x - prev.x, 2) + Math.pow(pos.y - prev.y, 2)
              )
            );
          }, 0);

          const expectedDistance = creature.genetics.speed * 10 * 10; // speed * ticks * movement_multiplier
          return (
            acc + (expectedDistance > 0 ? totalDistance / expectedDistance : 0)
          );
        }, 0) /
          aliveCreatures.length) *
        100;

      // Calculate speed utilization (how much of their speed potential they use)
      const speedUtilization =
        (aliveCreatures.reduce((acc, creature) => {
          // Estimate based on how active they are relative to their max speed
          const energyLevel = creature.physics.energy / 100;
          const speedTrait = creature.genetics.speed;
          const utilizationRate = Math.min(energyLevel * speedTrait, 1);
          return acc + utilizationRate;
        }, 0) /
          aliveCreatures.length) *
        100;

      // Calculate exploration tendency (how much they move away from center)
      const explorationTendency =
        (aliveCreatures.reduce((acc, creature) => {
          const centerX = 500; // Assume world center
          const centerY = 500;
          const distance = Math.sqrt(
            Math.pow(creature.physics.position.x - centerX, 2) +
              Math.pow(creature.physics.position.y - centerY, 2)
          );
          const maxDistance = Math.sqrt(Math.pow(500, 2) + Math.pow(500, 2)); // max possible distance
          return acc + distance / maxDistance;
        }, 0) /
          aliveCreatures.length) *
        100;

      // Calculate spatial clustering (how close creatures are to each other)
      let totalDistances = 0;
      let pairCount = 0;
      for (let i = 0; i < aliveCreatures.length; i++) {
        for (let j = i + 1; j < aliveCreatures.length; j++) {
          const dist = Math.sqrt(
            Math.pow(
              aliveCreatures[i].physics.position.x -
                aliveCreatures[j].physics.position.x,
              2
            ) +
              Math.pow(
                aliveCreatures[i].physics.position.y -
                  aliveCreatures[j].physics.position.y,
                2
              )
          );
          totalDistances += dist;
          pairCount++;
        }
      }
      const avgDistance = pairCount > 0 ? totalDistances / pairCount : 1000;
      const maxPossibleDistance = Math.sqrt(
        Math.pow(1000, 2) + Math.pow(1000, 2)
      );
      const spatialClustering = Math.max(
        0,
        100 - (avgDistance / maxPossibleDistance) * 100
      );

      const newPoint: MovementDataPoint = {
        tick: currentTick,
        avgTerritorySize,
        movementEfficiency,
        speedUtilization,
        explorationTendency,
        spatialClustering,
      };

      setCurrentMetrics({
        avgTerritorySize,
        movementEfficiency,
        speedUtilization,
        explorationTendency,
        spatialClustering,
      });

      setMovementData((prev) => {
        const updated = [...prev, newPoint];
        isUpdating = false; // Reset flag after update
        return updated.slice(-100); // Keep last 100 points
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [currentTick]); // Removed creatures.length to reduce updates

  const getMetricColor = (value: number, isHighGood: boolean = true) => {
    const threshold1 = isHighGood ? 40 : 60;
    const threshold2 = isHighGood ? 70 : 40;

    if (isHighGood) {
      if (value >= threshold2) return "#10b981";
      if (value >= threshold1) return "#f59e0b";
      return "#ef4444";
    } else {
      if (value <= threshold2) return "#10b981";
      if (value <= threshold1) return "#f59e0b";
      return "#ef4444";
    }
  };

  return (
    <ChartContainer>
      <ChartTitle>🚶 Movement Patterns & Territorial Behavior</ChartTitle>

      <BehaviorMetrics>
        <MetricItem>
          <MetricLabel>Territory Size</MetricLabel>
          <MetricValue $color={getMetricColor(currentMetrics.avgTerritorySize)}>
            {currentMetrics.avgTerritorySize.toFixed(1)}
          </MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>Move Efficiency</MetricLabel>
          <MetricValue
            $color={getMetricColor(currentMetrics.movementEfficiency)}
          >
            {currentMetrics.movementEfficiency.toFixed(1)}%
          </MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>Speed Use</MetricLabel>
          <MetricValue $color={getMetricColor(currentMetrics.speedUtilization)}>
            {currentMetrics.speedUtilization.toFixed(1)}%
          </MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>Exploration</MetricLabel>
          <MetricValue
            $color={getMetricColor(currentMetrics.explorationTendency)}
          >
            {currentMetrics.explorationTendency.toFixed(1)}%
          </MetricValue>
        </MetricItem>
        <MetricItem>
          <MetricLabel>Clustering</MetricLabel>
          <MetricValue
            $color={getMetricColor(currentMetrics.spatialClustering)}
          >
            {currentMetrics.spatialClustering.toFixed(1)}%
          </MetricValue>
        </MetricItem>
      </BehaviorMetrics>

      <DualChartContainer>
        <SingleChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={movementData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="tick" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#e5e7eb", fontSize: "12px" }} />

              <Line
                type="monotone"
                dataKey="movementEfficiency"
                stroke="#10b981"
                strokeWidth={2}
                name="Movement Efficiency"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="speedUtilization"
                stroke="#60a5fa"
                strokeWidth={2}
                name="Speed Utilization"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="explorationTendency"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Exploration"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="spatialClustering"
                stroke="#a78bfa"
                strokeWidth={2}
                name="Clustering"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </SingleChartContainer>

        <SingleChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                dataKey="x"
                name="X Position"
                stroke="#9ca3af"
                fontSize={11}
                domain={[0, 1000]}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Y Position"
                stroke="#9ca3af"
                fontSize={11}
                domain={[0, 1000]}
              />
              <Tooltip content={<TerritoryTooltip />} />
              <Scatter
                name="Territories"
                data={territoryData}
                fill="#60a5fa"
                fillOpacity={0.7}
              />

              {/* World center reference */}
              <ReferenceLine x={500} stroke="#6b7280" strokeDasharray="2 2" />
              <ReferenceLine y={500} stroke="#6b7280" strokeDasharray="2 2" />
            </ScatterChart>
          </ResponsiveContainer>
        </SingleChartContainer>
      </DualChartContainer>
    </ChartContainer>
  );
};
