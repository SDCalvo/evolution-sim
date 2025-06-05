/**
 * Evolution Analyzer UI Component
 * Research-grade analysis tools for studying digital evolution
 */

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  SimpleSimulationStats,
  SimulationSummary,
  BrainAnalysis,
  ActionAnalysis,
  SimulationEvent,
} from "../lib/simulation/simpleSimulation";
import { Creature } from "../lib/creatures/creature";
import { CreatureState } from "../lib/creatures/creatureTypes";
import { Environment } from "../lib/environment/environment";
import { PopulationChart } from "./charts/PopulationChart";
import { GeneticTraitsChart } from "./charts/GeneticTraitsChart";
import { PerformanceChart } from "./charts/PerformanceChart";
import { EnergyChart } from "./charts/EnergyChart";
import { SpeciesDiversityChart } from "./charts/SpeciesDiversityChart";
import { TraitEvolutionChart } from "./charts/TraitEvolutionChart";
import { EnergyManagementChart } from "./charts/EnergyManagementChart";
import { MovementBehaviorChart } from "./charts/MovementBehaviorChart";
import { CombatSocialChart } from "./charts/CombatSocialChart";

interface EvolutionAnalyzerProps {
  isOpen: boolean;
  onToggle: () => void;
  currentStats?: SimpleSimulationStats;
  creatures?: Creature[];
  environment?: Environment;
  simulationSummary?: SimulationSummary;
  events?: SimulationEvent[];
}

// Styled Components
const FloatingButton = styled.button`
  position: fixed;
  bottom: 4rem;
  right: 1rem;
  z-index: 50;
  background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, #6d28d9 0%, #2563eb 100%);
    transform: translateY(-2px);
    box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.2);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: #1f2937;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 80rem;
  height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #4b5563;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #4b5563;
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(to right, #60a5fa, #a78bfa);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatusBadge = styled.span<{ $variant?: "success" | "warning" | "info" }>`
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;

  ${(props) => {
    switch (props.$variant) {
      case "success":
        return `
          background: #065f46;
          color: #10b981;
          border: 1px solid #047857;
        `;
      case "warning":
        return `
          background: #78350f;
          color: #f59e0b;
          border: 1px solid #92400e;
        `;
      default:
        return `
          background: #1e3a8a;
          color: #60a5fa;
          border: 1px solid #1d4ed8;
        `;
    }
  }}
`;

const ActionButton = styled.button<{
  $variant?: "primary" | "success" | "danger" | "secondary";
}>`
  padding: 0.375rem 0.875rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) => {
    switch (props.$variant) {
      case "primary":
        return `
          background: #3b82f6;
          color: white;
          &:hover { background: #2563eb; transform: translateY(-1px); }
        `;
      case "success":
        return `
          background: #10b981;
          color: white;
          &:hover { background: #059669; transform: translateY(-1px); }
        `;
      case "danger":
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; transform: translateY(-1px); }
        `;
      default:
        return `
          background: #6b7280;
          color: white;
          &:hover { background: #4b5563; transform: translateY(-1px); }
        `;
    }
  }}
`;

const CloseButton = styled.button`
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    color: white;
    background: #374151;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #4b5563;
  background: #374151;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  background: ${(props) => (props.$active ? "#1f2937" : "transparent")};
  color: ${(props) => (props.$active ? "#60a5fa" : "#9ca3af")};
  border-bottom: ${(props) =>
    props.$active ? "2px solid #3b82f6" : "2px solid transparent"};
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    color: #d1d5db;
    background: #4b5563;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: #1f2937;
`;

const GridContainer = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$columns || 2}, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AnalysisCard = styled.div`
  background: #374151;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #4b5563;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardContent = styled.div`
  color: #d1d5db;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MetricLabel = styled.span`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const MetricValue = styled.span<{ $color?: string }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.$color || "#d1d5db"};
`;

const ProgressBar = styled.div<{ $percentage: number; $color?: string }>`
  width: 100%;
  height: 0.5rem;
  background: #4b5563;
  border-radius: 0.25rem;
  overflow: hidden;
  margin: 0.5rem 0;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(props) => Math.min(100, Math.max(0, props.$percentage))}%;
    background: ${(props) => props.$color || "#3b82f6"};
    transition: width 0.3s ease;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 200px;
  background: #4b5563;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 1rem 0;
`;

const TraitTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 0.75rem 0.5rem;
  color: #9ca3af;
  border-bottom: 1px solid #4b5563;
  font-weight: 500;
`;

