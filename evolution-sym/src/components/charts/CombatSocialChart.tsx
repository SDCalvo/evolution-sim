/**
 * Combat & Social Behavior Chart Component
 * Tracks combat dynamics, social behaviors, and predator-prey interactions
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
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { Creature } from "../../lib/creatures/creature";
import { CreatureState } from "../../lib/creatures/creatureTypes";
import { SimulationEvent } from "../../lib/simulation/simpleSimulation";

interface CombatSocialChartProps {
  creatures: Creature[];
  events: SimulationEvent[];
  currentTick: number;
}

interface BehaviorDataPoint {
  tick: number;
  combatFrequency: number;
  combatSuccess: number;
  aggressionExpression: number;
  socialClustering: number;
  conflictAvoidance: number;
}

interface SpeciesCombatData {
  species: string;
  aggression: number;
  combatSuccess: number;
  population: number;
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
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  flex: 1;
  min-height: 15rem;
`;

const SingleChartContainer = styled.div`
  height: 100%;
`;

const BehaviorSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #374151;
  border-radius: 0.375rem;
`;

const SummaryCard = styled.div`
  text-align: center;
  padding: 0.5rem;
  background: #4b5563;
  border-radius: 0.25rem;
`;

const SummaryLabel = styled.div`
  color: #9ca3af;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
`;

const SummaryValue = styled.div<{ $color?: string }>`
  color: ${(props) => props.$color || "#e5e7eb"};
  font-size: 1.1rem;
  font-weight: bold;
`;

const SummarySubtext = styled.div`
  color: #6b7280;
  font-size: 0.7rem;
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
            {`${entry.name}: ${entry.value.toFixed(1)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const CombatSocialChart: React.FC<CombatSocialChartProps> = ({
  creatures,
  events,
  currentTick,
}) => {
  const [behaviorData, setBehaviorData] = useState<BehaviorDataPoint[]>([]);
  const [speciesCombatData, setSpeciesCombatData] = useState<
    SpeciesCombatData[]
  >([]);
  const [currentSummary, setCurrentSummary] = useState({
    totalCombats: 0,
    avgAggression: 0,
    socialCohesion: 0,
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

      // Analyze recent combat events
      const recentEvents = events.slice(-200);
      const combatEvents = recentEvents.filter((e) => e.type === "combat");
      const totalCombats = combatEvents.length;

      // Calculate combat frequency (combats per creature per time window)
      const combatFrequency =
        (totalCombats / Math.max(aliveCreatures.length, 1)) * 10;

      // Estimate combat success rate from creature stats
      const combatSuccess =
        (aliveCreatures.reduce((acc, creature) => {
          const totalAttacks = creature.stats.attacksGiven || 0;
          const attacksReceived = creature.stats.attacksReceived || 0;
          if (totalAttacks + attacksReceived === 0) return acc;
          return acc + totalAttacks / (totalAttacks + attacksReceived);
        }, 0) /
          aliveCreatures.length) *
        100;

      // Calculate aggression expression
      const aggressionExpression =
        (aliveCreatures.reduce((acc, creature) => {
          const aggressionTrait = creature.genetics.aggression;
          const actualAggression = Math.min(
            (creature.stats.attacksGiven || 0) /
              Math.max(creature.physics.age / 100, 1),
            1
          );
          return acc + actualAggression / Math.max(aggressionTrait, 0.1);
        }, 0) /
          aliveCreatures.length) *
        100;

      // Calculate social clustering
      let clusteredPairs = 0;
      let totalPairs = 0;
      const clusterRadius = 50;

      for (let i = 0; i < aliveCreatures.length; i++) {
        for (let j = i + 1; j < aliveCreatures.length; j++) {
          const distance = Math.sqrt(
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
          if (distance <= clusterRadius) clusteredPairs++;
          totalPairs++;
        }
      }
      const socialClustering =
        totalPairs > 0 ? (clusteredPairs / totalPairs) * 100 : 0;

      // Calculate conflict avoidance
      const conflictAvoidance = aliveCreatures.reduce((acc, creature) => {
        if (creature.genetics.aggression < 0.3) {
          const nearbyAggressives = aliveCreatures.filter((other) => {
            if (other.id === creature.id || other.genetics.aggression < 0.7)
              return false;
            const distance = Math.sqrt(
              Math.pow(
                creature.physics.position.x - other.physics.position.x,
                2
              ) +
                Math.pow(
                  creature.physics.position.y - other.physics.position.y,
                  2
                )
            );
            return distance < 80;
          }).length;
          return acc + (nearbyAggressives === 0 ? 1 : 0);
        }
        return acc;
      }, 0);
      const lowAggressionCount = aliveCreatures.filter(
        (c) => c.genetics.aggression < 0.3
      ).length;
      const conflictAvoidanceRate =
        lowAggressionCount > 0
          ? (conflictAvoidance / lowAggressionCount) * 100
          : 50;

      // Group creatures by species
      const speciesGroups = new Map<string, Creature[]>();
      aliveCreatures.forEach((creature) => {
        const hsl = creature.getHSLColor();
        const species =
          hsl.hue < 60
            ? "Carnivore"
            : hsl.hue < 180
            ? "Herbivore"
            : hsl.hue < 300
            ? "Omnivore"
            : "Specialist";

        if (!speciesGroups.has(species)) {
          speciesGroups.set(species, []);
        }
        speciesGroups.get(species)!.push(creature);
      });

      const speciesData: SpeciesCombatData[] = Array.from(
        speciesGroups.entries()
      ).map(([species, creatures]) => {
        const avgAggression =
          (creatures.reduce((sum, c) => sum + c.genetics.aggression, 0) /
            creatures.length) *
          100;
        const avgCombatSuccess =
          (creatures.reduce((sum, c) => {
            const attacks = c.stats.attacksGiven || 0;
            const received = c.stats.attacksReceived || 0;
            return (
              sum +
              (attacks + received > 0 ? attacks / (attacks + received) : 0.5)
            );
          }, 0) /
            creatures.length) *
          100;

        return {
          species,
          aggression: avgAggression,
          combatSuccess: avgCombatSuccess,
          population: creatures.length,
        };
      });

      setSpeciesCombatData(speciesData);

      const newPoint: BehaviorDataPoint = {
        tick: currentTick,
        combatFrequency: Math.min(combatFrequency, 100),
        combatSuccess,
        aggressionExpression: Math.min(aggressionExpression, 100),
        socialClustering,
        conflictAvoidance: conflictAvoidanceRate,
      };

      setCurrentSummary({
        totalCombats,
        avgAggression:
          (aliveCreatures.reduce((sum, c) => sum + c.genetics.aggression, 0) /
            aliveCreatures.length) *
          100,
        socialCohesion: socialClustering,
      });

      setBehaviorData((prev) => {
        const updated = [...prev, newPoint];
        isUpdating = false; // Reset flag after update
        return updated.slice(-100);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentTick]); // Removed creatures.length and events.length to reduce updates

  const getSummaryColor = (
    value: number,
    type: "combat" | "aggression" | "social"
  ) => {
    switch (type) {
      case "combat":
        if (value <= 5) return "#10b981";
        if (value <= 15) return "#f59e0b";
        return "#ef4444";
      case "aggression":
        if (value <= 30) return "#10b981";
        if (value <= 60) return "#f59e0b";
        return "#ef4444";
      case "social":
        if (value >= 15) return "#10b981";
        if (value >= 5) return "#f59e0b";
        return "#ef4444";
      default:
        return "#e5e7eb";
    }
  };

  return (
    <ChartContainer>
      <ChartTitle>⚔️ Combat Dynamics & Social Behavior</ChartTitle>

      <BehaviorSummary>
        <SummaryCard>
          <SummaryLabel>Combat Activity</SummaryLabel>
          <SummaryValue
            $color={getSummaryColor(currentSummary.totalCombats, "combat")}
          >
            {currentSummary.totalCombats}
          </SummaryValue>
          <SummarySubtext>Recent conflicts</SummarySubtext>
        </SummaryCard>

        <SummaryCard>
          <SummaryLabel>Population Aggression</SummaryLabel>
          <SummaryValue
            $color={getSummaryColor(currentSummary.avgAggression, "aggression")}
          >
            {currentSummary.avgAggression.toFixed(1)}%
          </SummaryValue>
          <SummarySubtext>Average trait level</SummarySubtext>
        </SummaryCard>

        <SummaryCard>
          <SummaryLabel>Social Cohesion</SummaryLabel>
          <SummaryValue
            $color={getSummaryColor(currentSummary.socialCohesion, "social")}
          >
            {currentSummary.socialCohesion.toFixed(1)}%
          </SummaryValue>
          <SummarySubtext>Clustering tendency</SummarySubtext>
        </SummaryCard>
      </BehaviorSummary>

      <DualChartContainer>
        <SingleChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={behaviorData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="tick" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#e5e7eb", fontSize: "12px" }} />

              <Line
                type="monotone"
                dataKey="combatFrequency"
                stroke="#ef4444"
                strokeWidth={3}
                name="Combat Frequency"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="combatSuccess"
                stroke="#f97316"
                strokeWidth={2}
                name="Combat Success"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="aggressionExpression"
                stroke="#dc2626"
                strokeWidth={2}
                name="Aggression Expression"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="socialClustering"
                stroke="#10b981"
                strokeWidth={2}
                name="Social Clustering"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="conflictAvoidance"
                stroke="#60a5fa"
                strokeWidth={2}
                name="Conflict Avoidance"
                dot={false}
              />

              <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="2 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </SingleChartContainer>

        <SingleChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={speciesCombatData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="species"
                stroke="#9ca3af"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.375rem",
                  color: "#e5e7eb",
                }}
              />
              <Bar
                dataKey="aggression"
                fill="#ef4444"
                name="Aggression"
                fillOpacity={0.8}
              />
              <Bar
                dataKey="combatSuccess"
                fill="#10b981"
                name="Combat Success"
                fillOpacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </SingleChartContainer>
      </DualChartContainer>
    </ChartContainer>
  );
};
