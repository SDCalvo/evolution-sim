/**
 * Debug Bootstrap Brain Outputs
 * Let's see what values our "minimum viable" brains actually output
 */

import { BootstrapBrainFactory } from "../src/lib/creatures/bootstrapBrains";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";

function testBootstrapBrainOutputs() {
  console.log("🧠 BOOTSTRAP BRAIN DEBUG TEST");
  console.log("===============================");

  // Create a typical creature genetics
  const genetics = GeneticsHelper.generateRandomGenetics();
  const brain = BootstrapBrainFactory.createFounderBrain(genetics);

  console.log(`📋 Brain Architecture: ${brain.describe()}`);

  // Test Scenario 1: Hungry creature with food nearby
  console.log("\n🍎 SCENARIO 1: Hungry with food nearby");
  const hungryScenario = [
    0.2, // foodDistance (close)
    0.8, // foodType (plant)
    1.0, // carrionDistance (none)
    0.0, // carrionFreshness (none)
    1.0, // predatorDistance (safe)
    1.0, // preyDistance (none)
    0.2, // energyLevel (low!)
    1.0, // healthLevel (good)
    0.3, // ageLevel (young)
    0.3, // populationDensity (moderate)
    1.0, // visionForward (clear)
    1.0, // visionLeft (clear)
    1.0, // visionRight (clear)
    1.0, // visionBack (clear)
  ];

  const hungryOutput = brain.process(hungryScenario);
  console.log(
    `Input: energy=${hungryScenario[6]}, foodDist=${hungryScenario[0]}`
  );
  console.log(
    `Output: [moveX=${hungryOutput[0].toFixed(
      3
    )}, moveY=${hungryOutput[1].toFixed(3)}, eat=${hungryOutput[2].toFixed(
      3
    )}, attack=${hungryOutput[3].toFixed(
      3
    )}, reproduce=${hungryOutput[4].toFixed(3)}]`
  );
  console.log(
    `🍽️ Will eat? ${hungryOutput[2] > 0.3 ? "YES" : "NO"} (threshold: 0.3)`
  );

  // Test Scenario 2: High energy, mature creature (should reproduce)
  console.log("\n💕 SCENARIO 2: High energy, mature creature");
  const matureScenario = [
    1.0, // foodDistance (far)
    0.5, // foodType (neutral)
    1.0, // carrionDistance (none)
    0.0, // carrionFreshness (none)
    1.0, // predatorDistance (safe)
    1.0, // preyDistance (none)
    0.9, // energyLevel (high!)
    1.0, // healthLevel (good)
    0.8, // ageLevel (mature!)
    0.3, // populationDensity (moderate)
    1.0, // visionForward (clear)
    1.0, // visionLeft (clear)
    1.0, // visionRight (clear)
    1.0, // visionBack (clear)
  ];

  const matureOutput = brain.process(matureScenario);
  console.log(`Input: energy=${matureScenario[6]}, age=${matureScenario[8]}`);
  console.log(
    `Output: [moveX=${matureOutput[0].toFixed(
      3
    )}, moveY=${matureOutput[1].toFixed(3)}, eat=${matureOutput[2].toFixed(
      3
    )}, attack=${matureOutput[3].toFixed(
      3
    )}, reproduce=${matureOutput[4].toFixed(3)}]`
  );
  console.log(
    `💕 Will reproduce? ${
      matureOutput[4] > 0.35 ? "YES" : "NO"
    } (threshold: 0.35)`
  );

  // Test Scenario 3: Fresh carrion nearby, hungry creature
  console.log("\n🦴 SCENARIO 3: Fresh carrion nearby, hungry");
  const carrionScenario = [
    1.0, // foodDistance (no regular food)
    0.5, // foodType (neutral)
    0.3, // carrionDistance (close!)
    0.9, // carrionFreshness (fresh!)
    1.0, // predatorDistance (safe)
    1.0, // preyDistance (none)
    0.3, // energyLevel (low)
    1.0, // healthLevel (good)
    0.3, // ageLevel (young)
    0.3, // populationDensity (moderate)
    1.0, // visionForward (clear)
    1.0, // visionLeft (clear)
    1.0, // visionRight (clear)
    1.0, // visionBack (clear)
  ];

  const carrionOutput = brain.process(carrionScenario);
  console.log(
    `Input: energy=${carrionScenario[6]}, carrionDist=${carrionScenario[2]}, freshness=${carrionScenario[3]}`
  );
  console.log(
    `Output: [moveX=${carrionOutput[0].toFixed(
      3
    )}, moveY=${carrionOutput[1].toFixed(3)}, eat=${carrionOutput[2].toFixed(
      3
    )}, attack=${carrionOutput[3].toFixed(
      3
    )}, reproduce=${carrionOutput[4].toFixed(3)}]`
  );
  console.log(
    `🦴 Will scavenge? ${
      carrionOutput[2] > 0.3 ? "YES" : "NO"
    } (threshold: 0.3)`
  );

  // Test Scenario 4: Predator nearby (should flee)
  console.log("\n⚠️ SCENARIO 4: Predator nearby");
  const dangerScenario = [
    1.0, // foodDistance (far)
    0.5, // foodType (neutral)
    1.0, // carrionDistance (none)
    0.0, // carrionFreshness (none)
    0.1, // predatorDistance (very close!)
    1.0, // preyDistance (none)
    0.5, // energyLevel (medium)
    1.0, // healthLevel (good)
    0.3, // ageLevel (young)
    0.3, // populationDensity (moderate)
    1.0, // visionForward (clear)
    1.0, // visionLeft (clear)
    1.0, // visionRight (clear)
    1.0, // visionBack (clear)
  ];

  const dangerOutput = brain.process(dangerScenario);
  console.log(`Input: predatorDist=${dangerScenario[4]} (DANGER!)`);
  console.log(
    `Output: [moveX=${dangerOutput[0].toFixed(
      3
    )}, moveY=${dangerOutput[1].toFixed(3)}, eat=${dangerOutput[2].toFixed(
      3
    )}, attack=${dangerOutput[3].toFixed(
      3
    )}, reproduce=${dangerOutput[4].toFixed(3)}]`
  );
  console.log(
    `🏃 Will flee? ${
      Math.abs(dangerOutput[0]) + Math.abs(dangerOutput[1]) > 0.2 ? "YES" : "NO"
    } (movement threshold: 0.2)`
  );

  console.log("\n🎯 ANALYSIS:");
  console.log(
    "If most outputs are near 0.5 (sigmoid default), the bootstrap rules aren't working properly."
  );
  console.log(
    "We should see strong responses (>0.7 or <0.3) for these survival scenarios."
  );
}

// Run the test
testBootstrapBrainOutputs();
