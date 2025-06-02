/**
 * Biome Presets - Predefined Environment Types
 *
 * Six distinct biomes that create different evolutionary pressures
 */

import { Biome, BiomeType, BiomeCharacteristics } from "./environmentTypes";

/**
 * Grassland Biome - Default balanced environment
 */
export const GRASSLAND_BIOME: Biome = {
  type: BiomeType.Grassland,
  name: "Grassland",
  characteristics: {
    temperature: 0.6, // Moderate temperature
    humidity: 0.5, // Moderate humidity
    waterAvailability: 0.7, // Good water access

    plantDensity: 0.8, // Abundant plant food
    preyDensity: 0.4, // Moderate prey availability
    shelterAvailability: 0.3, // Some shelter

    predationPressure: 0.3, // Low danger
    competitionLevel: 0.5, // Moderate competition
    seasonalVariation: 0.2, // Stable environment
  },
  color: "#4ade80", // Green
  description:
    "Balanced environment with abundant plant food and moderate conditions",
};

/**
 * Desert Biome - Harsh, resource-scarce environment
 */
export const DESERT_BIOME: Biome = {
  type: BiomeType.Desert,
  name: "Desert",
  characteristics: {
    temperature: 0.9, // Hot
    humidity: 0.1, // Very dry
    waterAvailability: 0.2, // Water scarce

    plantDensity: 0.2, // Very little plant food
    preyDensity: 0.3, // Low prey availability
    shelterAvailability: 0.6, // Caves and rocks for shelter

    predationPressure: 0.6, // High danger
    competitionLevel: 0.8, // Intense competition for resources
    seasonalVariation: 0.7, // Extreme temperature swings
  },
  color: "#fbbf24", // Yellow/orange
  description: "Harsh environment favoring efficiency and heat tolerance",
};

/**
 * Forest Biome - Dense, complex environment
 */
export const FOREST_BIOME: Biome = {
  type: BiomeType.Forest,
  name: "Forest",
  characteristics: {
    temperature: 0.5, // Cool
    humidity: 0.8, // Humid
    waterAvailability: 0.9, // Abundant water

    plantDensity: 0.6, // Good plant food
    preyDensity: 0.7, // High prey availability
    shelterAvailability: 0.9, // Excellent shelter

    predationPressure: 0.8, // High predation
    competitionLevel: 0.6, // Moderate competition
    seasonalVariation: 0.4, // Some seasonal change
  },
  color: "#059669", // Dark green
  description: "Dense environment favoring stealth and complex behaviors",
};

/**
 * Wetland Biome - Rich but unstable environment
 */
export const WETLAND_BIOME: Biome = {
  type: BiomeType.Wetland,
  name: "Wetland",
  characteristics: {
    temperature: 0.6, // Moderate
    humidity: 0.9, // Very humid
    waterAvailability: 1.0, // Maximum water

    plantDensity: 0.9, // Very abundant plant food
    preyDensity: 0.8, // High prey availability
    shelterAvailability: 0.4, // Limited shelter

    predationPressure: 0.4, // Moderate danger
    competitionLevel: 0.3, // Low competition (abundant resources)
    seasonalVariation: 0.8, // Highly seasonal (flooding/drying)
  },
  color: "#06b6d4", // Cyan
  description: "Resource-rich but unstable environment with seasonal flooding",
};

/**
 * Mountain Biome - High-altitude challenging environment
 */
export const MOUNTAIN_BIOME: Biome = {
  type: BiomeType.Mountain,
  name: "Mountain",
  characteristics: {
    temperature: 0.2, // Cold
    humidity: 0.4, // Moderate humidity
    waterAvailability: 0.6, // Snow melt available

    plantDensity: 0.3, // Limited plant food
    preyDensity: 0.5, // Moderate prey
    shelterAvailability: 0.8, // Good rocky shelter

    predationPressure: 0.5, // Moderate danger
    competitionLevel: 0.7, // High competition for limited resources
    seasonalVariation: 0.9, // Extreme seasonal variation
  },
  color: "#6b7280", // Gray
  description:
    "High-altitude environment favoring cold tolerance and efficiency",
};

/**
 * Ocean Biome - Aquatic environment (future expansion)
 */
export const OCEAN_BIOME: Biome = {
  type: BiomeType.Ocean,
  name: "Ocean",
  characteristics: {
    temperature: 0.4, // Cool
    humidity: 1.0, // Maximum (aquatic)
    waterAvailability: 1.0, // Unlimited water

    plantDensity: 0.5, // Seaweed/algae
    preyDensity: 0.9, // High prey diversity
    shelterAvailability: 0.2, // Limited shelter in open water

    predationPressure: 0.9, // Very high predation
    competitionLevel: 0.4, // Moderate competition (3D space)
    seasonalVariation: 0.3, // Stable temperatures
  },
  color: "#1e40af", // Blue
  description:
    "Aquatic environment with high prey availability but intense predation",
};

/**
 * All available biome presets
 */
export const BiomePresets = {
  grassland: GRASSLAND_BIOME,
  desert: DESERT_BIOME,
  forest: FOREST_BIOME,
  wetland: WETLAND_BIOME,
  mountain: MOUNTAIN_BIOME,
  ocean: OCEAN_BIOME,
} as const;

/**
 * Get biome by name
 */
export function getBiome(name: keyof typeof BiomePresets): Biome {
  return BiomePresets[name];
}

/**
 * Get all biome names
 */
export function getBiomeNames(): (keyof typeof BiomePresets)[] {
  return Object.keys(BiomePresets) as (keyof typeof BiomePresets)[];
}

/**
 * Get random biome
 */
export function getRandomBiome(): Biome {
  const names = getBiomeNames();
  const randomName = names[Math.floor(Math.random() * names.length)];
  return BiomePresets[randomName];
}
