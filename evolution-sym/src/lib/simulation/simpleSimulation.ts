/**
 * Simple Simulation Manager - FIXED VERSION
 * Now properly calls creature AI updates!
 */

import { Environment } from "../environment/environment";
import { Creature } from "../creatures/creature";
import { GeneticsHelper } from "../creatures/creatureTypes";
import { BiomeType } from "../environment/environmentTypes";
import { simulationLogger, LogCategory } from "../logging/simulationLogger";

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

export interface SimulationEvent {
  tick: number;
  type:
    | "birth"
    | "death"
    | "feeding"
    | "combat"
    | "reproduction"
    | "brain_decision"
    | "action_attempt";
  creatureId: string;
  details: Record<string, unknown>;
}

export interface BrainAnalysis {
  totalDecisions: number;
  averageConfidence: number;
  actionDistribution: {
    movement: number;
    eating: number;
    attacking: number;
    reproducing: number;
    idle: number;
  };
  decisionPatterns: {
    energySeekingBehavior: number; // How often they move toward food when hungry
    predatorAvoidance: number; // How often they flee from threats
    reproductiveUrge: number; // How often they seek mates when mature
    explorationTendency: number; // How much they explore vs stay put
  };
}

export interface ActionAnalysis {
  attempts: {
    feeding: number;
    combat: number;
    reproduction: number;
    movement: number;
  };
  successes: {
    feeding: number;
    combat: number;
    reproduction: number;
  };
  efficiency: {
    feedingSuccess: number; // success rate %
    combatSuccess: number;
    reproductiveSuccess: number;
    energyManagement: number; // average energy maintained
  };
}

export interface SimulationSummary {
  // Session overview
  sessionDuration: {
    totalTicks: number;
    totalTimeSeconds: number;
    averageFPS: number;
  };

  // Population analysis
  population: {
    startingCount: number;
    endingCount: number;
    peakCount: number;
    totalBirths: number;
    totalDeaths: number;
    survivalRate: number;
  };

  // Creature behavior metrics
  behavior: {
    averageLifespan: number;
    totalFoodEaten: number;
    totalDistanceTraveled: number;
    combatEvents: number;
    reproductionEvents: number;
    averageEnergyLevel: number;
  };

  // AI decision analysis
  intelligence: {
    averageFitness: number;
    fitnessImprovement: number;
    smartestCreature: {
      id: string;
      fitness: number;
      age: number;
      energy: number;
    } | null;
    movementEfficiency: number;
    brainAnalysis: BrainAnalysis;
    actionAnalysis: ActionAnalysis;
  };

  // Genetic diversity
  genetics: {
    averageTraits: {
      size: number;
      speed: number;
      aggression: number;
      plantPreference: number;
      meatPreference: number;
    };
    traitVariance: {
      size: number;
      speed: number;
      aggression: number;
    };
  };

  // Environment interaction
  environment: {
    foodConsumptionRate: number;
    spatialDistribution: string;
    carrionCreated: number;
    carrionConsumed: number;
  };

  // Key insights and recommendations
  insights: string[];
}

export class SimpleSimulation {
  private environment: Environment;
  private config: SimpleSimulationConfig;
  private isRunning: boolean = false;
  private currentTick: number = 0;
  private updateTimes: number[] = [];

  // Simulation tracking
  private startTime: number = 0;
  private initialCreatureCount: number = 0;
  private peakCreatureCount: number = 0;
  private events: SimulationEvent[] = [];
  private creatureSnapshots: Map<string, Creature> = new Map();

  // Detailed behavior tracking
  private brainDecisions: Array<{
    creatureId: string;
    sensorInputs: number[];
    brainOutputs: number[];
    actions: {
      moveX: number;
      moveY: number;
      eat: number;
      attack: number;
      reproduce: number;
    };
    energy: number;
    tick: number;
  }> = [];

  private actionAttempts: Map<
    string,
    {
      feeding: number;
      feedingSuccess: number;
      combat: number;
      combatSuccess: number;
      reproduction: number;
      reproductionSuccess: number;
      movement: number;
    }
  > = new Map();

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
        radius: Math.min(config.worldWidth, config.worldHeight) / 2,
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
    // 🎯 SPAWN CREATURES CLOSER TOGETHER FOR EASIER MATING
    const centerX = this.config.worldWidth / 2;
    const centerY = this.config.worldHeight / 2;
    const spawnRadius =
      Math.min(this.config.worldWidth, this.config.worldHeight) * 0.3; // 30% of world size

