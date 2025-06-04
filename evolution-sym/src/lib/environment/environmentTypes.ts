/**
 * Environment Types - Extensible Ecosystem Foundation
 *
 * Designed for expansion from single grassland biome to complex multi-biome ecosystems
 */

import { Creature } from "../creatures/creature";
import { Vector2 } from "../creatures/creatureTypes";

// ============================================================================
// BIOME SYSTEM (Extensible for Multi-Biome Future)
// ============================================================================

/**
 * Environmental characteristics that affect creature behavior and evolution
 */
export interface BiomeCharacteristics {
  // Core environmental factors (0.0-1.0 normalized)
  temperature: number; // Affects metabolism speed
  humidity: number; // Affects hydration needs
  waterAvailability: number; // Affects survival requirements

  // Resource abundance
  plantDensity: number; // How much plant food spawns
  preyDensity: number; // How much moving prey available
  shelterAvailability: number; // Protection/hiding spots

  // Evolutionary pressures
  predationPressure: number; // Environmental danger level
  competitionLevel: number; // Resource scarcity pressure
  seasonalVariation: number; // Environmental stability
}

/**
 * Biome types - easily extensible
 */
export enum BiomeType {
  Grassland = "grassland",
  Desert = "desert",
  Forest = "forest",
  Wetland = "wetland",
  Mountain = "mountain",
  Ocean = "ocean",
}

/**
 * Biome definition combining type and characteristics
 */
export interface Biome {
  type: BiomeType;
  name: string;
  characteristics: BiomeCharacteristics;
  color: string; // Background color for visualization
  description: string;
}

// ============================================================================
// ENTITY SYSTEM (Food, Obstacles, Resources)
// ============================================================================

/**
 * Base entity interface - everything in the environment
 */
export interface Entity {
  id: string;
  position: Vector2;
  type: EntityType;
  isActive: boolean;
}

/**
 * Entity types in the environment
 */
export enum EntityType {
  // Food sources
  PlantFood = "plant_food",
  MushroomFood = "mushroom_food",
  SmallPrey = "small_prey",

  // Environmental features
  Obstacle = "obstacle",
  WaterSource = "water_source",
  Shelter = "shelter",

  // Special entities
  Creature = "creature",
  DeadCreature = "dead_creature",
  Carrion = "carrion", // NEW: Dead creature remains
}

/**
 * Food entity with energy value and behavior
 */
export interface FoodEntity extends Entity {
  type: EntityType.PlantFood | EntityType.MushroomFood | EntityType.SmallPrey;
  energy: number; // Energy gained when consumed
  size: number; // Collision radius

  // Movement (for prey)
  velocity?: Vector2; // Moving prey have velocity
  maxSpeed?: number; // Maximum movement speed

  // Spawning info
  spawnRate: number; // How frequently this food type spawns
  maxQuantity: number; // Maximum amount in environment
}

/**
 * Union type for all consumable entities (food + carrion)
 */
export type ConsumableEntity = FoodEntity | Carrion;

/**
 * Environmental feature entity
 */
export interface EnvironmentalEntity extends Entity {
  type: EntityType.Obstacle | EntityType.WaterSource | EntityType.Shelter;
  size: number; // Collision/interaction radius
  effect?: EnvironmentalEffect; // What happens when creatures interact
}

/**
 * Effects that environmental features have on creatures
 */
export interface EnvironmentalEffect {
  energyModifier?: number; // Energy gain/loss per tick
  healthModifier?: number; // Health gain/loss per tick
  speedModifier?: number; // Movement speed multiplier
  hidingBonus?: number; // Predator detection reduction
  reproductionBonus?: number; // Reproduction success boost
}

/**
 * Carrion - decaying creature remains that scavengers can eat
 */
export interface Carrion extends Entity {
  type: EntityType.Carrion;
  subtype: "fresh" | "aged" | "rotting";

  // Decay properties
  originalCreatureId: string; // Which creature died
  timeOfDeath: number; // When creature died (tick)
  currentDecayStage: number; // 0-1: Fresh to completely decayed
  maxDecayTime: number; // Ticks until completely gone

  // Energy properties
  originalEnergyValue: number; // Energy when creature died
  currentEnergyValue: number; // Decreases as it decays

  // Scavenger attraction
  scent: number; // 0-1: How detectable it is (decreases over time)

