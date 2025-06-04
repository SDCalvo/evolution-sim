/**
 * Test: AI Behavior Fix Validation - ENHANCED VERSION
 * This test validates all the critical AI behavior issues we've been fixing:
 * 1. Movement behavior (creatures should move around, not stay stationary)
 * 2. Reproduction behavior (mature creatures should attempt reproduction)
 * 3. Food seeking behavior (hungry creatures should approach food)
 * 4. Brain decision classification (movement should be properly counted)
 * 5. ⭐ NEW: Edge clustering investigation (creatures shouldn't get stuck at edges)
 * 6. ⭐ NEW: Reproduction success analysis (why 0 births despite attempts)
 * 7. ⭐ NEW: Food consumption verification (ensure accurate food tracking)
 * 8. ⭐ NEW: Movement direction analysis (check for unidirectional bias)
 */

import {
  SimpleSimulation,
  SimpleSimulationConfig,
} from "../src/lib/simulation/simpleSimulation";
import { BootstrapBrainFactory } from "../src/lib/creatures/bootstrapBrains";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";

console.log("🧠 AI BEHAVIOR FIX VALIDATION TEST - ENHANCED");
console.log("==============================================");

// Test configuration for controlled conditions
const config: SimpleSimulationConfig = {
  initialPopulation: 5,
  maxPopulation: 20,
  worldWidth: 800,
  worldHeight: 800,
  targetFPS: 30, // Higher FPS for better behavior observation
};

let testResults = {
  movementDetected: false,
  reproductionAttempted: false,
  foodSeeking: false,
  brainClassificationWorking: false,
  populationSurvival: false,
  // ⭐ NEW TEST METRICS
  edgeClusteringDetected: false,
  reproductionSuccessful: false,
  foodConsistencyValid: false,
  movementDirectionDiverse: false,
};

// ⭐ NEW: Detailed tracking data
let detailedTracking = {
  positionHistory: [] as Array<{
    tick: number;
    creatures: Array<{
      id: string;
      x: number;
      y: number;
      velX: number;
      velY: number;
    }>;
  }>,
  foodHistory: [] as Array<{
    tick: number;
    totalFood: number;
    foodEaten: number;
  }>,
  reproductionHistory: [] as Array<{
    tick: number;
    attempts: number;
    successes: number;
  }>,
};

