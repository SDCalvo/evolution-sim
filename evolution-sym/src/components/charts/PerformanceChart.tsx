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
import { SimpleSimulationStats } from "../../lib/simulation/simpleSimulation";

interface PerformanceChartProps {
  statsHistory: SimpleSimulationStats[];
  maxDataPoints?: number;
}

interface PerformanceDataPoint {
  tick: number;
  ups: number;
  avgFitness: number;
  population: number;
  food: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  statsHistory,
  maxDataPoints = 50,
}) => {
  const generatePerformanceData = (): PerformanceDataPoint[] => {
    if (!statsHistory.length) return [];

    return statsHistory.slice(-maxDataPoints).map((stats) => ({
      tick: stats.currentTick,
      ups: Math.round(stats.updatesPerSecond * 10) / 10, // Round to 1 decimal
      avgFitness: Math.round(stats.averageFitness * 100) / 100, // Round to 2 decimals
      population: stats.livingCreatures,
      food: stats.totalFood,
    }));
  };

  const data = generatePerformanceData();

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
          height: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "0.875rem",
        }}
      >
        No performance data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
        <Line
          type="monotone"
          dataKey="ups"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="UPS"
        />
        <Line
          type="monotone"
          dataKey="population"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="Population"
        />
        <Line
          type="monotone"
          dataKey="food"
          stroke="#f59e0b"
          strokeWidth={1}
          dot={false}
          name="Food"
        />
        <Line
          type="monotone"
          dataKey="avgFitness"
          stroke="#8b5cf6"
          strokeWidth={1}
          dot={false}
          name="Avg Fitness"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
