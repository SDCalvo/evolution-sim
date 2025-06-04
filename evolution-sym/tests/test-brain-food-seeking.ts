/**
 * Brain Food-Seeking Test
 *
 * Tests if the bootstrap brain logic actually makes creatures
 * move TOWARD food or AWAY from it.
 */

import { NeuralNetwork } from "../src/lib/neural/network";
import { BootstrapBrainFactory } from "../src/lib/creatures/bootstrapBrains";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";

async function testBrainFoodSeeking() {
  console.log("🧠 BRAIN FOOD-SEEKING LOGIC TEST");
  console.log("================================");

  // Create a bootstrap brain
  const genetics = GeneticsHelper.generateRandomGenetics();
  const brain = BootstrapBrainFactory.createFounderBrain(genetics);

  console.log("\n🍃 Testing food-seeking behavior:");

  // Test different food distance scenarios
  const scenarios = [
    { foodDist: 0.0, description: "Food very close (should move toward)" },
    { foodDist: 0.2, description: "Food nearby (should move toward)" },
    { foodDist: 0.5, description: "Food medium distance (should move toward)" },
    { foodDist: 0.8, description: "Food far away (should move toward)" },
    {
      foodDist: 1.0,
      description: "No food detected (should explore/move less)",
    },
  ];

  for (const scenario of scenarios) {
    console.log(`\n📍 ${scenario.description}:`);

    // Create sensor input with this food distance
    const sensorData = [
      scenario.foodDist, // [0] food distance
      0.5, // [1] food type (neutral)
      1.0, // [2] carrion distance (none)
      0.0, // [3] carrion freshness (none)
      1.0, // [4] predator distance (none)
      1.0, // [5] prey distance (none)
      0.6, // [6] energy level (moderate)
      0.8, // [7] health level (good)
      0.3, // [8] age level (young adult)
      0.2, // [9] population density (low)
      1.0, // [10] vision forward (clear)
      1.0, // [11] vision left (clear)
      1.0, // [12] vision right (clear)
      1.0, // [13] vision back (clear)
    ];

    // Get brain output
    const output = brain.process(sensorData);

    // Convert to actions (same logic as creature.ts)
    const actions = {
      moveX: output[0] * 2 - 1, // Convert 0-1 to -1 to +1
      moveY: output[1] * 2 - 1, // Convert 0-1 to -1 to +1
      eat: output[2], // Keep 0-1
      attack: output[3], // Keep 0-1
      reproduce: output[4], // Keep 0-1
    };

    const movementMagnitude = Math.sqrt(
      actions.moveX ** 2 + actions.moveY ** 2
    );

    console.log(`   Food distance: ${scenario.foodDist.toFixed(1)}`);
    console.log(`   Movement X: ${actions.moveX.toFixed(3)}`);
    console.log(`   Movement Y: ${actions.moveY.toFixed(3)}`);
    console.log(`   Movement magnitude: ${movementMagnitude.toFixed(3)}`);
    console.log(`   Eat action: ${actions.eat.toFixed(3)}`);

    if (scenario.foodDist < 0.5) {
      // Food is close - should have high movement toward it AND high eating
      if (movementMagnitude > 0.5 && actions.eat > 0.5) {
        console.log(`   ✅ CORRECT: Moving toward food AND trying to eat`);
      } else if (actions.eat > 0.5) {
        console.log(`   ⚠️  PARTIAL: Trying to eat but not moving much`);
      } else {
        console.log(
          `   ❌ WRONG: Food is close but creature not responding properly`
        );
      }
    } else {
      // Food is far/none - should have lower movement or exploration behavior
      if (movementMagnitude < 0.8) {
        console.log(`   ✅ REASONABLE: Lower movement when no food detected`);
      } else {
        console.log(
          `   ⚠️  HIGH MOVEMENT: Moving a lot when no food (could be exploration)`
        );
      }
    }
  }

  // Test energy-based eating behavior
  console.log(`\n⚡ Testing energy-based eating behavior:`);

  const energyScenarios = [
    { energy: 0.1, description: "Very low energy (critical)" },
    { energy: 0.3, description: "Low energy (hungry)" },
    { energy: 0.6, description: "Medium energy (okay)" },
    { energy: 0.9, description: "High energy (full)" },
  ];

  for (const scenario of energyScenarios) {
    const sensorData = [
      0.2, // [0] food distance (food nearby)
      0.5, // [1] food type (neutral)
      1.0, // [2] carrion distance (none)
      0.0, // [3] carrion freshness (none)
      1.0, // [4] predator distance (none)
      1.0, // [5] prey distance (none)
      scenario.energy, // [6] energy level (varies)
      0.8, // [7] health level (good)
      0.3, // [8] age level (young adult)
      0.2, // [9] population density (low)
      1.0, // [10] vision forward (clear)
      1.0, // [11] vision left (clear)
      1.0, // [12] vision right (clear)
      1.0, // [13] vision back (clear)
    ];

    const output = brain.process(sensorData);
    const eatAction = output[2];

    console.log(
      `   ${scenario.description}: Eat action = ${eatAction.toFixed(3)}`
    );

    if (scenario.energy < 0.4 && eatAction > 0.6) {
      console.log(`     ✅ CORRECT: Low energy → high eating desire`);
    } else if (scenario.energy > 0.8 && eatAction < 0.4) {
      console.log(`     ✅ CORRECT: High energy → low eating desire`);
    } else if (scenario.energy < 0.4 && eatAction < 0.4) {
      console.log(`     ❌ WRONG: Creature starving but not trying to eat!`);
    } else {
      console.log(
        `     ⚠️  NEUTRAL: Energy level ${scenario.energy.toFixed(
          1
        )} → eat ${eatAction.toFixed(1)}`
      );
    }
  }

  console.log(`\n💡 DIAGNOSIS:`);
  console.log(`   The bootstrap brain creates basic survival behavior,`);
  console.log(`   but the food-seeking movement logic may be inverted.`);
  console.log(`   Creatures might move MORE when they DON'T see food,`);
  console.log(`   causing them to wander away from food sources!`);
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBrainFoodSeeking()
    .then(() => {
      console.log("\n✅ Test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}
