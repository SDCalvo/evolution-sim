/**
 * Simple Test: Parental Care System - r-strategy vs K-strategy Trade-offs
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

console.log("🧬 PARENTAL CARE SYSTEM - r-strategy vs K-strategy\n");

// Create two extreme strategies
const rStrategy: CreatureGenetics = {
  ...GeneticsHelper.generateRandomGenetics(),
  parentalCare: 0.1, // Low care = many cheap offspring
  maturityAge: 60,
  lifespan: 1000,
  reproductionCost: 25,
};

const kStrategy: CreatureGenetics = {
  ...GeneticsHelper.generateRandomGenetics(),
  parentalCare: 0.9, // High care = few quality offspring
  maturityAge: 120,
  lifespan: 1000,
  reproductionCost: 45,
};

// Compare strategies
const comparison = StrategyAnalyzer.compareStrategies(rStrategy, kStrategy);

console.log("🐰 R-STRATEGY (Quantity):");
console.log(`  - Total offspring: ${comparison.rStrategy.totalOffspring}`);
console.log(
  `  - Survival rate: ${(
    comparison.rStrategy.survival.survivalToMaturity * 100
  ).toFixed(1)}%`
);
console.log(
  `  - Effective offspring: ${comparison.rStrategy.effectiveOffspring.toFixed(
    1
  )}\n`
);

console.log("🦘 K-STRATEGY (Quality):");
console.log(`  - Total offspring: ${comparison.kStrategy.totalOffspring}`);
console.log(
  `  - Survival rate: ${(
    comparison.kStrategy.survival.survivalToMaturity * 100
  ).toFixed(1)}%`
);
console.log(
  `  - Effective offspring: ${comparison.kStrategy.effectiveOffspring.toFixed(
    1
  )}\n`
);

console.log(`🎯 PREDICTION: ${comparison.prediction}\n`);

// Test reproduction
const stats: CreatureStats = {
  energy: 80,
  health: 90,
  age: 100,
  generation: 1,
  ticksAlive: 100,
  foodEaten: 5,
  feedingAttempts: 8,
  distanceTraveled: 200,
  attacksReceived: 1,
  attacksGiven: 0,
  reproductionAttempts: 2,
  offspring: 1,
  fitness: 25,
  thoughtHistory: [],
};

const rReproduction = ParentalCareHelper.calculateReproduction(
  rStrategy,
  stats
);
const kReproduction = ParentalCareHelper.calculateReproduction(
  kStrategy,
  stats
);

console.log("🔬 REPRODUCTION COMPARISON:");
console.log(
  `r-strategy: ${
    rReproduction.offspringCount
  } children, ${rReproduction.energyCost.toFixed(1)} energy cost`
);
console.log(
  `K-strategy: ${
    kReproduction.offspringCount
  } children, ${kReproduction.energyCost.toFixed(1)} energy cost\n`
);

console.log("💡 KEY INSIGHT:");
console.log(
  'This system prevents "more children is always better" by implementing biological trade-offs!'
);
console.log("r-strategy: Many cheap children (some survive harsh conditions)");
console.log(
  "K-strategy: Few expensive children (higher individual survival rates)"
);
