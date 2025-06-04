/**
 * Frontend Simulation Replication Test
 *
 * This test exactly replicates the frontend simulation setup to debug
 * why the population is stuck at ~43 creatures with low energy (~20.6)
 * despite our carrying capacity parameter changes.
 */

import {
  SimpleSimulation,
  SimpleSimulationConfig,
} from "../src/lib/simulation/simpleSimulation";
import { simulationLogger } from "../src/lib/logging/simulationLogger";

async function runFrontendSimulationTest() {
  console.log("🧬 FRONTEND SIMULATION REPLICATION TEST");
  console.log("=======================================");

  // EXACT frontend configuration from SimulationPage
  const config: SimpleSimulationConfig = {
    initialPopulation: 10,
    maxPopulation: 50, // ⚠️ This conflicts with carrying capacity target of 300!
    worldWidth: 800,
    worldHeight: 800,
    targetFPS: 30,
  };

  console.log("\n🔧 Testing with EXACT frontend config:");
  console.log(`Initial Population: ${config.initialPopulation}`);
  console.log(`Max Population: ${config.maxPopulation}`);
  console.log(`World Size: ${config.worldWidth}x${config.worldHeight}`);

  const simulation = new SimpleSimulation(config);

  // Clear logger for clean output
  simulationLogger.clear();

  // Start simulation
  simulation.start();

  // Run for 700 ticks to match frontend duration (was at tick 600+)
  let tick = 0;
  const maxTicks = 700;

  console.log("\n📊 Tracking population and energy over time:");
  console.log("Tick | Pop | AvgEnergy | Food | Notes");
  console.log("-----|-----|-----------|------|-------");

  let energyCrisisStartTick = -1;

  while (tick < maxTicks) {
    const stats = simulation.getStats();
    const creatures = simulation.getCreatures();
    const environment = simulation.getEnvironment();

    // Calculate average energy
    const totalEnergy = creatures.reduce((sum, c) => sum + c.physics.energy, 0);
    const avgEnergy = creatures.length > 0 ? totalEnergy / creatures.length : 0;

    // Get food count
    const allFood = environment.getAllFood();
    const foodCount = allFood.length;

    // Detect energy crisis start
    if (avgEnergy < 30 && energyCrisisStartTick === -1) {
      energyCrisisStartTick = tick;
      console.log(`\n🚨 ENERGY CRISIS DETECTED AT TICK ${tick}!`);
    }

    // Log every 25 ticks for longer simulation
    if (tick % 25 === 0) {
      let notes = "";
      if (avgEnergy < 30) notes += "LOW_ENERGY ";
      if (avgEnergy < 15) notes += "CRITICAL ";
      if (stats.livingCreatures >= config.maxPopulation * 0.9)
        notes += "NEAR_MAX ";
      if (foodCount < 20) notes += "LOW_FOOD ";
      if (stats.livingCreatures >= config.maxPopulation)
        notes += "MAX_REACHED ";

      console.log(
        `${tick.toString().padStart(4)} | ${stats.livingCreatures
          .toString()
          .padStart(3)} | ` +
          `${avgEnergy.toFixed(1).padStart(9)} | ${foodCount
            .toString()
            .padStart(4)} | ${notes}`
      );
    }

    // Check when we hit maxPopulation
    if (stats.livingCreatures >= config.maxPopulation && tick > 100) {
      console.log(
        `\n🏁 MAX POPULATION (${config.maxPopulation}) REACHED AT TICK ${tick}`
      );
      console.log(`    Average energy when maxed: ${avgEnergy.toFixed(1)}`);
      console.log(`    Available food: ${foodCount}`);
    }

    // Check carrying capacity vs maxPopulation conflict at key moments
    if (
      tick === 100 ||
      (stats.livingCreatures === config.maxPopulation && tick % 100 === 0)
    ) {
      const envConfig = environment.config;
      console.log(`\n⚠️ STATUS CHECK AT TICK ${tick}:`);
      console.log(
        `  Population: ${stats.livingCreatures}/${config.maxPopulation} (frontend limit)`
      );
      console.log(
        `  Carrying capacity target: ${envConfig.carryingCapacity?.targetPopulation}`
      );
      console.log(`  Average energy: ${avgEnergy.toFixed(1)}`);
      console.log(`  Food available: ${foodCount}`);

      if (stats.livingCreatures >= config.maxPopulation) {
        console.log(`  🚨 POPULATION CAPPED BY FRONTEND CONFIG!`);
        console.log(
          `     Carrying capacity wants ${envConfig.carryingCapacity?.targetPopulation} but frontend limits to ${config.maxPopulation}`
        );
      }
    }

    tick++;

    // Simulate time passing (let the simulation update) - reduced delay for longer run
    await new Promise((resolve) => setTimeout(resolve, 0.5));
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

  if (energyCrisisStartTick > 0) {
    console.log(`Energy crisis started at tick: ${energyCrisisStartTick}`);
  }

  // Stop simulation
  simulation.stop();

  // Identify the specific issue
  if (finalEnergy < 30) {
    console.log("\n🔍 ENERGY CRISIS DIAGNOSED:");
    console.log("   - Population growth blocked by low energy");
    console.log(
      "   - Likely caused by maxPopulation cap creating resource competition"
    );
    console.log(
      "   - Frontend maxPopulation (50) vs carrying capacity target (300) mismatch"
    );
  } else if (finalStats.livingCreatures >= config.maxPopulation * 0.9) {
    console.log("\n🔍 POPULATION CAP REACHED:");
    console.log("   - Population limited by frontend maxPopulation setting");
    console.log(
      "   - Carrying capacity system not fully engaged due to low cap"
    );
  }

  console.log("\n✅ Test completed successfully!");
  return {
    population: finalStats.livingCreatures,
    energy: finalEnergy,
    food: finalStats.totalFood,
    energyCrisisStartTick: energyCrisisStartTick,
  };
}

// Run the test if this file is executed directly
if (require.main === module) {
  runFrontendSimulationTest()
    .then((results) => {
      console.log("\n🏁 Test Results:", results);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}