    for (let i = 0; i < this.config.initialPopulation; i++) {
      const genetics = GeneticsHelper.generateRandomGenetics();

      // Spawn in a clustered circle around center for easier social interaction
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnRadius;

      const position = {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
      };

      const creature = new Creature(0, genetics, undefined, position);

      this.environment.addCreature(creature);
    }
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.currentTick = 0;
    this.initialCreatureCount = this.environment.getCreatures().length;
    this.peakCreatureCount = this.initialCreatureCount;
    this.events = [];
    this.creatureSnapshots.clear();
    this.brainDecisions = [];
    this.actionAttempts.clear();
    this.updateTimes = [];

    // Initialize logger
    simulationLogger.clear();
    simulationLogger.setTick(this.currentTick);

    // Take initial snapshots
    for (const creature of this.environment.getCreatures()) {
      this.creatureSnapshots.set(creature.id, creature);
    }

    simulationLogger.success(
      LogCategory.SYSTEM,
      `Simulation started with ${this.initialCreatureCount} creatures`
    );

    this.simulationLoop();
  }

  public stop(): void {
    this.isRunning = false;

    // Generate and display summary when stopping
    const summary = this.generateSummary();
    this.displaySummary(summary);
  }

  private simulationLoop(): void {
    if (!this.isRunning) return;

    const startTime = performance.now();

    // 🚀 THE KEY FIX: Update simulation AND call creature AI updates!
    this.currentTick++;

    // Update logger tick
    simulationLogger.setTick(this.currentTick);

    // Get all creatures and update them individually
    const creatures = this.environment.getCreatures();

    // 🧠 CALL CREATURE AI BRAINS - This was missing!
    creatures.forEach((creature) => {
      // Track creature behavior before update
      const beforeStats = {
        foodEaten: creature.stats.foodEaten,
        feedingAttempts: creature.stats.feedingAttempts,
        reproductionAttempts: creature.stats.reproductionAttempts,
        energy: creature.physics.energy,
      };

      creature.update(this.environment, (decision) => {
        // Add tick information and store decision
        decision.tick = this.currentTick;
        this.brainDecisions.push(decision);

        // Limit decision history to prevent memory issues (keep last 1000 decisions)
        if (this.brainDecisions.length > 1000) {
          this.brainDecisions.shift();
        }

        // Log thoughts in real-time (every 30 ticks to avoid spam)
        if (this.currentTick % 30 === 0 && creature.stats.currentThought) {
          const thought = creature.stats.currentThought;
          console.log(
            `💭 ${creature.id.substring(0, 8)}: "${thought.text}" ${
              thought.icon
            } (energy: ${creature.physics.energy.toFixed(1)})`
          );
        }

        // 🗺️ BRAIN OUTPUT DEBUGGING: Log neural network outputs
        if (this.currentTick % 100 === 0 && decision.tick % 100 === 0) {
          const pos = creature.physics.position;
          const vel = creature.physics.velocity;
          const moveMagnitude = Math.sqrt(
            decision.actions.moveX ** 2 + decision.actions.moveY ** 2
          );

          // 🧠 ALWAYS log brain outputs to debug why no movement
          console.log(
            `🧠 ${creature.id.substring(0, 8)}: ` +
              `RAW[${decision.brainOutputs
                .map((x) => x.toFixed(2))
                .join(",")}] ` +
              `ACTIONS[X:${decision.actions.moveX.toFixed(
                2
              )} Y:${decision.actions.moveY.toFixed(2)} ` +
              `E:${decision.actions.eat.toFixed(
                2
              )} A:${decision.actions.attack.toFixed(
                2
              )} R:${decision.actions.reproduce.toFixed(2)}] ` +
              `pos(${pos.x.toFixed(0)},${pos.y.toFixed(0)}) vel(${vel.x.toFixed(
                2
              )},${vel.y.toFixed(2)})`
          );

          // Log movement separately if it exists
          if (moveMagnitude > 0.05) {
            console.log(
              `🚶 MOVEMENT: ${creature.id.substring(
                0,
                8
              )} magnitude=${moveMagnitude.toFixed(3)}`
            );
          }
        }
      }); // Each creature thinks and acts!

      // Track behavior changes after update
      this.trackCreatureBehavior(creature, beforeStats);
    });

    // Update environment (food spawning, physics, etc.)
    this.environment.update();

    // Track simulation events and stats
    this.trackSimulationEvents();

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
        radius: Math.min(this.config.worldWidth, this.config.worldHeight) / 2,
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

  /**
   * Track simulation events and statistics
   */
  private trackSimulationEvents(): void {
    const currentCreatures = this.environment.getCreatures();
    const currentCount = currentCreatures.length;

    // Update peak creature count
    if (currentCount > this.peakCreatureCount) {
      this.peakCreatureCount = currentCount;
    }

    // Track births and deaths by comparing snapshots
    const currentIds = new Set(currentCreatures.map((c) => c.id));
    const previousIds = new Set(this.creatureSnapshots.keys());

    // Detect new births
    for (const creature of currentCreatures) {
      if (!previousIds.has(creature.id)) {
        this.events.push({
          tick: this.currentTick,
          type: "birth",
          creatureId: creature.id,
          details: {
            generation: creature.generation,
            parentIds: creature.parentIds,
            position: { ...creature.physics.position },
          },
        });
      }
    }

    // Detect deaths
    for (const [id, creature] of this.creatureSnapshots) {
      if (!currentIds.has(id)) {
        // 💀 DEATH ANALYSIS LOGGING
        const deathCause =
          creature.physics.energy <= 0
            ? "starvation"
            : creature.physics.health <= 0
            ? "combat"
            : creature.physics.age >= creature.genetics.lifespan
            ? "old_age"
            : "unknown";

        simulationLogger.logDeath(
          id,
          creature.stats.age,
          deathCause,
          creature.stats.fitness
        );

        this.events.push({
          tick: this.currentTick,
          type: "death",
          creatureId: id,
          details: {
            age: creature.stats.age,
            fitness: creature.stats.fitness,
            cause: deathCause,
            foodEaten: creature.stats.foodEaten,
            offspring: creature.stats.offspring,
          },
        });
      }
    }

    // 📊 POPULATION HEALTH LOGGING (every 100 ticks)
    if (this.currentTick % 100 === 0) {
      const avgEnergy =
        currentCount > 0
          ? currentCreatures.reduce((sum, c) => sum + c.physics.energy, 0) /
            currentCount
          : 0;
      const avgAge =
        currentCount > 0
          ? currentCreatures.reduce((sum, c) => sum + c.physics.age, 0) /
            currentCount
          : 0;
      const envStats = this.environment.getStats();

      simulationLogger.logPopulationHealth(
        this.currentTick,
        currentCount,
        avgEnergy,
        avgAge,
        envStats.totalFood
      );

      // 🚨 CRITICAL WARNINGS
      if (currentCount <= 3) {
        simulationLogger.critical(
          LogCategory.POPULATION,
          `Population near extinction! Only ${currentCount} creatures left`
        );
      }
      if (avgEnergy < 20) {
        simulationLogger.critical(
          LogCategory.POPULATION,
          `Population energy crisis! Average energy: ${avgEnergy.toFixed(1)}`
        );
      }
      if (envStats.totalFood === 0) {
        simulationLogger.critical(
          LogCategory.ENVIRONMENT,
          `No food in environment! Starvation imminent`
        );
      }
    }

    // 🧠 BRAIN DECISION ANALYSIS (every 200 ticks)
    if (this.currentTick % 200 === 0 && this.brainDecisions.length > 0) {
      const recentDecisions = this.brainDecisions.slice(-100); // Last 100 decisions
      const actionCounts = {
        eating: 0,
        moving: 0,
        reproducing: 0,
        attacking: 0,
        idle: 0,
      };

      recentDecisions.forEach((decision) => {
        const actions = decision.actions;

        // 🔧 FIXED: Fair comparison - normalize movement to single value like others
        const movementMagnitude = Math.sqrt(
          actions.moveX * actions.moveX + actions.moveY * actions.moveY
        ); // 0-√2 ≈ 0-1.4
        const normalizedMovement = movementMagnitude / 1.414; // Normalize to 0-1 range

        // Now all actions are in 0-1 range for fair comparison
        const maxAction = Math.max(
          actions.eat,
          actions.attack,
          actions.reproduce,
          normalizedMovement
        );

        // 🎯 FIXED: Classify based on PRIMARY action, but recognize movement
        const isMoving = normalizedMovement > 0.15; // Lower threshold for movement detection
        const isEating = actions.eat > 0.5;
        const isReproducing = actions.reproduce > 0.3;
        const isAttacking = actions.attack > 0.7;

        // If creature is doing multiple things, classify by the strongest
        if (isEating && isMoving && actions.eat > normalizedMovement) {
          actionCounts.eating++; // Moving to eat
        } else if (
          isReproducing &&
          isMoving &&
          actions.reproduce > normalizedMovement
        ) {
          actionCounts.reproducing++; // Moving to reproduce
        } else if (
          isAttacking &&
          isMoving &&
          actions.attack > normalizedMovement
        ) {
          actionCounts.attacking++; // Moving to attack
        } else if (isMoving) {
          actionCounts.moving++; // Pure movement/exploration
        } else if (isEating) {
          actionCounts.eating++; // Stationary eating
        } else if (isReproducing) {
          actionCounts.reproducing++; // Stationary reproduction attempt
        } else if (isAttacking) {
          actionCounts.attacking++; // Stationary attacking
        } else {
          actionCounts.idle++; // Truly idle
        }
      });

      const total = recentDecisions.length;
      simulationLogger.logBrainDecisions(
        (actionCounts.moving / total) * 100,
        (actionCounts.eating / total) * 100,
        (actionCounts.reproducing / total) * 100,
        (actionCounts.attacking / total) * 100,
        (actionCounts.idle / total) * 100
      );
    }

    // Update creature snapshots
    this.creatureSnapshots.clear();
    for (const creature of currentCreatures) {
      this.creatureSnapshots.set(creature.id, creature);
    }
  }

  /**
   * Generate comprehensive simulation summary
   */
  public generateSummary(): SimulationSummary {
    const currentTime = Date.now();
    const sessionDurationMs = currentTime - this.startTime;
    const creatures = this.environment.getCreatures();

    // Count events
    const births = this.events.filter((e) => e.type === "birth").length;
    const deaths = this.events.filter((e) => e.type === "death").length;

    // Calculate averages
    const totalFoodEaten = creatures.reduce(
      (sum, c) => sum + c.stats.foodEaten,
      0
    );
    const totalDistance = creatures.reduce(
      (sum, c) => sum + c.stats.distanceTraveled,
      0
    );
    const totalReproduction = creatures.reduce(
      (sum, c) => sum + c.stats.reproductionAttempts,
      0
    );
    const averageEnergy =
      creatures.length > 0
        ? creatures.reduce((sum, c) => sum + c.physics.energy, 0) /
          creatures.length
        : 0;

    // Find smartest creature
    const smartestCreature =
      creatures.length > 0
        ? creatures.reduce((best, current) =>
            current.stats.fitness > best.stats.fitness ? current : best
          )
        : null;

    // Calculate genetic averages
    const geneticAverages = this.calculateGeneticAverages(creatures);
    const geneticVariances = this.calculateGeneticVariances(creatures);

    // Generate insights
    const insights = this.generateInsights(creatures, births, deaths);

    return {
      sessionDuration: {
        totalTicks: this.currentTick,
        totalTimeSeconds: sessionDurationMs / 1000,
        averageFPS: this.currentTick / (sessionDurationMs / 1000),
      },
      population: {
        startingCount: this.initialCreatureCount,
        endingCount: creatures.length,
        peakCount: this.peakCreatureCount,
        totalBirths: births,
        totalDeaths: deaths,
        survivalRate:
          this.initialCreatureCount > 0
            ? creatures.length / this.initialCreatureCount
            : 0,
      },
      behavior: {
        averageLifespan:
          creatures.length > 0
            ? creatures.reduce((sum, c) => sum + c.stats.age, 0) /
              creatures.length
            : 0,
        totalFoodEaten,
        totalDistanceTraveled: totalDistance,
        combatEvents: this.events.filter((e) => e.type === "combat").length,
        reproductionEvents: totalReproduction,
        averageEnergyLevel: averageEnergy,
      },
      intelligence: {
        averageFitness:
          creatures.length > 0
            ? creatures.reduce((sum, c) => sum + c.stats.fitness, 0) /
              creatures.length
            : 0,
        fitnessImprovement: 0, // TODO: Track fitness over time
        smartestCreature: smartestCreature
          ? {
              id: smartestCreature.id,
              fitness: smartestCreature.stats.fitness,
              age: smartestCreature.stats.age,
              energy: smartestCreature.physics.energy,
            }
          : null,
        movementEfficiency: totalDistance / Math.max(1, this.currentTick),
        brainAnalysis: this.analyzeBrainBehavior(),
        actionAnalysis: this.analyzeActionEfficiency(),
      },
      genetics: {
        averageTraits: geneticAverages,
        traitVariance: geneticVariances,
      },
      environment: {
        foodConsumptionRate: totalFoodEaten / Math.max(1, this.currentTick),
        spatialDistribution: this.analyzeSpatialDistribution(creatures),
        carrionCreated: this.events.filter((e) => e.type === "death").length,
        carrionConsumed: 0, // TODO: Track carrion consumption
      },
      insights,
    };
  }

  /**
   * Display simulation summary in console
   */
  private displaySummary(summary: SimulationSummary): void {
    console.log(
      "\n🔬 ================== SIMULATION SUMMARY =================="
    );
    console.log(
      `📊 Session Duration: ${summary.sessionDuration.totalTimeSeconds.toFixed(
        1
      )}s (${summary.sessionDuration.totalTicks} ticks)`
    );
    console.log(
      `⚡ Average Performance: ${summary.sessionDuration.averageFPS.toFixed(
        0
      )} FPS`
    );

    console.log("\n👥 POPULATION ANALYSIS:");
    console.log(
      `  🔸 Started with: ${summary.population.startingCount} creatures`
    );
    console.log(`  🔸 Ended with: ${summary.population.endingCount} creatures`);
    console.log(
      `  🔸 Peak population: ${summary.population.peakCount} creatures`
    );
    console.log(`  🔸 Total births: ${summary.population.totalBirths}`);
    console.log(`  🔸 Total deaths: ${summary.population.totalDeaths}`);
    console.log(
      `  🔸 Survival rate: ${(summary.population.survivalRate * 100).toFixed(
        1
      )}%`
    );

    console.log("\n🧠 CREATURE BEHAVIOR:");
    console.log(
      `  🔸 Average lifespan: ${summary.behavior.averageLifespan.toFixed(
        1
      )} ticks`
    );
    console.log(`  🔸 Total food eaten: ${summary.behavior.totalFoodEaten}`);
    console.log(
      `  🔸 Average energy level: ${summary.behavior.averageEnergyLevel.toFixed(
        1
      )}`
    );
    console.log(
      `  🔸 Total distance traveled: ${summary.behavior.totalDistanceTraveled.toFixed(
        1
      )}`
    );
    console.log(
      `  🔸 Reproduction attempts: ${summary.behavior.reproductionEvents}`
    );

    console.log("\n🏆 INTELLIGENCE ANALYSIS:");
    console.log(
      `  🔸 Average fitness: ${summary.intelligence.averageFitness.toFixed(1)}`
    );
    console.log(
      `  🔸 Movement efficiency: ${summary.intelligence.movementEfficiency.toFixed(
        3
      )} units/tick`
    );
    if (summary.intelligence.smartestCreature) {
      const smart = summary.intelligence.smartestCreature;
      console.log(
        `  🔸 Smartest creature: ${smart.id.substring(
          0,
          8
        )} (fitness: ${smart.fitness.toFixed(1)}, age: ${smart.age})`
      );
    }

    console.log("\n🧠 BRAIN DECISION ANALYSIS:");
    const brain = summary.intelligence.brainAnalysis;
    console.log(`  🔸 Total decisions made: ${brain.totalDecisions}`);
    console.log(
      `  🔸 Average confidence: ${(brain.averageConfidence * 100).toFixed(1)}%`
    );
    console.log("  🔸 Action distribution:");
    console.log(
      `    • Movement: ${(brain.actionDistribution.movement * 100).toFixed(1)}%`
    );
    console.log(
      `    • Eating: ${(brain.actionDistribution.eating * 100).toFixed(1)}%`
    );
    console.log(
      `    • Attacking: ${(brain.actionDistribution.attacking * 100).toFixed(
        1
      )}%`
    );
    console.log(
      `    • Reproducing: ${(
        brain.actionDistribution.reproducing * 100
      ).toFixed(1)}%`
    );
    console.log(
      `    • Idle: ${(brain.actionDistribution.idle * 100).toFixed(1)}%`
    );
    console.log("  🔸 Decision patterns:");
    console.log(
      `    • Energy seeking: ${(
        brain.decisionPatterns.energySeekingBehavior * 100
      ).toFixed(1)}%`
    );
    console.log(
      `    • Predator avoidance: ${(
        brain.decisionPatterns.predatorAvoidance * 100
      ).toFixed(1)}%`
    );
    console.log(
      `    • Reproductive urge: ${(
        brain.decisionPatterns.reproductiveUrge * 100
      ).toFixed(1)}%`
    );
    console.log(
      `    • Exploration: ${(
        brain.decisionPatterns.explorationTendency * 100
      ).toFixed(1)}%`
    );

    console.log("\n⚡ ACTION EFFICIENCY ANALYSIS:");
    const action = summary.intelligence.actionAnalysis;
    console.log("  🔸 Attempts vs Successes:");
    console.log(
      `    • Feeding: ${action.attempts.feeding} attempts, ${
        action.successes.feeding
      } successes (${action.efficiency.feedingSuccess.toFixed(
        1
      )}% success rate)`
    );
    console.log(
      `    • Combat: ${action.attempts.combat} attempts, ${
        action.successes.combat
      } successes (${action.efficiency.combatSuccess.toFixed(1)}% success rate)`
    );
    console.log(
      `    • Reproduction: ${action.attempts.reproduction} attempts, ${
        action.successes.reproduction
      } successes (${action.efficiency.reproductiveSuccess.toFixed(
        1
      )}% success rate)`
    );
    console.log(`    • Movement actions: ${action.attempts.movement}`);
    console.log(
      `  🔸 Energy management: ${action.efficiency.energyManagement.toFixed(
        1
      )} average energy`
    );

    console.log("\n🧬 GENETIC DIVERSITY:");
    console.log(
      `  🔸 Average size: ${summary.genetics.averageTraits.size.toFixed(2)}`
    );
    console.log(
      `  🔸 Average speed: ${summary.genetics.averageTraits.speed.toFixed(2)}`
    );
    console.log(
      `  🔸 Average aggression: ${summary.genetics.averageTraits.aggression.toFixed(
        2
      )}`
    );
    console.log(
      `  🔸 Plant preference: ${summary.genetics.averageTraits.plantPreference.toFixed(
        2
      )}`
    );
    console.log(
      `  🔸 Meat preference: ${summary.genetics.averageTraits.meatPreference.toFixed(
        2
      )}`
    );

    console.log("\n🌍 ENVIRONMENT INTERACTION:");
    console.log(
      `  🔸 Food consumption rate: ${summary.environment.foodConsumptionRate.toFixed(
        3
      )}/tick`
    );
    console.log(
      `  🔸 Spatial distribution: ${summary.environment.spatialDistribution}`
    );

    console.log("\n💡 KEY INSIGHTS:");
    summary.insights.forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });

    console.log("\n🔬 =====================================================\n");
  }

  /**
   * Calculate genetic trait averages
   */
  private calculateGeneticAverages(creatures: Creature[]) {
    if (creatures.length === 0) {
      return {
        size: 1,
        speed: 1,
        aggression: 0.5,
        plantPreference: 0.5,
        meatPreference: 0.5,
      };
    }

    const totals = creatures.reduce(
      (acc, c) => ({
        size: acc.size + c.genetics.size,
        speed: acc.speed + c.genetics.speed,
        aggression: acc.aggression + c.genetics.aggression,
        plantPreference: acc.plantPreference + c.genetics.plantPreference,
        meatPreference: acc.meatPreference + c.genetics.meatPreference,
      }),
      {
        size: 0,
        speed: 0,
        aggression: 0,
        plantPreference: 0,
        meatPreference: 0,
      }
    );

    return {
      size: totals.size / creatures.length,
      speed: totals.speed / creatures.length,
      aggression: totals.aggression / creatures.length,
      plantPreference: totals.plantPreference / creatures.length,
      meatPreference: totals.meatPreference / creatures.length,
    };
  }

  /**
   * Calculate genetic trait variances
   */
  private calculateGeneticVariances(creatures: Creature[]) {
    if (creatures.length <= 1) {
      return { size: 0, speed: 0, aggression: 0 };
    }

    const averages = this.calculateGeneticAverages(creatures);
    const variances = creatures.reduce(
      (acc, c) => ({
        size: acc.size + Math.pow(c.genetics.size - averages.size, 2),
        speed: acc.speed + Math.pow(c.genetics.speed - averages.speed, 2),
        aggression:
          acc.aggression +
          Math.pow(c.genetics.aggression - averages.aggression, 2),
      }),
      { size: 0, speed: 0, aggression: 0 }
    );

    return {
      size: Math.sqrt(variances.size / creatures.length),
      speed: Math.sqrt(variances.speed / creatures.length),
      aggression: Math.sqrt(variances.aggression / creatures.length),
    };
  }

  /**
   * Analyze spatial distribution of creatures
   */
  private analyzeSpatialDistribution(creatures: Creature[]): string {
    if (creatures.length === 0) return "No creatures";

    const centerX = this.config.worldWidth / 2;
    const centerY = this.config.worldHeight / 2;
    const maxRadius =
      Math.min(this.config.worldWidth, this.config.worldHeight) / 2;

    const distances = creatures.map((c) => {
      const dx = c.physics.position.x - centerX;
      const dy = c.physics.position.y - centerY;
      return Math.sqrt(dx * dx + dy * dy) / maxRadius;
    });

    const averageDistance =
      distances.reduce((sum, d) => sum + d, 0) / distances.length;

    if (averageDistance < 0.3) return "Clustered in center";
    if (averageDistance > 0.7) return "Spread near edges";
    return "Evenly distributed";
  }

  /**
   * Generate actionable insights
   */
  private generateInsights(
    creatures: Creature[],
    births: number,
    deaths: number
  ): string[] {
    const insights: string[] = [];

    // Population health
    if (creatures.length === 0) {
      insights.push(
        "⚠️ Complete extinction occurred - consider reducing energy costs or increasing food"
      );
    } else if (creatures.length < this.initialCreatureCount * 0.5) {
      insights.push(
        "⚠️ Significant population decline - survival conditions may be too harsh"
      );
    } else if (creatures.length > this.initialCreatureCount * 1.5) {
      insights.push(
        "✅ Population growth - creatures are thriving in current environment"
      );
    }

    // Energy analysis
    const averageEnergy =
      creatures.length > 0
        ? creatures.reduce((sum, c) => sum + c.physics.energy, 0) /
          creatures.length
        : 0;

    if (averageEnergy < 30) {
      insights.push(
        "🔋 Low average energy levels - creatures struggling to maintain energy"
      );
    } else if (averageEnergy > 80) {
      insights.push(
        "🔋 High energy levels - environment may be too easy, consider adding challenges"
      );
    }

    // Reproductive success
    if (births === 0 && this.currentTick > 100) {
      insights.push(
        "🚫 No reproduction occurred - check maturity age and reproduction costs"
      );
    } else if (births > deaths * 2) {
      insights.push("📈 High birth rate - population expanding rapidly");
    }

    // AI behavior analysis
    const totalDistance = creatures.reduce(
      (sum, c) => sum + c.stats.distanceTraveled,
      0
    );
    if (totalDistance / Math.max(1, creatures.length) < 10) {
      insights.push(
        "🐌 Low movement activity - creatures may not be exploring effectively"
      );
    }

    // Food availability analysis
    const envStats = this.environment.getStats();
    if (envStats.totalFood === 0) {
      insights.push("🍃 No food in environment - check food spawning system");
    } else if (births === 0 && this.currentTick > 200 && averageEnergy > 80) {
      insights.push(
        "🧠 High energy but no feeding attempts - AI may not be detecting food properly"
      );
    }

    // Brain decision analysis
    if (this.brainDecisions.length === 0 && this.currentTick > 50) {
      insights.push(
        "🚨 No brain decisions recorded - brain tracking system may be broken"
      );
    }

    // Genetic diversity
    const avgAggression =
      creatures.length > 0
        ? creatures.reduce((sum, c) => sum + c.genetics.aggression, 0) /
          creatures.length
        : 0;

    if (avgAggression > 0.8) {
      insights.push(
        "⚔️ High aggression population - expect more combat interactions"
      );
    } else if (avgAggression < 0.2) {
      insights.push(
        "🕊️ Peaceful population - low combat, focus on foraging strategies"
      );
    }

    return insights;
  }

  /**
   * Track detailed creature behavior after each update
   */
  private trackCreatureBehavior(
    creature: Creature,
    beforeStats: {
      foodEaten: number;
      feedingAttempts: number;
      reproductionAttempts: number;
      energy: number;
    }
  ): void {
    const creatureId = creature.id;

    // Initialize tracking for new creatures
    if (!this.actionAttempts.has(creatureId)) {
      this.actionAttempts.set(creatureId, {
        feeding: 0,
        feedingSuccess: 0,
        combat: 0,
        combatSuccess: 0,
        reproduction: 0,
        reproductionSuccess: 0,
        movement: 0,
      });
    }

    const stats = this.actionAttempts.get(creatureId)!;

    // Track feeding attempts (regardless of success)
    if (creature.stats.feedingAttempts > beforeStats.feedingAttempts) {
      const newAttempts =
        creature.stats.feedingAttempts - beforeStats.feedingAttempts;
      stats.feeding += newAttempts; // Count all attempts
    }

    // Track feeding successes separately
    if (creature.stats.foodEaten > beforeStats.foodEaten) {
      stats.feedingSuccess++;

      this.events.push({
        tick: this.currentTick,
        type: "feeding",
        creatureId,
        details: {
          success: true,
          energyGain: creature.physics.energy - beforeStats.energy,
          totalFoodEaten: creature.stats.foodEaten,
        },
      });
    }

    // Detect reproduction attempts
    if (
      creature.stats.reproductionAttempts > beforeStats.reproductionAttempts
    ) {
      stats.reproduction++;

      // Check if reproduction was successful (new creatures born)
      const newCreatures = this.environment
        .getCreatures()
        .filter(
          (c) =>
            c.parentIds.includes(creatureId) &&
            c.generation > creature.generation
        );

      if (newCreatures.length > 0) {
        stats.reproductionSuccess++;

        this.events.push({
          tick: this.currentTick,
          type: "reproduction",
          creatureId,
          details: {
            success: true,
            offspring: newCreatures.length,
            energyCost: beforeStats.energy - creature.physics.energy,
          },
        });
      }
    }

    // Track movement
    if (
      creature.physics.velocity.x !== 0 ||
      creature.physics.velocity.y !== 0
    ) {
      stats.movement++;
    }
  }

  /**
   * Analyze brain decision patterns
   */
  private analyzeBrainBehavior(): BrainAnalysis {
    if (this.brainDecisions.length === 0) {
      return {
        totalDecisions: 0,
        averageConfidence: 0,
        actionDistribution: {
          movement: 0,
          eating: 0,
          attacking: 0,
          reproducing: 0,
          idle: 0,
        },
        decisionPatterns: {
          energySeekingBehavior: 0,
          predatorAvoidance: 0,
          reproductiveUrge: 0,
          explorationTendency: 0,
        },
      };
    }

    // Calculate action distribution
    const actionCounts = {
      movement: 0,
      eating: 0,
      attacking: 0,
      reproducing: 0,
      idle: 0,
    };

    let totalConfidence = 0;
    let energySeekingCount = 0;
    let predatorAvoidanceCount = 0;
    let reproductiveUrgeCount = 0;
    let explorationCount = 0;

    for (const decision of this.brainDecisions) {
      const actions = decision.actions;

      // Determine primary action
      const maxAction = Math.max(
        Math.abs(actions.moveX) + Math.abs(actions.moveY),
        actions.eat,
        actions.attack,
        actions.reproduce
      );

      if (maxAction === actions.eat && actions.eat > 0.5) {
        actionCounts.eating++;
      } else if (maxAction === actions.attack && actions.attack > 0.7) {
        actionCounts.attacking++;
      } else if (maxAction === actions.reproduce && actions.reproduce > 0.3) {
        actionCounts.reproducing++;
      } else if (Math.abs(actions.moveX) + Math.abs(actions.moveY) > 0.1) {
        actionCounts.movement++;
      } else {
        actionCounts.idle++;
      }

      // Calculate confidence as max output value
      const confidence = Math.max(...decision.brainOutputs);
      totalConfidence += confidence;

      // Analyze decision patterns
      const sensorInputs = decision.sensorInputs;

      // Energy seeking: moving toward food when energy is low
      if (
        decision.energy < 50 &&
        sensorInputs[0] < 0.5 &&
        Math.abs(actions.moveX) + Math.abs(actions.moveY) > 0.3
      ) {
        energySeekingCount++;
      }

      // Predator avoidance: moving away when predator detected
      if (
        sensorInputs[4] < 0.5 &&
        Math.abs(actions.moveX) + Math.abs(actions.moveY) > 0.5
      ) {
        predatorAvoidanceCount++;
      }

      // Reproductive urge: seeking mates when mature and energetic
      if (decision.energy > 60 && actions.reproduce > 0.5) {
        reproductiveUrgeCount++;
      }

      // Exploration: moving when no immediate stimuli
      if (
        sensorInputs[0] > 0.8 &&
        sensorInputs[4] > 0.8 &&
        Math.abs(actions.moveX) + Math.abs(actions.moveY) > 0.2
      ) {
        explorationCount++;
      }
    }

    const total = this.brainDecisions.length;

    return {
      totalDecisions: total,
      averageConfidence: totalConfidence / total,
      actionDistribution: {
        movement: actionCounts.movement / total,
        eating: actionCounts.eating / total,
        attacking: actionCounts.attacking / total,
        reproducing: actionCounts.reproducing / total,
        idle: actionCounts.idle / total,
      },
      decisionPatterns: {
        energySeekingBehavior: energySeekingCount / total,
        predatorAvoidance: predatorAvoidanceCount / total,
        reproductiveUrge: reproductiveUrgeCount / total,
        explorationTendency: explorationCount / total,
      },
    };
  }

  /**
   * Analyze action success rates
   */
  private analyzeActionEfficiency(): ActionAnalysis {
    const allStats = Array.from(this.actionAttempts.values());

    if (allStats.length === 0) {
      return {
        attempts: { feeding: 0, combat: 0, reproduction: 0, movement: 0 },
        successes: { feeding: 0, combat: 0, reproduction: 0 },
        efficiency: {
          feedingSuccess: 0,
          combatSuccess: 0,
          reproductiveSuccess: 0,
          energyManagement: 0,
        },
      };
    }

    const totals = allStats.reduce(
      (acc, stats) => ({
        feeding: acc.feeding + stats.feeding,
        feedingSuccess: acc.feedingSuccess + stats.feedingSuccess,
        combat: acc.combat + stats.combat,
        combatSuccess: acc.combatSuccess + stats.combatSuccess,
        reproduction: acc.reproduction + stats.reproduction,
        reproductionSuccess:
          acc.reproductionSuccess + stats.reproductionSuccess,
        movement: acc.movement + stats.movement,
      }),
      {
        feeding: 0,
        feedingSuccess: 0,
        combat: 0,
        combatSuccess: 0,
        reproduction: 0,
        reproductionSuccess: 0,
        movement: 0,
      }
    );

    // Calculate average energy management
    const creatures = this.environment.getCreatures();
    const averageEnergy =
      creatures.length > 0
        ? creatures.reduce((sum, c) => sum + c.physics.energy, 0) /
          creatures.length
        : 0;

    return {
      attempts: {
        feeding: totals.feeding,
        combat: totals.combat,
        reproduction: totals.reproduction,
        movement: totals.movement,
      },
      successes: {
        feeding: totals.feedingSuccess,
        combat: totals.combatSuccess,
        reproduction: totals.reproductionSuccess,
      },
      efficiency: {
        feedingSuccess:
          totals.feeding > 0
            ? (totals.feedingSuccess / totals.feeding) * 100
            : 0,
        combatSuccess:
          totals.combat > 0 ? (totals.combatSuccess / totals.combat) * 100 : 0,
        reproductiveSuccess:
          totals.reproduction > 0
            ? (totals.reproductionSuccess / totals.reproduction) * 100
            : 0,
        energyManagement: averageEnergy,
      },
    };
  }
}
