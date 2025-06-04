"use client";

import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import {
  SimpleSimulation,
  SimpleSimulationConfig,
  SimpleSimulationStats,
} from "../../lib/simulation/simpleSimulation";
import { Creature } from "../../lib/creatures/creature";
import { CreatureColorSystem } from "../../lib/creatures/creatureTypes";

// Styled Components
const CanvasContainer = styled.div`
  position: relative;
`;

const SimulationCanvasElement = styled.canvas`
  border: 1px solid #4b5563;
  border-radius: 0.5rem;
  background: #111827;
  image-rendering: pixelated;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 24, 39, 0.75);
  border-radius: 0.5rem;
`;

const LoadingContent = styled.div`
  color: white;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  animation: spin 1s linear infinite;
  border-radius: 50%;
  height: 2rem;
  width: 2rem;
  border: 2px solid transparent;
  border-bottom-color: white;
  margin: 0 auto 0.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  margin: 0;
`;

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

    // Draw world boundary (circular) - simplified
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw food entities - simplified rendering
    if (simulationRef.current) {
      const environment = simulationRef.current.getEnvironment();
      const allFood = environment.getAllFood();

      // Batch food rendering to reduce canvas calls
      const foodByType: { [key: string]: any[] } = {};
      allFood.forEach((food) => {
        const x = food.position.x;
        const y = food.position.y;

        // Skip if outside world bounds
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance > radius - 10) return;

        if (!foodByType[food.type]) {
          foodByType[food.type] = [];
        }
        foodByType[food.type].push({ x, y, data: food });
      });

      // Render each food type in batches
      Object.entries(foodByType).forEach(([type, foods]) => {
        if (type === "plant_food") {
          ctx.fillStyle = "#4ade80";
          foods.forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
          });
        } else if (type === "small_prey") {
          ctx.fillStyle = "#facc15";
          foods.forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
          });
        } else if (type === "carrion") {
          foods.forEach(({ x, y, data }) => {
            const carrion = data;
            const freshness = carrion.currentDecayStage || 0;
            const red = Math.floor(139 - freshness * 50);
            const green = Math.floor(69 - freshness * 20);
            const blue = Math.floor(19 + freshness * 20);

            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.globalAlpha =
              carrion.decayVisual?.opacity || 1 - freshness * 0.7;

            const size = carrion.size || 6;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.8, 0, 2 * Math.PI);
            ctx.fill();
          });
          ctx.globalAlpha = 1.0;
        } else if (type === "mushroom_food") {
          ctx.fillStyle = "#a855f7";
          foods.forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
          });
        }
      });
    }

    // Draw creatures - highly optimized
    const visibleCreatures = creatures.filter((creature) => {
      const x = creature.physics.position.x;
      const y = creature.physics.position.y;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      return distance <= radius;
    });

    // Batch creature rendering by color to reduce fillStyle changes
    const creaturesByColor: {
      [color: string]: {
        creature: Creature;
        x: number;
        y: number;
        size: number;
      }[];
    } = {};

    visibleCreatures.forEach((creature) => {
      const x = creature.physics.position.x;
      const y = creature.physics.position.y;
      const color = CreatureColorSystem.getCreatureColor(creature.genetics);
      const size = creature.genetics.size * 8 + 4;

      if (!creaturesByColor[color]) {
        creaturesByColor[color] = [];
      }
      creaturesByColor[color].push({ creature, x, y, size });
    });

    // Render creatures in color batches
    Object.entries(creaturesByColor).forEach(([color, creatures]) => {
      ctx.fillStyle = color;
      creatures.forEach(({ x, y, size }) => {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Simplified simulation info overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(10, 10, 180, 60);

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
      `UPS: ${
        simulationRef.current?.getStats().updatesPerSecond.toFixed(1) || 0
      }`,
      20,
      60
    );
  };

  return (
    <CanvasContainer>
      <SimulationCanvasElement ref={canvasRef} width={width} height={height} />

      {!isInitialized && (
        <LoadingOverlay>
          <LoadingContent>
            <LoadingSpinner />
            <LoadingText>Initializing simulation...</LoadingText>
          </LoadingContent>
        </LoadingOverlay>
      )}
    </CanvasContainer>
  );
};
