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
} from "./creatureTypes";
import { Environment } from "../environment/environment";
import { SpatialQuery, EntityType } from "../environment/environmentTypes";

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
  public update(environment?: Environment): void {
    if (this.state !== CreatureState.Alive) return;

    // 1. Sense environment (12 sensors)
    const sensorData = this.sense(environment);

    // 2. Think with AI brain
    const decisions = this.think(sensorData);

    // 3. Act on decisions
    this.act(decisions, environment);

    // 4. Update physics and internal state
    this.updatePhysics();
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
      // Fallback to dummy data if no environment
      return Array(12).fill(0.5);
    }

    // Query nearby entities using spatial grid
    const searchRadius = this.genetics.visionRange * 100; // Convert genetic trait to pixels
    const spatialQuery: SpatialQuery = {
      position: this.physics.position,
      radius: searchRadius,
      sortByDistance: true,
      excludeCreature: this,
    };
    const nearbyEntities = environment.queryNearbyEntities(spatialQuery);

    // Initialize sensors
    const sensors: CreatureSensors = {
      // Internal state sensors (always available)
      energyLevel: this.physics.energy / 100, // Normalize to 0-1
      healthLevel: this.physics.health / 100, // Normalize to 0-1
      ageLevel: Math.min(this.physics.age / this.genetics.lifespan, 1), // Normalize by lifespan

      // Environmental sensors (require queries)
      foodDistance: 1.0, // Default: no food detected
      foodType: 0.5, // Default: neutral
      predatorDistance: 1.0, // Default: no threats
      preyDistance: 1.0, // Default: no prey
      populationDensity: 0.0, // Will calculate from nearby creatures

      // Vision rays (spatial awareness in 4 directions)
      visionForward: 1.0, // Default: clear vision
      visionLeft: 1.0,
      visionRight: 1.0,
      visionBack: 1.0,
    };

    // Analyze nearby food
    let closestFoodDistance = Infinity;
    let closestFoodType = 0.5; // Default neutral
    for (const entity of nearbyEntities.food) {
      const distance = this.calculateDistance(
        this.physics.position,
        entity.position
      );
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

    // Convert food distance to 0-1 sensor value (0=very close, 1=far/none)
    if (closestFoodDistance < Infinity) {
      sensors.foodDistance = Math.min(closestFoodDistance / searchRadius, 1.0);
      sensors.foodType = closestFoodType;
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

    // Convert to array for neural network
    return [
      sensors.foodDistance,
      sensors.foodType,
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

    // Attempt eating if strong signal
    if (actions.eat > 0.5) {
      this.attemptEating(environment);
    }

    // Attempt attack/defense if needed
    if (actions.attack > 0.7) {
      this.attemptAttack(environment);
    }

    // Attempt reproduction if conditions met
    if (actions.reproduce > 0.6 && this.canReproduce()) {
      this.attemptReproduction(environment);
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

    // Energy cost for movement (bigger creatures cost more)
    const movementCost =
      (Math.abs(moveX) + Math.abs(moveY)) * this.genetics.size * 0.1;
    this.physics.energy = Math.max(0, this.physics.energy - movementCost);

    // Update rotation for vision rays
    if (moveX !== 0 || moveY !== 0) {
      this.physics.rotation = Math.atan2(moveY, moveX);
    }
  }

  /**
   * Update physics state
   */
  private updatePhysics(): void {
    // Apply velocity to position
    this.physics.position.x += this.physics.velocity.x;
    this.physics.position.y += this.physics.velocity.y;

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

    // Natural energy decay based on efficiency
    const decayRate = (2 - this.genetics.efficiency) * 0.1;
    this.physics.energy = Math.max(0, this.physics.energy - decayRate);

    // Update maturity status
    this.isMateable = this.physics.age > this.genetics.maturityAge;

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
   * Placeholder action methods (to be implemented with environment)
   */
  /**
   * Attempt to feed on nearby food - now with real environment interaction!
   */
  private attemptEating(environment?: Environment): void {
    if (!environment) return;

    // Query for nearby food
    const query: SpatialQuery = {
      position: this.physics.position,
      radius: this.physics.collisionRadius + 50, // Search radius based on size
      entityTypes: [
        EntityType.PlantFood,
        EntityType.SmallPrey,
        EntityType.MushroomFood,
      ],
      maxResults: 1,
      sortByDistance: true,
    };

    const results = environment.queryNearbyEntities(query);

    if (results.food.length > 0) {
      const nearestFood = results.food[0];
      const feedingPower = 0.8; // High feeding efficiency

      // Process feeding through environment
      environment.processFeeding(this, nearestFood, feedingPower);
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

    // Query for nearby potential mates
    const query: SpatialQuery = {
      position: this.physics.position,
      radius: this.physics.collisionRadius + 60, // Mating range
      maxResults: 5, // Check multiple potential mates
      sortByDistance: true,
      excludeCreature: this,
    };

    const results = environment.queryNearbyEntities(query);

    for (const potentialMate of results.creatures) {
      // Check if suitable mate (same species, mature, has energy)
      if (
        this.isSameSpecies(potentialMate) &&
        potentialMate.canReproduce() &&
        potentialMate.physics.age >= potentialMate.genetics.maturityAge
      ) {
        // Create offspring at nearby location
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

        break; // Only reproduce with first suitable mate found
      }
    }

    this.stats.reproductionAttempts++;
  }

  /**
   * Check if creature can reproduce
   */
  private canReproduce(): boolean {
    return (
      this.isMateable &&
      this.reproductionCooldown === 0 &&
      this.physics.energy > 50
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
   */
  public isSameSpecies(other: Creature): boolean {
    const distance = GeneticsHelper.calculateGeneticDistance(
      this.genetics,
      other.genetics
    );
    return distance < 0.3; // Species threshold
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
