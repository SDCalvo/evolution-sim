/**
 * Simulation Manager - Orchestrates Evolution Simulation
 *
 * This class connects all our systems together:
 * - Environment with creatures and resources
 * - Neural network AI decision making
 * - Genetic evolution and reproduction
 * - Species detection and tracking
 * - Real-time statistics and performance monitoring
 */

import { Environment } from "../environment/environment";
import { Creature } from "../creatures/creature";
import {
  CreatureGenetics,
  GeneticsHelper,
  CreatureColorSystem,
  SpeciesInfo,
} from "../creatures/creatureTypes";
import { BiomePresets } from "../environment/biomePresets";
import { NeuralNetwork } from "../neural/network";
import { BootstrapBrainFactory } from "../creatures/bootstrapBrains";

export interface SimulationConfig {
  // Population settings
  initialPopulation: number;
  maxPopulation: number;

  // World settings
  worldWidth: number;
  worldHeight: number;
  biomeName: keyof typeof BiomePresets;

  // Evolution settings
  mutationRate: number;
  mutationStrength: number;
  reproductionThreshold: number; // Minimum energy to reproduce

  // Performance settings
  targetFPS: number;
  maxUpdatesPerFrame: number;
}

export interface SimulationStats {
  // Time tracking
  currentTick: number;
  currentGeneration: number;
  averageGenerationTime: number;

  // Population dynamics
  totalCreatures: number;
  livingCreatures: number;
  deadCreatures: number;
  births: number;
  deaths: number;

  // Evolution tracking
  averageFitness: number;
  maxFitness: number;
  geneticDiversity: number;

  // Species tracking
  speciesCount: number;
  dominantSpecies: string | null;
  extinctions: number;
  speciations: number;

  // Performance metrics
  updatesPerSecond: number;
  msPerUpdate: number;
  memoryUsageMB: number;

  // Environment stats
  totalFood: number;
  spatialQueries: number;
  collisions: number;
}

export interface SimulationEvent {
  type:
    | "birth"
    | "death"
    | "reproduction"
    | "feeding"
    | "combat"
    | "speciation"
    | "extinction";
  tick: number;
  creatureId?: string;
  speciesId?: string;
  data?: any;
}

export class SimulationManager {
  private environment: Environment;
  private config: SimulationConfig;

  // State tracking
  private isRunning: boolean = false;
  private currentTick: number = 0;
  private currentGeneration: number = 0;
  private generationStartTick: number = 0;

  // Population management
  private creatureIdCounter: number = 0;
  private generationHistory: number[] = [];

  // Species tracking
  private detectedSpecies: Map<string, SpeciesInfo> = new Map();
  private speciesDetectionThreshold: number = 0.3; // Genetic distance for species

  // Performance tracking
  private updateTimes: number[] = [];
  private lastUpdateTime: number = 0;
  private fpsCounter: number = 0;
  private lastFpsTime: number = 0;

  // Event system
  private eventHistory: SimulationEvent[] = [];
  private eventListeners: ((event: SimulationEvent) => void)[] = [];

  constructor(config: SimulationConfig) {
    this.config = config;

    // Create environment with selected biome
    const biome = BiomePresets[config.biomeName];
    this.environment = new Environment({
      bounds: {
        width: config.worldWidth,
        height: config.worldHeight,
        shape: "circular",
        centerX: config.worldWidth / 2,
        centerY: config.worldHeight / 2,
      },
      biome,
      maxCreatures: config.maxPopulation,
      maxFood: Math.floor(config.maxPopulation * 2.5), // 2.5 food per creature
      foodSpawnRate: 0.1,
      preySpawnRate: 0.05,
      spatialGridSize: 100,
      updateFrequency: 1,
    });

    // Initialize with founder population
    this.initializePopulation();
  }

