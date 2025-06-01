/**
 * Simple Carrion Test - Verify carrion creation and scavenging
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { EntityType } from "../src/lib/environment/environmentTypes";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";

console.log("🦴 SIMPLE CARRION TEST - Verifying Scavenger System");
console.log("==================================================");

// Create small environment
const environment = new Environment({
  bounds: {
    width: 200,
    height: 200,
    shape: "rectangular",
    centerX: 100,
    centerY: 100,
  },
  maxCreatures: 10,
  maxFood: 20,
});

// Create a few creatures
const creatures: Creature[] = [];
for (let i = 0; i < 3; i++) {
  const genetics = GeneticsHelper.generateRandomGenetics();
  genetics.meatPreference = 0.9; // Make them good scavengers
  genetics.plantPreference = 0.1;

  const creature = new Creature(0, genetics);
  creatures.push(creature);
  environment.addCreature(creature);
}

console.log(`👥 Created ${creatures.length} carnivorous creatures`);

// Manually kill one creature to create carrion
const victim = creatures[0];
victim.physics.health = 0;
victim.state = "dead" as unknown as typeof victim.state;

console.log(
  `💀 Killed creature ${victim.id.substring(0, 8)} to create carrion`
);

// Manually call removeCreature to trigger carrion creation
const removed = environment.removeCreature(victim.id);
console.log(`🗑️ Removed dead creature: ${removed}`);

// Check if carrion was created
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allEntities = (environment as any).entities;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const carrionList = Array.from(allEntities.values())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .filter((e: any) => e.type === EntityType.Carrion);
console.log(`🦴 Carrion created: ${carrionList.length} pieces`);

if (carrionList.length > 0) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carrion = carrionList[0] as any;
  console.log(`   - ID: ${carrion.id}`);
  console.log(
    `   - Position: (${carrion.position.x.toFixed(
      1
    )}, ${carrion.position.y.toFixed(1)})`
  );
  console.log(`   - Energy: ${carrion.currentEnergyValue.toFixed(1)}`);
  console.log(`   - Scent: ${carrion.scent.toFixed(2)}`);
  console.log(
    `   - Decay stage: ${(carrion.currentDecayStage * 100).toFixed(1)}%`
  );
}

// Now test if remaining creatures can detect and eat the carrion
console.log("\n🔍 Testing carrion detection and feeding...");

const livingCreatures = environment.getCreatures();
console.log(`👥 Living creatures: ${livingCreatures.length}`);

// Run a few simulation steps
for (let tick = 1; tick <= 10; tick++) {
  environment.update();

  // Update creatures
  for (const creature of livingCreatures) {
    if (creature.state === "alive") {
      creature.update(environment);
    }
  }

  if (tick % 5 === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const remainingCarrion = Array.from(allEntities.values())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((e: any) => e.type === EntityType.Carrion);
    const totalFoodEaten = livingCreatures.reduce(
      (sum, c) => sum + c.stats.foodEaten,
      0
    );

    console.log(`Tick ${tick}:`);
    console.log(`  🦴 Carrion remaining: ${remainingCarrion.length}`);
    console.log(`  🍽️ Total food eaten: ${totalFoodEaten}`);

    if (remainingCarrion.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const carrion = remainingCarrion[0] as any;
      console.log(
        `  📊 Carrion energy: ${carrion.currentEnergyValue.toFixed(1)}`
      );
      console.log(`  👃 Carrion scent: ${carrion.scent.toFixed(2)}`);
    }
  }
}

console.log("\n🎯 CARRION TEST RESULTS:");
console.log("========================");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const finalCarrion = Array.from(allEntities.values()).filter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: any) => e.type === EntityType.Carrion
);
const finalFoodEaten = livingCreatures.reduce(
  (sum, c) => sum + c.stats.foodEaten,
  0
);

console.log(`🦴 Final carrion count: ${finalCarrion.length}`);
console.log(`🍽️ Total food consumed: ${finalFoodEaten}`);
console.log(
  `✅ Carrion system: ${
    finalCarrion.length === 0 && finalFoodEaten > 0 ? "WORKING" : "NEEDS DEBUG"
  }`
);

if (finalCarrion.length > 0) {
  console.log("🔍 Remaining carrion details:");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  finalCarrion.forEach((carrion: any, i: number) => {
    console.log(
      `   ${i + 1}. Energy: ${carrion.currentEnergyValue.toFixed(1)}, Decay: ${(
        carrion.currentDecayStage * 100
      ).toFixed(1)}%`
    );
  });
}

console.log("\n🦴 CARRION TEST COMPLETE!");
