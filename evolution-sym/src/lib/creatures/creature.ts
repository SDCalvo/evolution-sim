/**
 * Creature Class - Digital Life Form with AI Brain
 *
 * Uses composition pattern to combine:
 * - 14-trait genetic system
 * - Bootstrap neural network brains
 * - 12-sensor environmental awareness
 * - Physics and collision system
 * - HSL species visualization
 * - Survival statistics tracking
 */

import { NeuralNetwork } from "../neural/network";
import { BootstrapBrainFactory } from "./bootstrapBrains";
import {
  CreatureGenetics,
  GeneticsHelper,
  Vector2,
  CreatureSensors,
  CreatureActions,
  CreaturePhysics,
  CreatureState,
  HSLColor,
  CreatureStats,
  CreatureJSON,
  CreatureThought,
} from "./creatureTypes";
import { Environment } from "../environment/environment";
import {
  SpatialQuery,
  EntityType,
  Carrion,
} from "../environment/environmentTypes";
import { simulationLogger, LogCategory } from "../logging/simulationLogger";

export class Creature {
  // Core composition - HAS-A relationships
  public readonly id: string;
  public readonly genetics: CreatureGenetics;
  public readonly brain: NeuralNetwork;

  // State systems
  public physics: CreaturePhysics;
  public state: CreatureState;
  public stats: CreatureStats;

  // Generation tracking
  public readonly generation: number;
  public readonly parentIds: string[];

  // Reproduction state
  public reproductionCooldown: number;
  public isMateable: boolean;

  /**
   * Create a new creature
   */
  constructor(
    generation: number = 0,
    genetics?: CreatureGenetics,
    parents?: Creature[],
    position?: Vector2
  ) {
    // Generate unique ID
    this.id = this.generateId();
    this.generation = generation;
    this.parentIds = parents?.map((p) => p.id) || [];

    // Generate or inherit genetics
    this.genetics = genetics || GeneticsHelper.generateRandomGenetics();

    // Create brain using bootstrap system
    const parentBrains = parents?.map((p) => p.brain);
    this.brain = BootstrapBrainFactory.createBrainForGeneration(
      generation,
      this.genetics,
      parentBrains
    );

    // Initialize physics system
    this.physics = this.initializePhysics(position);

    // Set initial state
    this.state = CreatureState.Alive;
    this.stats = this.initializeStats();

    // Reproduction settings
    this.reproductionCooldown = 0;
    this.isMateable = false;
  }

  /**
   * Main simulation update - called every tick
   */
  public update(
    environment?: Environment,
    brainTracker?: (decision: {
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
    }) => void
  ): void {
    if (this.state !== CreatureState.Alive) return;

    // 1. Sense environment (12 sensors)
    const sensorData = this.sense(environment);

    // 2. Think with AI brain
    const decisions = this.think(sensorData);

    // 3. Report brain decision to tracker (if provided)
    if (brainTracker) {
      const brainOutputs = this.brain.process(sensorData); // Get raw neural network outputs
      brainTracker({
        creatureId: this.id,
        sensorInputs: [...sensorData],
        brainOutputs: [...brainOutputs],
        actions: { ...decisions },
        energy: this.physics.energy,
        tick: 0, // Will be set by simulation
      });
    }

    // 4. Act on decisions
    this.act(decisions, environment);

    // 4. Update physics and internal state
    this.updatePhysics(environment);
    this.updateInternalState();

    // 5. Check survival conditions
    this.checkSurvival();

    // 6. Update statistics
    this.updateStats();
  }

