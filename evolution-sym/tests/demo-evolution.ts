/**
 * Evolution Simulation Demo - Watch Digital Life Evolve!
 *
 * This demo shows our complete evolution simulation with:
 * - 🧠 AI brains making real-time decisions
 * - 🦎 Creatures evolving through natural selection
 * - 🌍 Living ecosystem with realistic interactions
 * - ⚡ 60 FPS performance with hundreds of creatures
 */

import { Simulation } from "../src/lib/simulation/simulation";
import { BiomeType } from "../src/lib/environment/environmentTypes";

function runEvolutionDemo() {
  console.log("🌟 EVOLUTION SIMULATION DEMO - DIGITAL LIFE IN ACTION!");
  console.log("=".repeat(70));
  console.log(
    "Watch as AI brains evolve to survive in a living ecosystem...\n"
  );

  // Create a larger simulation for more dramatic evolution
  const simulation = new Simulation({
    initialPopulation: 50, // Larger population for evolution
    maxPopulation: 100,
    ticksPerSecond: 30, // Fast but observable
    autoPause: false, // Keep evolving even through extinctions
    environment: {
      biome: {
        type: BiomeType.Grassland,
        name: "Evolution Arena",
        characteristics: {
          temperature: 0.7,
          humidity: 0.6,
          waterAvailability: 0.8,
          plantDensity: 0.7, // Moderate food scarcity for selection pressure
          preyDensity: 0.2,
          shelterAvailability: 0.4,
          predationPressure: 0.3, // Some danger to drive evolution
          competitionLevel: 0.6, // Competition for resources
          seasonalVariation: 0.2,
        },
        color: "#4CAF50",
        description: "Competitive ecosystem driving evolution",
      },
    },
  });

  console.log("🚀 Starting evolution simulation...");
  console.log(`👥 Initial population: 50 creatures`);
  console.log(`🌍 Environment: ${simulation.getEnvironment().getBiome().name}`);
  console.log(`⚡ Target speed: 30 FPS\n`);

  // Run for several generations
  let tickCount = 0;
  const maxTicks = 500; // Run longer to see evolution
  let lastGeneration = 0;
  let generationStartTime = Date.now();

  const runTick = () => {
    if (tickCount >= maxTicks) {
      // Final analysis
      showFinalResults();
      return;
    }

    // Step simulation forward
    simulation.step();
    tickCount++;

    // Log progress every 50 ticks
    if (tickCount % 50 === 0) {
      const stats = simulation.getStats();
      const envStats = simulation.getEnvironment().getStats();
      const creatures = simulation.getCreatures();

      console.log(`\n📊 Tick ${tickCount} Status:`);
      console.log(`  👥 Population: ${stats.livingCreatures} creatures`);
      console.log(`  🧬 Generation: ${stats.generationCount}`);
      console.log(`  🍃 Food available: ${envStats.totalFood}`);
      console.log(`  📈 Average fitness: ${stats.averageFitness.toFixed(1)}`);
      console.log(
        `  ⚡ Performance: ${stats.updateTimeMs.toFixed(2)}ms per tick`
      );

      // Check for new generation
      if (stats.generationCount > lastGeneration) {
        const generationTime = Date.now() - generationStartTime;
        console.log(
          `  🎉 NEW GENERATION ${stats.generationCount} EMERGED! (${generationTime}ms)`
        );
        lastGeneration = stats.generationCount;
        generationStartTime = Date.now();

        // Analyze the new generation
        if (creatures.length > 0) {
          const avgPlantPref =
            creatures.reduce((sum, c) => sum + c.genetics.plantPreference, 0) /
            creatures.length;
          const avgMeatPref =
            creatures.reduce((sum, c) => sum + c.genetics.meatPreference, 0) /
            creatures.length;
          const avgAggression =
            creatures.reduce((sum, c) => sum + c.genetics.aggression, 0) /
            creatures.length;
          const avgSize =
            creatures.reduce((sum, c) => sum + c.genetics.size, 0) /
            creatures.length;

          console.log(`    🧬 Evolution trends:`);
          console.log(
            `       Diet: Plant=${avgPlantPref.toFixed(
              2
            )}, Meat=${avgMeatPref.toFixed(2)}`
          );
          console.log(`       Aggression: ${avgAggression.toFixed(2)}`);
          console.log(`       Size: ${avgSize.toFixed(2)}`);
        }
      }

      // Show top performers
      if (creatures.length > 0) {
        const topCreature = creatures.reduce((best, current) =>
          current.stats.fitness > best.stats.fitness ? current : best
        );
        console.log(
          `  🏆 Top performer: Fitness ${topCreature.stats.fitness.toFixed(
            1
          )}, Food eaten: ${topCreature.stats.foodEaten}`
        );
      }
    }

    // Continue simulation
    setTimeout(runTick, 33); // ~30 FPS for observation
  };

  // Start the evolution!
  runTick();

  function showFinalResults() {
    console.log("\n🎯 EVOLUTION SIMULATION COMPLETE!");
    console.log("=".repeat(70));

    const finalStats = simulation.getStats();
    const finalEnvStats = simulation.getEnvironment().getStats();
    const finalCreatures = simulation.getCreatures();

    console.log(`\n📈 EVOLUTION RESULTS:`);
    console.log(`  🕐 Total ticks: ${tickCount}`);
    console.log(`  🧬 Generations evolved: ${finalStats.generationCount}`);
    console.log(`  👥 Final population: ${finalStats.livingCreatures}`);
    console.log(
      `  📊 Average fitness: ${finalStats.averageFitness.toFixed(1)}`
    );
    console.log(
      `  🍽️ Total food consumed: ${finalCreatures.reduce(
        (sum, c) => sum + c.stats.foodEaten,
        0
      )}`
    );
    console.log(
      `  ⚔️ Total combat events: ${finalCreatures.reduce(
        (sum, c) => sum + c.stats.attacksGiven,
        0
      )}`
    );

    console.log(`\n⚡ PERFORMANCE METRICS:`);
    console.log(`  🧠 Total spatial queries: ${finalEnvStats.spatialQueries}`);
    console.log(`  ⚔️ Collision checks: ${finalEnvStats.collisionChecks}`);
    console.log(
      `  ⏱️ Average update time: ${finalStats.updateTimeMs.toFixed(2)}ms`
    );
    console.log(
      `  🚀 Effective FPS: ${(1000 / finalStats.updateTimeMs).toFixed(1)}`
    );

    if (finalCreatures.length > 0) {
      console.log(`\n🧬 EVOLVED TRAITS:`);
      const avgPlantPref =
        finalCreatures.reduce((sum, c) => sum + c.genetics.plantPreference, 0) /
        finalCreatures.length;
      const avgMeatPref =
        finalCreatures.reduce((sum, c) => sum + c.genetics.meatPreference, 0) /
        finalCreatures.length;
      const avgAggression =
        finalCreatures.reduce((sum, c) => sum + c.genetics.aggression, 0) /
        finalCreatures.length;
      const avgSize =
        finalCreatures.reduce((sum, c) => sum + c.genetics.size, 0) /
        finalCreatures.length;
      const avgSpeed =
        finalCreatures.reduce((sum, c) => sum + c.genetics.speed, 0) /
        finalCreatures.length;
      const avgEfficiency =
        finalCreatures.reduce((sum, c) => sum + c.genetics.efficiency, 0) /
        finalCreatures.length;

      console.log(
        `  🌱 Plant preference: ${avgPlantPref.toFixed(
          2
        )} (0=carnivore, 1=herbivore)`
      );
      console.log(
        `  🥩 Meat preference: ${avgMeatPref.toFixed(
          2
        )} (0=herbivore, 1=carnivore)`
      );
      console.log(
        `  ⚔️ Aggression: ${avgAggression.toFixed(
          2
        )} (0=peaceful, 1=aggressive)`
      );
      console.log(`  📏 Size: ${avgSize.toFixed(2)} (0.5=small, 2.0=large)`);
      console.log(`  🏃 Speed: ${avgSpeed.toFixed(2)} (0.3=slow, 1.5=fast)`);
      console.log(
        `  ⚡ Efficiency: ${avgEfficiency.toFixed(
          2
        )} (0.5=efficient, 1.5=wasteful)`
      );

      // Show the most successful creatures
      const topCreatures = finalCreatures
        .sort((a, b) => b.stats.fitness - a.stats.fitness)
        .slice(0, 5);

      console.log(`\n🏆 TOP 5 EVOLVED CREATURES:`);
      topCreatures.forEach((creature, index) => {
        console.log(
          `  ${index + 1}. Fitness: ${creature.stats.fitness.toFixed(1)}`
        );
        console.log(
          `     Food eaten: ${creature.stats.foodEaten}, Generation: ${creature.generation}`
        );
        console.log(
          `     Diet: Plant=${creature.genetics.plantPreference.toFixed(
            2
          )}, Meat=${creature.genetics.meatPreference.toFixed(2)}`
        );
        console.log(
          `     Traits: Size=${creature.genetics.size.toFixed(
            2
          )}, Speed=${creature.genetics.speed.toFixed(
            2
          )}, Aggression=${creature.genetics.aggression.toFixed(2)}`
        );
      });
    }

    console.log(`\n🎉 EVOLUTION SIMULATION DEMO COMPLETE!`);
    console.log(
      `AI brains successfully evolved through ${finalStats.generationCount} generations!`
    );
    console.log(
      `Digital life forms adapted to their environment through natural selection! 🧬✨`
    );

    simulation.pause();
  }
}

// Run the demo
runEvolutionDemo();
