/**
 * Environment Module - Ecosystem Management System
 *
 * Exports all environment-related classes, types, and utilities
 */

// Core environment system
export { Environment } from "./environment";

// Type definitions
export type {
  // Biome system
  BiomeCharacteristics,
  Biome,

  // Entity system
  Entity,
  FoodEntity,
  EnvironmentalEntity,
  EnvironmentalEffect,

  // Spatial systems
  SpatialCell,
  SpatialGrid,
  SpatialQuery,
  EntityQuery,

  // Environment management
  WorldBounds,
  EnvironmentStats,
  EnvironmentConfig,

  // Interactions
  CombatInteraction,
  FeedingInteraction,
} from "./environmentTypes";

// Enums and constants
export { BiomeType, EntityType, PRESET_BIOMES } from "./environmentTypes";
