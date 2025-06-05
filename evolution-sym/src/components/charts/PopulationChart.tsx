import React from "react";
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
import { SimulationEvent } from "../../lib/simulation/simpleSimulation";

interface PopulationChartProps {
  events: SimulationEvent[];
  currentTick: number;
  maxDataPoints?: number;
}

interface PopulationDataPoint {
  tick: number;
  population: number;
  totalBirths: number;
  totalDeaths: number;
  totalFeeding: number;
  totalCombat: number;
  totalReproduction: number;
}

export const PopulationChart: React.FC<PopulationChartProps> = ({
  events,
  currentTick,
  maxDataPoints = 100,
}) => {
  // Process events into timeline data with cumulative totals
  const generateTimelineData = (): PopulationDataPoint[] => {
    if (!events.length) return [];

    // Group events by tick intervals for smoother visualization
    const tickInterval = Math.max(1, Math.floor(currentTick / maxDataPoints));
    const dataPoints: PopulationDataPoint[] = [];

    let totalBirths = 0;
    let totalDeaths = 0;
    let totalFeeding = 0;
    let totalCombat = 0;
    let totalReproduction = 0;

    for (let tick = 0; tick <= currentTick; tick += tickInterval) {
      const tickEnd = tick + tickInterval;

      // Count events in this interval
      const birthsInInterval = events.filter(
        (e) => e.type === "birth" && e.tick >= tick && e.tick < tickEnd
      ).length;

      const deathsInInterval = events.filter(
        (e) => e.type === "death" && e.tick >= tick && e.tick < tickEnd
      ).length;

      const feedingInInterval = events.filter(
        (e) => e.type === "feeding" && e.tick >= tick && e.tick < tickEnd
      ).length;

      const combatInInterval = events.filter(
        (e) => e.type === "combat" && e.tick >= tick && e.tick < tickEnd
      ).length;

      const reproductionInInterval = events.filter(
        (e) => e.type === "reproduction" && e.tick >= tick && e.tick < tickEnd
      ).length;

      // Update cumulative totals
      totalBirths += birthsInInterval;
      totalDeaths += deathsInInterval;
      totalFeeding += feedingInInterval;
      totalCombat += combatInInterval;
      totalReproduction += reproductionInInterval;

      // Calculate current population
      const currentPopulation = Math.max(0, totalBirths - totalDeaths);

      dataPoints.push({
        tick,
        population: currentPopulation,
        totalBirths,
        totalDeaths,
        totalFeeding,
        totalCombat,
        totalReproduction,
      });
    }

    return dataPoints.slice(-maxDataPoints); // Keep only recent data
  };

  const data = generateTimelineData();

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
            minWidth: "200px",
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
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
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
        No population data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
        <XAxis
          dataKey="tick"
          stroke="#9ca3af"
          fontSize={12}
          tickFormatter={(tick: number) => `${tick}`}
        />
        <YAxis stroke="#9ca3af" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: "#d1d5db", fontSize: "0.875rem" }} />

        {/* Primary population line - thicker and more prominent */}
        <Line
          type="monotone"
          dataKey="population"
          stroke="#10b981"
          strokeWidth={3}
          dot={false}
          name="Live Population"
        />

        {/* Cumulative totals - thinner lines */}
        <Line
          type="monotone"
          dataKey="totalBirths"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="Total Births"
        />
        <Line
          type="monotone"
          dataKey="totalDeaths"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          name="Total Deaths"
        />
        <Line
          type="monotone"
          dataKey="totalFeeding"
          stroke="#84cc16"
          strokeWidth={1.5}
          dot={false}
          name="Total Feeding Events"
        />
        <Line
          type="monotone"
          dataKey="totalCombat"
          stroke="#f97316"
          strokeWidth={1.5}
          dot={false}
          name="Total Combat Events"
        />
        <Line
          type="monotone"
          dataKey="totalReproduction"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
          name="Total Reproductions"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