  /**
   * Create initial population with bootstrap brains
   */
  private initializePopulation(): void {
    console.log(
      `🧬 Creating initial population of ${this.config.initialPopulation} creatures...`
    );

    for (let i = 0; i < this.config.initialPopulation; i++) {
      const genetics = GeneticsHelper.generateRandomGenetics();
      const brain = BootstrapBrainFactory.createFounderBrain(genetics); // Start with survival instincts

      // Random position in world
      const position = {
        x:
          Math.random() * this.config.worldWidth * 0.8 +
          this.config.worldWidth * 0.1,
        y:
          Math.random() * this.config.worldHeight * 0.8 +
          this.config.worldHeight * 0.1,
      };

      const creature = new Creature(
        `founder_${i}`,
        genetics,
        brain,
        0, // Generation 0
        position
      );

      this.environment.addCreature(creature);
      this.emitEvent({
        type: "birth",
        tick: this.currentTick,
        creatureId: creature.id,
      });
    }

    console.log(
      `✅ Population initialized with ${
        this.environment.getStats().livingCreatures
      } creatures`
    );
  }

  /**
   * Start the simulation
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.lastFpsTime = performance.now();

    console.log("🚀 Evolution simulation started!");
    this.emitEvent({
      type: "reproduction",
      tick: this.currentTick,
      data: "simulation_started",
    });

    // Start the main simulation loop
    this.simulationLoop();
  }

  /**
   * Stop the simulation
   */
  public stop(): void {
    this.isRunning = false;
    console.log("⏸️ Evolution simulation paused");
  }

  /**
   * Main simulation loop
   */
  private simulationLoop(): void {
    if (!this.isRunning) return;

    const startTime = performance.now();

    // Update simulation state
    this.updateSimulation();

    // Track performance
    const updateTime = performance.now() - startTime;
    this.updateTimes.push(updateTime);
    if (this.updateTimes.length > 60) {
      this.updateTimes.shift(); // Keep last 60 samples
    }

    // Schedule next update based on target FPS
    const targetFrameTime = 1000 / this.config.targetFPS;
    const nextUpdateDelay = Math.max(0, targetFrameTime - updateTime);

    setTimeout(() => this.simulationLoop(), nextUpdateDelay);
  }

  /**
   * Update simulation by one tick
   */
  private updateSimulation(): void {
    this.currentTick++;

    // Update environment (creatures make decisions and act)
    this.environment.update();

    // Handle reproduction and death
    this.processLifecycle();

    // Detect new species
    this.updateSpeciesDetection();

    // Check for generation advancement
    this.checkGenerationAdvancement();

    // Update FPS counter
    this.updateFPSCounter();
  }

  /**
   * Process creature lifecycle events
   */
  private processLifecycle(): void {
    const envStats = this.environment.getStats();

    // Handle deaths and create carrion
    // (Environment already handles this in its update method)

    // Attempt reproduction for mature, high-energy creatures
    const allCreatures = this.environment.getCreatures();
    const reproductionCandidates = allCreatures.filter(
      (creature: Creature) =>
        creature.canReproduce() &&
        creature.physics.energy >= this.config.reproductionThreshold
    );

    // Sexual reproduction - pair up nearby creatures
    for (let i = 0; i < reproductionCandidates.length; i += 2) {
      if (i + 1 >= reproductionCandidates.length) break;

      const parent1 = reproductionCandidates[i];
      const parent2 = reproductionCandidates[i + 1];

      // Check if they're close enough to mate
      const distance = Math.sqrt(
        (parent1.physics.position.x - parent2.physics.position.x) ** 2 +
          (parent1.physics.position.y - parent2.physics.position.y) ** 2
      );

      if (
        distance < 50 &&
        this.environment.getStats().livingCreatures < this.config.maxPopulation
      ) {
        this.reproduceCreatures(parent1, parent2);
      }
    }
  }

