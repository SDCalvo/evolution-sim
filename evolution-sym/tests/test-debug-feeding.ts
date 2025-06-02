/**
 * Debug feeding issue - why aren't creatures eating despite detecting food?
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BiomeType, EntityType } from "../src/lib/environment/environmentTypes";

function debugFeeding() {
  console.log("🐛 FEEDING DEBUG TEST");
  console.log("====================");

  // Create environment with lots of food
  const environment = new Environment({
    bounds: {
      width: 1000,
      height: 1000,
      shape: "circular",
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
    maxFood: 100,
    foodSpawnRate: 0.2, // High spawn rate
    preySpawnRate: 0.1,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Spawn lots of food
  for (let i = 0; i < 20; i++) {
    environment.update();
  }

  const stats = environment.getStats();
  console.log(`📊 Environment: ${stats.totalFood} food items spawned`);

  // Create a hungry creature right next to food
  const creature = new Creature(
    0,
    GeneticsHelper.generateRandomGenetics(),
    undefined,
    { x: 500, y: 500 }
  );
  creature.physics.energy = 30; // Low energy
  environment.addCreature(creature);

  // Check what food is nearby
  const foodQuery = {
    position: creature.physics.position,
    radius: 200,
    entityTypes: [
      EntityType.PlantFood,
      EntityType.SmallPrey,
      EntityType.MushroomFood,
    ],
    maxResults: 10,
    sortByDistance: true,
  };

  const nearbyFood = environment.queryNearbyEntities(foodQuery);
  console.log(
    `🔍 Found ${nearbyFood.food.length} food items within 200 pixels`
  );

  if (nearbyFood.food.length > 0) {
    const closest = nearbyFood.food[0];
    const distance = Math.sqrt(
      Math.pow(closest.position.x - creature.physics.position.x, 2) +
        Math.pow(closest.position.y - creature.physics.position.y, 2)
    );
    console.log(
      `📍 Closest food: distance ${distance.toFixed(1)}, collision radius: ${
        creature.physics.collisionRadius
      }`
    );
    console.log(
      `📏 Feeding search radius: ${creature.physics.collisionRadius + 50}`
    );

    if (distance <= creature.physics.collisionRadius + 50) {
      console.log("✅ Food is within feeding range!");
    } else {
      console.log("❌ Food is outside feeding range!");
    }
  }

  // Test brain decisions
  let eatDecisions = 0;
  let actualFeedingAttempts = 0;

  // Override attemptEating to count attempts
  const originalAttemptEating = creature["attemptEating"].bind(creature);
  creature["attemptEating"] = function (env) {
    actualFeedingAttempts++;
    console.log(`🍽️ attemptEating() called! Attempt #${actualFeedingAttempts}`);
    return originalAttemptEating(env);
  };

  console.log("\n🧠 Running creature brain for 10 ticks...");

  for (let tick = 1; tick <= 10; tick++) {
    creature.update(environment, (decision) => {
      if (decision.actions.eat > 0.5) {
        eatDecisions++;
        console.log(
          `Tick ${tick}: Brain wants to eat (${decision.actions.eat.toFixed(
            3
          )}) - energy: ${creature.physics.energy.toFixed(1)}`
        );
      }
    });

    // Show thought
    if (creature.stats.currentThought) {
      console.log(`  💭 "${creature.stats.currentThought.text}"`);
    }

    environment.update();
  }

  console.log(`\n📊 RESULTS:`);
  console.log(`🧠 Brain eat decisions: ${eatDecisions}`);
  console.log(`🍽️ Actual feeding attempts: ${actualFeedingAttempts}`);
  console.log(`⚡ Final energy: ${creature.physics.energy.toFixed(1)}`);
  console.log(`🥘 Food eaten: ${creature.stats.foodEaten}`);

  if (eatDecisions > 0 && actualFeedingAttempts === 0) {
    console.log(
      "🚨 PROBLEM: Brain wants to eat but attemptEating() never called!"
    );
    console.log("   Check action threshold in act() method");
  } else if (actualFeedingAttempts > 0 && creature.stats.foodEaten === 0) {
    console.log("🚨 PROBLEM: Feeding attempted but no food eaten!");
    console.log("   Check food proximity or processFeeding() method");
  }
}

debugFeeding();
