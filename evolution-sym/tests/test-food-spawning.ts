/**
 * Debug food spawning locations
 */

import { Environment } from "../src/lib/environment/environment";
import { BiomeType } from "../src/lib/environment/environmentTypes";

function testFoodSpawning() {
  console.log("🍃 FOOD SPAWNING DEBUG");
  console.log("======================");

  // Create environment
  const environment = new Environment({
    bounds: {
      width: 1000,
      height: 1000,
      shape: "circular",
      centerX: 500,
      centerY: 500,
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
    maxCreatures: 20,
    maxFood: 60,
    foodSpawnRate: 0.1,
    preySpawnRate: 0.05,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Spawn food
  for (let i = 0; i < 10; i++) {
    environment.update();
  }

  const stats = environment.getStats();
  console.log(`📊 Total food spawned: ${stats.totalFood}`);

  // Get all food entities
  const allFood = environment.queryNearbyEntities({
    position: { x: 500, y: 500 },
    radius: 2000, // Very large radius to get ALL food
    entityTypes: [0, 1, 2, 3, 4, 5], // Try all possible entity types
    maxResults: 100,
    sortByDistance: true,
  });

  console.log(`🔍 Food entities found by large query: ${allFood.food.length}`);

  // Show first few food locations
  if (allFood.food.length > 0) {
    console.log("📍 Food locations:");
    allFood.food.slice(0, 5).forEach((food, i) => {
      const distance = Math.sqrt(
        Math.pow(food.position.x - 500, 2) + Math.pow(food.position.y - 500, 2)
      );
      console.log(
        `   ${i + 1}. Type: ${food.type}, Position: (${food.position.x.toFixed(
          1
        )}, ${food.position.y.toFixed(
          1
        )}), Distance from center: ${distance.toFixed(1)}`
      );
    });
  }

  // Test creature position queries
  console.log("\n🦌 Testing creature position queries...");
  const testPosition = { x: 500, y: 500 };

  const smallQuery = environment.queryNearbyEntities({
    position: testPosition,
    radius: 100,
    entityTypes: [0, 1, 2], // Food types
    maxResults: 10,
    sortByDistance: true,
  });

  console.log(`🔍 Small radius (100): ${smallQuery.food.length} food found`);

  const mediumQuery = environment.queryNearbyEntities({
    position: testPosition,
    radius: 300,
    entityTypes: [0, 1, 2], // Food types
    maxResults: 10,
    sortByDistance: true,
  });

  console.log(`🔍 Medium radius (300): ${mediumQuery.food.length} food found`);

  // Check if the issue is with entity types
  console.log("\n🏷️ Testing different entity types...");
  for (let type = 0; type <= 10; type++) {
    const typeQuery = environment.queryNearbyEntities({
      position: testPosition,
      radius: 2000,
      entityTypes: [type],
      maxResults: 100,
      sortByDistance: true,
    });

    if (
      typeQuery.food.length > 0 ||
      typeQuery.creatures.length > 0 ||
      typeQuery.environmental.length > 0
    ) {
      console.log(
        `   Type ${type}: ${typeQuery.food.length} food, ${typeQuery.creatures.length} creatures, ${typeQuery.environmental.length} env`
      );
    }
  }
}

testFoodSpawning();
