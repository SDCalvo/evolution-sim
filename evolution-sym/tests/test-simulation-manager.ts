/**
 * Test Simulation Manager - Basic Functionality Test
 */

import {
  SimulationManager,
  SimulationConfig,
} from "../src/lib/simulation/simulationManager";

console.log("🎮 SIMULATION MANAGER TEST");
console.log("==========================");

// Create a basic simulation configuration
const config: SimulationConfig = {
  // Population settings
  initialPopulation: 10,
  maxPopulation: 50,

  // World settings
  worldWidth: 800,
  worldHeight: 600,
  biomeName: "grassland",

  // Evolution settings
  mutationRate: 0.1,
  mutationStrength: 0.1,
  reproductionThreshold: 60,

  // Performance settings
  targetFPS: 10,
  maxUpdatesPerFrame: 1,
};

try {
  console.log("📋 Creating simulation with config:");
  console.log(`   Population: ${config.initialPopulation} creatures`);
  console.log(`   World: ${config.worldWidth}x${config.worldHeight}px`);
  console.log(`   Biome: ${config.biomeName}`);
  console.log(`   Target FPS: ${config.targetFPS}`);

  // Create simulation manager
  const simulation = new SimulationManager(config);

  console.log("\n✅ Simulation manager created successfully!");

  // Get initial statistics
  const initialStats = simulation.getStats();
  console.log("\n📊 Initial Statistics:");
  console.log(`   Living creatures: ${initialStats.livingCreatures}`);
  console.log(`   Total food: ${initialStats.totalFood}`);
  console.log(`   Generation: ${initialStats.currentGeneration}`);
  console.log(`   Tick: ${initialStats.currentTick}`);

  // Get species information
  const species = simulation.getSpecies();
  console.log(`\n🧬 Species detected: ${species.length}`);
  species.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.name} (${s.population} individuals)`);
    console.log(`      Color: ${s.color}`);
    console.log(`      Traits: ${s.dominantTraits.join(", ")}`);
  });

  // Test simulation for a few ticks
  console.log("\n🚀 Starting simulation for 5 ticks...");
  simulation.start();

  // Let it run for a short time
  setTimeout(() => {
    simulation.stop();

    const finalStats = simulation.getStats();
    console.log("\n📈 Final Statistics:");
    console.log(`   Ticks elapsed: ${finalStats.currentTick}`);
    console.log(`   Living creatures: ${finalStats.livingCreatures}`);
    console.log(
      `   Performance: ${finalStats.updatesPerSecond.toFixed(1)} updates/sec`
    );
    console.log(`   Memory usage: ${finalStats.memoryUsageMB.toFixed(2)} MB`);

    console.log("\n🎉 Simulation manager test completed successfully!");
  }, 500); // Run for 0.5 seconds
} catch (error) {
  console.error("❌ Simulation manager test failed:");
  console.error(error);
}