  /**
   * Create offspring from two parent creatures
   */
  private reproduceCreatures(parent1: Creature, parent2: Creature): void {
    // Genetic crossover and mutation
    const childGenetics = GeneticsHelper.crossover(
      parent1.genetics,
      parent2.genetics
    );
    GeneticsHelper.mutate(
      childGenetics,
      this.config.mutationRate,
      this.config.mutationStrength
    );
    GeneticsHelper.clampGenetics(childGenetics);

    // Neural network crossover and mutation
    const childBrain = NeuralNetwork.crossover(parent1.brain, parent2.brain);
    childBrain.mutate(this.config.mutationRate, this.config.mutationStrength);

    // Position near parents
    const childPosition = {
      x:
        (parent1.physics.position.x + parent2.physics.position.x) / 2 +
        (Math.random() - 0.5) * 40,
      y:
        (parent1.physics.position.y + parent2.physics.position.y) / 2 +
        (Math.random() - 0.5) * 40,
    };

    // Create child creature
    const childGeneration =
      Math.max(parent1.stats.generation, parent2.stats.generation) + 1;
    const child = new Creature(
      `gen${childGeneration}_${this.creatureIdCounter++}`,
      childGenetics,
      childBrain,
      childGeneration,
      childPosition
    );

    // Subtract reproduction energy costs
    const reproductionCost =
      (parent1.genetics.reproductionCost + parent2.genetics.reproductionCost) /
      2;
    parent1.physics.energy = Math.max(
      0,
      parent1.physics.energy - reproductionCost * 0.6
    );
    parent2.physics.energy = Math.max(
      0,
      parent2.physics.energy - reproductionCost * 0.4
    );

    // Add to environment
    this.environment.addCreature(child);

    // Update statistics
    parent1.stats.offspring++;
    parent2.stats.offspring++;
    parent1.stats.reproductionAttempts++;
    parent2.stats.reproductionAttempts++;

    // Emit events
    this.emitEvent({
      type: "birth",
      tick: this.currentTick,
      creatureId: child.id,
      data: {
        parent1: parent1.id,
        parent2: parent2.id,
        generation: childGeneration,
      },
    });

    this.emitEvent({
      type: "reproduction",
      tick: this.currentTick,
      data: { parents: [parent1.id, parent2.id], child: child.id },
    });
  }

  /**
   * Update species detection and classification
   */
  private updateSpeciesDetection(): void {
    // Only run species detection every 60 ticks for performance
    if (this.currentTick % 60 !== 0) return;

    const allCreatures = this.environment.getAllCreatures();

    // Clear previous species data
    this.detectedSpecies.clear();

    // Group creatures by genetic similarity
    const speciesGroups: Creature[][] = [];

    for (const creature of allCreatures) {
      let assignedToSpecies = false;

      // Try to assign to existing species group
      for (const group of speciesGroups) {
        const representative = group[0];
        const geneticDistance = GeneticsHelper.calculateGeneticDistance(
          creature.genetics,
          representative.genetics
        );

        if (geneticDistance < this.speciesDetectionThreshold) {
          group.push(creature);
          assignedToSpecies = true;
          break;
        }
      }

      // Create new species if no match found
      if (!assignedToSpecies) {
        speciesGroups.push([creature]);
      }
    }

    // Convert groups to species info
    let speciesCounter = 0;
    for (const group of speciesGroups) {
      if (group.length === 0) continue;

      const representative = group[0];
      const speciesId = `species_${speciesCounter++}`;

      // Calculate average fitness
      const totalFitness = group.reduce((sum, c) => sum + c.stats.fitness, 0);
      const averageFitness = totalFitness / group.length;

      // Calculate average generation
      const totalGeneration = group.reduce(
        (sum, c) => sum + c.stats.generation,
        0
      );
      const averageGeneration = totalGeneration / group.length;

      // Generate species name and color
      const color = CreatureColorSystem.getCreatureColor(
        representative.genetics
      );
      const colorDescription = CreatureColorSystem.getColorDescription(
        representative.genetics
      );

      const speciesInfo: SpeciesInfo = {
        id: speciesId,
        name: this.generateSpeciesName(
          representative.genetics,
          colorDescription
        ),
        color,
        population: group.length,
        averageFitness,
        dominantTraits: this.getDominantTraits(representative.genetics),
        generation: Math.round(averageGeneration),
        trend: this.determinePopulationTrend(speciesId, group.length),
        firstAppeared: this.currentTick,
      };

      this.detectedSpecies.set(speciesId, speciesInfo);
    }
  }

