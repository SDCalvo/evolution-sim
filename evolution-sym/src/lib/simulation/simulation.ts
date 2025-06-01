/**
 * Evolution Simulation Engine - Where Digital Life Emerges!
 *
 * Orchestrates the real-time loop where:
 * - 🧠 AI brains sense the environment through spatial queries
 * - 🦎 Creatures make decisions and take actions in the ecosystem
 * - 🌍 Environment responds with realistic consequences
 * - ⚡ Evolution emerges from creatures that make better survival decisions
 */

import { Environment } from "../environment/environment";
import { Creature } from "../creatures/creature";
import { CreatureState } from "../creatures/creatureTypes";
import { EnvironmentConfig } from "../environment/environmentTypes";

export interface SimulationConfig {
  // Population settings
  initialPopulation: number; // Starting number of creatures
  maxPopulation: number; // Population limit

  // Simulation settings
  ticksPerSecond: number; // Target simulation speed (60 FPS)
  autoPause: boolean; // Pause when all creatures die

  // Environment settings
  environment: Partial<EnvironmentConfig>;
}

export interface SimulationStats {
  // Time tracking
  currentTick: number;
  elapsedTime: number; // Milliseconds since simulation start
  generationCount: number; // Highest generation seen

  // Population tracking
  totalCreatures: number;
  livingCreatures: number;
  averageGeneration: number;
  averageFitness: number;

  // Performance tracking
  ticksPerSecond: number; // Actual performance
  updateTimeMs: number; // Time per simulation tick

  // Evolution tracking
  reproductionEvents: number;
  combatEvents: number;
  feedingEvents: number;
  extinctionEvents: number;
}

export class Simulation {
  private environment: Environment;
  private config: SimulationConfig;
  private stats: SimulationStats;

  // Simulation state
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastUpdateTime: number = 0;
  private targetTickInterval: number; // Milliseconds between ticks

  // Event tracking
  private lastReproductionCount: number = 0;
  private lastCombatCount: number = 0;
  private lastFeedingCount: number = 0;

  constructor(config: Partial<SimulationConfig> = {}) {
    // Merge configuration with defaults
    this.config = this.mergeConfig(config);
    this.targetTickInterval = 1000 / this.config.ticksPerSecond;

    // Create environment
    this.environment = new Environment(this.config.environment);

    // Initialize statistics
    this.stats = this.initializeStats();

    // Create initial population
    this.spawnInitialPopulation();
  }

  /**
   * Start the simulation loop
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.animationFrameId = requestAnimationFrame(() => this.simulationLoop());

    console.log("🚀 Evolution simulation started!");
  }

  /**
   * Pause the simulation
   */
  public pause(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    console.log("⏸️ Evolution simulation paused");
  }

  /**
   * Step forward one simulation tick (for debugging)
   */
  public step(): void {
    this.updateSimulation();
  }

  /**
   * Reset simulation to initial state
   */
  public reset(): void {
    this.pause();

    // Reset environment
    this.environment = new Environment(this.config.environment);

    // Reset statistics
    this.stats = this.initializeStats();

    // Create new initial population
    this.spawnInitialPopulation();

    console.log("🔄 Evolution simulation reset");
  }

  /**
   * Get current simulation statistics
   */
  public getStats(): SimulationStats {
    return { ...this.stats };
  }

  /**
   * Get current environment
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Get all living creatures
   */
  public getCreatures(): Creature[] {
    return this.environment
      .getCreatures()
      .filter((c) => c.state === CreatureState.Alive);
  }

  /**
   * Main simulation loop - 60 FPS real-time evolution!
   */
  private simulationLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;