  // Visual properties
  size: number; // Based on original creature size
  decayVisual: {
    opacity: number; // Becomes more transparent
    color: string; // Changes from creature color to brown/gray
  };
}

// ============================================================================
// SPATIAL SYSTEMS (Efficient Collision Detection)
// ============================================================================

/**
 * Spatial grid cell for fast entity queries
 */
export interface SpatialCell {
  creatures: Creature[];
  food: ConsumableEntity[]; // Now includes both food and carrion!
  environmental: EnvironmentalEntity[];
}

/**
 * Spatial partitioning system for O(1) collision detection
 */
export interface SpatialGrid {
  cellSize: number; // Size of each grid cell
  width: number; // Grid width in cells
  height: number; // Grid height in cells
  cells: Map<string, SpatialCell>; // Keyed by "x,y" coordinates
}

/**
 * Query results for entity searches
 */
export interface EntityQuery {
  food: ConsumableEntity[]; // Now includes both food and carrion!
  creatures: Creature[];
  environmental: EnvironmentalEntity[];
  distance: number; // Distance to nearest entity
}

// ============================================================================
// ENVIRONMENT STATE & MANAGEMENT
// ============================================================================

/**
 * World boundaries and physics constraints
 */
export interface WorldBounds {
  width: number; // World width in pixels
  height: number; // World height in pixels
  shape: "rectangular" | "circular"; // World boundary shape
  centerX: number; // World center X
  centerY: number; // World center Y
  radius?: number; // For circular worlds
}

/**
 * Environment statistics for monitoring
 */
export interface EnvironmentStats {
  // Population tracking
  totalCreatures: number;
  livingCreatures: number;
  deadCreatures: number;

  // Resource tracking
  totalFood: number;
  plantFood: number;
  meatFood: number;
  preyFood: number;

  // System performance
  spatialQueries: number; // Queries this tick
  collisionChecks: number; // Collision calculations
  updateTimeMs: number; // Time to update environment
}

/**
 * Environment configuration for different scenarios
 */
export interface EnvironmentConfig {
  // World setup
  bounds: WorldBounds;
  biome: Biome;

  // Population limits
  maxCreatures: number;
  maxFood: number;

  // Spawning rates
  foodSpawnRate: number; // Food items per tick
  preySpawnRate: number; // Moving prey per tick

  // Performance settings
  spatialGridSize: number; // Grid cell size for spatial partitioning
  updateFrequency: number; // Ticks per environment update

  // 🎯 NEW: Carrying capacity system for population control
  carryingCapacity?: {
    targetPopulation: number; // Ideal stable population (default: 300)
    maxPopulation: number; // Hard limit before emergency measures (default: 400)
    densityStressFactor: number; // How much overcrowding affects energy (default: 0.001)
    mortalityRate: number; // Base chance of density-dependent death (default: 0.001)
    resourceScaling: number; // How population affects food spawning (default: 0.8)
  };
}

// ============================================================================
// ENVIRONMENT QUERIES & INTERACTIONS
// ============================================================================

/**
 * Query parameters for finding nearby entities
 */
export interface SpatialQuery {
  position: Vector2;
  radius: number;
  entityTypes?: EntityType[]; // Filter by entity types
  maxResults?: number; // Limit number of results
  sortByDistance?: boolean; // Sort results by distance
  excludeCreature?: Creature; // Exclude this creature from results (prevents self-detection)
}

/**
 * Combat interaction between creatures
 */
export interface CombatInteraction {
  attacker: Creature;
  defender: Creature;
  attackPower: number; // 0.0-1.0 attack strength
  distance: number; // Distance between creatures

  // Results
  success: boolean; // Whether attack succeeded
  damage: number; // Health damage dealt
  energyGain?: number; // Energy gained by attacker (if successful)
  energyLoss: number; // Energy lost by attacker (always)
}

/**
 * Feeding interaction between creature and food
 */
export interface FeedingInteraction {
  creature: Creature;
  food: ConsumableEntity; // Now supports both food and carrion!
  feedingPower: number; // 0.0-1.0 feeding strength

  // Results
  success: boolean; // Whether feeding succeeded
  energyGain: number; // Energy gained
  foodConsumed: boolean; // Whether food entity was fully consumed
}

// ============================================================================
// PRESET BIOMES (Easy Starting Configurations)
// ============================================================================

/**
 * Predefined biome configurations for easy setup
 */