  /**
   * Generate 12-sensor input for neural network
   * Real environmental sensing using spatial queries!
   */
  private sense(environment?: Environment): number[] {
    if (!environment) {
      // Fallback to dummy data if no environment - NOW 14 SENSORS!
      return Array(14).fill(0.5);
    }

    // Query nearby entities using spatial grid - INCLUDING CARRION! 🦴
    const searchRadius = this.genetics.visionRange * 100; // Convert genetic trait to pixels
    const spatialQuery: SpatialQuery = {
      position: this.physics.position,
      radius: searchRadius,
      entityTypes: [
        EntityType.PlantFood,
        EntityType.SmallPrey,
        EntityType.MushroomFood,
        EntityType.Carrion, // 🦴 NOW DETECTING CARRION!
      ],
      sortByDistance: true,
      excludeCreature: this,
    };
    const nearbyEntities = environment.queryNearbyEntities(spatialQuery);

    // Initialize sensors - NOW WITH CARRION DETECTION! 🦴
    const sensors: CreatureSensors = {
      // Internal state sensors (always available)
      energyLevel: this.physics.energy / 100, // Normalize to 0-1
      healthLevel: this.physics.health / 100, // Normalize to 0-1
      ageLevel: Math.min(this.physics.age / this.genetics.lifespan, 1), // Normalize by lifespan

      // Environmental sensors (require queries)
      foodDistance: 1.0, // Default: no food detected
      foodType: 0.5, // Default: neutral
      carrionDistance: 1.0, // Default: no carrion detected 🦴 NEW!
      carrionFreshness: 0.0, // Default: no carrion freshness data 🦴 NEW!
      predatorDistance: 1.0, // Default: no threats
      preyDistance: 1.0, // Default: no prey
      populationDensity: 0.0, // Will calculate from nearby creatures

      // Vision rays (spatial awareness in 4 directions)
      visionForward: 1.0, // Default: clear vision
      visionLeft: 1.0,
      visionRight: 1.0,
      visionBack: 1.0,
    };

    // Analyze nearby food AND carrion separately! 🦴
    let closestFoodDistance = Infinity;
    let closestFoodType = 0.5; // Default neutral
    let closestCarrionDistance = Infinity;
    let closestCarrionFreshness = 0.0; // Default stale

    for (const entity of nearbyEntities.food) {
      const distance = this.calculateDistance(
        this.physics.position,
        entity.position
      );

      // Check if this is carrion (needs special handling)
      if ("scent" in entity && "currentDecayStage" in entity) {
        // 🦴 CARRION DETECTION - Scent-based discovery!
        const carrion = entity as Carrion;
        if (
          carrion.scent !== undefined &&
          carrion.currentDecayStage !== undefined
        ) {
          // Scent affects detection range - fresh carrion detected further away!
          const scentRadius = searchRadius * carrion.scent;
          if (distance <= scentRadius && distance < closestCarrionDistance) {
            closestCarrionDistance = distance;
            closestCarrionFreshness = 1.0 - carrion.currentDecayStage; // Fresh = 1.0, rotted = 0.0
          }
        }
      } else {
        // Regular food detection
        if (distance < closestFoodDistance) {
          closestFoodDistance = distance;
          // Food type based on diet preference
          if (entity.type === EntityType.PlantFood) {
            closestFoodType = this.genetics.plantPreference;
          } else {
            closestFoodType = this.genetics.meatPreference;
          }
        }
      }
    }

    // Convert food distance to 0-1 sensor value (0=very close, 1=far/none)
    if (closestFoodDistance < Infinity) {
      sensors.foodDistance = Math.min(closestFoodDistance / searchRadius, 1.0);
      sensors.foodType = closestFoodType;
    }

    // 🦴 Convert carrion distance and freshness to sensor values
    if (closestCarrionDistance < Infinity) {
      sensors.carrionDistance = Math.min(
        closestCarrionDistance / searchRadius,
        1.0
      );
      sensors.carrionFreshness = closestCarrionFreshness;
    }

    // Analyze nearby creatures for predators/prey/population
    let predatorCount = 0;
    let preyCount = 0;
    let closestPredatorDistance = Infinity;
    let closestPreyDistance = Infinity;

    for (const creature of nearbyEntities.creatures) {
      if (creature.id === this.id) continue; // Skip self

      const distance = this.calculateDistance(
        this.physics.position,
        creature.physics.position
      );
      sensors.populationDensity += 0.1; // Each nearby creature increases density

      // Determine if predator or prey based on size and aggression
      const sizeDifference = creature.genetics.size - this.genetics.size;
      const aggressionDifference =
        creature.genetics.aggression - this.genetics.aggression;

      const threatScore = sizeDifference + aggressionDifference;

      if (threatScore > 0.3) {
        // Larger, more aggressive = potential predator
        predatorCount++;
        if (distance < closestPredatorDistance) {
          closestPredatorDistance = distance;
        }
      } else if (threatScore < -0.3) {
        // Smaller, less aggressive = potential prey
        preyCount++;
        if (distance < closestPreyDistance) {
          closestPreyDistance = distance;
        }
      }
    }

    // Set predator/prey distances (0=very close, 1=far/none)
    if (predatorCount > 0) {
      sensors.predatorDistance = Math.min(
        closestPredatorDistance / searchRadius,
        1.0
      );
    }
    if (preyCount > 0) {
      sensors.preyDistance = Math.min(closestPreyDistance / searchRadius, 1.0);
    }

    // Clamp population density to 0-1
    sensors.populationDensity = Math.min(sensors.populationDensity, 1.0);

    // Vision rays: Check for obstacles in 4 directions
    const visionDistance = this.genetics.visionRange * 50; // Half search radius for vision
    sensors.visionForward = this.castVisionRay(environment, 0, visionDistance); // Forward
    sensors.visionLeft = this.castVisionRay(
      environment,
      -Math.PI / 2,
      visionDistance
    ); // Left
    sensors.visionRight = this.castVisionRay(
      environment,
      Math.PI / 2,
      visionDistance
    ); // Right
    sensors.visionBack = this.castVisionRay(
      environment,
      Math.PI,
      visionDistance
    ); // Back

    // Convert to array for neural network - NOW 14 INPUTS FOR CARRION! 🦴
    return [
      sensors.foodDistance,
      sensors.foodType,
      sensors.carrionDistance, // 🦴 NEW: Distance to carrion
      sensors.carrionFreshness, // 🦴 NEW: How fresh the carrion is
      sensors.predatorDistance,
      sensors.preyDistance,
      sensors.energyLevel,
      sensors.healthLevel,
      sensors.ageLevel,
      sensors.populationDensity,
      sensors.visionForward,
      sensors.visionLeft,
      sensors.visionRight,
      sensors.visionBack,
    ];
  }

