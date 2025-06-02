/**
 * Simple Simulation Manager - FIXED VERSION
 * Now properly calls creature AI updates!
 */

import { Environment } from "../environment/environment";
import { Creature } from "../creatures/creature";
import { GeneticsHelper } from "../creatures/creatureTypes";
import { BiomeType } from "../environment/environmentTypes";

export interface SimpleSimulationConfig {
  initialPopulation: number;
  maxPopulation: number;
  worldWidth: number;
  worldHeight: number;
  targetFPS: number;
}

export interface SimpleSimulationStats {
  currentTick: number;
  livingCreatures: number;
  totalFood: number;
  averageFitness: number;
  updatesPerSecond: number;
}

export class SimpleSimulation {
  private environment: Environment;
  private config: SimpleSimulationConfig;
  private isRunning: boolean = false;
  private currentTick: number = 0;
  private updateTimes: number[] = [];

  constructor(config: SimpleSimulationConfig) {
    this.config = config;

    // Create environment with grassland biome
    this.environment = new Environment({
      bounds: {
        width: config.worldWidth,
        height: config.worldHeight,
        shape: "circular",
        centerX: config.worldWidth / 2,
        centerY: config.worldHeight / 2,
      },
      biome: {
        type: BiomeType.Grassland,
        name: "Grassland",
        characteristics: {
          temperature: 0.6,
          humidity: 0.5,
          waterAvailability: 0.7,
          plantDensity: 0.8,
          preyDensity: 0.4,
          shelterAvailability: 0.3,
          predationPressure: 0.3,
          competitionLevel: 0.5,
          seasonalVariation: 0.2,
        },
        color: "#4ade80",
        description: "Balanced grassland environment",
      },
      maxCreatures: config.maxPopulation,
      maxFood: config.maxPopulation * 3,
      foodSpawnRate: 0.1,
      preySpawnRate: 0.05,
      spatialGridSize: 100,
      updateFrequency: 1,
    });

    this.initializePopulation();
  }

  private initializePopulation(): void {
    for (let i = 0; i < this.config.initialPopulation; i++) {
      const genetics = GeneticsHelper.generateRandomGenetics();

      const position = {
        x:
          Math.random() * this.config.worldWidth * 0.8 +
          this.config.worldWidth * 0.1,
        y:
          Math.random() * this.config.worldHeight * 0.8 +
          this.config.worldHeight * 0.1,
      };

      const creature = new Creature(0, genetics, undefined, position);

      this.environment.addCreature(creature);
    }
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.simulationLoop();
  }

  public stop(): void {
    this.isRunning = false;
  }

  private simulationLoop(): void {
    if (!this.isRunning) return;

    const startTime = performance.now();

    // 🚀 THE KEY FIX: Update simulation AND call creature AI updates!
    this.currentTick++;

    // Get all creatures and update them individually
    const creatures = this.environment.getCreatures();

    // 🧠 CALL CREATURE AI BRAINS - This was missing!
    creatures.forEach((creature) => {
      creature.update(this.environment); // Each creature thinks and acts!
    });

    // Update environment (food spawning, physics, etc.)
    this.environment.update();

    // Track performance
    const updateTime = performance.now() - startTime;
    this.updateTimes.push(updateTime);
    if (this.updateTimes.length > 60) {
      this.updateTimes.shift();
    }

    // Schedule next update at reasonable speed
    const targetFrameTime = 1000 / this.config.targetFPS;
    const nextUpdateDelay = Math.max(16, targetFrameTime - updateTime); // Minimum 16ms (60 FPS max)

    setTimeout(() => this.simulationLoop(), nextUpdateDelay);
  }

  public getStats(): SimpleSimulationStats {
    const envStats = this.environment.getStats();
    const creatures = this.environment.getCreatures();

    const averageFitness =
      creatures.length > 0
        ? creatures.reduce(
            (sum: number, c: Creature) => sum + c.stats.fitness,
            0
          ) / creatures.length
        : 0;

    const averageUpdateTime =
      this.updateTimes.length > 0
        ? this.updateTimes.reduce((sum: number, t: number) => sum + t, 0) /
          this.updateTimes.length
        : 0;

    const updatesPerSecond =
      averageUpdateTime > 0 ? 1000 / averageUpdateTime : 0;

    return {
      currentTick: this.currentTick,
      livingCreatures: envStats.livingCreatures,
      totalFood: envStats.totalFood,
      averageFitness,
      updatesPerSecond,
    };
  }

  public getCreatures(): Creature[] {
    return this.environment.getCreatures();
  }

  public getEnvironment(): Environment {
    return this.environment;
  }

  public reset(): void {
    this.stop();
    this.currentTick = 0;
    this.updateTimes = [];

    // Create new environment and reinitialize
    this.environment = new Environment({
      bounds: {
        width: this.config.worldWidth,
        height: this.config.worldHeight,
        shape: "circular",
        centerX: this.config.worldWidth / 2,
        centerY: this.config.worldHeight / 2,
      },
      biome: {
        type: BiomeType.Grassland,
        name: "Grassland",
        characteristics: {
          temperature: 0.6,
          humidity: 0.5,
          waterAvailability: 0.7,
          plantDensity: 0.8,
          preyDensity: 0.4,
          shelterAvailability: 0.3,
          predationPressure: 0.3,
          competitionLevel: 0.5,
          seasonalVariation: 0.2,
        },
        color: "#4ade80",
        description: "Balanced grassland environment",
      },
      maxCreatures: this.config.maxPopulation,
      maxFood: this.config.maxPopulation * 3,
      foodSpawnRate: 0.1,
      preySpawnRate: 0.05,
      spatialGridSize: 100,
      updateFrequency: 1,
    });

    this.initializePopulation();
  }
}
