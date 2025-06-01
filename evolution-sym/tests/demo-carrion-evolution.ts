/**
 * 🦴 CARRION EVOLUTION SPECTACULAR! 🦴
 *
 * This demo showcases the complete digital scavenger evolution system:
 * - Creatures with different dietary preferences (carnivores vs herbivores)
 * - Natural death creating carrion with decay mechanics
 * - AI brains detecting and consuming carrion based on meat preference
 * - Evolutionary advantage for scavengers in environments with frequent death
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { Simulation } from "../src/lib/simulation/simulation";
import { EntityType } from "../src/lib/environment/environmentTypes";
import {
  GeneticsHelper,
  CreatureState,
} from "../src/lib/creatures/creatureTypes";

console.log("🦴🧬 CARRION EVOLUTION SPECTACULAR! 🧬🦴");
console.log("===========================================");
console.log("Watch as digital scavengers evolve to exploit the dead!");
console.log("🎭 This simulation demonstrates:");
console.log("   🥩 Carnivorous scavengers vs 🌱 herbivorous creatures");
console.log("   💀 Natural death creating carrion feeding opportunities");
console.log("   🧠 AI brains making scavenging decisions based on genetics");
console.log("   🦴 Complete carrion decay system with scent-based detection");
console.log(
  "   📈 Evolutionary advantage for creatures with high meat preference"
);

// Create environment optimized for scavenger evolution
const environment = new Environment({
  bounds: {
    width: 600,
    height: 600,
    shape: "circular",
    centerX: 300,
    centerY: 300,
    radius: 300,
  },
  maxCreatures: 40,
  maxFood: 80,
});

// Create diverse population with different dietary strategies
const creatures: Creature[] = [];
let scavengerCount = 0;
let herbivoreCount = 0;
let omnivoreCount = 0;

console.log("\n👥 SPAWNING DIVERSE POPULATION:");
console.log("===============================");

for (let i = 0; i < 20; i++) {
  const genetics = GeneticsHelper.generateRandomGenetics();

  if (i < 7) {
    // Pure scavengers - high meat preference
    genetics.meatPreference = 0.8 + Math.random() * 0.2; // 80-100%
    genetics.plantPreference = 0.0 + Math.random() * 0.2; // 0-20%
    genetics.aggression = 0.5 + Math.random() * 0.4; // More aggressive
    genetics.visionRange = 1.2 + Math.random() * 0.8; // Better vision
    scavengerCount++;

    console.log(
      `🥩 Scavenger ${scavengerCount}: Meat=${(
        genetics.meatPreference * 100
      ).toFixed(0)}%, Plant=${(genetics.plantPreference * 100).toFixed(
        0
      )}%, Vision=${genetics.visionRange.toFixed(1)}`
    );
  } else if (i < 14) {
    // Pure herbivores - high plant preference
    genetics.plantPreference = 0.8 + Math.random() * 0.2; // 80-100%
    genetics.meatPreference = 0.0 + Math.random() * 0.2; // 0-20%
    genetics.aggression = 0.0 + Math.random() * 0.3; // Less aggressive
    genetics.sociability = 0.5 + Math.random() * 0.5; // More social
    herbivoreCount++;

    console.log(
      `🌱 Herbivore ${herbivoreCount}: Plant=${(
        genetics.plantPreference * 100
      ).toFixed(0)}%, Meat=${(genetics.meatPreference * 100).toFixed(
        0
      )}%, Social=${genetics.sociability.toFixed(1)}`
    );
  } else {
    // Balanced omnivores
    genetics.plantPreference = 0.4 + Math.random() * 0.2; // 40-60%
    genetics.meatPreference = 0.4 + Math.random() * 0.2; // 40-60%
    genetics.curiosity = 0.6 + Math.random() * 0.4; // More curious
    omnivoreCount++;

    console.log(
      `🔄 Omnivore ${omnivoreCount}: Plant=${(
        genetics.plantPreference * 100
      ).toFixed(0)}%, Meat=${(genetics.meatPreference * 100).toFixed(
        0
      )}%, Curiosity=${genetics.curiosity.toFixed(1)}`
    );
  }

  const creature = new Creature(0, genetics);
  creatures.push(creature);
  environment.addCreature(creature);
}

console.log(
  `\n📊 Population composition: ${scavengerCount} scavengers, ${herbivoreCount} herbivores, ${omnivoreCount} omnivores`
);

// Create simulation
const simulation = new Simulation({ environment });

// Force some early deaths to create initial carrion opportunities
console.log("\n💀 CREATING INITIAL CARRION OPPORTUNITIES:");
console.log("==========================================");

let initialCarrion = 0;
for (let i = 0; i < 3; i++) {
  const victim = creatures[10 + i]; // Kill some herbivores initially
  victim.physics.health = 0;
  victim.state = CreatureState.Dead;

  console.log(
    `💀 ${victim.id.substring(0, 12)} died (Plant pref: ${(
      victim.genetics.plantPreference * 100
    ).toFixed(0)}%)`
  );
  initialCarrion++;
}

console.log(
  `🦴 ${initialCarrion} fresh carrion pieces created for scavenger opportunities`
);

// Track carrion and feeding statistics
let tickCount = 0;
let maxCarrionSeen = 0;

console.log("\n🏃‍♂️ RUNNING SCAVENGER EVOLUTION SIMULATION:");
console.log("============================================");

// Run extended simulation to observe scavenging behavior
for (let tick = 1; tick <= 200; tick++) {
  simulation.step();
  tickCount++;

  if (tick % 25 === 0) {
    const stats = environment.getStats();
    const livingCreatures = environment.getCreatures();

    // Count different creature types still alive
    const aliveScavengers = livingCreatures.filter(
      (c) => c.genetics.meatPreference > 0.6
    );
    const aliveHerbivores = livingCreatures.filter(
      (c) => c.genetics.plantPreference > 0.6
    );
    const aliveOmnivores = livingCreatures.filter(
      (c) =>
        c.genetics.plantPreference > 0.3 &&
        c.genetics.meatPreference > 0.3 &&
        Math.abs(c.genetics.plantPreference - c.genetics.meatPreference) < 0.3
    );

    // Check carrion status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allEntities = (environment as any).entities;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentCarrion = Array.from(allEntities.values())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((e: any) => e.type === EntityType.Carrion);
    maxCarrionSeen = Math.max(maxCarrionSeen, currentCarrion.length);

    // Analyze feeding success by diet type
    const scavengerFeeding = aliveScavengers.reduce(
      (sum, c) => sum + c.stats.foodEaten,
      0
    );
    const herbivoreFeeding = aliveHerbivores.reduce(
      (sum, c) => sum + c.stats.foodEaten,
      0
    );
    const omnivoreFeeding = aliveOmnivores.reduce(
      (sum, c) => sum + c.stats.foodEaten,
      0
    );

    console.log(`\n📊 Tick ${tick} Evolution Report:`);
    console.log(
      `   👥 Population: ${livingCreatures.length} (🥩${aliveScavengers.length} 🌱${aliveHerbivores.length} 🔄${aliveOmnivores.length})`
    );
    console.log(`   🦴 Active carrion: ${currentCarrion.length} pieces`);
    console.log(`   🍃 Regular food: ${stats.totalFood} items`);
    console.log(
      `   🍽️ Feeding success: Scavengers=${scavengerFeeding}, Herbivores=${herbivoreFeeding}, Omnivores=${omnivoreFeeding}`
    );

    // Calculate survival rates
    const scavengerSurvival = (
      (aliveScavengers.length / scavengerCount) *
      100
    ).toFixed(1);
    const herbivoreSurvival = (
      (aliveHerbivores.length / herbivoreCount) *
      100
    ).toFixed(1);
    const omnivoreSurvival = (
      (aliveOmnivores.length / omnivoreCount) *
      100
    ).toFixed(1);

    console.log(
      `   📈 Survival rates: Scavengers=${scavengerSurvival}%, Herbivores=${herbivoreSurvival}%, Omnivores=${omnivoreSurvival}%`
    );

    // Show top performers
    const topPerformer = livingCreatures.reduce((best, current) =>
      current.stats.fitness > best.stats.fitness ? current : best
    );
    console.log(
      `   🏆 Top performer: Fitness=${topPerformer.stats.fitness.toFixed(
        1
      )}, Food=${topPerformer.stats.foodEaten}, Meat pref=${(
        topPerformer.genetics.meatPreference * 100
      ).toFixed(0)}%`
    );

    // Look for evidence of carrion consumption
    if (currentCarrion.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const freshCarrion = currentCarrion.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => c.currentDecayStage < 0.3
      ).length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rottingCarrion = currentCarrion.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => c.currentDecayStage > 0.7
      ).length;
      console.log(
        `   🦴 Carrion status: ${freshCarrion} fresh, ${
          currentCarrion.length - freshCarrion - rottingCarrion
        } aging, ${rottingCarrion} rotting`
      );
    }
  }
}

console.log("\n🧬 FINAL EVOLUTION ANALYSIS:");
console.log("============================");

const finalCreatures = environment.getCreatures();
const finalScavengers = finalCreatures.filter(
  (c) => c.genetics.meatPreference > 0.6
);
const finalHerbivores = finalCreatures.filter(
  (c) => c.genetics.plantPreference > 0.6
);
const finalOmnivores = finalCreatures.filter(
  (c) =>
    c.genetics.plantPreference > 0.3 &&
    c.genetics.meatPreference > 0.3 &&
    Math.abs(c.genetics.plantPreference - c.genetics.meatPreference) < 0.3
);

console.log(
  `👥 Final population: ${finalCreatures.length}/${creatures.length} creatures survived`
);
console.log(
  `🥩 Scavengers: ${finalScavengers.length}/${scavengerCount} (${(
    (finalScavengers.length / scavengerCount) *
    100
  ).toFixed(1)}% survival)`
);
console.log(
  `🌱 Herbivores: ${finalHerbivores.length}/${herbivoreCount} (${(
    (finalHerbivores.length / herbivoreCount) *
    100
  ).toFixed(1)}% survival)`
);
console.log(
  `🔄 Omnivores: ${finalOmnivores.length}/${omnivoreCount} (${(
    (finalOmnivores.length / omnivoreCount) *
    100
  ).toFixed(1)}% survival)`
);

// Analyze feeding efficiency
const totalScavengerFeeding = finalScavengers.reduce(
  (sum, c) => sum + c.stats.foodEaten,
  0
);
const totalHerbivoreFeeding = finalHerbivores.reduce(
  (sum, c) => sum + c.stats.foodEaten,
  0
);
const totalOmnivoreFeeding = finalOmnivores.reduce(
  (sum, c) => sum + c.stats.foodEaten,
  0
);

const avgScavengerFeeding =
  finalScavengers.length > 0
    ? totalScavengerFeeding / finalScavengers.length
    : 0;
const avgHerbivoreFeeding =
  finalHerbivores.length > 0
    ? totalHerbivoreFeeding / finalHerbivores.length
    : 0;
const avgOmnivoreFeeding =
  finalOmnivores.length > 0 ? totalOmnivoreFeeding / finalOmnivores.length : 0;

console.log(`\n🍽️ FEEDING EFFICIENCY ANALYSIS:`);
console.log(
  `   Scavengers: ${totalScavengerFeeding} total food (${avgScavengerFeeding.toFixed(
    1
  )} avg per survivor)`
);
console.log(
  `   Herbivores: ${totalHerbivoreFeeding} total food (${avgHerbivoreFeeding.toFixed(
    1
  )} avg per survivor)`
);
console.log(
  `   Omnivores: ${totalOmnivoreFeeding} total food (${avgOmnivoreFeeding.toFixed(
    1
  )} avg per survivor)`
);

// Analyze genetic traits of survivors
if (finalScavengers.length > 0) {
  const avgScavengerMeat =
    finalScavengers.reduce((sum, c) => sum + c.genetics.meatPreference, 0) /
    finalScavengers.length;
  const avgScavengerVision =
    finalScavengers.reduce((sum, c) => sum + c.genetics.visionRange, 0) /
    finalScavengers.length;
  console.log(`\n🥩 SURVIVING SCAVENGER TRAITS:`);
  console.log(
    `   Average meat preference: ${(avgScavengerMeat * 100).toFixed(1)}%`
  );
  console.log(`   Average vision range: ${avgScavengerVision.toFixed(2)}`);
}

// Final carrion system status
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const finalCarrion = Array.from((environment as any).entities.values())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .filter((e: any) => e.type === EntityType.Carrion);

console.log(`\n🦴 CARRION SYSTEM PERFORMANCE:`);
console.log(`   Maximum carrion seen simultaneously: ${maxCarrionSeen}`);
console.log(`   Final carrion remaining: ${finalCarrion.length}`);
console.log(`   Total simulation ticks: ${tickCount}`);

// Determine evolutionary winner
let evolutionaryWinner = "DRAW";
if (
  finalScavengers.length > finalHerbivores.length &&
  finalScavengers.length > finalOmnivores.length
) {
  evolutionaryWinner = "SCAVENGERS";
} else if (
  finalHerbivores.length > finalScavengers.length &&
  finalHerbivores.length > finalOmnivores.length
) {
  evolutionaryWinner = "HERBIVORES";
} else if (
  finalOmnivores.length > finalScavengers.length &&
  finalOmnivores.length > finalHerbivores.length
) {
  evolutionaryWinner = "OMNIVORES";
}

console.log(`\n🏆 EVOLUTIONARY OUTCOME: ${evolutionaryWinner} STRATEGY WINS!`);

if (totalScavengerFeeding > totalHerbivoreFeeding) {
  console.log(
    `🦴 Carrion scavenging proved to be a successful evolutionary strategy!`
  );
} else {
  console.log(
    `🌱 Traditional plant-based feeding remained dominant in this environment.`
  );
}

console.log(`\n🎉 CARRION EVOLUTION SPECTACULAR COMPLETE! 🎉`);
console.log(
  `The digital scavengers have shown us the power of exploiting the dead! 🦴🧬`
);