  /**
   * Process sensor data through AI brain
   */
  private think(sensorData: number[]): CreatureActions {
    const rawOutput = this.brain.process(sensorData);

    // Convert neural network output to actions
    return {
      moveX: rawOutput[0] * 2 - 1, // Convert 0-1 to -1 to +1
      moveY: rawOutput[1] * 2 - 1, // Convert 0-1 to -1 to +1
      eat: rawOutput[2], // Keep 0-1
      attack: rawOutput[3], // Keep 0-1
      reproduce: rawOutput[4], // Keep 0-1
    };
  }

  /**
   * Execute actions in the environment
   */
  private act(actions: CreatureActions, environment?: Environment): void {
    // Apply movement (trait-modified)
    this.applyMovement(actions.moveX, actions.moveY);

    // Generate thoughts based on decisions and state
    this.generateThoughts(actions, environment);

    // Attempt eating if strong signal
    if (actions.eat > 0.5) {
      this.attemptEating(environment);
    }

    // Attempt attack/defense if needed
    if (actions.attack > 0.7) {
      this.attemptAttack(environment);
    }

    // Attempt reproduction if conditions met (LOWERED THRESHOLD from 0.6 to 0.3)
    if (actions.reproduce > 0.3 && this.canReproduce()) {
      this.attemptReproduction(environment);
    } else if (
      this.isMateable &&
      this.physics.age > this.genetics.maturityAge
    ) {
      // 🚫 DEBUG: Log why reproduction isn't happening
      if (this.stats.reproductionAttempts % 60 === 0) {
        const reasons = [];
        if (actions.reproduce <= 0.3)
          reasons.push(`weak signal: ${actions.reproduce.toFixed(2)}`);
        if (!this.canReproduce()) {
          if (this.reproductionCooldown > 0)
            reasons.push(`cooldown: ${this.reproductionCooldown}`);
          if (this.physics.energy <= 50)
            reasons.push(`low energy: ${this.physics.energy.toFixed(1)}`);
        }
        simulationLogger.warning(
          LogCategory.REPRODUCTION,
          `${this.id.substring(0, 8)} reproduction blocked: ${reasons.join(
            ", "
          )}`
        );
      }
      this.stats.reproductionAttempts++;
    }
  }

