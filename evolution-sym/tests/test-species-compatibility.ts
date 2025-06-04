/**
 * Test: Species Compatibility Investigation
 * This test investigates why all creatures are being marked as "same_species=false"
 * despite being from the same bootstrap generation.
 */

import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BootstrapBrainFactory } from "../src/lib/creatures/bootstrapBrains";
import { Creature } from "../src/lib/creatures/creature";

console.log("🧬 SPECIES COMPATIBILITY INVESTIGATION");
console.log("=====================================");

// Test 1: Check genetic distances between bootstrap creatures
console.log("\n🔬 TEST 1: Bootstrap Creature Genetic Distances");
console.log("================================================");

const testCreatures: Creature[] = [];
for (let i = 0; i < 5; i++) {
  const genetics = GeneticsHelper.generateRandomGenetics();
  const creature = new Creature(0, genetics);
  testCreatures.push(creature);

  console.log(`Creature ${i + 1}:`);
  console.log(
    `  Size: ${genetics.size.toFixed(3)}, Speed: ${genetics.speed.toFixed(
      3
    )}, Aggression: ${genetics.aggression.toFixed(3)}`
  );
  console.log(
    `  Plant Pref: ${genetics.plantPreference.toFixed(
      3
    )}, Meat Pref: ${genetics.meatPreference.toFixed(3)}`
  );
  console.log(
    `  Maturity: ${genetics.maturityAge.toFixed(
      1
    )}, Lifespan: ${genetics.lifespan.toFixed(1)}`
  );
}

console.log("\n📊 Pairwise Genetic Distances:");
console.log("==============================");

let totalDistances = 0;
let pairCount = 0;
let sameSpeciesPairs = 0;

for (let i = 0; i < testCreatures.length; i++) {
  for (let j = i + 1; j < testCreatures.length; j++) {
    const distance = GeneticsHelper.calculateGeneticDistance(
      testCreatures[i].genetics,
      testCreatures[j].genetics
    );
    const sameSpecies = testCreatures[i].isSameSpecies(testCreatures[j]);

    console.log(
      `  Creature ${i + 1} ↔ Creature ${j + 1}: distance=${distance.toFixed(
        3
      )} same_species=${sameSpecies ? "✅" : "❌"}`
    );

    totalDistances += distance;
    pairCount++;
    if (sameSpecies) sameSpeciesPairs++;
  }
}

const averageDistance = totalDistances / pairCount;
const sameSpeciesRate = (sameSpeciesPairs / pairCount) * 100;

console.log(`\n📈 Summary:`);
console.log(`  Average genetic distance: ${averageDistance.toFixed(3)}`);
console.log(`  Current species threshold: 0.3`);
console.log(
  `  Same species pairs: ${sameSpeciesPairs}/${pairCount} (${sameSpeciesRate.toFixed(
    1
  )}%)`
);

// Test 2: Analysis of individual trait contributions
console.log("\n🔍 TEST 2: Trait Contribution Analysis");
console.log("======================================");

