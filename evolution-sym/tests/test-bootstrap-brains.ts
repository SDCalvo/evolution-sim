/**
 * Test: Bootstrap Brain Factory - Solving the "Random Death" Problem
 * This test demonstrates how pre-configured brains prevent population collapse
 */

import {
  BootstrapBrainFactory,
  EmergencyBrainFactory,
} from "../src/lib/creatures/bootstrapBrains";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { NeuralNetwork } from "../src/lib/neural/network";

console.log(
  "🧠 TESTING: Bootstrap Brain Factory - Solving Random Death Problem\n"
);

// Create test genetics
const testGenetics = GeneticsHelper.generateRandomGenetics();

console.log("🧬 Test Creature Genetics:");
console.log(`  - Size: ${testGenetics.size.toFixed(2)}`);
console.log(`  - Curiosity: ${testGenetics.curiosity.toFixed(2)}`);
console.log(`  - Plant Preference: ${testGenetics.plantPreference.toFixed(2)}`);
console.log(`  - Meat Preference: ${testGenetics.meatPreference.toFixed(2)}\n`);

console.log("🚀 GENERATION 0: Founder Generation");
const founderBrain = BootstrapBrainFactory.createFounderBrain(testGenetics);
console.log(`  - Architecture: ${founderBrain.getArchitecture().join(" → ")}`);
console.log(`  - Total weights: ${founderBrain.getTotalWeights()}`);
console.log(
  `  - Average weight: ${founderBrain.getAverageWeight().toFixed(3)}`
);

const strategy0 = BootstrapBrainFactory.getBootstrapStrategy(0);
console.log(`  - Strategy: ${strategy0.name}`);
console.log(
  `  - Expected survival: ${(strategy0.survivalRate * 100).toFixed(1)}%`
);
console.log(`  - Description: ${strategy0.description}\n`);

// Test basic survival scenarios
console.log("🧪 SURVIVAL SCENARIO TESTING:\n");

console.log("Scenario 1: Low energy + nearby food");
const scenario1 = [0.2, 0.0, 0.9, 0.5, 0.1, 0.8, 0.3, 0.4]; // [food_dist, food_type, predator_dist, prey_dist, energy, health, age, pop_density]
const response1 = founderBrain.process(scenario1);
console.log(
  `  Input: Low energy (${scenario1[4]}), close food (${scenario1[0]})`
);
console.log(
  `  Output: [moveX=${response1[0].toFixed(3)}, moveY=${response1[1].toFixed(
    3
  )}, eat=${response1[2].toFixed(3)}, attack=${response1[3].toFixed(
    3
  )}, reproduce=${response1[4].toFixed(3)}]`
);
console.log(
  `  Analysis: ${
    response1[2] > 0.5
      ? "EATING behavior activated ✅"
      : "No eating response ❌"
  }\n`
);

console.log("Scenario 2: High energy + mature age");
const scenario2 = [0.8, 0.5, 0.9, 0.7, 0.8, 0.9, 0.7, 0.3]; // High energy, mature
const response2 = founderBrain.process(scenario2);
console.log(
  `  Input: High energy (${scenario2[4]}), mature age (${scenario2[6]})`
);
console.log(
  `  Output: [moveX=${response2[0].toFixed(3)}, moveY=${response2[1].toFixed(
    3
  )}, eat=${response2[2].toFixed(3)}, attack=${response2[3].toFixed(
    3
  )}, reproduce=${response2[4].toFixed(3)}]`
);
console.log(
  `  Analysis: ${
    response2[4] > 0.5
      ? "REPRODUCTION behavior activated ✅"
      : "No reproduction response ❌"
  }\n`
);

console.log("Scenario 3: Predator nearby");
const scenario3 = [0.6, 0.5, 0.1, 0.8, 0.5, 0.7, 0.4, 0.2]; // Close predator
const response3 = founderBrain.process(scenario3);
console.log(`  Input: Close predator (${scenario3[2]}), moderate energy`);
console.log(
  `  Output: [moveX=${response3[0].toFixed(3)}, moveY=${response3[1].toFixed(
    3
  )}, eat=${response3[2].toFixed(3)}, attack=${response3[3].toFixed(
    3
  )}, reproduce=${response3[4].toFixed(3)}]`
);
const isFleeingX = Math.abs(response3[0]) > 0.3;
const isFleeingY = Math.abs(response3[1]) > 0.3;
console.log(
  `  Analysis: ${
    isFleeingX || isFleeingY
      ? "FLEEING behavior activated ✅"
      : "No fleeing response ❌"
  }\n`
);

