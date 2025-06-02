/**
 * Test feeding integration - why aren't creatures eating?
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BiomeType, EntityType } from "../src/lib/environment/environmentTypes";
import { BootstrapBrainFactory } from "../src/lib/creatures/bootstrapBrains";

function testFeedingIntegration() {
  console.log("🍽️ FEEDING INTEGRATION TEST");
  console.log("===========================");

  // Create environment
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
    maxFood: 60,
    foodSpawnRate: 0.1,
    preySpawnRate: 0.05,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Let environment spawn food for a few updates
  console.log("🌱 Spawning food...");
  for (let i = 0; i < 10; i++) {
    environment.update();
  }

  const stats = environment.getStats();
  console.log(
    `📊 Environment stats: ${stats.totalFood} food items, ${stats.livingCreatures} creatures`
  );

  if (stats.totalFood === 0) {
    console.log("❌ NO FOOD SPAWNED! This is the problem!");
    return;
  }

  // Create a hungry creature near some food
  const genetics = GeneticsHelper.generateRandomGenetics();
  const creature = new Creature(0, genetics, undefined, { x: 500, y: 500 });

  // Manually set low energy to ensure hunger
  creature.physics.energy = 20;
  console.log(
    `🦌 Created hungry creature at (500, 500) with ${creature.physics.energy} energy`
  );

  // Add creature to environment
  environment.addCreature(creature);

  // Test food detection
  console.log("\n🔍 Testing food detection...");
  const foodQuery = {
    position: creature.physics.position,
    radius: 200, // Large search radius
    entityTypes: [
      EntityType.PlantFood,
      EntityType.SmallPrey,
      EntityType.MushroomFood,
    ], // All food types
    maxResults: 5,
    sortByDistance: true,
  };

  const nearbyFood = environment.queryNearbyEntities(foodQuery);
  console.log(`Found ${nearbyFood.food.length} food items near creature`);

  if (nearbyFood.food.length > 0) {
    const closest = nearbyFood.food[0];
    const distance = Math.sqrt(
      Math.pow(closest.position.x - creature.physics.position.x, 2) +
        Math.pow(closest.position.y - creature.physics.position.y, 2)
    );
    console.log(
      `📍 Closest food: ${closest.type} at distance ${distance.toFixed(1)}`
    );
  } else {
    console.log(
      "❌ NO FOOD DETECTED! Problem with spatial queries or spawning!"
    );
    return;
  }

  // Test creature update with tracking
  console.log("\n🧠 Testing creature brain decisions...");
  let brainDecisionCaptured = false;
  let feedingAttempted = false;
  let capturedSensorData: number[] = [];

  const originalAttemptEating = creature["attemptEating"].bind(creature);
  creature["attemptEating"] = function (env) {
    feedingAttempted = true;
    console.log("🍽️ attemptEating() called!");
    return originalAttemptEating(env);
  };

  creature.update(environment, (decision) => {
    brainDecisionCaptured = true;
    capturedSensorData = [...decision.sensorInputs];
    console.log(`🧠 Brain decision captured:`);
    console.log(
      `   Energy sensor: ${decision.sensorInputs[6]?.toFixed(3)} (${
        creature.physics.energy
      } actual)`
    );
    console.log(
      `   Food distance sensor: ${decision.sensorInputs[0]?.toFixed(3)}`
    );
    console.log(`   Eat action: ${decision.actions.eat.toFixed(3)}`);
    console.log(
      `   Will attempt eating: ${decision.actions.eat > 0.5 ? "YES" : "NO"}`
    );
  });

  console.log(`\n📊 Results:`);
  console.log(
    `   Brain decision captured: ${brainDecisionCaptured ? "✅" : "❌"}`
  );
  console.log(`   Feeding attempted: ${feedingAttempted ? "✅" : "❌"}`);
  console.log(`   Creature energy after: ${creature.physics.energy}`);

  // 🔬 NEW: Test the exact sensor data with a fresh bootstrap brain
  if (capturedSensorData.length > 0) {
    console.log("\n🔬 BOOTSTRAP BRAIN COMPARISON TEST:");
    console.log(
      "Testing the exact sensor data with a fresh bootstrap brain..."
    );

    const testBrain = BootstrapBrainFactory.createFounderBrain(genetics);
    const testOutput = testBrain.process(capturedSensorData);

    console.log(
      `📊 Sensor array: [${capturedSensorData
        .map((x) => x.toFixed(3))
        .join(", ")}]`
    );
    console.log(
      `🧠 Bootstrap brain output: [${testOutput
        .map((x) => x.toFixed(3))
        .join(", ")}]`
    );
    console.log(
      `🍽️ Bootstrap would eat? ${
        testOutput[2] > 0.5 ? "YES" : "NO"
      } (eat=${testOutput[2].toFixed(3)})`
    );

    if (testOutput[2] > 0.5 && !feedingAttempted) {
      console.log(
        "🚨 MISMATCH! Bootstrap brain says EAT but creature didn't attempt feeding!"
      );
      console.log(
        "   This suggests the creature's brain is different from bootstrap brain."
      );
    } else if (testOutput[2] <= 0.5) {
      console.log(
        "✅ Bootstrap brain also says DON'T EAT - sensor data might be the issue."
      );
    }
  }

  // Test reproduction conditions
  console.log("\n💕 Testing reproduction conditions...");
  creature.physics.energy = 80; // High energy
  creature.physics.age = 120; // Mature age
  creature.reproductionCooldown = 0;

  console.log(`   Energy: ${creature.physics.energy} (need >50)`);
  console.log(
    `   Age: ${creature.physics.age} (mature at ${creature.genetics.maturityAge})`
  );
  console.log(`   Mateable: ${creature.isMateable ? "✅" : "❌"}`);
  console.log(`   Can reproduce: ${creature["canReproduce"]() ? "✅" : "❌"}`);

  // Create a potential mate
  const mate = new Creature(0, genetics, undefined, { x: 520, y: 520 });
  mate.physics.energy = 80;
  mate.physics.age = 120;
  mate.reproductionCooldown = 0;
  environment.addCreature(mate);

  console.log(`   Potential mate nearby: ✅`);
  console.log(`   Same species: ${creature.isSameSpecies(mate) ? "✅" : "❌"}`);

  // Test reproduction attempt
  let reproductionAttempted = false;
  const originalAttemptReproduction =
    creature["attemptReproduction"].bind(creature);
  creature["attemptReproduction"] = function (env) {
    reproductionAttempted = true;
    console.log("💕 attemptReproduction() called!");
    return originalAttemptReproduction(env);
  };

  creature.update(environment, (decision) => {
    console.log(`🧠 Reproduction brain decision:`);
    console.log(`   Energy sensor: ${decision.sensorInputs[6]?.toFixed(3)}`);
    console.log(`   Age sensor: ${decision.sensorInputs[8]?.toFixed(3)}`);
    console.log(
      `   Reproduce action: ${decision.actions.reproduce.toFixed(3)}`
    );
    console.log(
      `   Will attempt reproduction: ${
        decision.actions.reproduce > 0.6 ? "YES" : "NO"
      }`
    );
  });

  console.log(`\n💕 Reproduction Results:`);
  console.log(
    `   Reproduction attempted: ${reproductionAttempted ? "✅" : "❌"}`
  );

  const finalStats = environment.getStats();
  console.log(
    `   Offspring created: ${finalStats.livingCreatures > 2 ? "✅" : "❌"} (${
      finalStats.livingCreatures
    } total creatures)`
  );
}

testFeedingIntegration();
