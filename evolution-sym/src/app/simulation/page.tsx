"use client";

import React, { useState } from "react";
import { SimulationCanvas } from "../../components/simulation/SimulationCanvas";
import { ControlPanel } from "../../components/simulation/ControlPanel";
import {
  SimpleSimulationConfig,
  SimpleSimulationStats,
} from "../../lib/simulation/simpleSimulation";

export default function SimulationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<SimpleSimulationStats | undefined>();
  const [canvasKey, setCanvasKey] = useState(0); // For forcing canvas reset

  // Simulation configuration
  const config: SimpleSimulationConfig = {
    initialPopulation: 10,
    maxPopulation: 50,
    worldWidth: 600,
    worldHeight: 600,
    targetFPS: 30,
  };

  const handleToggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStats(undefined);
    setCanvasKey((prev) => prev + 1); // Force canvas to recreate simulation
  };

  const handleStatsUpdate = (newStats: SimpleSimulationStats) => {
    setStats(newStats);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-8 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🧬 Evolution Simulation
          </h1>
          <p className="text-gray-300 text-lg">
            Watch AI creatures evolve through natural selection in real-time
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Simulation Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-semibold text-white mb-4">
                🌍 Digital Ecosystem
              </h2>
              <SimulationCanvas
                key={canvasKey}
                width={config.worldWidth}
                height={config.worldHeight}
                config={config}
                isRunning={isRunning}
                onStatsUpdate={handleStatsUpdate}
              />

              {/* Canvas Info */}
              <div className="mt-4 text-gray-400 text-sm">
                <p>
                  🔵 Creatures are colored by their genetics (diet = hue,
                  aggression = saturation, size = lightness)
                </p>
                <p>
                  🟢 Green dots are plant food • White glow indicates creature
                  energy level
                </p>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <ControlPanel
              isRunning={isRunning}
              onToggleRunning={handleToggleRunning}
              onReset={handleReset}
              stats={stats}
            />

            {/* Configuration Info */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">
                ⚙️ Configuration
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Population:</span>
                  <span className="text-white">
                    {config.initialPopulation} → {config.maxPopulation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">World Size:</span>
                  <span className="text-white">
                    {config.worldWidth}×{config.worldHeight}px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Target FPS:</span>
                  <span className="text-white">{config.targetFPS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Biome:</span>
                  <span className="text-green-400">Grassland</span>
                </div>
              </div>
            </div>

            {/* Evolution Info */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-3">
                🧬 Evolution Features
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Neural network AI brains</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>14-trait genetic system</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Environmental sensors</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Carrion scavenging</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Species color coding</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Sexual reproduction</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Species tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>
            Built with Next.js, TypeScript, and Canvas API • Neural networks
            built from scratch
          </p>
        </footer>
      </div>
    </div>
  );
}
