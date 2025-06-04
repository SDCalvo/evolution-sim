/**
 * Frontend Configuration Fix Test
 *
 * Verifies that aligning frontend maxPopulation with carrying capacity
 * allows the system to work properly and reach the sweet spot.
 */

import {
  SimpleSimulation,
  SimpleSimulationConfig,
} from "../src/lib/simulation/simpleSimulation";
import { simulationLogger } from "../src/lib/logging/simulationLogger";

async function runFrontendFixTest() {
  console.log("🔧 FRONTEND CONFIGURATION FIX TEST");
  console.log("===================================");

  // FIXED frontend configuration - aligned with carrying capacity
  const config: SimpleSimulationConfig = {
    initialPopulation: 10,
    maxPopulation: 400, // 🎯 FIXED: Now matches carrying capacity maxPopulation
    worldWidth: 800,
    worldHeight: 800,
    targetFPS: 30,
  };

  console.log("\n✅ Testing with FIXED frontend config:");
  console.log(`Initial Population: ${config.initialPopulation}`);
  console.log(
    `Max Population: ${config.maxPopulation} (aligned with carrying capacity)`
  );
  console.log(`World Size: ${config.worldWidth}x${config.worldHeight}`);

  const simulation = new SimpleSimulation(config);

  // Clear logger for clean output
  simulationLogger.clear();

  // Start simulation
  simulation.start();

  // Run for 400 ticks to see if we reach the sweet spot
  let tick = 0;
  const maxTicks = 400;

  console.log("\n📊 Tracking population growth to sweet spot:");
  console.log("Tick | Pop | AvgEnergy | Food | Target | Notes");
  console.log("-----|-----|-----------|------|--------|-------");

  let sweetSpotReached = false;
  let sweetSpotTick = -1;

  while (tick < maxTicks) {
    const stats = simulation.getStats();
    const creatures = simulation.getCreatures();
    const environment = simulation.getEnvironment();

    // Calculate average energy
    const totalEnergy = creatures.reduce((sum, c) => sum + c.physics.energy, 0);
    const avgEnergy = creatures.length > 0 ? totalEnergy / creatures.length : 0;

    // Get food count and carrying capacity info
    const allFood = environment.getAllFood();
    const foodCount = allFood.length;
    const envConfig = environment.config;
    const target = envConfig.carryingCapacity?.targetPopulation || 300;

    // Check if we've reached the sweet spot (250-300 range)
    if (
      !sweetSpotReached &&
      stats.livingCreatures >= 250 &&
      stats.livingCreatures <= 300
    ) {
      sweetSpotReached = true;
      sweetSpotTick = tick;
      console.log(`\n🎯 SWEET SPOT REACHED AT TICK ${tick}!`);
      console.log(`   Population: ${stats.livingCreatures}`);
      console.log(`   Average Energy: ${avgEnergy.toFixed(1)}`);
    }

    // Log every 20 ticks
    if (tick % 20 === 0) {
      let notes = "";
      if (avgEnergy < 30) notes += "LOW_ENERGY ";
      if (avgEnergy >= 60) notes += "HEALTHY ";
      if (stats.livingCreatures >= 250 && stats.livingCreatures <= 300)
        notes += "SWEET_SPOT ";
      if (stats.livingCreatures > target) notes += "OVERPOP ";
      if (foodCount < 30) notes += "LOW_FOOD ";

      console.log(
        `${tick.toString().padStart(4)} | ${stats.livingCreatures
          .toString()
          .padStart(3)} | ` +
          `${avgEnergy.toFixed(1).padStart(9)} | ${foodCount
            .toString()
            .padStart(4)} | ` +
          `${target.toString().padStart(6)} | ${notes}`
      );
    }

    // Check carrying capacity engagement
    if (stats.livingCreatures >= target && tick % 50 === 0) {
      console.log(`\n🎛️ CARRYING CAPACITY ENGAGED AT TICK ${tick}:`);
      console.log(
        `   Population: ${stats.livingCreatures}/${target} (target reached)`
      );
      console.log(`   Average energy: ${avgEnergy.toFixed(1)}`);
      console.log(
        `   Mortality rate: ${envConfig.carryingCapacity?.mortalityRate}`
      );
      console.log(
        `   Density stress: ${envConfig.carryingCapacity?.densityStressFactor}`
      );
    }

    tick++;

    // Break early if we stabilize in sweet spot for 20 ticks
    if (sweetSpotReached && tick > sweetSpotTick + 20) {
      break;
    }

    // Faster simulation
    await new Promise((resolve) => setTimeout(resolve, 0.1));
  }

  // Final analysis
  const finalStats = simulation.getStats();
  const finalCreatures = simulation.getCreatures();
  const finalEnergy =
    finalCreatures.reduce((sum, c) => sum + c.physics.energy, 0) /
    finalCreatures.length;

  console.log("\n📈 FINAL ANALYSIS:");
  console.log(`Final population: ${finalStats.livingCreatures}`);
  console.log(`Average energy: ${finalEnergy.toFixed(1)}`);
  console.log(`Total food: ${finalStats.totalFood}`);

  if (sweetSpotReached) {
    console.log(`Sweet spot reached at tick: ${sweetSpotTick}`);
  }

  // Stop simulation
  simulation.stop();

  // Determine success
  const inSweetSpot =
    finalStats.livingCreatures >= 250 && finalStats.livingCreatures <= 300;
  const healthyEnergy = finalEnergy >= 40;

  if (inSweetSpot && healthyEnergy) {
    console.log("\n🎉 SUCCESS: Frontend fix works!");
    console.log("   - Population in sweet spot (250-300)");
    console.log("   - Energy levels healthy (40+)");
    console.log("   - Carrying capacity system functioning properly");
  } else if (inSweetSpot) {
    console.log(
      "\n⚠️ PARTIAL SUCCESS: Sweet spot reached but energy needs improvement"
    );
  } else {
    console.log(
      "\n❌ NEEDS MORE TUNING: Population not stabilized in sweet spot"
    );
  }

  console.log("\n✅ Test completed!");
  return {
    population: finalStats.livingCreatures,
    energy: finalEnergy,
    food: finalStats.totalFood,
    sweetSpotReached: sweetSpotReached,
    sweetSpotTick: sweetSpotTick,
    inTargetRange: inSweetSpot,
  };
}

// Run the test if this file is executed directly
if (require.main === module) {
  runFrontendFixTest()
    .then((results) => {
      console.log("\n🏁 Test Results:", results);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}
