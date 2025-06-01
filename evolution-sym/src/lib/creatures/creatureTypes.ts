/**
 * Core creature type definitions and genetic system
 * This file defines the DNA of our digital creatures!
 */

import { NetworkData } from "../neural/network";

/**
 * The genetic blueprint of a creature - their "DNA"
 * These traits determine everything about how a creature looks and behaves
 */
export interface CreatureGenetics {
  // Physical characteristics
  size: number; // 0.5-2.0: How big the creature is (affects health, energy storage, speed)
  speed: number; // 0.3-1.5: Movement speed multiplier
  efficiency: number; // 0.5-1.5: How efficiently they use energy (lower = better)

  // Behavioral predispositions (influence neural network inputs)
  aggression: number; // 0.0-1.0: Tendency to attack others vs flee
  sociability: number; // 0.0-1.0: Tendency to group with others vs be solitary
  curiosity: number; // 0.0-1.0: Exploration vs exploitation balance

  // Sensory capabilities (affect what they can detect)
  visionRange: number; // 0.5-2.0: How far they can see objects
  visionAcuity: number; // 0.5-1.5: How well they can distinguish different objects

  // Dietary preferences (evolved, not hardcoded!)
  plantPreference: number; // 0.0-1.0: Attraction to plant-based food
  meatPreference: number; // 0.0-1.0: Attraction to meat/other creatures

  // Life cycle parameters
  maturityAge: number; // 50-200: Age when can reproduce (in simulation ticks)
  lifespan: number; // 500-2000: Maximum age before death
  reproductionCost: number; // 20-60: Energy cost to create offspring

  // Parental care strategy (r-strategy vs K-strategy trade-off)
  parentalCare: number; // 0.0-1.0: Investment in fewer, higher-quality offspring
}

/**
 * Current creature statistics (change during lifetime)
 */
export interface CreatureStats {
  energy: number; // 0-100: Current energy level
  health: number; // 0-100: Current health
  age: number; // 0-lifespan: Current age in ticks
  generation: number; // 0+: How many generations from original population
  ticksAlive: number;
  foodEaten: number;
  distanceTraveled: number;
  attacksReceived: number;
  attacksGiven: number;
  reproductionAttempts: number;
  offspring: number;
  fitness: number; // Calculated survival score
}

/**
 * What the creature senses about its environment
 */
export interface CreatureSensors {
  foodDistance: number; // 0.0-1.0: Distance to nearest food (0=very close, 1=far/none)
  foodType: number; // 0.0-1.0: Type of nearest food (0=plant, 1=meat)
  predatorDistance: number; // 0.0-1.0: Distance to nearest threat
  preyDistance: number; // 0.0-1.0: Distance to nearest prey creature
  energyLevel: number; // 0.0-1.0: Current energy (normalized)
  healthLevel: number; // 0.0-1.0: Current health (normalized)
  ageLevel: number; // 0.0-1.0: Age relative to lifespan
  populationDensity: number; // 0.0-1.0: How crowded local area is
}

/**
 * Actions the creature can take (neural network outputs)
 */
export interface CreatureActions {
  moveX: number; // -1.0 to 1.0: Horizontal movement direction
  moveY: number; // -1.0 to 1.0: Vertical movement direction
  eat: number; // 0.0-1.0: Attempt to consume nearby food
  attack: number; // 0.0-1.0: Attack nearby creatures
  reproduce: number; // 0.0-1.0: Attempt reproduction if possible
}

/**
 * Position and movement data
 */
export interface CreaturePosition {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number; // 0-2π: Current facing direction
}

/**
 * Species classification data
 */
export interface SpeciesInfo {
  id: string; // Unique species identifier
  name: string; // Generated name like "Swift Hunters"
  color: string; // HSL color for visual identification
  population: number; // Current population count
  averageFitness: number; // Mean fitness of all members
  dominantTraits: string[]; // Most prominent genetic characteristics
  generation: number; // Average generation of members
  trend: "growing" | "stable" | "declining" | "extinct";
  firstAppeared: number; // Simulation tick when species first emerged
}

/**
 * Utility class for genetic operations
 */