export const PRESET_BIOMES: Record<BiomeType, Biome> = {
  [BiomeType.Grassland]: {
    type: BiomeType.Grassland,
    name: "Temperate Grassland",
    characteristics: {
      temperature: 0.6, // Moderate temperature
      humidity: 0.5, // Moderate humidity
      waterAvailability: 0.7, // Good water access
      plantDensity: 0.8, // Abundant plants
      preyDensity: 0.4, // Some small prey
      shelterAvailability: 0.3, // Limited shelter
      predationPressure: 0.3, // Low-medium predation
      competitionLevel: 0.4, // Moderate competition
      seasonalVariation: 0.2, // Stable environment
    },
    color: "#4a7c23", // Green grassland
    description: "Balanced ecosystem perfect for initial evolution experiments",
  },

  [BiomeType.Desert]: {
    type: BiomeType.Desert,
    name: "Arid Desert",
    characteristics: {
      temperature: 0.9, // Very hot
      humidity: 0.1, // Very dry
      waterAvailability: 0.2, // Scarce water
      plantDensity: 0.2, // Few plants
      preyDensity: 0.3, // Limited prey
      shelterAvailability: 0.8, // Lots of rocks/caves
      predationPressure: 0.7, // High predation
      competitionLevel: 0.8, // Intense competition
      seasonalVariation: 0.6, // Variable conditions
    },
    color: "#d4a574", // Sandy desert
    description: "Harsh environment driving extreme adaptations",
  },

  [BiomeType.Forest]: {
    type: BiomeType.Forest,
    name: "Dense Forest",
    characteristics: {
      temperature: 0.5, // Cool temperature
      humidity: 0.8, // High humidity
      waterAvailability: 0.9, // Abundant water
      plantDensity: 0.9, // Dense vegetation
      preyDensity: 0.7, // Abundant prey
      shelterAvailability: 0.9, // Lots of cover
      predationPressure: 0.5, // Medium predation
      competitionLevel: 0.6, // High competition for light
      seasonalVariation: 0.4, // Moderate seasonal change
    },
    color: "#1a4d1a", // Dark forest green
    description: "Complex environment with dense resources and hiding spots",
  },

  [BiomeType.Wetland]: {
    type: BiomeType.Wetland,
    name: "Wetland Marsh",
    characteristics: {
      temperature: 0.6, // Moderate temperature
      humidity: 1.0, // Maximum humidity
      waterAvailability: 1.0, // Water everywhere
      plantDensity: 0.6, // Moderate plants
      preyDensity: 0.8, // Rich prey diversity
      shelterAvailability: 0.7, // Reeds and vegetation
      predationPressure: 0.4, // Medium predation
      competitionLevel: 0.3, // Lower competition
      seasonalVariation: 0.8, // High seasonal variation
    },
    color: "#2d5a3d", // Marsh green
    description: "Water-rich environment with unique ecological pressures",
  },

  [BiomeType.Mountain]: {
    type: BiomeType.Mountain,
    name: "Alpine Mountain",
    characteristics: {
      temperature: 0.2, // Cold temperature
      humidity: 0.4, // Low humidity
      waterAvailability: 0.5, // Seasonal water
      plantDensity: 0.3, // Sparse vegetation
      preyDensity: 0.2, // Limited prey
      shelterAvailability: 0.8, // Rocky shelters
      predationPressure: 0.6, // High predation
      competitionLevel: 0.7, // Intense competition
      seasonalVariation: 0.9, // Extreme seasonal changes
    },
    color: "#8b7d6b", // Rocky mountain
    description: "Extreme environment testing survival limits",
  },

  [BiomeType.Ocean]: {
    type: BiomeType.Ocean,
    name: "Open Ocean",
    characteristics: {
      temperature: 0.4, // Cool water
      humidity: 1.0, // Water environment
      waterAvailability: 1.0, // Water everywhere
      plantDensity: 0.1, // Minimal plants
      preyDensity: 0.9, // Rich marine life
      shelterAvailability: 0.1, // Open water, no shelter
      predationPressure: 0.8, // High marine predation
      competitionLevel: 0.5, // Medium competition
      seasonalVariation: 0.3, // Stable marine environment
    },
    color: "#1e3a5f", // Deep ocean blue
    description: "Aquatic environment for marine evolution (future expansion)",
  },
};