  /**
   * Generate thoughts based on brain decisions and current state
   */
  private generateThoughts(
    actions: CreatureActions,
    environment?: Environment
  ): void {
    const thoughts: CreatureThought[] = [];

    // Energy-based thoughts
    if (this.physics.energy < 30) {
      thoughts.push({
        text: "I'm starving!",
        priority: 10,
        duration: 30,
        color: "#ff4444",
        icon: "🍽️",
      });
    } else if (this.physics.energy < 50) {
      thoughts.push({
        text: "Getting hungry...",
        priority: 5,
        duration: 20,
        color: "#ffaa44",
        icon: "🤔",
      });
    }

    // Action-based thoughts
    if (actions.eat > 0.7) {
      thoughts.push({
        text: "Food detected!",
        priority: 8,
        duration: 25,
        color: "#44ff44",
        icon: "🍃",
      });
    } else if (actions.eat > 0.5) {
      thoughts.push({
        text: "Searching for food...",
        priority: 6,
        duration: 20,
        color: "#88ff88",
        icon: "👀",
      });
    }

    if (actions.reproduce > 0.8 && this.canReproduce()) {
      thoughts.push({
        text: "Looking for a mate!",
        priority: 9,
        duration: 40,
        color: "#ff69b4",
        icon: "💕",
      });
    } else if (actions.reproduce > 0.6) {
      thoughts.push({
        text: "Feeling romantic...",
        priority: 7,
        duration: 30,
        color: "#ffb6c1",
        icon: "💘",
      });
    }

    if (actions.attack > 0.8) {
      thoughts.push({
        text: "FIGHT!",
        priority: 12,
        duration: 20,
        color: "#ff0000",
        icon: "⚔️",
      });
    } else if (actions.attack > 0.5) {
      thoughts.push({
        text: "Feeling aggressive...",
        priority: 6,
        duration: 15,
        color: "#ff6666",
        icon: "😤",
      });
    }

    // Movement-based thoughts
    const movement = Math.abs(actions.moveX) + Math.abs(actions.moveY);
    if (movement > 1.5) {
      thoughts.push({
        text: "Running fast!",
        priority: 4,
        duration: 10,
        color: "#4488ff",
        icon: "💨",
      });
    } else if (movement > 0.8) {
      thoughts.push({
        text: "Exploring...",
        priority: 3,
        duration: 15,
        color: "#88aaff",
        icon: "🧭",
      });
    }

    // Age-based thoughts
    if (this.physics.age > this.genetics.lifespan * 0.8) {
      thoughts.push({
        text: "I'm getting old...",
        priority: 3,
        duration: 60,
        color: "#888888",
        icon: "👴",
      });
    } else if (
      this.physics.age > this.genetics.maturityAge &&
      !this.isMateable
    ) {
      thoughts.push({
        text: "I'm mature now!",
        priority: 5,
        duration: 100,
        color: "#ffdd44",
        icon: "🌟",
      });
    }

    // Health-based thoughts
    if (this.physics.health < 50) {
      thoughts.push({
        text: "I'm hurt...",
        priority: 8,
        duration: 50,
        color: "#aa4444",
        icon: "🩹",
      });
    }

    // Environmental awareness thoughts
    if (environment) {
      const nearbyQuery = {
        position: this.physics.position,
        radius: this.physics.collisionRadius + 100,
        entityTypes: [
          EntityType.PlantFood,
          EntityType.SmallPrey,
          EntityType.MushroomFood,
          EntityType.Carrion,
        ],
        maxResults: 10,
        sortByDistance: true,
        excludeCreature: this,
      };

      try {
        const nearby = environment.queryNearbyEntities(nearbyQuery);

        if (nearby.creatures.length > 3) {
          thoughts.push({
            text: "Crowded here!",
            priority: 4,
            duration: 20,
            color: "#ffaa00",
            icon: "🏃",
          });
        }

        if (nearby.food.length === 0 && this.physics.energy < 60) {
          thoughts.push({
            text: "No food around...",
            priority: 6,
            duration: 30,
            color: "#ff8800",
            icon: "😟",
          });
        }
      } catch {
        // Ignore query errors for thought generation
      }
    }

    // Special combination thoughts
    if (
      this.physics.energy > 80 &&
      this.canReproduce() &&
      actions.reproduce > 0.7
    ) {
      thoughts.push({
        text: "Ready to start a family!",
        priority: 11,
        duration: 50,
        color: "#ff1493",
        icon: "👨‍👩‍👧‍👦",
      });
    }

    if (this.physics.energy < 20 && actions.eat > 0.8) {
      thoughts.push({
        text: "MUST FIND FOOD NOW!",
        priority: 15,
        duration: 40,
        color: "#ff0000",
        icon: "🆘",
      });
    }

    // Default exploration thought if nothing else
    if (thoughts.length === 0 && movement > 0.2) {
      thoughts.push({
        text: "Wandering around...",
        priority: 1,
        duration: 20,
        color: "#aaaaaa",
        icon: "🚶",
      });
    }

    // Select the highest priority thought
    if (thoughts.length > 0) {
      const newThought = thoughts.reduce((best, current) =>
        current.priority > best.priority ? current : best
      );

      // Only update if it's a higher priority than current thought or current thought expired
      if (
        !this.stats.currentThought ||
        newThought.priority > this.stats.currentThought.priority ||
        this.stats.currentThought.duration <= 0
      ) {
        this.stats.currentThought = newThought;

        // Add to thought history (keep last 10)
        this.stats.thoughtHistory.push(newThought);
        if (this.stats.thoughtHistory.length > 10) {
          this.stats.thoughtHistory.shift();
        }
      }
    }

    // Decrease current thought duration
    if (this.stats.currentThought) {
      this.stats.currentThought.duration--;
      if (this.stats.currentThought.duration <= 0) {
        this.stats.currentThought = undefined;
      }
    }
  }

  /**
   * Apply movement based on neural network decision and genetics
   */
  private applyMovement(moveX: number, moveY: number): void {
    // Scale by genetic speed trait
    const speed = this.genetics.speed * this.physics.maxSpeed;

    // Apply movement with energy cost
    this.physics.velocity.x = moveX * speed;
    this.physics.velocity.y = moveY * speed;

    // Energy cost for movement (bigger creatures cost more, frame-rate independent)
    const movementCost =
      (Math.abs(moveX) + Math.abs(moveY)) * this.genetics.size * 0.003; // Reduced by ~33x for high FPS
    this.physics.energy = Math.max(0, this.physics.energy - movementCost);

    // Update rotation for vision rays
    if (moveX !== 0 || moveY !== 0) {
      this.physics.rotation = Math.atan2(moveY, moveX);
    }
  }

  /**
   * Update physics state
   */
  private updatePhysics(environment?: Environment): void {
    // Apply velocity to position
    this.physics.position.x += this.physics.velocity.x;
    this.physics.position.y += this.physics.velocity.y;

    // Apply boundary wrapping (creatures appear on opposite side when going out of bounds)
    this.applyBoundaryWrapping(environment);

    // Apply drag
    this.physics.velocity.x *= 0.95;
    this.physics.velocity.y *= 0.95;

    // Track distance traveled
    const distance = Math.sqrt(
      this.physics.velocity.x ** 2 + this.physics.velocity.y ** 2
    );
    this.stats.distanceTraveled += distance;
  }