export class GeneticsHelper {
  /**
   * Generate random genetics for initial population
   */
  public static generateRandomGenetics(): CreatureGenetics {
    return {
      // Physical traits - start with moderate values
      size: 0.8 + Math.random() * 0.4, // 0.8-1.2
      speed: 0.8 + Math.random() * 0.4, // 0.8-1.2
      efficiency: 0.8 + Math.random() * 0.4, // 0.8-1.2

      // Behavioral traits - full range for diversity
      aggression: Math.random(), // 0.0-1.0
      sociability: Math.random(), // 0.0-1.0
      curiosity: Math.random(), // 0.0-1.0

      // Sensory traits - start moderate
      visionRange: 0.8 + Math.random() * 0.4, // 0.8-1.2
      visionAcuity: 0.8 + Math.random() * 0.4, // 0.8-1.2

      // Dietary preferences - start omnivorous
      plantPreference: 0.3 + Math.random() * 0.4, // 0.3-0.7
      meatPreference: 0.3 + Math.random() * 0.4, // 0.3-0.7

      // Life cycle - moderate values
      maturityAge: 80 + Math.random() * 40, // 80-120
      lifespan: 800 + Math.random() * 400, // 800-1200
      reproductionCost: 30 + Math.random() * 20, // 30-50

      // Parental care strategy - start with random approaches
      parentalCare: Math.random(), // 0.0-1.0
    };
  }

  /**
   * Create offspring genetics through crossover and mutation
   */
  public static crossover(
    parent1: CreatureGenetics,
    parent2: CreatureGenetics
  ): CreatureGenetics {
    const child: CreatureGenetics = {
      // Each trait randomly inherited from either parent
      size: Math.random() < 0.5 ? parent1.size : parent2.size,
      speed: Math.random() < 0.5 ? parent1.speed : parent2.speed,
      efficiency: Math.random() < 0.5 ? parent1.efficiency : parent2.efficiency,
      aggression: Math.random() < 0.5 ? parent1.aggression : parent2.aggression,
      sociability:
        Math.random() < 0.5 ? parent1.sociability : parent2.sociability,
      curiosity: Math.random() < 0.5 ? parent1.curiosity : parent2.curiosity,
      visionRange:
        Math.random() < 0.5 ? parent1.visionRange : parent2.visionRange,
      visionAcuity:
        Math.random() < 0.5 ? parent1.visionAcuity : parent2.visionAcuity,
      plantPreference:
        Math.random() < 0.5 ? parent1.plantPreference : parent2.plantPreference,
      meatPreference:
        Math.random() < 0.5 ? parent1.meatPreference : parent2.meatPreference,
      maturityAge:
        Math.random() < 0.5 ? parent1.maturityAge : parent2.maturityAge,
      lifespan: Math.random() < 0.5 ? parent1.lifespan : parent2.lifespan,
      reproductionCost:
        Math.random() < 0.5
          ? parent1.reproductionCost
          : parent2.reproductionCost,
      parentalCare:
        Math.random() < 0.5 ? parent1.parentalCare : parent2.parentalCare,
    };

    return child;
  }

  /**
   * Apply mutations to genetics
   */
  public static mutate(
    genetics: CreatureGenetics,
    mutationRate: number = 0.1,
    mutationStrength: number = 0.1
  ): void {
    // Each trait has a chance to mutate
    if (Math.random() < mutationRate) {
      genetics.size += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.speed += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.efficiency += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.aggression += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.sociability += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.curiosity += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.visionRange += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.visionAcuity += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.plantPreference += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.meatPreference += (Math.random() - 0.5) * mutationStrength;
    }
    if (Math.random() < mutationRate) {
      genetics.maturityAge += (Math.random() - 0.5) * mutationStrength * 20; // Larger range for age
    }
    if (Math.random() < mutationRate) {
      genetics.lifespan += (Math.random() - 0.5) * mutationStrength * 100; // Larger range for lifespan
    }
    if (Math.random() < mutationRate) {
      genetics.reproductionCost +=
        (Math.random() - 0.5) * mutationStrength * 10; // Larger range for energy
    }
    if (Math.random() < mutationRate) {
      genetics.parentalCare += (Math.random() - 0.5) * mutationStrength;
    }

    // Clamp all values to valid ranges
    this.clampGenetics(genetics);
  }

  /**
   * Ensure all genetic values stay within valid bounds
   */
  public static clampGenetics(genetics: CreatureGenetics): void {
    genetics.size = Math.max(0.5, Math.min(2.0, genetics.size));
    genetics.speed = Math.max(0.3, Math.min(1.5, genetics.speed));
    genetics.efficiency = Math.max(0.5, Math.min(1.5, genetics.efficiency));
    genetics.aggression = Math.max(0.0, Math.min(1.0, genetics.aggression));
    genetics.sociability = Math.max(0.0, Math.min(1.0, genetics.sociability));
    genetics.curiosity = Math.max(0.0, Math.min(1.0, genetics.curiosity));
    genetics.visionRange = Math.max(0.5, Math.min(2.0, genetics.visionRange));
    genetics.visionAcuity = Math.max(0.5, Math.min(1.5, genetics.visionAcuity));
    genetics.plantPreference = Math.max(
      0.0,
      Math.min(1.0, genetics.plantPreference)
    );
    genetics.meatPreference = Math.max(
      0.0,
      Math.min(1.0, genetics.meatPreference)
    );
    genetics.maturityAge = Math.max(50, Math.min(200, genetics.maturityAge));
    genetics.lifespan = Math.max(500, Math.min(2000, genetics.lifespan));
    genetics.reproductionCost = Math.max(
      20,
      Math.min(60, genetics.reproductionCost)
    );
    genetics.parentalCare = Math.max(0.0, Math.min(1.0, genetics.parentalCare));
  }