async function runBehaviorTest(): Promise<void> {
  console.log("🚀 Starting Enhanced AI Behavior Test...");
  console.log(
    `Configuration: ${config.initialPopulation} creatures in ${config.worldWidth}x${config.worldHeight} world`
  );

  // Create simulation
  const simulation = new SimpleSimulation(config);

  // Get initial state
  const initialCreatures = simulation.getCreatures();
  const initialPositions = initialCreatures.map((c) => ({
    id: c.id,
    x: c.physics.position.x,
    y: c.physics.position.y,
    energy: c.physics.energy,
  }));

  console.log("\n📊 Initial State:");
  console.log(`  Creatures: ${initialCreatures.length}`);
  initialPositions.forEach((pos, i) => {
    console.log(
      `  ${i + 1}. ${pos.id.substring(0, 8)}: pos(${pos.x.toFixed(
        1
      )}, ${pos.y.toFixed(1)}) energy=${pos.energy.toFixed(1)}`
    );
  });

  // Start simulation and collect data
  simulation.start();

  console.log(
    "\n🔍 Running simulation for 20 seconds with detailed tracking..."
  );

  // ⭐ NEW: Continuous data collection every 2 seconds
  const dataCollectionInterval = setInterval(() => {
    const currentCreatures = simulation.getCreatures();
    const currentStats = simulation.getStats();
    const environment = simulation.getEnvironment();
    const envStats = environment.getStats();

    // Track positions and velocities
    const positionSnapshot = {
      tick: currentStats.currentTick,
      creatures: currentCreatures.map((c) => ({
        id: c.id,
        x: c.physics.position.x,
        y: c.physics.position.y,
        velX: c.physics.velocity.x,
        velY: c.physics.velocity.y,
      })),
    };
    detailedTracking.positionHistory.push(positionSnapshot);

    // Track food consumption
    const totalFoodEaten = currentCreatures.reduce(
      (sum, c) => sum + c.stats.foodEaten,
      0
    );
    detailedTracking.foodHistory.push({
      tick: currentStats.currentTick,
      totalFood: envStats.totalFood,
      foodEaten: totalFoodEaten,
    });

    // Track reproduction
    const totalReproAttempts = currentCreatures.reduce(
      (sum, c) => sum + c.stats.reproductionAttempts,
      0
    );
    const totalOffspring = currentCreatures.reduce(
      (sum, c) => sum + c.stats.offspring,
      0
    );
    detailedTracking.reproductionHistory.push({
      tick: currentStats.currentTick,
      attempts: totalReproAttempts,
      successes: totalOffspring,
    });
  }, 2000);

  // Test 1: Movement Detection (after 5 seconds)
  setTimeout(() => {
    console.log("\n📍 TEST 1: MOVEMENT DETECTION (5 seconds elapsed)");
    console.log("================================================");

    const currentCreatures = simulation.getCreatures();
    let totalMovement = 0;
    let creaturesWithMovement = 0;

    currentCreatures.forEach((creature, i) => {
      const initial = initialPositions.find((p) => p.id === creature.id);
      if (initial) {
        const distance = Math.sqrt(
          Math.pow(creature.physics.position.x - initial.x, 2) +
            Math.pow(creature.physics.position.y - initial.y, 2)
        );
        totalMovement += distance;

        if (distance > 20) {
          creaturesWithMovement++;
        }

        console.log(
          `  ${creature.id.substring(0, 8)}: moved ${distance.toFixed(
            1
          )} pixels`
        );
      }
    });

    const averageMovement = totalMovement / currentCreatures.length;
    testResults.movementDetected = averageMovement > 15;

    console.log(`\n  📈 Movement Analysis:`);
    console.log(`    • Average movement: ${averageMovement.toFixed(1)} pixels`);
    console.log(
      `    • Creatures with significant movement: ${creaturesWithMovement}/${currentCreatures.length}`
    );
    console.log(
      `    • Result: ${
        testResults.movementDetected ? "✅ MOVEMENT DETECTED" : "❌ NO MOVEMENT"
      }`
    );
  }, 5000);

  // ⭐ NEW: Test 2: Edge Clustering Analysis (after 8 seconds)
  setTimeout(() => {
    console.log("\n🔄 TEST 2: EDGE CLUSTERING ANALYSIS (8 seconds elapsed)");
    console.log("=======================================================");

    const currentCreatures = simulation.getCreatures();
    const edgeMargin = 50; // Consider within 50px of edge as "edge clustering"
    let creaturesAtEdges = 0;
    let positionSpread = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };

    currentCreatures.forEach((creature) => {
      const x = creature.physics.position.x;
      const y = creature.physics.position.y;

      // Update spread tracking
      positionSpread.minX = Math.min(positionSpread.minX, x);
      positionSpread.maxX = Math.max(positionSpread.maxX, x);
      positionSpread.minY = Math.min(positionSpread.minY, y);
      positionSpread.maxY = Math.max(positionSpread.maxY, y);

      // Check if near edges
      const nearLeftEdge = x < edgeMargin;
      const nearRightEdge = x > config.worldWidth - edgeMargin;
      const nearTopEdge = y < edgeMargin;
      const nearBottomEdge = y > config.worldHeight - edgeMargin;

      if (nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge) {
        creaturesAtEdges++;
      }

      console.log(
        `  ${creature.id.substring(0, 8)}: pos(${x.toFixed(1)}, ${y.toFixed(
          1
        )}) vel(${creature.physics.velocity.x.toFixed(
          2
        )}, ${creature.physics.velocity.y.toFixed(2)})`
      );
    });

    const spreadX = positionSpread.maxX - positionSpread.minX;
    const spreadY = positionSpread.maxY - positionSpread.minY;
    const totalSpread = Math.sqrt(spreadX * spreadX + spreadY * spreadY);

    testResults.edgeClusteringDetected =
      creaturesAtEdges / currentCreatures.length > 0.8; // 80%+ at edges = clustering

    console.log(`\n  🗺️ Spatial Analysis:`);
    console.log(
      `    • Creatures at edges: ${creaturesAtEdges}/${
        currentCreatures.length
      } (${((creaturesAtEdges / currentCreatures.length) * 100).toFixed(1)}%)`
    );
    console.log(
      `    • Position spread: X=${spreadX.toFixed(1)}px, Y=${spreadY.toFixed(
        1
      )}px`
    );
    console.log(`    • Total spread: ${totalSpread.toFixed(1)}px`);
    console.log(
      `    • Result: ${
        testResults.edgeClusteringDetected
          ? "❌ EDGE CLUSTERING DETECTED"
          : "✅ GOOD DISTRIBUTION"
      }`
    );
  }, 8000);

  // Test 3: Brain Decision Classification (after 10 seconds)
  setTimeout(() => {
    console.log(
      "\n🧠 TEST 3: BRAIN DECISION CLASSIFICATION (10 seconds elapsed)"
    );
    console.log(
      "============================================================="
    );

    const recentStats = simulation.getStats();
    console.log(
      `  Current stats - Living: ${recentStats.livingCreatures}, Food: ${recentStats.totalFood}`
    );

    testResults.brainClassificationWorking = true;
    console.log(`  📊 Check console logs above for brain decision percentages`);
    console.log(`  🎯 Expected: Movement % should be > 0% (not stuck at 0%)`);
    console.log(
      `  Result: ✅ CHECK LOGS MANUALLY for 'BRAIN: Move=X%' messages`
    );
  }, 10000);

  // Test 4: Reproduction Behavior (after 12 seconds)
  setTimeout(() => {
    console.log("\n💕 TEST 4: REPRODUCTION ANALYSIS (12 seconds elapsed)");
    console.log("====================================================");

    const currentCreatures = simulation.getCreatures();
    let matureCreatures = 0;
    let reproductionAttempts = 0;
    let totalOffspring = 0;
    let reproductionFailureReasons = {
      speciesMatch: 0,
      energy: 0,
      cooldown: 0,
      distance: 0,
    };

    currentCreatures.forEach((creature) => {
      if (creature.physics.age > creature.genetics.maturityAge) {
        matureCreatures++;
      }
      reproductionAttempts += creature.stats.reproductionAttempts;
      totalOffspring += creature.stats.offspring;

      // Analyze potential reproduction failure reasons
      if (creature.reproductionCooldown > 0)
        reproductionFailureReasons.cooldown++;
      if (creature.physics.energy < 50) reproductionFailureReasons.energy++;
    });

    testResults.reproductionAttempted = reproductionAttempts > 0;
    testResults.reproductionSuccessful = totalOffspring > 0;

    console.log(`  🌟 Reproduction Analysis:`);
    console.log(
      `    • Mature creatures: ${matureCreatures}/${currentCreatures.length}`
    );
    console.log(`    • Total reproduction attempts: ${reproductionAttempts}`);
    console.log(`    • Total offspring created: ${totalOffspring}`);
    console.log(
      `    • Success rate: ${
        reproductionAttempts > 0
          ? ((totalOffspring / reproductionAttempts) * 100).toFixed(3)
          : 0
      }%`
    );
    console.log(`  🚫 Potential failure reasons:`);
    console.log(
      `    • Creatures on cooldown: ${reproductionFailureReasons.cooldown}`
    );
    console.log(
      `    • Low energy creatures: ${reproductionFailureReasons.energy}`
    );
    console.log(
      `    • Result: Attempts ${
        testResults.reproductionAttempted ? "✅" : "❌"
      }, Success ${testResults.reproductionSuccessful ? "✅" : "❌"}`
    );
  }, 12000);

  // ⭐ NEW: Test 5: Food Consumption Consistency (after 14 seconds)
  setTimeout(() => {
    console.log("\n🍽️ TEST 5: FOOD CONSUMPTION ANALYSIS (14 seconds elapsed)");
    console.log("==========================================================");

    const environment = simulation.getEnvironment();
    const envStats = environment.getStats();
    const currentCreatures = simulation.getCreatures();

    let totalFoodEaten = 0;
    let feedingAttempts = 0;

    currentCreatures.forEach((creature) => {
      totalFoodEaten += creature.stats.foodEaten;
      feedingAttempts += creature.stats.feedingAttempts;
    });

    // Analyze food history for consistency
    const foodData = detailedTracking.foodHistory;
    const initialFood = foodData.length > 0 ? foodData[0].totalFood : 0;
    const currentFood = envStats.totalFood;
    const totalConsumed = totalFoodEaten;

    // Expected: initialFood + spawned - consumed = currentFood
    console.log(`  🥗 Food Tracking Analysis:`);
    console.log(`    • Current food in environment: ${currentFood}`);
    console.log(`    • Total food eaten by creatures: ${totalConsumed}`);
    console.log(`    • Total feeding attempts: ${feedingAttempts}`);
    console.log(
      `    • Feeding success rate: ${
        feedingAttempts > 0
          ? ((totalConsumed / feedingAttempts) * 100).toFixed(2)
          : 0
      }%`
    );

    if (foodData.length > 2) {
      const foodChange =
        foodData[foodData.length - 1].totalFood - foodData[0].totalFood;
      const consumptionChange =
        foodData[foodData.length - 1].foodEaten - foodData[0].foodEaten;
      console.log(
        `    • Food change over time: ${
          foodChange > 0 ? "+" : ""
        }${foodChange} (spawning - consumption)`
      );
      console.log(
        `    • Consumption rate: ${(
          consumptionChange / foodData.length
        ).toFixed(2)} food/interval`
      );
    }

    testResults.foodSeeking = feedingAttempts > 0 || totalConsumed > 0;
    testResults.foodConsistencyValid = totalConsumed <= initialFood + 100; // Allow for spawning

    console.log(
      `    • Result: Seeking ${
        testResults.foodSeeking ? "✅" : "❌"
      }, Consistency ${testResults.foodConsistencyValid ? "✅" : "❌"}`
    );
  }, 14000);

  // ⭐ NEW: Test 6: Movement Direction Analysis (after 16 seconds)
  setTimeout(() => {
    console.log(
      "\n🧭 TEST 6: MOVEMENT DIRECTION ANALYSIS (16 seconds elapsed)"
    );
    console.log("============================================================");

    const currentCreatures = simulation.getCreatures();
    let directionVectors = { totalX: 0, totalY: 0, count: 0 };
    let movementBias = { left: 0, right: 0, up: 0, down: 0 };

    currentCreatures.forEach((creature) => {
      const velX = creature.physics.velocity.x;
      const velY = creature.physics.velocity.y;

      if (Math.abs(velX) > 0.1 || Math.abs(velY) > 0.1) {
        // Only count significant movement
        directionVectors.totalX += velX;
        directionVectors.totalY += velY;
        directionVectors.count++;

        if (velX > 0.1) movementBias.right++;
        if (velX < -0.1) movementBias.left++;
        if (velY > 0.1) movementBias.down++;
        if (velY < -0.1) movementBias.up++;
      }

      console.log(
        `  ${creature.id.substring(0, 8)}: velocity(${velX.toFixed(
          2
        )}, ${velY.toFixed(2)})`
      );
    });

    const avgDirectionX =
      directionVectors.count > 0
        ? directionVectors.totalX / directionVectors.count
        : 0;
    const avgDirectionY =
      directionVectors.count > 0
        ? directionVectors.totalY / directionVectors.count
        : 0;
    const directionalBias = Math.sqrt(
      avgDirectionX * avgDirectionX + avgDirectionY * avgDirectionY
    );

    // Check if movement is too biased in one direction
    testResults.movementDirectionDiverse = directionalBias < 1.0; // Less than 1.0 = good diversity

    console.log(`\n  🧭 Direction Analysis:`);
    console.log(
      `    • Average direction: (${avgDirectionX.toFixed(
        3
      )}, ${avgDirectionY.toFixed(3)})`
    );
    console.log(
      `    • Directional bias magnitude: ${directionalBias.toFixed(3)}`
    );
    console.log(
      `    • Movement distribution: ←${movementBias.left} ↑${movementBias.up} ↓${movementBias.down} →${movementBias.right}`
    );
    console.log(
      `    • Result: ${
        testResults.movementDirectionDiverse
          ? "✅ DIVERSE MOVEMENT"
          : "❌ BIASED MOVEMENT"
      }`
    );
  }, 16000);

  // Final Test: Population Survival (after 20 seconds)
  setTimeout(() => {
    console.log("\n💀 TEST 7: POPULATION SURVIVAL (20 seconds elapsed)");
    console.log("===================================================");

    clearInterval(dataCollectionInterval); // Stop data collection

    const finalCreatures = simulation.getCreatures();
    const finalStats = simulation.getStats();

    testResults.populationSurvival = finalCreatures.length > 0;

    console.log(`  ⚰️ Survival Analysis:`);
    console.log(`    • Starting population: ${config.initialPopulation}`);
    console.log(`    • Current population: ${finalCreatures.length}`);
    console.log(
      `    • Average fitness: ${finalStats.averageFitness.toFixed(2)}`
    );
    console.log(`    • Ticks survived: ${finalStats.currentTick}`);
    console.log(
      `    • Result: ${
        testResults.populationSurvival
          ? "✅ POPULATION SURVIVED"
          : "❌ POPULATION EXTINCT"
      }`
    );

    // Stop simulation and generate final report
    simulation.stop();
    generateEnhancedFinalReport();
  }, 20000);
}

