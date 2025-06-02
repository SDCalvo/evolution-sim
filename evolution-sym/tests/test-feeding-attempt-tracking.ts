/**
 * Test Feeding Attempt Tracking - Verify the fix for feeding paradox
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BiomeType } from "../src/lib/environment/environmentTypes";

function testFeedingAttemptTracking() {
  console.log("🧪 FEEDING ATTEMPT TRACKING TEST");
  console.log("=================================");

  // Create environment with NO food initially
  const environment = new Environment({
    bounds: {
      width: 400,
      height: 400,
      shape: "circular",
      centerX: 200,
      centerY: 200,
      radius: 200,
    },
    biome: {
      type: BiomeType.Grassland,
      name: "Grassland",
      characteristics: {
        temperature: 0.6,
        humidity: 0.5,
        waterAvailability: 0.7,
        plantDensity: 0.0, // NO FOOD SPAWNING
        preyDensity: 0.0, // NO PREY SPAWNING
        shelterAvailability: 0.3,
        predationPressure: 0.3,
        competitionLevel: 0.5,
        seasonalVariation: 0.2,
      },
      color: "#4ade80",
      description: "Empty environment for testing",
    },
    maxCreatures: 5,
    maxFood: 0, // NO FOOD
    foodSpawnRate: 0.0, // NO SPAWNING
    preySpawnRate: 0.0,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Create a hungry creature
  const creature = new Creature(
    0,
    GeneticsHelper.generateRandomGenetics(),
    undefined,
    { x: 200, y: 200 }
  );
  creature.physics.energy = 25; // Very hungry
  environment.addCreature(creature);

  console.log(
    `🦴 Starting stats: energy=${creature.physics.energy.toFixed(
      1
    )}, feedingAttempts=${creature.stats.feedingAttempts}, foodEaten=${
      creature.stats.foodEaten
    }`
  );

  let brainEatDecisions = 0;
  let totalThoughtsAboutFood = 0;

  console.log(
    "\n🧠 Running 20 ticks with hungry creature in empty environment..."
  );

  for (let tick = 1; tick <= 20; tick++) {
    creature.update(environment, (decision) => {
      if (decision.actions.eat > 0.5) {
        brainEatDecisions++;
        console.log(
          `Tick ${tick}: Brain wants to eat (${decision.actions.eat.toFixed(
            3
          )}) - energy: ${creature.physics.energy.toFixed(1)}`
        );
      }
    });

    // Check for food-related thoughts
    if (creature.stats.currentThought) {
      const thought = creature.stats.currentThought.text;
      if (
        thought.includes("food") ||
        thought.includes("hungry") ||
        thought.includes("starving") ||
        thought.includes("eat")
      ) {
        totalThoughtsAboutFood++;
        console.log(`  💭 "${thought}" ${creature.stats.currentThought.icon}`);
      }
    }

    environment.update();
  }

  console.log(`\n📊 FINAL RESULTS:`);
  console.log(`🧠 Brain eat decisions: ${brainEatDecisions}`);
  console.log(`💭 Food-related thoughts: ${totalThoughtsAboutFood}`);
  console.log(`🍽️ Feeding attempts: ${creature.stats.feedingAttempts}`);
  console.log(`🥘 Food actually eaten: ${creature.stats.foodEaten}`);
  console.log(`⚡ Final energy: ${creature.physics.energy.toFixed(1)}`);

  // Validation
  if (brainEatDecisions > 0 && creature.stats.feedingAttempts === 0) {
    console.log(
      "❌ FAILED: Brain made eat decisions but no feeding attempts recorded!"
    );
    return false;
  }

  if (brainEatDecisions > 0 && creature.stats.feedingAttempts > 0) {
    console.log(
      "✅ SUCCESS: Both brain decisions AND feeding attempts are being tracked!"
    );
  }

  if (creature.stats.feedingAttempts > 0 && creature.stats.foodEaten === 0) {
    console.log(
      "✅ SUCCESS: Feeding attempts recorded even when no food available!"
    );
  }

  console.log("\n🎯 Now testing with food available...");

  // Add some food to test successful feeding
  for (let i = 0; i < 5; i++) {
    environment.update(); // This should spawn food since we'll change the config
  }

  // Reset the environment to have food
  const foodEnvironment = new Environment({
    bounds: {
      width: 400,
      height: 400,
      shape: "circular",
      centerX: 200,
      centerY: 200,
      radius: 200,
    },
    biome: {
      type: BiomeType.Grassland,
      name: "Grassland",
      characteristics: {
        temperature: 0.6,
        humidity: 0.5,
        waterAvailability: 0.7,
        plantDensity: 0.8, // LOTS OF FOOD
        preyDensity: 0.4,
        shelterAvailability: 0.3,
        predationPressure: 0.3,
        competitionLevel: 0.5,
        seasonalVariation: 0.2,
      },
      color: "#4ade80",
      description: "Food-rich environment",
    },
    maxCreatures: 5,
    maxFood: 20,
    foodSpawnRate: 0.2, // High spawn rate
    preySpawnRate: 0.1,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Spawn food
  for (let i = 0; i < 10; i++) {
    foodEnvironment.update();
  }

  // Create new hungry creature
  const creature2 = new Creature(
    0,
    GeneticsHelper.generateRandomGenetics(),
    undefined,
    { x: 200, y: 200 }
  );
  creature2.physics.energy = 25;
  foodEnvironment.addCreature(creature2);

  const beforeAttempts = creature2.stats.feedingAttempts;
  const beforeEaten = creature2.stats.foodEaten;

  console.log(
    `\n🍃 Testing with food available - Food in environment: ${
      foodEnvironment.getStats().totalFood
    }`
  );

  for (let tick = 1; tick <= 10; tick++) {
    creature2.update(foodEnvironment);
    foodEnvironment.update();
  }

  const afterAttempts = creature2.stats.feedingAttempts;
  const afterEaten = creature2.stats.foodEaten;

  console.log(`📊 With food available:`);
  console.log(
    `   Feeding attempts: ${beforeAttempts} → ${afterAttempts} (+${
      afterAttempts - beforeAttempts
    })`
  );
  console.log(
    `   Food eaten: ${beforeEaten} → ${afterEaten} (+${
      afterEaten - beforeEaten
    })`
  );
  console.log(`   Energy: ${creature2.physics.energy.toFixed(1)}`);

  if (afterAttempts > beforeAttempts && afterEaten > beforeEaten) {
    console.log(
      "✅ SUCCESS: Both attempts and successes tracked when food available!"
    );
    return true;
  } else {
    console.log(
      "❌ FAILED: Something wrong with tracking when food is available"
    );
    return false;
  }
}

const success = testFeedingAttemptTracking();
console.log(`\n🎉 Test ${success ? "PASSED" : "FAILED"}!`);