  /**
   * Calculate genetic distance between two creatures (for species classification)
   */
  public static calculateGeneticDistance(
    a: CreatureGenetics,
    b: CreatureGenetics
  ): number {
    return Math.sqrt(
      Math.pow(a.size - b.size, 2) +
        Math.pow(a.speed - b.speed, 2) +
        Math.pow(a.efficiency - b.efficiency, 2) +
        Math.pow(a.aggression - b.aggression, 2) +
        Math.pow(a.sociability - b.sociability, 2) +
        Math.pow(a.curiosity - b.curiosity, 2) +
        Math.pow(a.visionRange - b.visionRange, 2) +
        Math.pow(a.visionAcuity - b.visionAcuity, 2) +
        Math.pow(a.plantPreference - b.plantPreference, 2) +
        Math.pow(a.meatPreference - b.meatPreference, 2) +
        Math.pow((a.maturityAge - b.maturityAge) / 100, 2) + // Normalize age differences
        Math.pow((a.lifespan - b.lifespan) / 1000, 2) + // Normalize lifespan differences
        Math.pow((a.reproductionCost - b.reproductionCost) / 30, 2) + // Normalize cost differences
        Math.pow(a.parentalCare - b.parentalCare, 2) // Parental care strategy difference
    );
  }

  /**
   * Generate creature description based on genetics
   */
  public static describeGenetics(genetics: CreatureGenetics): string {
    const traits: string[] = [];

    // Size description
    if (genetics.size > 1.3) traits.push("Large");
    else if (genetics.size < 0.7) traits.push("Small");

    // Speed description
    if (genetics.speed > 1.2) traits.push("Fast");
    else if (genetics.speed < 0.6) traits.push("Slow");

    // Efficiency description
    if (genetics.efficiency > 1.2) traits.push("Inefficient");
    else if (genetics.efficiency < 0.8) traits.push("Efficient");

    // Behavioral descriptions
    if (genetics.aggression > 0.7) traits.push("Aggressive");
    else if (genetics.aggression < 0.3) traits.push("Peaceful");

    if (genetics.sociability > 0.7) traits.push("Social");
    else if (genetics.sociability < 0.3) traits.push("Solitary");

    if (genetics.curiosity > 0.7) traits.push("Curious");

    // Dietary descriptions
    if (genetics.plantPreference > 0.7 && genetics.meatPreference < 0.3)
      traits.push("Herbivore");
    else if (genetics.meatPreference > 0.7 && genetics.plantPreference < 0.3)
      traits.push("Carnivore");
    else if (genetics.plantPreference > 0.5 && genetics.meatPreference > 0.5)
      traits.push("Omnivore");

    // Parental care strategy descriptions
    if (genetics.parentalCare > 0.7) traits.push("Nurturing");
    else if (genetics.parentalCare < 0.3) traits.push("Prolific");

    return traits.length > 0 ? traits.join(", ") : "Balanced";
  }
}

/**
 * HSL Color system for species visualization
 */
