/**
 * Energy Management Chart Component
 * Tracks energy efficiency and survival strategies
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
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { Creature } from "../../lib/creatures/creature";
import { CreatureState } from "../../lib/creatures/creatureTypes";
import { SimulationEvent } from "../../lib/simulation/simpleSimulation";

interface EnergyManagementChartProps {
  creatures: Creature[];
  events: SimulationEvent[];
  currentTick: number;
}

interface EnergyDataPoint {
  tick: number;
  avgEfficiency: number;
  avgRiskTaking: number;
  feedingSuccess: number;
  energyConservation: number;
  survivalPressure: number;
}

const ChartContainer = styled.div`
  width: 100%;
  height: 40vh;
  min-height: 20rem;
  max-height: 50vh;
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

const StrategyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StrategyCard = styled.div`
  background: #374151;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #4b5563;
`;

const StrategyTitle = styled.div`
  color: #60a5fa;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const StrategyValue = styled.div`
  color: #e5e7eb;
  font-size: 1.25rem;
  font-weight: bold;
`;

const StrategyDescription = styled.div`
  color: #9ca3af;
  font-size: 0.75rem;
  margin-top: 0.25rem;
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
            {`${entry.name}: ${entry.value.toFixed(2)}${
              entry.dataKey.includes("Success") ||
              entry.dataKey.includes("efficiency") ||
              entry.dataKey.includes("Conservation")
                ? "%"
                : ""
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const EnergyManagementChart: React.FC<EnergyManagementChartProps> = ({
  creatures,
  events,
  currentTick,
}) => {
  const [energyData, setEnergyData] = useState<EnergyDataPoint[]>([]);
  const [currentStrategies, setCurrentStrategies] = useState({
    avgEfficiency: 0,
    avgRiskTaking: 0,
    feedingSuccess: 0,
    energyConservation: 0,
  });

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

      // Calculate energy efficiency (energy gained per unit of aggression/risk)
      const avgEfficiency =
        aliveCreatures.reduce((acc, creature) => {
          const energyRatio = creature.physics.energy / 100;
          const riskFactor =
            creature.genetics.aggression * 0.5 +
            creature.genetics.speed * 0.3 +
            creature.genetics.size * 0.2;
          return acc + energyRatio / Math.max(riskFactor, 0.1);
        }, 0) / aliveCreatures.length;

      // Calculate average risk-taking behavior
      const avgRiskTaking =
        aliveCreatures.reduce((acc, creature) => {
          return acc + creature.genetics.aggression * 100;
        }, 0) / aliveCreatures.length;

      // Calculate feeding success from recent events
      const recentEvents = events.slice(-100);
      const feedingEvents = recentEvents.filter((e) => e.type === "feeding");

      // KEY FIX: Don't filter by alive creatures - events are historical!
      // The problem was that we were excluding events from creatures that died after eating
      const feedingByAliveCreatures = feedingEvents; // Use ALL feeding events, not just from currently alive creatures

      // Debug logging for chart data
      if (currentTick % 200 === 0) {
        console.log(
          `🔍 DEBUG CHART: Total events: ${events.length}, Recent: ${recentEvents.length}, Feeding: ${feedingEvents.length}, For alive creatures: ${feedingByAliveCreatures.length}, Alive creatures: ${aliveCreatures.length}`
        );
        console.log(
          `🔍 DEBUG CHART: Recent event types:`,
          recentEvents.map((e) => e.type).slice(0, 10)
        );

        // Debug energy calculations
        const totalEnergyBudget = aliveCreatures.reduce(
          (sum, c) => sum + 100,
          0
        );
        const currentTotalEnergy = aliveCreatures.reduce(
          (sum, c) => sum + c.physics.energy,
          0
        );
        console.log(
          `🔍 DEBUG CHART: Energy - Budget: ${totalEnergyBudget}, Current: ${currentTotalEnergy.toFixed(
            1
          )}, Efficiency: ${
            totalEnergyBudget > 0
              ? ((currentTotalEnergy / totalEnergyBudget) * 100).toFixed(1)
              : 0
          }%`
        );

        // Debug the actual percentage calculations that are failing
        const feedingSuccess =
          feedingByAliveCreatures.length > 0
            ? (feedingByAliveCreatures.filter((e) => e.details?.success)
                .length /
                feedingByAliveCreatures.length) *
              100
            : 0;
        console.log(
          `🔍 DEBUG CHART: Feeding Success Rate: ${feedingSuccess.toFixed(
            1
          )}% (${
            feedingByAliveCreatures.filter((e) => e.details?.success).length
          }/${feedingByAliveCreatures.length})`
        );
      }

      // FIXED: Use actual feeding success rate from events
      const feedingSuccess =
        feedingByAliveCreatures.length > 0
          ? (feedingByAliveCreatures.filter((e) => e.details?.success).length /
              feedingByAliveCreatures.length) *
            100
          : 0;

      // Calculate energy conservation (how well creatures maintain energy above 50)
      const energyConservation =
        (aliveCreatures.reduce((acc, creature) => {
          return acc + (creature.physics.energy > 50 ? 1 : 0);
        }, 0) /
          aliveCreatures.length) *
        100;

      // Calculate survival pressure (based on population density and deaths)
      const recentDeaths = recentEvents.filter(
        (e) => e.type === "death"
      ).length;
      const survivalPressure = Math.min(
        (recentDeaths / Math.max(aliveCreatures.length, 1)) * 100,
        100
      );

      const newPoint: EnergyDataPoint = {
        tick: currentTick,
        avgEfficiency: avgEfficiency * 100,
        avgRiskTaking,
        feedingSuccess,
        energyConservation,
        survivalPressure,
      };

      setCurrentStrategies({
        avgEfficiency: avgEfficiency * 100,
        avgRiskTaking,
        feedingSuccess,
        energyConservation,
      });

      setEnergyData((prev) => {
        const updated = [...prev, newPoint];
        isUpdating = false; // Reset flag after update
        return updated.slice(-100); // Keep last 100 points
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTick]); // Removed creatures.length and events.length to reduce updates

  const getStrategyStatus = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1])
      return { color: "#10b981", status: "Excellent" };
    if (value >= thresholds[0]) return { color: "#f59e0b", status: "Good" };
    return { color: "#ef4444", status: "Poor" };
  };

  const efficiencyStatus = getStrategyStatus(
    currentStrategies.avgEfficiency,
    [60, 80]
  );
  const feedingStatus = getStrategyStatus(
    currentStrategies.feedingSuccess,
    [30, 60]
  );
  const conservationStatus = getStrategyStatus(
    currentStrategies.energyConservation,
    [40, 70]
  );
  const riskStatus = getStrategyStatus(
    100 - currentStrategies.avgRiskTaking,
    [40, 70]
  );

  return (
    <ChartContainer>
      <ChartTitle>⚡ Energy Management & Survival Strategies</ChartTitle>

      <StrategyGrid>
        <StrategyCard>
          <StrategyTitle>Energy Efficiency</StrategyTitle>
          <StrategyValue style={{ color: efficiencyStatus.color }}>
            {currentStrategies.avgEfficiency.toFixed(1)}%
          </StrategyValue>
          <StrategyDescription>
            Energy gained per risk unit ({efficiencyStatus.status})
          </StrategyDescription>
        </StrategyCard>

        <StrategyCard>
          <StrategyTitle>Feeding Success</StrategyTitle>
          <StrategyValue style={{ color: feedingStatus.color }}>
            {currentStrategies.feedingSuccess.toFixed(1)}%
          </StrategyValue>
          <StrategyDescription>
            Recent feeding events ({feedingStatus.status})
          </StrategyDescription>
        </StrategyCard>

        <StrategyCard>
          <StrategyTitle>Energy Conservation</StrategyTitle>
          <StrategyValue style={{ color: conservationStatus.color }}>
            {currentStrategies.energyConservation.toFixed(1)}%
          </StrategyValue>
          <StrategyDescription>
            Population above 50 energy ({conservationStatus.status})
          </StrategyDescription>
        </StrategyCard>

        <StrategyCard>
          <StrategyTitle>Risk Management</StrategyTitle>
          <StrategyValue style={{ color: riskStatus.color }}>
            {(100 - currentStrategies.avgRiskTaking).toFixed(1)}%
          </StrategyValue>
          <StrategyDescription>
            Cautious vs aggressive behavior ({riskStatus.status})
          </StrategyDescription>
        </StrategyCard>
      </StrategyGrid>

      <div style={{ flex: 1, minHeight: "12rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={energyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="tick" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: "#e5e7eb" }} />

            {/* Efficiency and conservation as primary metrics */}
            <Line
              type="monotone"
              dataKey="avgEfficiency"
              stroke="#10b981"
              strokeWidth={3}
              name="Energy Efficiency"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="energyConservation"
              stroke="#60a5fa"
              strokeWidth={2}
              name="Energy Conservation"
              dot={false}
            />

            {/* Feeding success as secondary metric */}
            <Line
              type="monotone"
              dataKey="feedingSuccess"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Feeding Success"
              dot={false}
            />

            {/* Survival pressure as background context */}
            <Line
              type="monotone"
              dataKey="survivalPressure"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Survival Pressure"
              dot={false}
            />

            {/* Reference lines for strategy thresholds */}
            <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="2 2" />
            <ReferenceLine y={75} stroke="#059669" strokeDasharray="2 2" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
