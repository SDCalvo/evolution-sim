/**
 * 🎯 SWEET SPOT TEST - Testing aggressive mortality rate 0.02
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import {
  PRESET_BIOMES,
  BiomeType,
} from "../src/lib/environment/environmentTypes";

console.log("🎯 SWEET SPOT TEST - Aggressive Mortality Rate 0.02");
console.log("=" .repeat(60));

// Create environment with aggressive mortality rate
const env = new Environment({
  bounds: {
    width: 2000,
    height: 2000,
    shape: "circular",
    centerX: 1000,
    centerY: 1000,
    radius: 1000,
  },
  biome: PRESET_BIOMES[BiomeType.Grassland],
  maxCreatures: 600,
  maxFood: 800,
  carryingCapacity: {
    targetPopulation: 300,
    maxPopulation: 400,
    densityStressFactor: 0.0005,
    mortalityRate: 0.02, // AGGRESSIVE RATE!
    resourceScaling: 0.85,
  },
});

// Add creatures to test overpopulation
for (let i = 0; i < 400; i++) {
  const position = {
    x: 950 + (Math.random() - 0.5) * 100,
    y: 950 + (Math.random() - 0.5) * 100,
  };
  const genetics = GeneticsHelper.generateRandomGenetics();
  const creature = new Creature(i, genetics, undefined, position);
  env.addCreature(creature);
}

const initialCount = env.getCreatures().length;
console.log(`🚀 Starting with ${initialCount} creatures (target: 300)`);

// Run for 50 ticks to see population reduction
const populations: number[] = [];
for (let tick = 0; tick < 50; tick++) {
  env.update();
  const currentPop = env.getCreatures().length;
  populations.push(currentPop);
  
  if (tick % 10 === 0) {
    console.log(`   Tick ${tick}: ${currentPop} creatures`);
  }
}

const finalCount = env.getCreatures().length;
const reduction = initialCount - finalCount;
const reductionPercent = (reduction / initialCount * 100).toFixed(1);

console.log("\n" + "=" .repeat(60));
console.log("📊 RESULTS:");
console.log("=" .repeat(60));
console.log(`🏁 Final population: ${finalCount} creatures`);
console.log(`📉 Reduction: ${reduction} creatures (${reductionPercent}%)`);

// Check if we hit the sweet spot
const inSweetSpot = finalCount >= 250 && finalCount <= 300;
const error = Math.abs(finalCount - 300);
const errorPercent = (error / 300 * 100).toFixed(1);

console.log(`🎯 Target range: 250-300 creatures`);
console.log(`${inSweetSpot ? "✅" : "❌"} Sweet spot achieved: ${inSweetSpot}`);
console.log(`📏 Error from target (300): ${error} creatures (${errorPercent}%)`);

if (inSweetSpot) {
  console.log("🎉 SUCCESS! We hit the 250-300 sweet spot!");
} else if (finalCount > 300) {
  console.log(`🔧 Still too high. Need higher mortality rate (current: 0.02)`);
} else {
  console.log(`🔧 Too aggressive! Need lower mortality rate (current: 0.02)`);
}

console.log("=" .repeat(60)); 