export class CreatureColorSystem {
  /**
   * Generate HSL color based on creature genetics
   * Hue = Diet preference, Saturation = Aggression, Lightness = Size
   */
  public static getCreatureColor(genetics: CreatureGenetics): string {
    // Hue (0-360°): Diet preference
    // 120° = Pure green (herbivore), 60° = Yellow (omnivore), 0° = Red (carnivore)
    const plantWeight = genetics.plantPreference;
    const meatWeight = genetics.meatPreference;
    const totalWeight = plantWeight + meatWeight;

    let hue: number;
    if (totalWeight === 0) {
      hue = 180; // Blue for creatures that don't eat anything (shouldn't happen)
    } else {
      // Blend between green (120°) for plants and red (0°) for meat
      const plantRatio = plantWeight / totalWeight;
      const meatRatio = meatWeight / totalWeight;

      if (plantRatio > meatRatio) {
        // More herbivorous: green to yellow
        hue = 120 - meatRatio * 60; // 120° to 60°
      } else {
        // More carnivorous: yellow to red
        hue = 60 - meatRatio * 60; // 60° to 0°
      }
    }

    // Saturation (30-100%): Aggression level
    const saturation = 30 + genetics.aggression * 70;

    // Lightness (20-80%): Size (bigger = brighter)
    const lightness = 20 + ((genetics.size - 0.5) / 1.5) * 60;

    return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(
      lightness
    )}%)`;
  }

  /**
   * Get a descriptive name for the creature's color/appearance
   */
  public static getColorDescription(genetics: CreatureGenetics): string {
    const color = this.getCreatureColor(genetics);
    const hsl = this.parseHSL(color);

    let description = "";

    // Size descriptor
    if (genetics.size > 1.3) description += "Bright ";
    else if (genetics.size < 0.7) description += "Dark ";

    // Aggression descriptor
    if (genetics.aggression > 0.7) description += "Vivid ";
    else if (genetics.aggression < 0.3) description += "Pale ";

    // Color name based on hue
    if (hsl.h >= 100 && hsl.h <= 140) description += "Green";
    else if (hsl.h >= 40 && hsl.h < 100) description += "Yellow";
    else if (hsl.h >= 0 && hsl.h < 40) description += "Red";
    else if (hsl.h >= 300) description += "Purple";
    else description += "Blue";

    return description.trim();
  }

  private static parseHSL(hslString: string): {
    h: number;
    s: number;
    l: number;
  } {
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return { h: 0, s: 0, l: 0 };

    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3]),
    };
  }
}

/**
 * 2D Vector for positions and velocities
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Enhanced sensor system with 12 inputs for neural network
 * Based on environmental awareness + spatial vision rays
 */
export interface CreatureSensors {
  // Environmental awareness (8 sensors)
  foodDistance: number; // 0.0-1.0 (closest food)
  foodType: number; // 0=plant, 1=meat
  predatorDistance: number; // 0.0-1.0 (closest threat)
  preyDistance: number; // 0.0-1.0 (closest target)
  energyLevel: number; // 0.0-1.0 (internal state)
  healthLevel: number; // 0.0-1.0 (damage level)
  ageLevel: number; // 0.0-1.0 (maturity progress)
  populationDensity: number; // 0.0-1.0 (local crowding)

  // Spatial vision rays (4 sensors)
  visionForward: number; // 0.0-1.0 (obstacle distance ahead)
  visionLeft: number; // 0.0-1.0 (obstacle distance left)
  visionRight: number; // 0.0-1.0 (obstacle distance right)
  visionBack: number; // 0.0-1.0 (obstacle distance behind)
}

/**
 * Action outputs from neural network (5 actions)
 */
export interface CreatureActions {
  moveX: number; // -1.0 to +1.0 (horizontal movement)
  moveY: number; // -1.0 to +1.0 (vertical movement)
  eat: number; // 0.0-1.0 (eating attempt strength)
  attack: number; // 0.0-1.0 (attack/defend strength)
  reproduce: number; // 0.0-1.0 (reproduction attempt)
}

/**
 * Physical state of creature
 */
export interface CreaturePhysics {
  position: Vector2;
  velocity: Vector2;
  rotation: number; // Radians for vision ray directions
  energy: number; // 0-100 energy points
  health: number; // 0-100 health points
  age: number; // Ticks since birth
  maxSpeed: number; // From genetics.speed trait
  collisionRadius: number; // From genetics.size trait
}

/**
 * Creature life state
 */
export enum CreatureState {
  Alive = "alive",
  Dead = "dead",
  Reproducing = "reproducing",
}

/**
 * HSL color representation for species visualization
 */
export interface HSLColor {
  hue: number; // 0-360° (diet preference)
  saturation: number; // 0-100% (aggression level)
  lightness: number; // 0-100% (size)
  alpha: number; // 0-1 (transparency)
}

/**
 * Basic Environment interface (placeholder until full environment system)
 */
export interface Environment {
  // Food system
  food?: Array<{
    id: string;
    position: Vector2;
    type: "plant" | "meat";
    energy: number;
  }>;

  // Other creatures for interaction
  creatures?: Array<{
    id: string;
    position: Vector2;
    genetics: CreatureGenetics;
    state: CreatureState;
  }>;

  // World boundaries
  boundaries?: {
    width: number;
    height: number;
  };

  // Environmental conditions
  conditions?: {
    temperature: number;
    resourceAbundance: number;
    predationPressure: number;
  };
}

/**
 * JSON serialization types
 */
export interface CreatureJSON {
  id: string;
  generation: number;
  genetics: CreatureGenetics;
  physics: CreaturePhysics;
  stats: CreatureStats;
  brain: NetworkData;
}
