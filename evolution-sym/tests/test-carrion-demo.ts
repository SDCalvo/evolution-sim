/**
 * Carrion System Demo - Watch Digital Scavengers Evolve! 🦴
 *
 * This test specifically demonstrates the new carrion decay system
 * and how creatures can evolve scavenging behaviors.
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { Simulation } from "../src/lib/simulation/simulation";
import { EntityType } from "../src/lib/environment/environmentTypes";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";

console.log("🦴 CARRION SCAVENGING DEMO - Digital Scavenger Evolution!");
console.log("============================================================");

// Create environment
const environment = new Environment({
  bounds: {
    width: 500,
    height: 500,
    shape: "circular",
    centerX: 250,
    centerY: 250,
    radius: 250,
  },
  maxCreatures: 30,
  maxFood: 100,
});

// Create creatures with different meat preferences (potential scavengers)
const creatures: Creature[] = [];
for (let i = 0; i < 10; i++) {
  const genetics = GeneticsHelper.generateRandomGenetics();

  // Make some creatures more carnivorous (better scavengers)
  if (i < 5) {
    genetics.meatPreference = 0.8 + Math.random() * 0.2; // High meat preference
    genetics.plantPreference = 0.1 + Math.random() * 0.2; // Low plant preference
    genetics.aggression = 0.6 + Math.random() * 0.4; // More aggressive
  } else {
    genetics.meatPreference = 0.1 + Math.random() * 0.3; // Low meat preference
    genetics.plantPreference = 0.7 + Math.random() * 0.3; // High plant preference
    genetics.aggression = 0.1 + Math.random() * 0.3; // Less aggressive
  }

  const creature = new Creature(0, genetics);
  creatures.push(creature);
  environment.addCreature(creature);
}

console.log(`👥 Created ${creatures.length} creatures:`);
console.log(`   🥩 Carnivorous (potential scavengers): 5`);
console.log(`   🌱 Herbivorous: 5`);

// Create simulation
const simulation = new Simulation({ environment });

// Force some creatures to die to create carrion
console.log("\n💀 Forcing some creatures to die to create carrion...");
let carrionCreated = 0;
for (let i = 0; i < 3; i++) {
  const victim = creatures[i];
  victim.physics.health = 0; // Kill creature
  victim.state = "dead" as unknown as typeof victim.state;
  carrionCreated++;
}

console.log(`🦴 ${carrionCreated} creatures died - carrion should be created!`);

// Run simulation to observe scavenging
console.log("\n🏃‍♂️ Running simulation to observe scavenging behavior...");
console.log("--------------------------------------------------");

for (let tick = 1; tick <= 50; tick++) {
  simulation.step();

  if (tick % 10 === 0) {
    const stats = environment.getStats();
    const livingCreatures = environment.getCreatures();

    console.log(`\nTick ${tick}:`);
    console.log(`  👥 Living creatures: ${livingCreatures.length}`);
    console.log(`  🍃 Food available: ${stats.totalFood}`);
    console.log(`  🧠 Spatial queries: ${stats.spatialQueries}`);

    // Check for carrion in environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allEntities = (environment as any).entities;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carrionCount = Array.from(allEntities.values())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((e: any) => e.type === EntityType.Carrion).length;
    console.log(`  🦴 Carrion available: ${carrionCount}`);

    // Show creature food consumption
    const totalFoodEaten = livingCreatures.reduce(
      (sum, c) => sum + c.stats.foodEaten,
      0
    );
    console.log(`  🍽️ Total food eaten: ${totalFoodEaten}`);

    // Show top scavenger
    const topScavenger = livingCreatures.reduce((best, current) =>
      current.stats.foodEaten > best.stats.foodEaten ? current : best
    );
    console.log(
      `  🏆 Top feeder: ${
        topScavenger.stats.foodEaten
      } items, Meat pref: ${topScavenger.genetics.meatPreference.toFixed(2)}`
    );
  }
}

console.log("\n📊 CARRION SCAVENGING ANALYSIS:");
console.log("============================================================");

const finalCreatures = environment.getCreatures();
const carnivores = finalCreatures.filter(
  (c) => c.genetics.meatPreference > 0.6
);
const herbivores = finalCreatures.filter(
  (c) => c.genetics.plantPreference > 0.6
);

console.log(`👥 Final population: ${finalCreatures.length}`);
console.log(`🥩 Carnivores (potential scavengers): ${carnivores.length}`);
console.log(`🌱 Herbivores: ${herbivores.length}`);

// Analyze feeding success by diet type
const carnivoreFeeding = carnivores.reduce(
  (sum, c) => sum + c.stats.foodEaten,
  0
);
const herbivoreFeeding = herbivores.reduce(
  (sum, c) => sum + c.stats.foodEaten,
  0
);

console.log(`\n🍽️ FEEDING SUCCESS:`);
console.log(
  `   Carnivores ate: ${carnivoreFeeding} items (avg: ${(
    carnivoreFeeding / Math.max(carnivores.length, 1)
  ).toFixed(1)})`
);
console.log(
  `   Herbivores ate: ${herbivoreFeeding} items (avg: ${(
    herbivoreFeeding / Math.max(herbivores.length, 1)
  ).toFixed(1)})`
);

// Check if carrion system is working
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allEntities = (environment as any).entities;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const remainingCarrion = Array.from(allEntities.values())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .filter((e: any) => e.type === EntityType.Carrion);

console.log(`\n🦴 CARRION SYSTEM STATUS:`);
console.log(`   Carrion remaining: ${remainingCarrion.length}`);
if (remainingCarrion.length > 0) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carrion = remainingCarrion[0] as any;
  console.log(
    `   Sample carrion decay: ${(carrion.currentDecayStage * 100).toFixed(1)}%`
  );
  console.log(
    `   Sample carrion energy: ${carrion.currentEnergyValue.toFixed(1)}`
  );
  console.log(`   Sample carrion scent: ${carrion.scent.toFixed(2)}`);
}

console.log(`\n🎉 CARRION DEMO COMPLETE!`);
console.log(
  `The carrion decay system is ${
    remainingCarrion.length > 0 || carnivoreFeeding > herbivoreFeeding
      ? "WORKING"
      : "NEEDS INVESTIGATION"
  }! 🦴`
);