if (testCreatures.length >= 2) {
  const c1 = testCreatures[0].genetics;
  const c2 = testCreatures[1].genetics;

  console.log(`Analyzing distance between Creature 1 and Creature 2:`);

  const traitContributions = [
    { name: "Size", value: Math.pow(c1.size - c2.size, 2) },
    { name: "Speed", value: Math.pow(c1.speed - c2.speed, 2) },
    { name: "Efficiency", value: Math.pow(c1.efficiency - c2.efficiency, 2) },
    { name: "Aggression", value: Math.pow(c1.aggression - c2.aggression, 2) },
    {
      name: "Sociability",
      value: Math.pow(c1.sociability - c2.sociability, 2),
    },
    { name: "Curiosity", value: Math.pow(c1.curiosity - c2.curiosity, 2) },
    {
      name: "Vision Range",
      value: Math.pow(c1.visionRange - c2.visionRange, 2),
    },
    {
      name: "Vision Acuity",
      value: Math.pow(c1.visionAcuity - c2.visionAcuity, 2),
    },
    {
      name: "Plant Preference",
      value: Math.pow(c1.plantPreference - c2.plantPreference, 2),
    },
    {
      name: "Meat Preference",
      value: Math.pow(c1.meatPreference - c2.meatPreference, 2),
    },
    {
      name: "Maturity Age (norm)",
      value: Math.pow((c1.maturityAge - c2.maturityAge) / 100, 2),
    },
    {
      name: "Lifespan (norm)",
      value: Math.pow((c1.lifespan - c2.lifespan) / 1000, 2),
    },
    {
      name: "Reproduction Cost (norm)",
      value: Math.pow((c1.reproductionCost - c2.reproductionCost) / 30, 2),
    },
    {
      name: "Parental Care",
      value: Math.pow(c1.parentalCare - c2.parentalCare, 2),
    },
  ];

  traitContributions.sort((a, b) => b.value - a.value);

  const totalSquaredDistance = traitContributions.reduce(
    (sum, trait) => sum + trait.value,
    0
  );
  const finalDistance = Math.sqrt(totalSquaredDistance);

  console.log(`\n📊 Trait contributions (sorted by impact):`);
  traitContributions.forEach((trait, index) => {
    const percentage = (trait.value / totalSquaredDistance) * 100;
    console.log(
      `  ${index + 1}. ${trait.name}: ${trait.value.toFixed(
        4
      )} (${percentage.toFixed(1)}%)`
    );
  });

  console.log(
    `\n🎯 Final distance: √${totalSquaredDistance.toFixed(
      4
    )} = ${finalDistance.toFixed(3)}`
  );

  // 🔧 FIXED: Show the actual compatibility logic being used
  const creature1 = testCreatures[0];
  const creature2 = testCreatures[1];
  const actualCompatibility = creature1.isSameSpecies(creature2);

  console.log(`\n🧬 COMPATIBILITY ANALYSIS:`);
  console.log(
    `  Generation 1: ${creature1.generation}, Generation 2: ${creature2.generation}`
  );

  if (creature1.generation === 0 && creature2.generation === 0) {
    console.log(`  ✅ COMPATIBLE: Both are Generation 0 (bootstrap founders)`);
    console.log(
      `  📝 Note: Bootstrap creatures are always compatible to ensure initial reproduction`
    );
  } else {
    const generationDiff = Math.abs(
      creature1.generation - creature2.generation
    );
    if (generationDiff <= 2) {
      console.log(
        `  ✅ COMPATIBLE: Within 2 generations (diff: ${generationDiff})`
      );
    } else if (finalDistance < 0.8) {
      console.log(
        `  ✅ COMPATIBLE: Genetic distance ${finalDistance.toFixed(
          3
        )} < 0.8 threshold`
      );
    } else {
      console.log(
        `  ❌ INCOMPATIBLE: Genetic distance ${finalDistance.toFixed(
          3
        )} >= 0.8 threshold`
      );
    }
  }

  console.log(
    `🚪 Final species compatibility: ${
      actualCompatibility ? "✅ SAME SPECIES" : "❌ DIFFERENT SPECIES"
    }`
  );
  console.log(
    `🔬 Pure genetic distance (ignoring generation): ${finalDistance.toFixed(
      3
    )} vs 0.3 threshold = ${
      finalDistance < 0.3 ? "✅ COMPATIBLE" : "❌ INCOMPATIBLE"
    }`
  );
  console.log(
    `🔬 Pure genetic distance (ignoring generation): ${finalDistance.toFixed(
      3
    )} vs 1.2 threshold = ${
      finalDistance < 1.2 ? "✅ COMPATIBLE" : "❌ INCOMPATIBLE"
    }`
  );
}

// Test 3: Determine optimal species threshold
console.log("\n🎯 TEST 3: Optimal Species Threshold Analysis");
console.log("=============================================");

const thresholds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const thresholdResults = thresholds.map((threshold) => {
  let sameSpeciesCount = 0;
  for (let i = 0; i < testCreatures.length; i++) {
    for (let j = i + 1; j < testCreatures.length; j++) {
      const distance = GeneticsHelper.calculateGeneticDistance(
        testCreatures[i].genetics,
        testCreatures[j].genetics
      );
      if (distance < threshold) sameSpeciesCount++;
    }
  }
  return {
    threshold,
    sameSpeciesRate: (sameSpeciesCount / pairCount) * 100,
    sameSpeciesCount,
  };
});

console.log(`Threshold analysis for ${pairCount} creature pairs:`);
thresholdResults.forEach((result) => {
  console.log(
    `  Threshold ${result.threshold}: ${
      result.sameSpeciesCount
    }/${pairCount} pairs (${result.sameSpeciesRate.toFixed(1)}%) same species`
  );
});