  /**
   * Update internal creature state
   */
  private updateInternalState(): void {
    // Age the creature
    this.physics.age++;
    this.stats.ticksAlive++;

    // Natural energy decay based on efficiency (frame-rate independent)
    // Target: lose ~10 energy per second at 60 FPS with efficiency 1.0
    const oldEnergy = this.physics.energy;
    const decayRate = (2 - this.genetics.efficiency) * 0.0027; // Reduced by ~37x for high FPS
    this.physics.energy = Math.max(0, this.physics.energy - decayRate);

    // 🔋 CRITICAL ENERGY LOGGING
    if (this.physics.energy <= 10 && oldEnergy > 10) {
      simulationLogger.logCriticalEnergy(
        this.id,
        this.physics.energy,
        this.physics.age
      );
    }

    // Update maturity status
    const wasMateable = this.isMateable;
    this.isMateable = this.physics.age > this.genetics.maturityAge;

    // 🌟 MATURITY MILESTONE LOGGING
    if (!wasMateable && this.isMateable) {
      simulationLogger.logMaturity(
        this.id,
        this.physics.age,
        this.genetics.maturityAge,
        this.physics.energy
      );
    }

    // Update reproduction cooldown
    if (this.reproductionCooldown > 0) {
      this.reproductionCooldown--;
    }
  }

  /**
   * Check if creature should die
   */
  private checkSurvival(): void {
    // Death conditions
    if (
      this.physics.energy <= 0 ||
      this.physics.health <= 0 ||
      this.physics.age > this.genetics.lifespan
    ) {
      this.state = CreatureState.Dead;
    }
  }

  /**
   * Attempt to feed on nearby food - NOW INCLUDES CARRION! 🦴
   */
  private attemptEating(environment?: Environment): void {
    if (!environment) return;

    // Always track feeding attempts (even if unsuccessful)
    this.stats.feedingAttempts++;

    // Query for nearby food AND carrion! 🦴
    const query: SpatialQuery = {
      position: this.physics.position,
      radius: this.physics.collisionRadius + 100, // INCREASED: Better feeding reach
      entityTypes: [
        EntityType.PlantFood,
        EntityType.SmallPrey,
        EntityType.MushroomFood,
        EntityType.Carrion, // 🦴 SCAVENGER FEEDING!
      ],
      maxResults: 1,
      sortByDistance: true,
    };

    const results = environment.queryNearbyEntities(query);

    if (results.food.length > 0) {
      const nearestFood = results.food[0];

      // 🦴 Special handling for carrion vs regular food
      let feedingPower = 0.8; // High feeding efficiency

      // Scavengers (high meat preference) are better at eating carrion
      if (nearestFood.type === EntityType.Carrion) {
        feedingPower = this.genetics.meatPreference * 0.9; // Meat lovers = better scavengers
        if (this.stats.feedingAttempts % 30 === 0) {
          console.log(
            `🦴 ${this.id.substring(
              0,
              8
            )} attempting to scavenge carrion (power: ${feedingPower.toFixed(
              2
            )})`
          );
        }
      }

      // 🔥 FIX: Process feeding and check if it was successful
      const feedingResult = environment.processFeeding(
        this,
        nearestFood,
        feedingPower
      );

      // If feeding failed (food already consumed), stop trying immediately
      if (!feedingResult.success) {
        // Food might have been consumed by another creature - stop trying this tick
        return;
      }
    }
  }

  /**
   * Attempt to attack nearby creatures - real predator-prey combat!
   */
  private attemptAttack(environment?: Environment): void {
    if (!environment) return;

    // Query for nearby creatures
    const query: SpatialQuery = {
      position: this.physics.position,
      radius: this.physics.collisionRadius + 30, // Attack range
      maxResults: 1,
      sortByDistance: true,
      excludeCreature: this, // Don't attack self
    };

    const results = environment.queryNearbyEntities(query);

    if (results.creatures.length > 0) {
      const target = results.creatures[0];
      const attackPower = this.genetics.aggression; // Use aggression trait as attack power

      // Process combat through environment
      environment.processCombat(this, target, attackPower);
    }
  }