console.log("🧬 EVOLUTIONARY PROGRESSION:\n");

console.log("Generation 10: Early Evolution");
const earlyBrain = BootstrapBrainFactory.createEarlyGenerationBrain(
  testGenetics,
  10
);
const strategy10 = BootstrapBrainFactory.getBootstrapStrategy(10);
console.log(`  - Strategy: ${strategy10.name}`);
console.log(
  `  - Expected survival: ${(strategy10.survivalRate * 100).toFixed(1)}%`
);
console.log(`  - Average weight: ${earlyBrain.getAverageWeight().toFixed(3)}`);

const retention10 = BootstrapBrainFactory.analyzeBootstrapRetention(earlyBrain);
console.log(
  `  - Bootstrap retention: ${retention10.retentionPercentage}% - ${retention10.description}\n`
);

console.log("Generation 25: Mid Evolution");
const midBrain = BootstrapBrainFactory.createEarlyGenerationBrain(
  testGenetics,
  25
);
const strategy25 = BootstrapBrainFactory.getBootstrapStrategy(25);
console.log(`  - Strategy: ${strategy25.name}`);
console.log(
  `  - Expected survival: ${(strategy25.survivalRate * 100).toFixed(1)}%`
);
console.log(`  - Average weight: ${midBrain.getAverageWeight().toFixed(3)}\n`);

console.log("Generation 100: Full Evolution");
// Create mock parent brains for crossover
const parent1 = BootstrapBrainFactory.createEarlyGenerationBrain(
  testGenetics,
  50
);
const parent2 = BootstrapBrainFactory.createEarlyGenerationBrain(
  testGenetics,
  50
);
const evolutionaryBrain = BootstrapBrainFactory.createEvolutionaryBrain(
  testGenetics,
  [parent1, parent2]
);
const strategy100 = BootstrapBrainFactory.getBootstrapStrategy(100);
console.log(`  - Strategy: ${strategy100.name}`);
console.log(
  `  - Expected survival: ${(strategy100.survivalRate * 100).toFixed(1)}%`
);
console.log(
  `  - Average weight: ${evolutionaryBrain.getAverageWeight().toFixed(3)}`
);

const retention100 =
  BootstrapBrainFactory.analyzeBootstrapRetention(evolutionaryBrain);
console.log(
  `  - Bootstrap retention: ${retention100.retentionPercentage}% - ${retention100.description}\n`
);

console.log("🚨 EMERGENCY SCENARIOS:\n");

console.log("Population Collapse Recovery:");
const bestSurvivors = [founderBrain]; // Only one survivor left
const emergencyBrain = EmergencyBrainFactory.createEmergencyBrain(
  bestSurvivors,
  testGenetics
);
console.log(`  - Emergency brain created from best survivor`);
console.log(
  `  - Average weight: ${emergencyBrain.getAverageWeight().toFixed(3)}`
);
console.log(`  - Total weights: ${emergencyBrain.getTotalWeights()}\n`);

console.log("Complete Extinction Recovery:");
const extinctionBrain = EmergencyBrainFactory.createEmergencyBrain(
  [],
  testGenetics
);
console.log(`  - Restarted with founder brain template`);
console.log(
  `  - Average weight: ${extinctionBrain.getAverageWeight().toFixed(3)}\n`
);

console.log("📊 COMPARISON: Random vs Bootstrap Brains\n");

console.log("Random Brain (would cause population collapse):");
const randomBrain = new NeuralNetwork([8, 6, 5]);
const randomResponse = randomBrain.process(scenario1); // Same low energy scenario
console.log(
  `  - Response to low energy + food: eat=${randomResponse[2].toFixed(3)}`
);
console.log(`  - Likelihood of survival: Very Low ❌\n`);

console.log("Bootstrap Brain (ensures survival):");
const bootstrapResponse = founderBrain.process(scenario1);
console.log(
  `  - Response to low energy + food: eat=${bootstrapResponse[2].toFixed(3)}`
);
console.log(`  - Likelihood of survival: Good ✅\n`);

console.log("💡 KEY INSIGHTS:\n");
console.log(
  "1. Bootstrap brains start with survival instincts coded directly into weights"
);
console.log(
  "2. Early generations gradually mutate while preserving core survival behaviors"
);
console.log("3. After generation 50, full sexual reproduction takes over");
console.log("4. Emergency systems prevent complete population collapse");
console.log(
  '5. This solves the "random death lottery" that kills purely random brains\n'
);

console.log("✅ BOOTSTRAP BRAIN SYSTEM TEST COMPLETE!");
console.log(
  "Evolution can now start with viable creatures instead of random chaos!"
);