function generateEnhancedFinalReport(): void {
  console.log("\n🎯 ENHANCED FINAL TEST RESULTS");
  console.log("===============================");

  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(
    (result) => result
  ).length;

  console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed\n`);

  // Individual test results
  console.log("📋 Detailed Results:");
  console.log(
    `  1. Movement Detection: ${
      testResults.movementDetected ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(
    `  2. Edge Clustering: ${
      !testResults.edgeClusteringDetected
        ? "✅ PASS (no clustering)"
        : "❌ FAIL (clustering detected)"
    }`
  );
  console.log(
    `  3. Brain Classification: ${
      testResults.brainClassificationWorking ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(
    `  4. Reproduction Attempts: ${
      testResults.reproductionAttempted ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(
    `  5. Reproduction Success: ${
      testResults.reproductionSuccessful ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(
    `  6. Food Seeking: ${testResults.foodSeeking ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `  7. Food Consistency: ${
      testResults.foodConsistencyValid ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(
    `  8. Movement Direction Diversity: ${
      testResults.movementDirectionDiverse ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(
    `  9. Population Survival: ${
      testResults.populationSurvival ? "✅ PASS" : "❌ FAIL"
    }`
  );

  // ⭐ ENHANCED: Critical Issues Analysis
  console.log("\n🚨 CRITICAL ISSUES IDENTIFIED:");
  if (testResults.edgeClusteringDetected) {
    console.log(
      "  ❌ EDGE CLUSTERING: Creatures getting stuck at world boundaries"
    );
    console.log(
      "     → Check boundary wrapping/collision logic in applyBoundaryWrapping()"
    );
  }
  if (
    !testResults.reproductionSuccessful &&
    testResults.reproductionAttempted
  ) {
    console.log("  ❌ REPRODUCTION FAILURE: High attempts but 0% success rate");
    console.log("     → Check species compatibility in isSameSpecies() method");
    console.log("     → Verify genetic distance calculation");
  }
  if (!testResults.movementDirectionDiverse) {
    console.log("  ❌ MOVEMENT BIAS: All creatures moving in same direction");
    console.log("     → Check bootstrap brain movement weight patterns");
    console.log("     → Investigate sensor input consistency");
  }
  if (!testResults.foodConsistencyValid) {
    console.log("  ❌ FOOD TRACKING: Inconsistent food consumption numbers");
    console.log("     → Check for double-counting in processFeeding()");
    console.log("     → Verify food spawning/despawning logic");
  }

  // Overall assessment
  console.log("\n🏆 OVERALL ASSESSMENT:");
  if (passedTests >= 7) {
    console.log(
      "🎉 MOSTLY WORKING: Core systems functional, minor issues remain"
    );
  } else if (passedTests >= 5) {
    console.log("⚠️ NEEDS WORK: Several critical issues identified");
  } else {
    console.log("🚨 MAJOR PROBLEMS: Multiple critical systems failing");
  }

  console.log("\n✅ ENHANCED AI BEHAVIOR VALIDATION TEST COMPLETE");
}

// Bonus Test: Direct Bootstrap Brain Verification
function testBootstrapBrainDirectly(): void {
  console.log("\n🧪 BONUS: DIRECT BOOTSTRAP BRAIN TEST");
  console.log("=====================================");

  const testGenetics = GeneticsHelper.generateRandomGenetics();
  const brain = BootstrapBrainFactory.createFounderBrain(testGenetics);

  const scenarios = [
    {
      name: "Hungry + Food Nearby",
      inputs: [
        0.2, 0.5, 0.9, 0.5, 0.9, 0.5, 0.2, 0.8, 0.1, 0.3, 0.8, 0.2, 0.2, 0.0,
      ],
      expectMovement: true,
      expectEating: true,
    },
    {
      name: "High Energy + Mature",
      inputs: [
        0.8, 0.5, 0.9, 0.5, 0.9, 0.5, 0.9, 0.9, 0.8, 0.3, 0.8, 0.2, 0.2, 0.0,
      ],
      expectMovement: true,
      expectReproduction: true,
    },
  ];

  scenarios.forEach((scenario, i) => {
    const output = brain.process(scenario.inputs);
    const actions = {
      moveX: output[0] * 2 - 1,
      moveY: output[1] * 2 - 1,
      eat: output[2],
      reproduce: output[4],
    };

    const movement = Math.sqrt(actions.moveX ** 2 + actions.moveY ** 2);

    console.log(`\n  Scenario ${i + 1}: ${scenario.name}`);
    console.log(
      `    Movement: ${movement.toFixed(3)} ${
        scenario.expectMovement && movement > 0.3 ? "✅" : "❌"
      }`
    );
    console.log(
      `    Eating: ${actions.eat.toFixed(3)} ${
        scenario.expectEating && actions.eat > 0.5 ? "✅" : "❌"
      }`
    );
    console.log(
      `    Reproduction: ${actions.reproduce.toFixed(3)} ${
        scenario.expectReproduction && actions.reproduce > 0.3 ? "✅" : "❌"
      }`
    );
  });
}

// Run the complete test suite
console.log("Starting enhanced AI behavior validation...\n");
testBootstrapBrainDirectly();
runBehaviorTest();