  /**
   * Attempt reproduction with nearby mate - real genetic crossover!
   */
  private attemptReproduction(environment?: Environment): void {
    if (!environment) return;

    // 🔥 FIX: Add debugging for reproduction issues
    if (!this.canReproduce()) {
      // Log why reproduction failed every 60 ticks to avoid spam
      if (this.stats.reproductionAttempts % 60 === 0) {
        const reasons = [];
        if (!this.isMateable) reasons.push("not mateable");
        if (this.reproductionCooldown > 0)
          reasons.push(`cooldown: ${this.reproductionCooldown}`);
        if (this.physics.energy <= 50)
          reasons.push(`low energy: ${this.physics.energy.toFixed(1)}`);
        console.log(
          `🚫 ${this.id.substring(0, 8)} can't reproduce: ${reasons.join(", ")}`
        );
      }
      this.stats.reproductionAttempts++;
      return;
    }

    // Query for nearby potential mates
    const query: SpatialQuery = {
      position: this.physics.position,
      radius: this.physics.collisionRadius + 60, // Mating range
      maxResults: 5, // Check multiple potential mates
      sortByDistance: true,
      excludeCreature: this,
    };

    const results = environment.queryNearbyEntities(query);

    if (results.creatures.length === 0) {
      // No nearby creatures - log occasionally
      if (this.stats.reproductionAttempts % 60 === 0) {
        console.log(`💔 ${this.id.substring(0, 8)} found no nearby mates`);
      }
      this.stats.reproductionAttempts++;
      return;
    }

    for (const potentialMate of results.creatures) {
      // 🔍 DETAILED MATE ANALYSIS
      const sameSpecies = this.isSameSpecies(potentialMate);
      const mateCanReproduce = potentialMate.canReproduce();
      const mateIsMature =
        potentialMate.physics.age >= potentialMate.genetics.maturityAge;

      // Log detailed mate checking (every 60 ticks to avoid spam)
      if (this.stats.reproductionAttempts % 60 === 0) {
        const distance = this.calculateDistance(
          this.physics.position,
          potentialMate.physics.position
        );
        console.log(
          `💕 ${this.id.substring(
            0,
            8
          )} evaluating mate ${potentialMate.id.substring(0, 8)}:` +
            ` distance=${distance.toFixed(
              1
            )} same_species=${sameSpecies} mate_can_reproduce=${mateCanReproduce} ` +
            `mate_mature=${mateIsMature} mate_energy=${potentialMate.physics.energy.toFixed(
              1
            )} ` +
            `mate_cooldown=${potentialMate.reproductionCooldown}`
        );
      }

      // Check if suitable mate (same species, mature, has energy)
      if (sameSpecies && mateCanReproduce && mateIsMature) {
        // 🎉 SUCCESS! Create offspring at nearby location
        const offspring = Creature.createOffspring(this, potentialMate);

        // Add offspring to environment
        environment.addCreature(offspring);

        // Apply reproduction costs
        const reproductionCost = this.genetics.reproductionCost;
        this.physics.energy = Math.max(
          0,
          this.physics.energy - reproductionCost
        );
        potentialMate.physics.energy = Math.max(
          0,
          potentialMate.physics.energy - reproductionCost
        );

        // Set reproduction cooldown
        this.reproductionCooldown = 100; // Ticks before can reproduce again
        potentialMate.reproductionCooldown = 100;

        // 🎉 SUCCESS LOG
        simulationLogger.logBirth([this.id, potentialMate.id], offspring.id);

        console.log(
          `🍼 BIRTH SUCCESS! ${this.id.substring(
            0,
            8
          )} + ${potentialMate.id.substring(0, 8)} → ${offspring.id.substring(
            0,
            8
          )} ` +
            `at (${offspring.physics.position.x.toFixed(
              0
            )}, ${offspring.physics.position.y.toFixed(0)})`
        );

        break; // Only reproduce with first suitable mate found
      }
    }

    this.stats.reproductionAttempts++;
  }

  /**
   * Check if creature can reproduce
   */
  public canReproduce(): boolean {
    return (
      this.isMateable &&
      this.reproductionCooldown === 0 &&
      this.physics.energy > 30 // REDUCED from 50 to 30 for easier reproduction
    );
  }

  /**
   * Get HSL color representation of genetics
   */
  public getHSLColor(): HSLColor {
    // Hue: Diet preference (0° = plant/green, 180° = meat/red)
    const hue = this.genetics.meatPreference * 180;

    // Saturation: Aggression level (30-100%)
    const saturation = 30 + this.genetics.aggression * 70;

    // Lightness: Size (20-80%)
    const lightness = 20 + this.genetics.size * 60;

    return {
      hue,
      saturation,
      lightness,
      alpha: 1.0,
    };
  }

  /**
   * Get creature description for debugging
   */
  public describe(): string {
    return (
      `Creature(id=${this.id.substring(0, 8)}, gen=${this.generation}, ` +
      `age=${this.physics.age}, energy=${this.physics.energy.toFixed(1)}, ` +
      `pos=[${this.physics.position.x.toFixed(
        1
      )}, ${this.physics.position.y.toFixed(1)}])`
    );
  }

  /**
   * Initialize physics state
   */
  private initializePhysics(position?: Vector2): CreaturePhysics {
    // Random spawn position if none provided (50px margin from edges)
    const defaultPosition = position || {
      x: 50 + Math.random() * 900, // Random X: 50-950 in 1000px world
      y: 50 + Math.random() * 900, // Random Y: 50-950 in 1000px world
    };

    return {
      position: defaultPosition,
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2, // Random initial direction
      energy: 100, // Start with full energy
      health: 100, // Start with full health
      age: 0, // Born at age 0
      maxSpeed: this.genetics.speed * 3, // Max pixels per tick
      collisionRadius: this.genetics.size * 10, // Size in pixels
    };
  }

  /**
   * Initialize statistics tracking
   */
  private initializeStats(): CreatureStats {
    return {
      energy: this.physics.energy,
      health: this.physics.health,
      age: this.physics.age,
      generation: this.generation,
      ticksAlive: 0,
      foodEaten: 0,
      distanceTraveled: 0,
      attacksReceived: 0,
      attacksGiven: 0,
      reproductionAttempts: 0,
      offspring: 0,
      fitness: 0,
      thoughtHistory: [],
      feedingAttempts: 0,
    };
  }

