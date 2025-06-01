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
  Environment,
  CreatureJSON,
} from "./creatureTypes";

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
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private sense(_environment?: Environment): number[] {
    // TODO: Implement environmental sensing
    // For now, return normalized dummy data
    const sensors: CreatureSensors = {
      // Environmental awareness
      foodDistance: Math.random(),
      foodType: Math.random(),
      predatorDistance: Math.random(),
      preyDistance: Math.random(),
      energyLevel: this.physics.energy / 100, // Normalize to 0-1
      healthLevel: this.physics.health / 100, // Normalize to 0-1
      ageLevel: Math.min(this.physics.age / 1000, 1), // Normalize to 0-1
      populationDensity: Math.random(),

      // Vision rays (will implement with actual ray casting)
      visionForward: Math.random(),
      visionLeft: Math.random(),
      visionRight: Math.random(),
      visionBack: Math.random(),
    };

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private attemptEating(_environment?: Environment): void {
    // TODO: Implement when environment is ready
    // Placeholder: small energy gain from random feeding
    this.physics.energy = Math.min(100, this.physics.energy + 1);
    this.stats.foodEaten++;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private attemptAttack(_environment?: Environment): void {
    // TODO: Implement when environment is ready
    // Placeholder: track attack attempts
    this.stats.attacksGiven++;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private attemptReproduction(_environment?: Environment): void {
    // TODO: Implement when environment is ready
    // Placeholder: track reproduction attempts
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
}