const TableCell = styled.td`
  padding: 0.75rem 0.5rem;
  color: #d1d5db;
  border-bottom: 1px solid #4b5563;
`;

const SpeciesColorDot = styled.div<{ $color: string }>`
  width: 1rem;
  height: 1rem;
  background-color: ${(props) => props.$color};
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.5rem;
`;

const InsightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InsightItem = styled.li`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #4b5563;
  border-radius: 0.5rem;
  border-left: 3px solid #3b82f6;
  color: #d1d5db;
  font-size: 0.875rem;
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
`;

// Main Component
export const EvolutionAnalyzer: React.FC<EvolutionAnalyzerProps> = ({
  isOpen,
  onToggle,
  currentStats,
  creatures = [],
  environment,
  simulationSummary,
  events = [],
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "genetics" | "behavior" | "intelligence" | "environment"
  >("overview");

  // Track statistics history for charts
  const [statsHistory, setStatsHistory] = useState<SimpleSimulationStats[]>([]);

  // Add debugging logs
  useEffect(() => {
    console.log("🔬 EvolutionAnalyzer Debug:", {
      isOpen,
      currentStats,
      creaturesCount: creatures.length,
      eventsCount: events.length,
      environment: environment ? "present" : "missing",
      simulationSummary: simulationSummary ? "present" : "missing",
      activeTab,
    });
  }, [
    isOpen,
    currentStats,
    creatures.length,
    events.length,
    environment,
    simulationSummary,
    activeTab,
  ]);

  // Update stats history when currentStats changes
  useEffect(() => {
    if (currentStats) {
      console.log("📊 Updating stats history:", currentStats);
      setStatsHistory((prev) => {
        const newHistory = [...prev, currentStats];
        // Keep last 100 data points for performance
        return newHistory.slice(-100);
      });
    }
  }, [currentStats]);

  // Calculate real-time statistics
  const getPopulationStats = () => {
    if (!creatures.length) return null;

    const alive = creatures.filter((c) => c.state === CreatureState.Alive);
    const totalFitness = alive.reduce((sum, c) => sum + c.stats.fitness, 0);
    const averageFitness = alive.length > 0 ? totalFitness / alive.length : 0;

    return {
      alive: alive.length,
      total: creatures.length,
      averageFitness,
      averageAge:
        alive.length > 0
          ? alive.reduce((sum, c) => sum + c.physics.age, 0) / alive.length
          : 0,
      averageEnergy:
        alive.length > 0
          ? alive.reduce((sum, c) => sum + c.physics.energy, 0) / alive.length
          : 0,
    };
  };

  const getGeneticStats = () => {
    if (!creatures.length) return null;

    const alive = creatures.filter((c) => c.state === CreatureState.Alive);
    if (!alive.length) return null;

    const traits = alive.map((c) => c.genetics);
    const avgTraits = {
      size: traits.reduce((sum, t) => sum + t.size, 0) / traits.length,
      speed: traits.reduce((sum, t) => sum + t.speed, 0) / traits.length,
      aggression:
        traits.reduce((sum, t) => sum + t.aggression, 0) / traits.length,
      plantPreference:
        traits.reduce((sum, t) => sum + t.plantPreference, 0) / traits.length,
      meatPreference:
        traits.reduce((sum, t) => sum + t.meatPreference, 0) / traits.length,
      visionRange:
        traits.reduce((sum, t) => sum + t.visionRange, 0) / traits.length,
    };

    return { avgTraits, diversity: traits.length };
  };

  const getBehaviorStats = () => {
    if (!events.length) return null;

    const recentEvents = events.slice(-1000); // Last 1000 events
    const eventCounts = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: recentEvents.length,
      births: eventCounts.birth || 0,
      deaths: eventCounts.death || 0,
      feeding: eventCounts.feeding || 0,
      combat: eventCounts.combat || 0,
      reproduction: eventCounts.reproduction || 0,
    };
  };

  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      currentStats,
      populationStats: getPopulationStats(),
      geneticStats: getGeneticStats(),
      behaviorStats: getBehaviorStats(),
      simulationSummary,
      events: events.slice(-100), // Last 100 events
      creatures: creatures
        .filter((c) => c.state === CreatureState.Alive)
        .slice(0, 50) // Top 50 creatures
        .map((c) => ({
          id: c.id,
          age: c.physics.age,
          energy: c.physics.energy,
          fitness: c.stats.fitness,
          genetics: c.genetics,
          position: c.physics.position,
        })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evolution-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const populationStats = getPopulationStats();
    const geneticStats = getGeneticStats();

    if (!populationStats || !geneticStats) return;

    const csvData = [
      ["Metric", "Value"],
      ["Living Creatures", populationStats.alive.toString()],
      ["Average Fitness", populationStats.averageFitness.toFixed(3)],
      ["Average Age", populationStats.averageAge.toFixed(1)],
      ["Average Energy", populationStats.averageEnergy.toFixed(1)],
      ["Average Size", geneticStats.avgTraits.size.toFixed(3)],
      ["Average Speed", geneticStats.avgTraits.speed.toFixed(3)],
      ["Average Aggression", geneticStats.avgTraits.aggression.toFixed(3)],
      ["Plant Preference", geneticStats.avgTraits.plantPreference.toFixed(3)],
      ["Meat Preference", geneticStats.avgTraits.meatPreference.toFixed(3)],
      ["Vision Range", geneticStats.avgTraits.visionRange.toFixed(3)],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evolution-stats-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverviewTab = () => {
    console.log("📊 renderOverviewTab called");
    const populationStats = getPopulationStats();
    const behaviorStats = getBehaviorStats();

    console.log("📊 Overview data:", {
      populationStats,
      behaviorStats,
      eventsCount: events.length,
      currentTick: currentStats?.currentTick,
    });

    try {
      return (
        <div>
          <GridContainer $columns={1}>
            <AnalysisCard>
              <CardTitle>📈 Population & Activity Trends</CardTitle>
              <CardContent>
                {(() => {
                  try {
                    console.log(
                      "📈 Rendering PopulationChart with events:",
                      events.length
                    );
                    return (
                      <PopulationChart
                        events={events}
                        currentTick={currentStats?.currentTick || 0}
                      />
                    );
                  } catch (error) {
                    console.error("❌ PopulationChart error:", error);
                    return (
                      <div style={{ color: "#ef4444" }}>
                        Error loading Population Chart:{" "}
                        {error instanceof Error ? error.message : String(error)}
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </AnalysisCard>
          </GridContainer>

          <GridContainer $columns={2}>
            <AnalysisCard>
              <CardTitle>⚡ Average Energy Levels</CardTitle>
              <CardContent>
                {(() => {
                  try {
                    console.log(
                      "⚡ Rendering EnergyChart with creatures:",
                      creatures.length
                    );
                    return (
                      <EnergyChart
                        creatures={creatures}
                        currentTick={currentStats?.currentTick || 0}
                      />
                    );
                  } catch (error) {
                    console.error("❌ EnergyChart error:", error);
                    return (
                      <div style={{ color: "#ef4444" }}>
                        Error loading Energy Chart:{" "}
                        {error instanceof Error ? error.message : String(error)}
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </AnalysisCard>

            <AnalysisCard>
              <CardTitle>📊 Performance Metrics</CardTitle>
              <CardContent>
                {(() => {
                  try {
                    console.log(
                      "📊 Rendering PerformanceChart with statsHistory:",
                      statsHistory.length
                    );
                    return <PerformanceChart statsHistory={statsHistory} />;
                  } catch (error) {
                    console.error("❌ PerformanceChart error:", error);
                    return (
                      <div style={{ color: "#ef4444" }}>
                        Error loading Performance Chart:{" "}
                        {error instanceof Error ? error.message : String(error)}
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </AnalysisCard>
          </GridContainer>

          {simulationSummary && (
            <AnalysisCard>
              <CardTitle>💡 AI Insights</CardTitle>
              <CardContent>
                <InsightsList>
                  {simulationSummary.insights.map((insight, index) => (
                    <InsightItem key={index}>{insight}</InsightItem>
                  ))}
                </InsightsList>
              </CardContent>
            </AnalysisCard>
          )}
        </div>
      );
    } catch (error) {
      console.error("❌ renderOverviewTab error:", error);
      return (
        <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
          <h3>Error loading Overview tab</h3>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      );
    }
  };

  const renderGeneticsTab = () => {
    console.log("🧬 renderGeneticsTab called");
    const geneticStats = getGeneticStats();
    console.log("🧬 Genetics data:", {
      geneticStats,
      creaturesCount: creatures.length,
    });

    try {
      return (
        <div>
          <GridContainer $columns={1}>
            <AnalysisCard>
              <CardTitle>🧬 Genetic Diversity Analysis</CardTitle>
              <CardContent>
                {(() => {
                  try {
                    console.log("📊 Rendering GeneticTraitsChart");
                    return (
                      <GeneticTraitsChart
                        creatures={creatures}
                        currentTick={currentStats?.currentTick || 0}
                      />
                    );
                  } catch (error) {
                    console.error("❌ GeneticTraitsChart error:", error);
                    return (
                      <div style={{ color: "#ef4444" }}>
                        Error loading Genetic Traits Chart:{" "}
                        {error instanceof Error ? error.message : String(error)}
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </AnalysisCard>
          </GridContainer>

          <GridContainer $columns={1}>
            <AnalysisCard>
              <CardTitle>🔬 Species Diversity Tracking</CardTitle>
              <CardContent>
                {(() => {
                  try {
                    console.log("🌈 Rendering SpeciesDiversityChart");
                    return (
                      <SpeciesDiversityChart
                        creatures={creatures}
                        currentTick={currentStats?.currentTick || 0}
                      />
                    );
                  } catch (error) {
                    console.error("❌ SpeciesDiversityChart error:", error);
                    return (
                      <div style={{ color: "#ef4444" }}>
                        Error loading Species Diversity Chart:{" "}
                        {error instanceof Error ? error.message : String(error)}
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </AnalysisCard>
          </GridContainer>

          <GridContainer $columns={1}>
            <AnalysisCard>
              <CardTitle>📈 Trait Evolution Timeline</CardTitle>
              <CardContent>
                {(() => {
                  try {
                    console.log("📈 Rendering TraitEvolutionChart");
                    return (
                      <TraitEvolutionChart
                        creatures={creatures}
                        currentTick={currentStats?.currentTick || 0}
                      />
                    );
                  } catch (error) {
                    console.error("❌ TraitEvolutionChart error:", error);
                    return (
                      <div style={{ color: "#ef4444" }}>
                        Error loading Trait Evolution Chart:{" "}
                        {error instanceof Error ? error.message : String(error)}
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </AnalysisCard>
          </GridContainer>
        </div>
      );
    } catch (error) {
      console.error("❌ renderGeneticsTab error:", error);
      return (
        <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
          <h3>Error loading Genetics tab</h3>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      );
    }
  };

  const renderBehaviorTab = () => {
    console.log("🎭 renderBehaviorTab called");
    const behaviorStats = getBehaviorStats();
    console.log("🎭 Behavior data:", {
      behaviorStats,
      creaturesCount: creatures.length,
      eventsCount: events.length,
    });

    try {
      return (
        <div>
          <GridContainer $columns={1}>
            <AnalysisCard>
              <CardTitle>⚡ Energy & Movement Analysis</CardTitle>
              <CardContent>
                {(() => {
                  try {
                    console.log("⚡ Rendering EnergyManagementChart");
                    return (
                      <EnergyManagementChart
                        creatures={creatures}
                        events={events}
                        currentTick={currentStats?.currentTick || 0}
                      />
                    );
                  } catch (energyError) {
                    console.error(
                      "❌ EnergyManagementChart error:",
                      energyError
                    );
                    return (
                      <div style={{ color: "#ef4444", padding: "1rem" }}>
                        Error loading Energy Management Chart:{" "}
                        {energyError instanceof Error
                          ? energyError.message
                          : String(energyError)}
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </AnalysisCard>

            <AnalysisCard>
              <CardTitle>🚶 Movement & Territorial Behavior</CardTitle>
              <CardContent>
                {(() => {
                  try {
                    console.log("🚶 Rendering MovementBehaviorChart");
                    return (
                      <MovementBehaviorChart
                        creatures={creatures}
                        currentTick={currentStats?.currentTick || 0}
                      />
                    );
                  } catch (movementError) {
                    console.error(
                      "❌ MovementBehaviorChart error:",
                      movementError
                    );
                    return (
                      <div style={{ color: "#ef4444", padding: "1rem" }}>
                        Error loading Movement Behavior Chart:{" "}
                        {movementError instanceof Error
                          ? movementError.message
                          : String(movementError)}
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </AnalysisCard>

            <AnalysisCard>
              <CardTitle>⚔️ Combat & Social Dynamics</CardTitle>
              <CardContent>
                {(() => {
                  try {
                    console.log("⚔️ Rendering CombatSocialChart");
                    return (
                      <CombatSocialChart
                        creatures={creatures}
                        events={events}
                        currentTick={currentStats?.currentTick || 0}
                      />
                    );
                  } catch (combatError) {
                    console.error("❌ CombatSocialChart error:", combatError);
                    return (
                      <div style={{ color: "#ef4444", padding: "1rem" }}>
                        Error loading Combat Social Chart:{" "}
                        {combatError instanceof Error
                          ? combatError.message
                          : String(combatError)}
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </AnalysisCard>
          </GridContainer>
        </div>
      );
    } catch (behaviorError) {
      console.error("❌ renderBehaviorTab error:", behaviorError);
      return (
        <div style={{ color: "#ef4444", padding: "2rem", textAlign: "center" }}>
          <h3>Behavior Tab Error</h3>
          <p>
            Failed to render behavior analysis:{" "}
            {behaviorError instanceof Error
              ? behaviorError.message
              : String(behaviorError)}
          </p>
          <details style={{ marginTop: "1rem", textAlign: "left" }}>
            <summary>Error Details</summary>
            <pre style={{ fontSize: "0.8rem", overflow: "auto" }}>
              {behaviorError instanceof Error
                ? behaviorError.stack
                : String(behaviorError)}
            </pre>
          </details>
        </div>
      );
    }
  };

  const renderIntelligenceTab = () => {
    return (
      <div>
        <AnalysisCard>
          <CardTitle>🧠 Neural Network Evolution</CardTitle>
          <CardContent>
            <ChartContainer>
              Brain complexity and decision-making analysis coming soon...
              <br />
              <small>
                Neural network architecture evolution and intelligence metrics
              </small>
            </ChartContainer>
          </CardContent>
        </AnalysisCard>
      </div>
    );
  };

  const renderEnvironmentTab = () => {
    return (
      <div>
        <AnalysisCard>
          <CardTitle>🌍 Environmental Impact</CardTitle>
          <CardContent>
            <ChartContainer>
              Environmental analysis coming soon...
              <br />
              <small>
                Resource distribution, spatial patterns, and ecosystem health
              </small>
            </ChartContainer>
          </CardContent>
        </AnalysisCard>
      </div>
    );
  };

  const renderTabContent = () => {
    console.log("🎨 Rendering tab content for:", activeTab);

    try {
      switch (activeTab) {
        case "overview":
          console.log("📊 Rendering overview tab");
          return renderOverviewTab();
        case "genetics":
          console.log("🧬 Rendering genetics tab");
          return renderGeneticsTab();
        case "behavior":
          console.log("🎭 Rendering behavior tab");
          return renderBehaviorTab();
        case "intelligence":
          console.log("🧠 Rendering intelligence tab");
          return renderIntelligenceTab();
        case "environment":
          console.log("🌍 Rendering environment tab");
          return renderEnvironmentTab();
        default:
          console.log("📊 Rendering default overview tab");
          return renderOverviewTab();
      }
    } catch (error) {
      console.error("❌ Error rendering tab content:", error);
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#ef4444",
          }}
        >
          <h3>Error loading tab content</h3>
          <p>Check console for details</p>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      );
    }
  };

  return (
    <>
      <FloatingButton onClick={onToggle}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 3v18h18V3H3z" />
          <path d="M21 9H3" />
          <path d="M21 15H3" />
          <path d="M12 3v18" />
        </svg>
        Evolution Analyzer
      </FloatingButton>

      {isOpen && (
        <Overlay onClick={onToggle}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <Header>
              <Title>🔬 Evolution Analyzer</Title>
              <HeaderActions>
                <StatusBadge $variant="info">Research Mode</StatusBadge>
                <ActionButton $variant="success" onClick={handleExportData}>
                  Export JSON
                </ActionButton>
                <ActionButton $variant="primary" onClick={handleExportCSV}>
                  Export CSV
                </ActionButton>
                <CloseButton onClick={onToggle}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </CloseButton>
              </HeaderActions>
            </Header>

            <TabsContainer>
              <Tab
                $active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
              >
                📊 Overview
              </Tab>
              <Tab
                $active={activeTab === "genetics"}
                onClick={() => setActiveTab("genetics")}
              >
                🧬 Genetics
              </Tab>
              <Tab
                $active={activeTab === "behavior"}
                onClick={() => setActiveTab("behavior")}
              >
                🎭 Behavior
              </Tab>
              <Tab
                $active={activeTab === "intelligence"}
                onClick={() => setActiveTab("intelligence")}
              >
                🧠 Intelligence
              </Tab>
              <Tab
                $active={activeTab === "environment"}
                onClick={() => setActiveTab("environment")}
              >
                🌍 Environment
              </Tab>
            </TabsContainer>

            <Content>{renderTabContent()}</Content>
          </Modal>
        </Overlay>
      )}
    </>
  );
};