  /**
   * Update fitness score and other stats
   */
  private updateStats(): void {
    // Sync current physics state to stats
    this.stats.energy = this.physics.energy;
    this.stats.health = this.physics.health;
    this.stats.age = this.physics.age;

    // ticksAlive is updated in updateInternalState()
    // foodEaten is updated in attemptEating()
    // distanceTraveled is updated in updatePhysics()
    // attacksReceived is updated when taking damage (TODO: implement)
    // attacksGiven is updated in attemptAttack()
    // reproductionAttempts is updated in attemptReproduction()
    // offspring is updated in createOffspring()

    // Calculate comprehensive fitness score
    const survivalFitness = this.stats.ticksAlive; // Reward survival time
    const reproductionFitness = this.stats.offspring * 100; // Reward reproduction success
    const efficiencyFitness = this.stats.distanceTraveled * 0.1; // Reward exploration
    const feedingFitness = this.stats.foodEaten * 5; // Reward successful feeding

    this.stats.fitness =
      survivalFitness +
      reproductionFitness +
      efficiencyFitness +
      feedingFitness;
  }

  /**
   * Generate unique creature ID
   */
  private generateId(): string {
    return "creature_" + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Create offspring creature through sexual reproduction
   */
  public static createOffspring(
    parent1: Creature,
    parent2: Creature,
    position?: Vector2
  ): Creature {
    // Create child genetics through crossover
    const childGenetics = GeneticsHelper.crossover(
      parent1.genetics,
      parent2.genetics
    );

    // Apply mutation
    GeneticsHelper.mutate(childGenetics);

    // Calculate spawn position near parents if not specified
    const childPosition =
      position || this.calculateOffspringPosition(parent1, parent2);

    // Create child with bootstrap brain appropriate for its generation
    const childGeneration =
      Math.max(parent1.generation, parent2.generation) + 1;
    const child = new Creature(
      childGeneration,
      childGenetics,
      [parent1, parent2],
      childPosition
    );

    // Update parent statistics
    parent1.stats.offspring++;
    parent2.stats.offspring++;

    return child;
  }

  /**
   * Calculate spawn position for offspring near parents
   */
  private static calculateOffspringPosition(
    parent1: Creature,
    parent2: Creature
  ): Vector2 {
    // Find midpoint between parents
    const midX = (parent1.physics.position.x + parent2.physics.position.x) / 2;
    const midY = (parent1.physics.position.y + parent2.physics.position.y) / 2;

    // Add small random offset (within 30 pixels of midpoint)
    const offsetRange = 30;
    const offsetX = (Math.random() - 0.5) * offsetRange;
    const offsetY = (Math.random() - 0.5) * offsetRange;

    // Calculate final position
    let childX = midX + offsetX;
    let childY = midY + offsetY;

    // Clamp to world boundaries (50px margin from edges)
    childX = Math.max(50, Math.min(950, childX));
    childY = Math.max(50, Math.min(950, childY));

    return { x: childX, y: childY };
  }

  /**
   * Check if this creature is the same species as another
   * 🔧 FIXED: More reasonable threshold + generation compatibility
   */
  public isSameSpecies(other: Creature): boolean {
    // ⭐ NEW: Generation 0 creatures (bootstrap) are always compatible
    // This ensures the initial population can reproduce
    if (this.generation === 0 && other.generation === 0) {
      return true; // Bootstrap creatures are all "founder species"
    }

    // ⭐ NEW: Creatures within 2 generations are always compatible
    // This allows evolution chains to continue
    const generationDiff = Math.abs(this.generation - other.generation);
    if (generationDiff <= 2) {
      return true; // Close generation = compatible
    }

    // For distant generations, use genetic distance with REALISTIC threshold
    const distance = GeneticsHelper.calculateGeneticDistance(
      this.genetics,
      other.genetics
    );

    // 🔧 UPDATED: Increased threshold from 0.8 to 1.2 based on test data
    // Test showed average random distance is ~1.0, so 1.2 allows ~40% compatibility
    return distance < 1.2; // Realistic threshold for natural speciation
  }

  /**
   * Serialize creature for save/load
   */
  public toJSON(): CreatureJSON {
    return {
      id: this.id,
      generation: this.generation,
      genetics: this.genetics,
      physics: this.physics,
      stats: this.stats,
      brain: this.brain.toJSON(),
    };
  }

  /**
   * Create creature from serialized data
   */
  public static fromJSON(data: CreatureJSON): Creature {
    const creature = new Creature(data.generation, data.genetics);
    creature.physics = data.physics;
    creature.stats = data.stats;
    // Brain would need to be reconstructed
    return creature;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Apply boundary wrapping to keep creatures in world bounds
   * Creatures bounce off boundaries naturally instead of disappearing
   */
  private applyBoundaryWrapping(environment?: Environment): void {
    if (!environment || !environment.bounds) {
      // Fallback to basic rectangular bounds if no environment
      this.physics.position.x = Math.max(
        10,
        Math.min(990, this.physics.position.x)
      );
      this.physics.position.y = Math.max(
        10,
        Math.min(990, this.physics.position.y)
      );
      return;
    }

    // Get world bounds from environment
    const bounds = environment.bounds;
    const worldWidth = bounds.width || 1000;
    const worldHeight = bounds.height || 1000;
    const centerX = bounds.centerX ?? worldWidth / 2;
    const centerY = bounds.centerY ?? worldHeight / 2;

    // Handle circular bounds (preferred for simulation)
    if (bounds.shape === "circular" && bounds.radius) {
      const maxRadius = bounds.radius;
      const dx = this.physics.position.x - centerX;
      const dy = this.physics.position.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If creature is outside the circular boundary, push it back inside
      if (distance > maxRadius - 10) {
        // 10px safety margin
        // Calculate the direction from center to creature
        const angle = Math.atan2(dy, dx);

        // Place creature just inside the boundary
        const safeRadius = maxRadius - 20; // More buffer space to prevent re-bouncing
        this.physics.position.x = centerX + Math.cos(angle) * safeRadius;
        this.physics.position.y = centerY + Math.sin(angle) * safeRadius;

        // 🔄 IMPROVED BOUNDARY HANDLING: Add randomness to prevent loops
        const randomAngle = (Math.random() - 0.5) * Math.PI * 0.5; // ±45° randomness
        const newDirection = angle + Math.PI + randomAngle; // Turn around + randomness

        // Set new velocity in random direction away from boundary
        const speed = Math.sqrt(
          this.physics.velocity.x ** 2 + this.physics.velocity.y ** 2
        );
        this.physics.velocity.x = Math.cos(newDirection) * speed * 0.8; // 80% speed retention
        this.physics.velocity.y = Math.sin(newDirection) * speed * 0.8;

        // Update rotation to match new direction
        this.physics.rotation = newDirection;
      }
    } else {
      // Handle rectangular bounds as fallback
      const margin = 10;
      const leftBound = margin;
      const rightBound = worldWidth - margin;
      const topBound = margin;
      const bottomBound = worldHeight - margin;

      // Clamp position to bounds with anti-loop measures
      if (this.physics.position.x < leftBound) {
        this.physics.position.x = leftBound + 5; // Small buffer
        // Add randomness to prevent straight-line bouncing
        const randomY = (Math.random() - 0.5) * 2; // Random Y component
        this.physics.velocity.x = Math.abs(this.physics.velocity.x) * 0.6; // Bounce right (reduced)
        this.physics.velocity.y += randomY; // Add random Y movement
      } else if (this.physics.position.x > rightBound) {
        this.physics.position.x = rightBound - 5; // Small buffer
        const randomY = (Math.random() - 0.5) * 2; // Random Y component
        this.physics.velocity.x = -Math.abs(this.physics.velocity.x) * 0.6; // Bounce left (reduced)
        this.physics.velocity.y += randomY; // Add random Y movement
      }

      if (this.physics.position.y < topBound) {
        this.physics.position.y = topBound + 5; // Small buffer
        const randomX = (Math.random() - 0.5) * 2; // Random X component
        this.physics.velocity.y = Math.abs(this.physics.velocity.y) * 0.6; // Bounce down (reduced)
        this.physics.velocity.x += randomX; // Add random X movement
      } else if (this.physics.position.y > bottomBound) {
        this.physics.position.y = bottomBound - 5; // Small buffer
        const randomX = (Math.random() - 0.5) * 2; // Random X component
        this.physics.velocity.y = -Math.abs(this.physics.velocity.y) * 0.6; // Bounce up (reduced)
        this.physics.velocity.x += randomX; // Add random X movement
      }
    }
  }

  /**
   * Cast a vision ray in a direction to detect obstacles
   * Returns 0.0-1.0 where 0=obstacle very close, 1=clear vision
   */
  private castVisionRay(
    environment: Environment,
    angleOffset: number,
    maxDistance: number
  ): number {
    // Calculate ray direction from current rotation + offset
    const rayAngle = this.physics.rotation + angleOffset;
    const rayDirection = {
      x: Math.cos(rayAngle),
      y: Math.sin(rayAngle),
    };

    // Sample points along the ray
    const sampleCount = 10; // Number of points to check along ray
    for (let i = 1; i <= sampleCount; i++) {
      const distance = (i / sampleCount) * maxDistance;
      const samplePoint = {
        x: this.physics.position.x + rayDirection.x * distance,
        y: this.physics.position.y + rayDirection.y * distance,
      };

      // Query for obstacles at this point
      const query: SpatialQuery = {
        position: samplePoint,
        radius: 20, // Small radius for obstacle detection
        entityTypes: [EntityType.Obstacle], // Only check for obstacles
        maxResults: 1,
      };

      const results = environment.queryNearbyEntities(query);

      // If we hit an obstacle, return normalized distance
      if (results.environmental.length > 0) {
        return distance / maxDistance; // 0.0-1.0 normalized
      }
    }

    // Clear vision - no obstacles detected
    return 1.0;
  }
}