  /**
   * Generate a descriptive name for a species
   */
  private generateSpeciesName(
    genetics: CreatureGenetics,
    colorDescription: string
  ): string {
    const adjectives: string[] = [];
    const nouns: string[] = [];

    // Size-based adjectives
    if (genetics.size > 1.3) adjectives.push("Giant");
    else if (genetics.size > 1.1) adjectives.push("Large");
    else if (genetics.size < 0.7) adjectives.push("Tiny");
    else if (genetics.size < 0.9) adjectives.push("Small");

    // Speed-based adjectives
    if (genetics.speed > 1.2) adjectives.push("Swift");
    else if (genetics.speed < 0.8) adjectives.push("Slow");

    // Behavior-based adjectives
    if (genetics.aggression > 0.7) adjectives.push("Fierce");
    else if (genetics.aggression < 0.3) adjectives.push("Gentle");

    if (genetics.sociability > 0.7) adjectives.push("Social");
    else if (genetics.sociability < 0.3) adjectives.push("Solitary");

    // Diet-based nouns
    if (genetics.meatPreference > 0.7)
      nouns.push("Hunters", "Predators", "Carnivores");
    else if (genetics.plantPreference > 0.7)
      nouns.push("Gatherers", "Herbivores", "Browsers");
    else nouns.push("Omnivores", "Foragers", "Scavengers");

    // Fallback names
    if (adjectives.length === 0) adjectives.push("Common");
    if (nouns.length === 0) nouns.push("Creatures");

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective} ${noun}`;
  }

  /**
   * Get dominant traits for a genetics profile
   */
  private getDominantTraits(genetics: CreatureGenetics): string[] {
    const traits: string[] = [];

    if (genetics.size > 1.2) traits.push("Large Size");
    if (genetics.speed > 1.2) traits.push("High Speed");
    if (genetics.aggression > 0.7) traits.push("Aggressive");
    if (genetics.sociability > 0.7) traits.push("Social");
    if (genetics.curiosity > 0.7) traits.push("Curious");
    if (genetics.visionRange > 1.2) traits.push("Sharp Vision");
    if (genetics.meatPreference > 0.7) traits.push("Carnivorous");
    if (genetics.plantPreference > 0.7) traits.push("Herbivorous");
    if (genetics.parentalCare > 0.7) traits.push("High Parental Care");

    return traits.length > 0 ? traits : ["Generalist"];
  }

  /**
   * Determine population trend for a species
   */
  private determinePopulationTrend(
    speciesId: string,
    currentPopulation: number
  ): "growing" | "stable" | "declining" | "extinct" {
    if (currentPopulation === 0) return "extinct";
    if (currentPopulation < 3) return "declining";

    // For now, just return stable - we'd need historical data for real trends
    return "stable";
  }

  /**
   * Check if we should advance to the next generation
   */
  private checkGenerationAdvancement(): void {
    const allCreatures = this.environment.getAllCreatures();
    const averageGeneration =
      allCreatures.reduce((sum, c) => sum + c.stats.generation, 0) /
      allCreatures.length;

    // Advance generation when average generation increases significantly
    if (averageGeneration > this.currentGeneration + 0.5) {
      this.currentGeneration = Math.floor(averageGeneration);
      this.generationHistory.push(this.currentTick - this.generationStartTick);
      this.generationStartTick = this.currentTick;

      console.log(
        `🧬 Generation ${
          this.currentGeneration
        } reached! Average fitness: ${this.getStats().averageFitness.toFixed(
          2
        )}`
      );
    }
  }

  /**
   * Update FPS counter
   */
  private updateFPSCounter(): void {
    this.fpsCounter++;
    const now = performance.now();

    if (now - this.lastFpsTime >= 1000) {
      // Reset counter every second
      this.fpsCounter = 0;
      this.lastFpsTime = now;
    }
  }

  /**
   * Emit a simulation event
   */
  private emitEvent(event: SimulationEvent): void {
    this.eventHistory.push(event);

    // Keep only recent events for memory efficiency
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    // Notify listeners
    this.eventListeners.forEach((listener) => listener(event));
  }

  /**
   * Add event listener
   */
  public addEventListener(listener: (event: SimulationEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(listener: (event: SimulationEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Get current simulation statistics
   */
  public getStats(): SimulationStats {
    const envStats = this.environment.getStats();
    const allCreatures = this.environment.getAllCreatures();

    // Calculate fitness statistics
    const fitnessValues = allCreatures.map((c) => c.stats.fitness);
    const averageFitness =
      fitnessValues.length > 0
        ? fitnessValues.reduce((sum, f) => sum + f, 0) / fitnessValues.length
        : 0;
    const maxFitness =
      fitnessValues.length > 0 ? Math.max(...fitnessValues) : 0;

    // Calculate genetic diversity (average genetic distance between all pairs)
    let geneticDiversity = 0;
    if (allCreatures.length > 1) {
      let totalDistance = 0;
      let comparisons = 0;

      for (let i = 0; i < allCreatures.length; i++) {
        for (let j = i + 1; j < allCreatures.length; j++) {
          totalDistance += GeneticsHelper.calculateGeneticDistance(
            allCreatures[i].genetics,
            allCreatures[j].genetics
          );
          comparisons++;
        }
      }

      geneticDiversity = comparisons > 0 ? totalDistance / comparisons : 0;
    }

    // Performance metrics
    const averageUpdateTime =
      this.updateTimes.length > 0
        ? this.updateTimes.reduce((sum, t) => sum + t, 0) /
          this.updateTimes.length
        : 0;

    const updatesPerSecond =
      averageUpdateTime > 0 ? 1000 / averageUpdateTime : 0;

    // Memory usage (rough estimate)
    const memoryUsageMB =
      allCreatures.length * 0.01 + // ~10KB per creature
      envStats.totalFood * 0.001 + // ~1KB per food item
      this.eventHistory.length * 0.0005; // ~0.5KB per event

    // Find dominant species
    let dominantSpecies: string | null = null;
    let maxPopulation = 0;
    for (const [id, species] of this.detectedSpecies) {
      if (species.population > maxPopulation) {
        maxPopulation = species.population;
        dominantSpecies = species.name;
      }
    }

    return {
      // Time tracking
      currentTick: this.currentTick,
      currentGeneration: this.currentGeneration,
      averageGenerationTime:
        this.generationHistory.length > 0
          ? this.generationHistory.reduce((sum, t) => sum + t, 0) /
            this.generationHistory.length
          : 0,

      // Population dynamics
      totalCreatures: envStats.totalCreatures,
      livingCreatures: envStats.livingCreatures,
      deadCreatures: envStats.deadCreatures,
      births: this.eventHistory.filter((e) => e.type === "birth").length,
      deaths: this.eventHistory.filter((e) => e.type === "death").length,

      // Evolution tracking
      averageFitness,
      maxFitness,
      geneticDiversity,

      // Species tracking
      speciesCount: this.detectedSpecies.size,
      dominantSpecies,
      extinctions: 0, // Would need historical tracking
      speciations: 0, // Would need historical tracking

      // Performance metrics
      updatesPerSecond,
      msPerUpdate: averageUpdateTime,
      memoryUsageMB,

      // Environment stats
      totalFood: envStats.totalFood,
      spatialQueries: envStats.spatialQueries,
      collisions: envStats.collisionChecks,
    };
  }

  /**
   * Get all detected species
   */
  public getSpecies(): SpeciesInfo[] {
    return Array.from(this.detectedSpecies.values());
  }

  /**
   * Get all creatures (for visualization)
   */
  public getCreatures(): Creature[] {
    return this.environment.getAllCreatures();
  }

  /**
   * Get all food items (for visualization)
   */
  public getAllFood(): any[] {
    return this.environment.getAllFood();
  }

  /**
   * Get recent events
   */
  public getRecentEvents(count: number = 50): SimulationEvent[] {
    return this.eventHistory.slice(-count);
  }

  /**
   * Get environment for direct access if needed
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Reset simulation to initial state
   */
  public reset(): void {
    this.stop();

    // Clear all state
    this.currentTick = 0;
    this.currentGeneration = 0;
    this.generationStartTick = 0;
    this.creatureIdCounter = 0;
    this.generationHistory = [];
    this.detectedSpecies.clear();
    this.updateTimes = [];
    this.eventHistory = [];

    // Recreate environment and population
    this.environment = new Environment({
      bounds: {
        width: this.config.worldWidth,
        height: this.config.worldHeight,
        shape: "circular",
        centerX: this.config.worldWidth / 2,
        centerY: this.config.worldHeight / 2,
      },
      biome: BiomePresets[this.config.biomeName],
      maxCreatures: this.config.maxPopulation,
      maxFood: Math.floor(this.config.maxPopulation * 2.5),
      foodSpawnRate: 0.1,
      preySpawnRate: 0.05,
      spatialGridSize: 100,
      updateFrequency: 1,
    });

    this.initializePopulation();

    console.log("🔄 Simulation reset to initial state");
  }
}
