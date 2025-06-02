/**
 * Test Simple Simulation - Working Version Test
 */

import {
  SimpleSimulation,
  SimpleSimulationConfig,
} from "../src/lib/simulation/simpleSimulation";

console.log("🎮 SIMPLE SIMULATION TEST");
console.log("=========================");

// Create a basic simulation configuration
const config: SimpleSimulationConfig = {
  initialPopulation: 5,
  maxPopulation: 20,
  worldWidth: 400,
  worldHeight: 400,
  targetFPS: 10,
};

try {
  console.log("📋 Creating simple simulation with config:");
  console.log(`   Population: ${config.initialPopulation} creatures`);
  console.log(`   World: ${config.worldWidth}x${config.worldHeight}px`);
  console.log(`   Target FPS: ${config.targetFPS}`);

  // Create simulation
  const simulation = new SimpleSimulation(config);

  console.log("\n✅ Simple simulation created successfully!");

  // Get initial statistics
  const initialStats = simulation.getStats();
  console.log("\n📊 Initial Statistics:");
  console.log(`   Living creatures: ${initialStats.livingCreatures}`);
  console.log(`   Total food: ${initialStats.totalFood}`);
  console.log(`   Tick: ${initialStats.currentTick}`);
  console.log(`   Average fitness: ${initialStats.averageFitness.toFixed(2)}`);

  // Get creatures
  const creatures = simulation.getCreatures();
  console.log(`\n🧬 Creatures: ${creatures.length}`);
  creatures.forEach((creature, i) => {
    console.log(
      `   ${i + 1}. ${creature.id} - Energy: ${creature.physics.energy.toFixed(
        1
      )}, Age: ${creature.physics.age}`
    );
  });

  // Test simulation for a few ticks
  console.log("\n🚀 Starting simulation for 1 second...");
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
    console.log(`   Average fitness: ${finalStats.averageFitness.toFixed(2)}`);

    const finalCreatures = simulation.getCreatures();
    console.log(`\n🧬 Final Creatures: ${finalCreatures.length}`);
    finalCreatures.slice(0, 3).forEach((creature, i) => {
      console.log(
        `   ${i + 1}. ${
          creature.id
        } - Energy: ${creature.physics.energy.toFixed(1)}, Age: ${
          creature.physics.age
        }`
      );
    });

    console.log("\n🎉 Simple simulation test completed successfully!");
  }, 1000); // Run for 1 second
} catch (error) {
  console.error("❌ Simple simulation test failed:");
  console.error(error);
}
