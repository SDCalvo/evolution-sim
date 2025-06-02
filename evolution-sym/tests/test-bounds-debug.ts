/**
 * Debug world bounds configuration
 */

import { Environment } from "../src/lib/environment/environment";
import { BiomeType } from "../src/lib/environment/environmentTypes";

function testBoundsConfig() {
  console.log("🌍 WORLD BOUNDS DEBUG");
  console.log("=====================");

  // Test the same config as our simulation
  const config = {
    bounds: {
      width: 1000,
      height: 1000,
      shape: "circular" as const,
      centerX: 500,
      centerY: 500,
      radius: 500,
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
  };

  console.log("Configuration:");
  console.log(`  Width: ${config.bounds.width}`);
  console.log(`  Height: ${config.bounds.height}`);
  console.log(`  Shape: ${config.bounds.shape}`);
  console.log(`  Center: (${config.bounds.centerX}, ${config.bounds.centerY})`);
  console.log(
    `  Calculated radius: ${
      Math.min(config.bounds.width, config.bounds.height) / 2
    }`
  );

  // Check if there's a radius property missing
  const environment = new Environment(config);
  const bounds = environment.bounds;

  console.log("\nActual bounds object:");
  console.log(bounds);

  // Check food spawning for first few updates
  console.log("\n🍃 Food spawning test...");

  for (let i = 0; i < 3; i++) {
    const beforeStats = environment.getStats();
    console.log(`  Update ${i + 1}:`);
    console.log(`    Before: ${beforeStats.totalFood} food`);

    environment.update();

    const afterStats = environment.getStats();
    console.log(
      `    After: ${afterStats.totalFood} food (${
        afterStats.totalFood - beforeStats.totalFood
      } spawned)`
    );
  }

  // Manual spatial grid check
  console.log("\n🗂️ Spatial grid structure test...");
  const testGrid = environment["spatialGrid"];
  console.log(`  Grid cell size: ${testGrid.cellSize}`);
  console.log(`  Total cells with data: ${testGrid.cells.size}`);

  // Check a few cell contents
  let foodInCells = 0;
  let cellsChecked = 0;

  for (const [cellKey, cell] of testGrid.cells) {
    cellsChecked++;
    foodInCells += cell.food.length;

    if (cellsChecked <= 3 && cell.food.length > 0) {
      console.log(`  Cell ${cellKey}: ${cell.food.length} food items`);
      console.log(
        `    First food position: (${cell.food[0].position.x.toFixed(
          1
        )}, ${cell.food[0].position.y.toFixed(1)})`
      );
    }
  }

  console.log(`  Total food in all cells: ${foodInCells}`);
  console.log(`  Cells checked: ${cellsChecked}`);
}

testBoundsConfig();
