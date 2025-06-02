"use client";

import React from "react";
import { SimpleSimulationStats } from "../../lib/simulation/simpleSimulation";

interface ControlPanelProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  stats?: SimpleSimulationStats;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onToggleRunning,
  onReset,
  stats,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
      <h2 className="text-xl font-semibold text-white mb-4">
        🎮 Simulation Controls
      </h2>

      {/* Main Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={onToggleRunning}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isRunning
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isRunning ? "⏸️ Pause" : "▶️ Start"}
        </button>

        <button
          onClick={onReset}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          🔄 Reset
        </button>
      </div>

      {/* Statistics Display */}
      {stats && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white">📊 Live Statistics</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-300 text-sm">Simulation Tick</div>
              <div className="text-white text-xl font-mono">
                {stats.currentTick}
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-300 text-sm">Living Creatures</div>
              <div className="text-green-400 text-xl font-mono">
                {stats.livingCreatures}
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-300 text-sm">Food Available</div>
              <div className="text-yellow-400 text-xl font-mono">
                {stats.totalFood}
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <div className="text-gray-300 text-sm">Average Fitness</div>
              <div className="text-blue-400 text-xl font-mono">
                {stats.averageFitness.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-700 rounded p-3">
            <div className="text-gray-300 text-sm mb-2">Performance</div>
            <div className="flex justify-between items-center">
              <span className="text-white">Updates/sec:</span>
              <span className="text-purple-400 font-mono">
                {stats.updatesPerSecond.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isRunning ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <span className="text-gray-300 text-sm">
              {isRunning ? "Simulation Running" : "Simulation Paused"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
