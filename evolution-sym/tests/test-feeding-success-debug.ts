/**
 * Debug Feeding Success - Why 2174 attempts but 0 successes?
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BiomePresets } from "../src/lib/environment/biomePresets";
import { EntityType } from "../src/lib/environment/environmentTypes";

function debugFeedingSuccess() {
  console.log("🍽️ FEEDING SUCCESS DEBUG");
  console.log("========================");

  // Create environment identical to simple simulation
  const environment = new Environment({
    bounds: {
      width: 1000,
      height: 1000,
      shape: "circular",
      centerX: 500,
      centerY: 500,
      radius: 500, // Now with proper radius!
    },
    biome: BiomePresets.grassland,
    maxCreatures: 200,
    maxFood: 600, // 200 * 3
    foodSpawnRate: 0.1,
    preySpawnRate: 0.05,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Create a creature with high plant preference near food
  const genetics = GeneticsHelper.generateRandomGenetics();
  genetics.plantPreference = 0.9; // Love plants
  genetics.visionRange = 2.0; // Excellent vision

  const creature = new Creature(0, genetics, undefined, { x: 500, y: 500 });
  environment.addCreature(creature);

  console.log(
    `🦌 Created creature with high plant preference (${genetics.plantPreference.toFixed(
      2
    )})`
  );
  console.log(`👁️ Vision range: ${genetics.visionRange.toFixed(2)}`);

  // Let environment spawn some initial food
  for (let i = 0; i < 10; i++) {
    environment.update();
  }

  // Check food availability
  const foodQuery = environment.queryNearbyEntities({
    position: { x: 500, y: 500 },
    radius: 1000, // Check entire world
    entityTypes: [
      EntityType.PlantFood,
      EntityType.SmallPrey,
      EntityType.MushroomFood,
    ],
    maxResults: 100,
    sortByDistance: true,
  });

  console.log(`\n🌿 FOOD AVAILABILITY CHECK:`);
  console.log(`  Total food in world: ${foodQuery.food.length}`);
  foodQuery.food.forEach((food, i) => {
    if (i < 5) {
      // Show first 5
      const distance = Math.sqrt(
        (food.position.x - 500) ** 2 + (food.position.y - 500) ** 2
      );
      console.log(
        `    ${i + 1}. ${food.type} at distance ${distance.toFixed(1)}`
      );
    }
  });

  // Track feeding attempts
  const feedingAttemptsBefore = creature.stats.feedingAttempts;
  const foodEatenBefore = creature.stats.foodEaten;
  const energyBefore = creature.physics.energy;

  console.log(`\n🔬 BEFORE FEEDING TEST:`);
  console.log(`  Energy: ${energyBefore.toFixed(1)}`);
  console.log(`  Feeding attempts: ${feedingAttemptsBefore}`);
  console.log(`  Food eaten: ${foodEatenBefore}`);

  // Force eating decisions for 20 ticks
  console.log(`\n🧠 RUNNING 20 TICKS OF FORCED EATING...`);

  for (let tick = 0; tick < 20; tick++) {
    // Check food around creature
    const nearbyFood = environment.queryNearbyEntities({
      position: creature.physics.position,
      radius: creature.genetics.visionRange * 100,
      entityTypes: [
        EntityType.PlantFood,
        EntityType.SmallPrey,
        EntityType.MushroomFood,
      ],
      maxResults: 5,
      sortByDistance: true,
    });

    if (tick % 5 === 0) {
      console.log(
        `  Tick ${tick}: Found ${nearbyFood.food.length} food nearby`
      );
      if (nearbyFood.food.length > 0) {
        const distance = Math.sqrt(
          (nearbyFood.food[0].position.x - creature.physics.position.x) ** 2 +
            (nearbyFood.food[0].position.y - creature.physics.position.y) ** 2
        );
        console.log(
          `    Closest food: ${nearbyFood.food[0].type} at ${distance.toFixed(
            1
          )}px`
        );
      }
    }

    environment.update();
  }

  // Check results
  const feedingAttemptsAfter = creature.stats.feedingAttempts;
  const foodEatenAfter = creature.stats.foodEaten;
  const energyAfter = creature.physics.energy;

  console.log(`\n📊 AFTER FEEDING TEST:`);
  console.log(
    `  Energy: ${energyBefore.toFixed(1)} → ${energyAfter.toFixed(
      1
    )} (change: ${(energyAfter - energyBefore).toFixed(1)})`
  );
  console.log(
    `  Feeding attempts: ${feedingAttemptsBefore} → ${feedingAttemptsAfter} (new attempts: ${
      feedingAttemptsAfter - feedingAttemptsBefore
    })`
  );
  console.log(
    `  Food eaten: ${foodEatenBefore} → ${foodEatenAfter} (new food: ${
      foodEatenAfter - foodEatenBefore
    })`
  );

  // Check final food availability
  const finalFoodQuery = environment.queryNearbyEntities({
    position: { x: 500, y: 500 },
    radius: 1000,
    entityTypes: [
      EntityType.PlantFood,
      EntityType.SmallPrey,
      EntityType.MushroomFood,
    ],
    maxResults: 100,
    sortByDistance: true,
  });

  console.log(`\n🌿 FINAL FOOD CHECK:`);
  console.log(`  Total food remaining: ${finalFoodQuery.food.length}`);

  const feedingSuccess = foodEatenAfter - foodEatenBefore > 0;
  const feedingAttempts = feedingAttemptsAfter - feedingAttemptsBefore;

  if (feedingAttempts > 0 && !feedingSuccess) {
    console.log(`\n❌ FEEDING ISSUE IDENTIFIED:`);
    console.log(`  ${feedingAttempts} feeding attempts made, but 0 successes`);
    console.log(`  This suggests either:`);
    console.log(`    1. Food is available but creature can't reach it`);
    console.log(`    2. Feeding mechanism is broken`);
    console.log(`    3. Food spawning rate is too low`);
  } else if (feedingSuccess) {
    console.log(`\n✅ FEEDING IS WORKING!`);
    console.log(
      `  ${feedingAttempts} attempts, ${
        foodEatenAfter - foodEatenBefore
      } successes`
    );
  } else {
    console.log(`\n⚠️ NO FEEDING ATTEMPTS MADE`);
    console.log(`  Creature's brain might not be making eating decisions`);
  }

  return feedingSuccess;
}

const success = debugFeedingSuccess();
console.log(`\n🎯 Feeding debug result: ${success ? "WORKING" : "BROKEN"}`);