// Find recommended threshold (should allow ~50-80% compatibility for random creatures)
const recommendedThreshold = thresholdResults.find(
  (r) => r.sameSpeciesRate >= 50 && r.sameSpeciesRate <= 80
);
if (recommendedThreshold) {
  console.log(
    `\n💡 RECOMMENDED: Use threshold ${
      recommendedThreshold.threshold
    } for ~${recommendedThreshold.sameSpeciesRate.toFixed(1)}% compatibility`
  );
} else {
  console.log(
    `\n💡 RECOMMENDED: Current threshold too strict, consider 0.5-0.8 range`
  );
}

// Test 4: Test with identical genetics (should always be same species)
console.log("\n🔬 TEST 4: Identical Genetics Test");
console.log("==================================");

const baseGenetics = GeneticsHelper.generateRandomGenetics();
const identicalCreature1 = new Creature(0, { ...baseGenetics });
const identicalCreature2 = new Creature(0, { ...baseGenetics });

const identicalDistance = GeneticsHelper.calculateGeneticDistance(
  identicalCreature1.genetics,
  identicalCreature2.genetics
);
const identicalSameSpecies =
  identicalCreature1.isSameSpecies(identicalCreature2);

console.log(`Identical genetics distance: ${identicalDistance.toFixed(6)}`);
console.log(
  `Same species result: ${identicalSameSpecies ? "✅ CORRECT" : "❌ BROKEN"}`
);

// ⭐ NEW: Test 5: Mixed Generation Compatibility
console.log("\n🔬 TEST 5: Mixed Generation Compatibility Test");
console.log("==============================================");

// Create creatures from different generations to test full logic
const gen0Creature = new Creature(0, GeneticsHelper.generateRandomGenetics());
const gen1Creature = new Creature(1, GeneticsHelper.generateRandomGenetics());
const gen5Creature = new Creature(5, GeneticsHelper.generateRandomGenetics());

const testPairs = [
  { name: "Gen 0 ↔ Gen 0", c1: gen0Creature, c2: testCreatures[0] },
  { name: "Gen 0 ↔ Gen 1", c1: gen0Creature, c2: gen1Creature },
  { name: "Gen 1 ↔ Gen 5", c1: gen1Creature, c2: gen5Creature },
];

console.log("Testing different generation combinations:");
testPairs.forEach((pair) => {
  const distance = GeneticsHelper.calculateGeneticDistance(
    pair.c1.genetics,
    pair.c2.genetics
  );
  const compatible = pair.c1.isSameSpecies(pair.c2);
  const genDiff = Math.abs(pair.c1.generation - pair.c2.generation);

  console.log(
    `  ${pair.name}: distance=${distance.toFixed(
      3
    )}, genDiff=${genDiff}, compatible=${compatible ? "✅" : "❌"}`
  );

  // Explain why compatible/incompatible
  if (pair.c1.generation === 0 && pair.c2.generation === 0) {
    console.log(`    → Bootstrap founders (always compatible)`);
  } else if (genDiff <= 2) {
    console.log(`    → Within 2 generations (always compatible)`);
  } else if (distance < 1.2) {
    console.log(`    → Genetic distance < 1.2 threshold`);
  } else {
    console.log(`    → Genetic distance >= 1.2 threshold (incompatible)`);
  }
});

console.log("\n💡 KEY INSIGHTS:");
console.log(
  "  • Generation 0 creatures are ALWAYS compatible (bootstrap founders)"
);
console.log(
  "  • Creatures within 2 generations are ALWAYS compatible (family lines)"
);
console.log("  • Distant generations use genetic distance with 1.2 threshold");
console.log(
  "  • This ensures initial reproduction while allowing speciation over time"
);

console.log("\n🎯 FINAL DIAGNOSIS:");
console.log("==================");
if (averageDistance > 0.3) {
  console.log(
    "❌ ISSUE CONFIRMED: Species threshold (0.3) too strict for random genetics"
  );
  console.log(
    `💡 SOLUTION: Increase threshold to ~${(averageDistance * 1.2).toFixed(
      1
    )} or implement generation-based compatibility`
  );
} else {
  console.log("✅ Species threshold appears reasonable");
  console.log("🔍 Issue may be elsewhere in reproduction logic");
}

if (sameSpeciesRate < 20) {
  console.log(
    "🚨 CRITICAL: <20% same-species rate will prevent all reproduction!"
  );
} else if (sameSpeciesRate < 50) {
  console.log(
    "⚠️ WARNING: Low same-species rate may severely limit reproduction"
  );
} else {
  console.log("✅ Same-species rate acceptable for healthy reproduction");
}
