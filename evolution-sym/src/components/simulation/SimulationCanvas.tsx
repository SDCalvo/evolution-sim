"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  SimpleSimulation,
  SimpleSimulationConfig,
  SimpleSimulationStats,
} from "../../lib/simulation/simpleSimulation";
import { Creature } from "../../lib/creatures/creature";
import { CreatureColorSystem } from "../../lib/creatures/creatureTypes";

interface SimulationCanvasProps {
  width: number;
  height: number;
  config: SimpleSimulationConfig;
  isRunning: boolean;
  onStatsUpdate?: (stats: SimpleSimulationStats) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  width,
  height,
  config,
  isRunning,
  onStatsUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<SimpleSimulation | null>(null);
  const animationFrameRef = useRef<number>();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize simulation
  useEffect(() => {
    if (!simulationRef.current) {
      simulationRef.current = new SimpleSimulation(config);
      setIsInitialized(true);
    }
  }, [config]);

  // Handle start/stop
  useEffect(() => {
    if (!simulationRef.current || !isInitialized) return;

    if (isRunning) {
      simulationRef.current.start();
      startRenderLoop();
    } else {
      simulationRef.current.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, isInitialized]);

  const startRenderLoop = () => {
    const render = () => {
      if (!simulationRef.current || !canvasRef.current) return;

      // Get current simulation state
      const creatures = simulationRef.current.getCreatures();
      const stats = simulationRef.current.getStats();

      // Update parent with stats
      if (onStatsUpdate) {
        onStatsUpdate(stats);
      }

      // Render the simulation
      renderSimulation(creatures);

      // Continue loop if running
      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();
  };

  const renderSimulation = (creatures: Creature[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    // Draw world boundary (circular)
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw grid for scientific feel
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw food items (if we can access them)
    // For now, we'll draw some placeholder food
    ctx.fillStyle = "#4ade80";
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (distance < radius - 10) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Draw creatures
    creatures.forEach((creature) => {
      const x = creature.physics.position.x;
      const y = creature.physics.position.y;

      // Skip if outside world bounds
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (distance > radius) return;

      // Get creature color based on genetics
      const color = CreatureColorSystem.getCreatureColor(creature.genetics);

      // Draw creature body
      const size = creature.genetics.size * 8 + 4; // 4-20 pixels
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();

      // Draw energy indicator (glow)
      const energyAlpha = creature.physics.energy / 100;
      ctx.fillStyle = `rgba(255, 255, 255, ${energyAlpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, size + 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw movement trail
      if (
        creature.physics.velocity.x !== 0 ||
        creature.physics.velocity.y !== 0
      ) {
        const trailLength = 15;
        const trailX = x - creature.physics.velocity.x * trailLength;
        const trailY = y - creature.physics.velocity.y * trailLength;

        ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Draw thought bubble if creature has a current thought
      if (
        creature.stats.currentThought &&
        creature.stats.currentThought.duration > 0
      ) {
        const thought = creature.stats.currentThought;

        // Position bubble above creature
        const bubbleX = x;
        const bubbleY = y - size - 25;

        // Bubble dimensions
        const bubbleWidth = Math.max(60, thought.text.length * 4);
        const bubbleHeight = 20;
        const bubbleRadius = 8;

        // Draw bubble background
        ctx.fillStyle = `${thought.color}dd`; // Add transparency
        ctx.strokeStyle = thought.color;
        ctx.lineWidth = 1;

        // Rounded rectangle for bubble (with fallback for older browsers)
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(
            bubbleX - bubbleWidth / 2,
            bubbleY - bubbleHeight / 2,
            bubbleWidth,
            bubbleHeight,
            bubbleRadius
          );
        } else {
          // Fallback: simple rectangle
          ctx.rect(
            bubbleX - bubbleWidth / 2,
            bubbleY - bubbleHeight / 2,
            bubbleWidth,
            bubbleHeight
          );
        }
        ctx.fill();
        ctx.stroke();

        // Draw bubble tail pointing to creature
        ctx.fillStyle = thought.color;
        ctx.beginPath();
        ctx.moveTo(bubbleX - 8, bubbleY + bubbleHeight / 2);
        ctx.lineTo(bubbleX + 8, bubbleY + bubbleHeight / 2);
        ctx.lineTo(bubbleX, bubbleY + bubbleHeight / 2 + 8);
        ctx.closePath();
        ctx.fill();

        // Draw thought text
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw icon first if available
        if (thought.icon) {
          ctx.font = "12px Arial";
          ctx.fillText(thought.icon, bubbleX - bubbleWidth / 4, bubbleY);

          // Then draw text
          ctx.font = "8px Arial";
          ctx.fillText(
            thought.text.slice(0, 12) + (thought.text.length > 12 ? "..." : ""),
            bubbleX + bubbleWidth / 6,
            bubbleY
          );
        } else {
          // Just draw text
          ctx.font = "9px Arial";
          ctx.fillText(
            thought.text.slice(0, 15) + (thought.text.length > 15 ? "..." : ""),
            bubbleX,
            bubbleY
          );
        }
      }

      // Draw creature ID (for debugging)
      if (size > 8) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(creature.id.slice(-3), x, y - size - 5);
      }
    });

    // Draw simulation info overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 200, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Creatures: ${creatures.length}`, 20, 30);
    ctx.fillText(
      `Tick: ${simulationRef.current?.getStats().currentTick || 0}`,
      20,
      45
    );
    ctx.fillText(
      `FPS: ${
        simulationRef.current?.getStats().updatesPerSecond.toFixed(1) || 0
      }`,
      20,
      60
    );
    ctx.fillText(
      `Fitness: ${
        simulationRef.current?.getStats().averageFitness.toFixed(2) || 0
      }`,
      20,
      75
    );
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-600 rounded-lg bg-gray-900"
        style={{ imageRendering: "pixelated" }}
      />

      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Initializing simulation...</p>
          </div>
        </div>
      )}
    </div>
  );
};
