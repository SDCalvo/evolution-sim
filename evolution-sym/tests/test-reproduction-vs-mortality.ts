/**
 * 🔬 REPRODUCTION VS MORTALITY BALANCE TEST
 *
 * Analyzing why population keeps growing despite high mortality rates
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import {
  PRESET_BIOMES,
  BiomeType,
} from "../src/lib/environment/environmentTypes";

console.log("🔬 REPRODUCTION VS MORTALITY BALANCE TEST");
console.log("=".repeat(60));

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
    mortalityRate: 0.05, // EVEN MORE AGGRESSIVE!
    resourceScaling: 0.85,
  },
});

// Add creatures to test overpopulation
for (let i = 0; i < 350; i++) {
  const position = {
    x: 950 + (Math.random() - 0.5) * 100,
    y: 950 + (Math.random() - 0.5) * 100,
  };
  const genetics = GeneticsHelper.generateRandomGenetics();
  const creature = new Creature(i, genetics, undefined, position);
  env.addCreature(creature);
}

console.log(`🚀 Starting with ${env.getCreatures().length} creatures`);
console.log(
  `🎯 Target: 300, Current overpopulation: ${env.getCreatures().length - 300}`
);

// Track detailed statistics
let birthCount = 0;
let deathCount = 0;
const tickData: any[] = [];

// Monkey patch to count births and deaths
const originalAddCreature = env.addCreature.bind(env);
const originalRemoveCreature = env.removeCreature.bind(env);

env.addCreature = function (creature: Creature) {
  birthCount++;
  return originalAddCreature(creature);
};

env.removeCreature = function (creatureId: string) {
  deathCount++;
  return originalRemoveCreature(creatureId);
};

// Run simulation
for (let tick = 0; tick < 30; tick++) {
  const preUpdatePop = env.getCreatures().length;
  const preBirths = birthCount;
  const preDeaths = deathCount;

  env.update();

  const postUpdatePop = env.getCreatures().length;
  const tickBirths = birthCount - preBirths;
  const tickDeaths = deathCount - preDeaths;
  const netChange = postUpdatePop - preUpdatePop;

  tickData.push({
    tick,
    population: postUpdatePop,
    births: tickBirths,
    deaths: tickDeaths,
    netChange,
    overpopulation: Math.max(0, postUpdatePop - 300),
  });

  if (tick % 5 === 0) {
    console.log(
      `   Tick ${tick}: Pop ${postUpdatePop} (+${tickBirths} births, -${tickDeaths} deaths, net: ${
        netChange >= 0 ? "+" : ""
      }${netChange})`
    );
  }
}

console.log("\n" + "=".repeat(60));
console.log("📊 DETAILED ANALYSIS:");
console.log("=".repeat(60));

const finalPop = env.getCreatures().length;
const totalBirths = birthCount;
const totalDeaths = deathCount;
const netChange = finalPop - 350;

console.log(`🏁 Final population: ${finalPop} creatures`);
console.log(`👶 Total births: ${totalBirths}`);
console.log(`💀 Total deaths: ${totalDeaths}`);
console.log(
  `📈 Net change: ${netChange >= 0 ? "+" : ""}${netChange} creatures`
);
console.log(
  `📊 Birth/Death ratio: ${(totalBirths / Math.max(1, totalDeaths)).toFixed(2)}`
);

// Calculate overpopulation mortality chance
const overpopulation = Math.max(0, finalPop - 300);
const overpopulationRatio = overpopulation / 300;
const mortalityChance = 0.05 * Math.pow(overpopulationRatio, 2);
const expectedDeathsPerTick = finalPop * mortalityChance;

console.log(`\n🔬 MORTALITY ANALYSIS:`);
console.log(`   Overpopulation: ${overpopulation} creatures`);
console.log(`   Overpopulation ratio: ${overpopulationRatio.toFixed(3)}`);
console.log(
  `   Mortality chance per creature: ${(mortalityChance * 100).toFixed(4)}%`
);
console.log(`   Expected deaths per tick: ${expectedDeathsPerTick.toFixed(2)}`);
console.log(`   Actual deaths per tick: ${(totalDeaths / 30).toFixed(2)}`);

// Show trend
console.log(`\n📈 POPULATION TREND:`);
tickData.slice(0, 10).forEach((data) => {
  console.log(
    `   Tick ${data.tick}: ${data.population} creatures (${data.births}B, ${
      data.deaths
    }D, ${data.netChange >= 0 ? "+" : ""}${data.netChange})`
  );
});

if (finalPop > 350) {
  console.log(
    `\n🚨 CRITICAL ISSUE: Population grew despite 0.05 mortality rate!`
  );
  console.log(`🔧 DIAGNOSIS: Reproduction rate > mortality rate`);
  console.log(
    `💡 SOLUTION: Either increase mortality or reduce reproduction rate`
  );
} else if (finalPop < 250) {
  console.log(`\n✅ Mortality rate too aggressive, population collapsed`);
} else {
  console.log(`\n🎯 Population stabilized in acceptable range!`);
}

console.log("=".repeat(60));