    // Update simulation at target tick rate
    if (deltaTime >= this.targetTickInterval) {
      const updateStartTime = performance.now();

      this.updateSimulation();

      const updateEndTime = performance.now();
      this.stats.updateTimeMs = updateEndTime - updateStartTime;

      this.lastUpdateTime = currentTime;
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.simulationLoop());
  }

  /**
   * Core simulation update - where the magic happens!
   */
  private updateSimulation(): void {
    // 1. Update environment (food spawning, spatial grid, etc.)
    this.environment.update();

    // 2. Update all creatures (AI sensing → thinking → acting)
    const creatures = this.environment.getCreatures();
    for (const creature of creatures) {
      if (creature.state === CreatureState.Alive) {
        creature.update(this.environment);
      }
    }

    // 3. Remove dead creatures
    this.cleanupDeadCreatures();

    // 4. Check for population collapse
    this.checkPopulationHealth();

    // 5. Update statistics
    this.updateStats();

    // 6. Increment tick counter
    this.stats.currentTick++;
  }

  /**
   * Create initial population of creatures
   */
  private spawnInitialPopulation(): void {
    for (let i = 0; i < this.config.initialPopulation; i++) {
      const creature = new Creature(0); // Generation 0
      this.environment.addCreature(creature);
    }

    console.log(
      `👥 Spawned ${this.config.initialPopulation} initial creatures`
    );
  }

  /**
   * Remove dead creatures from environment
   */
  private cleanupDeadCreatures(): void {
    const creatures = this.environment.getCreatures();
    const deadCreatures = creatures.filter(
      (c) => c.state === CreatureState.Dead
    );

    for (const deadCreature of deadCreatures) {
      this.environment.removeCreature(deadCreature.id);
    }
  }

  /**
   * Check for population collapse and handle extinction
   */
  private checkPopulationHealth(): void {
    const livingCreatures = this.getCreatures();

    // Population collapse detection
    if (livingCreatures.length === 0) {
      this.stats.extinctionEvents++;

      if (this.config.autoPause) {
        this.pause();
        console.log("💀 Population extinct! Simulation auto-paused.");
      } else {
        // Respawn population to continue evolution
        this.spawnInitialPopulation();
        console.log("🆘 Population extinct! Respawning new generation...");
      }
    }

    // Population growth management
    if (livingCreatures.length > this.config.maxPopulation) {
      // Remove excess creatures (natural selection pressure)
      const excessCount = livingCreatures.length - this.config.maxPopulation;
      const sortedByFitness = livingCreatures.sort(
        (a, b) => a.stats.fitness - b.stats.fitness
      );

      for (let i = 0; i < excessCount; i++) {
        const weakestCreature = sortedByFitness[i];
        weakestCreature.state = CreatureState.Dead;
      }
    }
  }

  /**
   * Update simulation statistics
   */
  private updateStats(): void {
    const currentTime = performance.now();
    this.stats.elapsedTime =
      currentTime - (this.stats.elapsedTime || currentTime);

    const creatures = this.getCreatures();
    this.stats.livingCreatures = creatures.length;
    this.stats.totalCreatures = this.environment.getCreatures().length;

    // Calculate average generation and fitness
    if (creatures.length > 0) {
      this.stats.averageGeneration =
        creatures.reduce((sum, c) => sum + c.generation, 0) / creatures.length;
      this.stats.averageFitness =
        creatures.reduce((sum, c) => sum + c.stats.fitness, 0) /
        creatures.length;
      this.stats.generationCount = Math.max(
        ...creatures.map((c) => c.generation)
      );
    }

    // Calculate actual performance
    this.stats.ticksPerSecond =
      this.stats.updateTimeMs > 0 ? 1000 / this.stats.updateTimeMs : 0;

    // Track evolutionary events (compare with previous counts)
    const envStats = this.environment.getStats();

    // Note: These would need to be tracked in the environment as cumulative counters
    // For now, we'll estimate based on population changes
    this.stats.reproductionEvents = Math.max(
      0,
      creatures.length - this.lastReproductionCount
    );
    this.stats.combatEvents = envStats.collisionChecks;
    this.stats.feedingEvents = envStats.spatialQueries;

    this.lastReproductionCount = creatures.length;
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(config: Partial<SimulationConfig>): SimulationConfig {
    return {
      initialPopulation: config.initialPopulation || 50,
      maxPopulation: config.maxPopulation || 200,
      ticksPerSecond: config.ticksPerSecond || 60,
      autoPause: config.autoPause ?? true,
      environment: config.environment || {},
    };
  }

  /**
   * Initialize simulation statistics
   */
  private initializeStats(): SimulationStats {
    return {
      currentTick: 0,
      elapsedTime: 0,
      generationCount: 0,
      totalCreatures: 0,
      livingCreatures: 0,
      averageGeneration: 0,
      averageFitness: 0,
      ticksPerSecond: 0,
      updateTimeMs: 0,
      reproductionEvents: 0,
      combatEvents: 0,
      feedingEvents: 0,
      extinctionEvents: 0,
    };
  }
}
