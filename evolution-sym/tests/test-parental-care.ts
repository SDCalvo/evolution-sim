/**
 * Test: Parental Care System - r-strategy vs K-strategy Trade-offs
 * This test demonstrates how evolutionary strategies balance quantity vs quality
 */

import {
  ParentalCareHelper,
  StrategyAnalyzer,
} from "../src/lib/creatures/parentalCare";
import {
  GeneticsHelper,
  CreatureGenetics,
  CreatureStats,
} from "../src/lib/creatures/creatureTypes";

console.log("🧬 TESTING: Parental Care System - r-strategy vs K-strategy\n");

// Create two extreme strategies for comparison
const rStrategyGenetics: CreatureGenetics = {
  ...GeneticsHelper.generateRandomGenetics(),
  parentalCare: 0.1, // Low care = many cheap offspring
  maturityAge: 60, // Early reproduction
  lifespan: 1000,
  reproductionCost: 25,
};

const kStrategyGenetics: CreatureGenetics = {
  ...GeneticsHelper.generateRandomGenetics(),
  parentalCare: 0.9, // High care = few quality offspring
  maturityAge: 120, // Later reproduction
  lifespan: 1000,
  reproductionCost: 45,
};

console.log("📊 STRATEGY COMPARISON:\n");

// Analyze both strategies
const comparison = StrategyAnalyzer.compareStrategies(
  rStrategyGenetics,
  kStrategyGenetics
);

console.log("🐰 R-STRATEGY (Many offspring, low investment):");
console.log(`  - Strategy: ${comparison.rStrategy.strategy}`);
console.log(
  `  - Total lifetime offspring: ${comparison.rStrategy.totalOffspring}`
);
console.log(
  `  - Survival rate: ${(
    comparison.rStrategy.survival.survivalToMaturity * 100
  ).toFixed(1)}%`
);
console.log(
  `  - Effective offspring: ${comparison.rStrategy.effectiveOffspring.toFixed(
    1
  )}`
);
console.log(`  - Description: ${comparison.rStrategy.description}`);
console.log(`  - Survival: ${comparison.rStrategy.survival.description}\n`);

console.log("🦘 K-STRATEGY (Few offspring, high investment):");
console.log(`  - Strategy: ${comparison.kStrategy.strategy}`);
console.log(
  `  - Total lifetime offspring: ${comparison.kStrategy.totalOffspring}`
);
console.log(
  `  - Survival rate: ${(
    comparison.kStrategy.survival.survivalToMaturity * 100
  ).toFixed(1)}%`
);
console.log(
  `  - Effective offspring: ${comparison.kStrategy.effectiveOffspring.toFixed(
    1
  )}`
);
console.log(`  - Description: ${comparison.kStrategy.description}`);
console.log(`  - Survival: ${comparison.kStrategy.survival.description}\n`);

console.log("🎯 EVOLUTIONARY PREDICTION:");
console.log(`${comparison.prediction}\n`);

console.log("⚖️ TRADE-OFF DEMONSTRATION:\n");

// Test reproduction at different life stages (give K-strategy enough energy)
const stats: CreatureStats = {
  energy: 100,
  health: 100,
  age: 0,
  generation: 0,
  ticksAlive: 0,
  foodEaten: 0,
  feedingAttempts: 0,
  distanceTraveled: 0,
  attacksReceived: 0,
  attacksGiven: 0,
  reproductionAttempts: 0,
  offspring: 0,
  fitness: 0,
  thoughtHistory: [],
};

console.log("🔬 REPRODUCTION COMPARISON:");
const rReproduction = ParentalCareHelper.calculateReproduction(
  rStrategyGenetics,
  stats
);
const kReproduction = ParentalCareHelper.calculateReproduction(
  kStrategyGenetics,
  stats
);

console.log("r-strategy reproduction event:");
console.log(`  - Offspring count: ${rReproduction.offspringCount}`);
console.log(`  - Energy cost: ${rReproduction.energyCost.toFixed(1)}`);
console.log(
  `  - Child starting energy: ${rReproduction.offspringStartingEnergy.toFixed(
    1
  )}`
);
console.log(
  `  - Child starting health: ${rReproduction.offspringStartingHealth.toFixed(
    1
  )}`
);
console.log(
  `  - Reproduction cooldown: ${rReproduction.reproductionCooldown} ticks\n`
);

console.log("K-strategy reproduction event:");
console.log(`  - Offspring count: ${kReproduction.offspringCount}`);
console.log(`  - Energy cost: ${kReproduction.energyCost.toFixed(1)}`);
console.log(
  `  - Child starting energy: ${kReproduction.offspringStartingEnergy.toFixed(
    1
  )}`
);
console.log(
  `  - Child starting health: ${kReproduction.offspringStartingHealth.toFixed(
    1
  )}`
);
console.log(
  `  - Reproduction cooldown: ${kReproduction.reproductionCooldown} ticks\n`
);

console.log("📈 ENVIRONMENTAL ADAPTATION TESTING:\n");

// Test how optimal strategy changes with environment
const environments = [
  {
    name: "High Predation",
    conditions: {
      foodAbundance: 0.7,
      predationPressure: 0.9,
      populationDensity: 0.5,
      resourceStability: 0.3,
    },
  },
  {
    name: "Resource Scarcity",
    conditions: {
      foodAbundance: 0.2,
      predationPressure: 0.4,
      populationDensity: 0.8,
      resourceStability: 0.6,
    },
  },
  {
    name: "Stable Paradise",
    conditions: {
      foodAbundance: 0.9,
      predationPressure: 0.1,
      populationDensity: 0.3,
      resourceStability: 0.9,
    },
  },
  {
    name: "Crowded Competition",
    conditions: {
      foodAbundance: 0.5,
      predationPressure: 0.3,
      populationDensity: 0.9,
      resourceStability: 0.7,
    },
  },
];

environments.forEach((env) => {
  const optimal = ParentalCareHelper.analyzeOptimalStrategy(env.conditions);
  const strategyType =
    optimal.optimalParentalCare < 0.3
      ? "r-strategy"
      : optimal.optimalParentalCare > 0.7
      ? "K-strategy"
      : "balanced";

  console.log(`🌍 ${env.name}:`);
  console.log(
    `  - Optimal parental care: ${(optimal.optimalParentalCare * 100).toFixed(
      1
    )}% (${strategyType})`
  );
  console.log(`  - Reasoning: ${optimal.reasoning}\n`);
});

console.log("💡 KEY INSIGHTS:\n");
console.log(
  '1. r-strategy: "Spray and pray" - many offspring, some survive harsh conditions'
);
console.log(
  '2. K-strategy: "Quality investment" - fewer offspring, better survival rates'
);
console.log(
  "3. Environment determines optimal strategy - no single approach always wins"
);
console.log("4. Trade-off creates evolutionary balance and species diversity");
console.log(
  "5. High predation favors r-strategy, resource competition favors K-strategy\n"
);

console.log("✅ PARENTAL CARE SYSTEM TEST COMPLETE!");
console.log(
  'This system prevents "more children is always better" by implementing biological trade-offs.'
);
