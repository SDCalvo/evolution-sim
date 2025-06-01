/**
 * Complete Integration Test - Real-Time AI Evolution!
 *
 * Tests the complete system where:
 * - 🧠 AI brains sense environment through spatial queries
 * - 🦎 Creatures make real decisions and take actions
 * - 🌍 Environment responds with realistic consequences
 * - ⚡ Evolution emerges through natural selection
 */

import { Simulation } from "../src/lib/simulation/simulation";
import { BiomeType } from "../src/lib/environment/environmentTypes";

function testCompleteIntegration() {
  console.log("🚀 PHASE 3.3 INTEGRATION TEST - AI BRAINS IN ACTION!");
  console.log("=".repeat(60));

  // Create simulation with specific test configuration
  const simulation = new Simulation({
    initialPopulation: 20, // Smaller population for clearer observation
    maxPopulation: 50,
    ticksPerSecond: 10, // Slower for detailed observation
    autoPause: false, // Keep running even if population dies
    environment: {
      biome: {
        type: BiomeType.Grassland,
        name: "Test Grassland",
        characteristics: {
          temperature: 0.6,
          humidity: 0.7,
          waterAvailability: 0.8,
          plantDensity: 0.9, // Rich in food for testing
          preyDensity: 0.3,
          shelterAvailability: 0.5,
          predationPressure: 0.2, // Low predation for initial testing
          competitionLevel: 0.4,
          seasonalVariation: 0.1,
        },
        color: "#4CAF50",
        description: "Rich testing environment",
      },
    },
  });

  console.log("\n📊 INITIAL SIMULATION STATE:");
  console.log("-".repeat(40));

  const initialStats = simulation.getStats();
  const environment = simulation.getEnvironment();
  const envStats = environment.getStats();

  console.log(`👥 Population: ${initialStats.livingCreatures} creatures`);
  console.log(`🍃 Food Available: ${envStats.totalFood} items`);
  console.log(`🌍 Environment: ${environment.getBiome().name}`);
  console.log(`⚡ Target Speed: ${initialStats.ticksPerSecond} ticks/second`);

  console.log("\n🧬 INITIAL CREATURE ANALYSIS:");
  console.log("-".repeat(40));

  const creatures = simulation.getCreatures();
  creatures.slice(0, 3).forEach((creature, index) => {
    console.log(`Creature ${index + 1}:`);
    console.log(`  - ID: ${creature.id.substring(0, 8)}...`);
    console.log(`  - Generation: ${creature.generation}`);
    console.log(`  - Energy: ${creature.physics.energy}`);
    console.log(
      `  - Position: (${creature.physics.position.x.toFixed(
        0
      )}, ${creature.physics.position.y.toFixed(0)})`
    );
    console.log(
      `  - Diet: Plant=${creature.genetics.plantPreference.toFixed(
        2
      )}, Meat=${creature.genetics.meatPreference.toFixed(2)}`
    );
    console.log(`  - Aggression: ${creature.genetics.aggression.toFixed(2)}`);
    console.log(
      `  - Vision Range: ${creature.genetics.visionRange.toFixed(2)}`
    );
    console.log(
      `  - Brain Complexity: ${creature.brain.getLayerCount()} layers`
    );
  });

  console.log("\n🏃‍♂️ RUNNING SIMULATION - OBSERVING AI DECISIONS:");
  console.log("-".repeat(50));

  // Run simulation for several ticks and observe behavior
  let tickCount = 0;
  const maxTicks = 100;

  const runTick = () => {
    if (tickCount >= maxTicks) {
      // Stop simulation and analyze results
      simulation.pause();
      analyzeResults();
      return;
    }

    // Step simulation forward
    simulation.step();
    tickCount++;

    // Log interesting events every 10 ticks
    if (tickCount % 10 === 0) {
      const stats = simulation.getStats();
      const envStats = environment.getStats();

      console.log(`\nTick ${tickCount}:`);
      console.log(`  👥 Living creatures: ${stats.livingCreatures}`);
      console.log(`  🍃 Food remaining: ${envStats.totalFood}`);
      console.log(`  🧠 Spatial queries: ${envStats.spatialQueries}`);
      console.log(`  ⚔️ Collision checks: ${envStats.collisionChecks}`);
      console.log(`  ⏱️ Update time: ${stats.updateTimeMs.toFixed(2)}ms`);

      // Analyze specific creature behavior
      const aliveCreatures = simulation.getCreatures();
      if (aliveCreatures.length > 0) {
        const sampleCreature = aliveCreatures[0];
        console.log(
          `  🦎 Sample creature energy: ${sampleCreature.physics.energy.toFixed(
            1
          )}`
        );
        console.log(
          `  📊 Sample creature fitness: ${sampleCreature.stats.fitness.toFixed(
            1
          )}`
        );
        console.log(`  🍽️ Food eaten: ${sampleCreature.stats.foodEaten}`);
        console.log(`  ⚔️ Attacks given: ${sampleCreature.stats.attacksGiven}`);
      }
    }

    // Continue simulation
    setTimeout(runTick, 100); // 100ms delay between ticks for observation
  };

  // Start the simulation loop
  runTick();

  function analyzeResults() {
    console.log("\n📈 FINAL ANALYSIS - AI EVOLUTION RESULTS:");
    console.log("=".repeat(60));

    const finalStats = simulation.getStats();
    const finalEnvStats = environment.getStats();
    const finalCreatures = simulation.getCreatures();

    // Population analysis
    console.log("\n👥 POPULATION RESULTS:");
    console.log(`  Initial: 20 creatures`);
    console.log(`  Final: ${finalStats.livingCreatures} creatures`);
    console.log(
      `  Survival rate: ${((finalStats.livingCreatures / 20) * 100).toFixed(
        1
      )}%`
    );
    console.log(`  Generation reached: ${finalStats.generationCount}`);
    console.log(`  Average fitness: ${finalStats.averageFitness.toFixed(1)}`);

    // Environmental interaction
    console.log("\n🌍 ENVIRONMENTAL INTERACTION:");
    console.log(`  Total spatial queries: ${finalEnvStats.spatialQueries}`);
    console.log(`  Collision checks: ${finalEnvStats.collisionChecks}`);
    console.log(`  Food consumed: ${20 * 140 - finalEnvStats.totalFood} items`); // Estimate
    console.log(
      `  Queries per tick: ${(finalEnvStats.spatialQueries / tickCount).toFixed(
        1
      )}`
    );

    // Performance analysis
    console.log("\n⚡ PERFORMANCE METRICS:");
    console.log(
      `  Average update time: ${finalStats.updateTimeMs.toFixed(2)}ms`
    );
    console.log(`  Target ticks/second: 10`);
    console.log(
      `  Actual performance: ${(1000 / finalStats.updateTimeMs).toFixed(
        1
      )} ticks/second`
    );
    console.log(
      `  Performance ratio: ${(
        (1000 / finalStats.updateTimeMs / 10) *
        100
      ).toFixed(1)}%`
    );

    // Behavioral analysis
    if (finalCreatures.length > 0) {
      console.log("\n🧬 CREATURE BEHAVIOR ANALYSIS:");

      const totalFoodEaten = finalCreatures.reduce(
        (sum, c) => sum + c.stats.foodEaten,
        0
      );
      const totalAttacks = finalCreatures.reduce(
        (sum, c) => sum + c.stats.attacksGiven,
        0
      );
      const avgEnergy =
        finalCreatures.reduce((sum, c) => sum + c.physics.energy, 0) /
        finalCreatures.length;

      console.log(`  Total food eaten: ${totalFoodEaten} items`);
      console.log(`  Total attacks: ${totalAttacks} attempts`);
      console.log(`  Average energy: ${avgEnergy.toFixed(1)}/100`);
      console.log(
        `  Food per creature: ${(
          totalFoodEaten / finalCreatures.length
        ).toFixed(1)}`
      );

      // Analyze diet preferences
      const avgPlantPref =
        finalCreatures.reduce((sum, c) => sum + c.genetics.plantPreference, 0) /
        finalCreatures.length;
      const avgMeatPref =
        finalCreatures.reduce((sum, c) => sum + c.genetics.meatPreference, 0) /
        finalCreatures.length;
      const avgAggression =
        finalCreatures.reduce((sum, c) => sum + c.genetics.aggression, 0) /
        finalCreatures.length;

      console.log(`  Average plant preference: ${avgPlantPref.toFixed(2)}`);
      console.log(`  Average meat preference: ${avgMeatPref.toFixed(2)}`);
      console.log(`  Average aggression: ${avgAggression.toFixed(2)}`);

      // Top performers
      const topCreatures = finalCreatures
        .sort((a, b) => b.stats.fitness - a.stats.fitness)
        .slice(0, 3);

      console.log("\n🏆 TOP PERFORMING CREATURES:");
      topCreatures.forEach((creature, index) => {
        console.log(
          `  ${index + 1}. Fitness: ${creature.stats.fitness.toFixed(
            1
          )}, Food: ${
            creature.stats.foodEaten
          }, Energy: ${creature.physics.energy.toFixed(1)}`
        );
      });
    }

    console.log("\n🎉 INTEGRATION TEST RESULTS:");
    console.log("-".repeat(40));

    // Determine test success
    const testsPassed = [
      finalStats.livingCreatures > 0, // Creatures survived
      finalEnvStats.spatialQueries > 0, // AI sensing worked
      finalStats.updateTimeMs < 50, // Performance acceptable
      finalCreatures.some((c) => c.stats.foodEaten > 0), // Feeding worked
    ];

    const successRate =
      (testsPassed.filter(Boolean).length / testsPassed.length) * 100;

    console.log(`✅ Creature survival: ${testsPassed[0] ? "PASS" : "FAIL"}`);
    console.log(`✅ AI sensing system: ${testsPassed[1] ? "PASS" : "FAIL"}`);
    console.log(`✅ Performance: ${testsPassed[2] ? "PASS" : "FAIL"}`);
    console.log(`✅ Feeding behavior: ${testsPassed[3] ? "PASS" : "FAIL"}`);
    console.log(`\n🎯 Overall success: ${successRate.toFixed(1)}%`);

    if (successRate >= 75) {
      console.log("\n🎉 PHASE 3.3 INTEGRATION SUCCESSFUL!");
      console.log(
        "AI brains are controlling creatures in the real environment!"
      );
      console.log("Evolution simulation foundation is COMPLETE! 🚀");
    } else {
      console.log("\n⚠️ Integration issues detected. Review logs above.");
    }
  }
}

// Run the test
testCompleteIntegration();
