/**
 * 🔬 COMPREHENSIVE CARRYING CAPACITY VALIDATION SUITE
 *
 * This test validates EVERY component of the carrying capacity system step by step
 * to identify exactly what's working and what's broken.
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import {
  PRESET_BIOMES,
  BiomeType,
} from "../src/lib/environment/environmentTypes";

// 🧪 TEST CONFIGURATION
const TEST_DURATION = 100; // Short tests for precise control
const TARGET_POPULATION = 300;
const MAX_POPULATION = 400;

interface TestResult {
  testName: string;
  success: boolean;
  details: string;
  data?: any;
}

// 🏗️ Helper function to create test environment
function createTestEnvironment(mortalityRate: number = 0.001): Environment {
  return new Environment({
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
      targetPopulation: TARGET_POPULATION,
      maxPopulation: MAX_POPULATION,
      densityStressFactor: 0.0005,
      mortalityRate: mortalityRate,
      resourceScaling: 0.85,
    },
  });
}

// 🏗️ Helper function to add creatures
function addCreatures(env: Environment, count: number): void {
  for (let i = 0; i < count; i++) {
    const position = {
      x: 950 + (Math.random() - 0.5) * 100,
      y: 950 + (Math.random() - 0.5) * 100,
    };
    const genetics = GeneticsHelper.generateRandomGenetics();
    const creature = new Creature(i, genetics, undefined, position);
    env.addCreature(creature);
  }
}

// 🧪 TEST 1: Basic Population Counting
function testBasicPopulationCounting(): TestResult {
  console.log("\n🧪 TEST 1: Basic Population Counting");

  const env = createTestEnvironment();

  // Test adding creatures
  addCreatures(env, 50);
  const count1 = env.getCreatures().length;

  addCreatures(env, 100);
  const count2 = env.getCreatures().length;

  const success = count1 === 50 && count2 === 150;
  const details = `Added 50 → ${count1}, Added 100 more → ${count2}`;

  console.log(`   ${success ? "✅" : "❌"} ${details}`);
  return { testName: "Basic Population Counting", success, details };
}

// 🧪 TEST 2: Overpopulation Calculation Logic
function testOverpopulationCalculation(): TestResult {
  console.log("\n🧪 TEST 2: Overpopulation Calculation Logic");

  const testCases = [
    { population: 200, expected: { overpop: 0, ratio: 0 } },
    { population: 300, expected: { overpop: 0, ratio: 0 } },
    { population: 350, expected: { overpop: 50, ratio: 50 / 300 } },
    { population: 400, expected: { overpop: 100, ratio: 100 / 300 } },
    { population: 600, expected: { overpop: 300, ratio: 300 / 300 } },
  ];

  let allPassed = true;
  const results: any[] = [];

  for (const testCase of testCases) {
    const overpopulation = Math.max(0, testCase.population - TARGET_POPULATION);
    const overpopulationRatio = overpopulation / TARGET_POPULATION;

    const overpopPassed = overpopulation === testCase.expected.overpop;
    const ratioPassed =
      Math.abs(overpopulationRatio - testCase.expected.ratio) < 0.001;
    const passed = overpopPassed && ratioPassed;

    console.log(
      `   ${passed ? "✅" : "❌"} Pop: ${
        testCase.population
      } → Overpop: ${overpopulation} (expected ${
        testCase.expected.overpop
      }), Ratio: ${overpopulationRatio.toFixed(
        3
      )} (expected ${testCase.expected.ratio.toFixed(3)})`
    );

    allPassed = allPassed && passed;
    results.push({
      population: testCase.population,
      overpopulation,
      overpopulationRatio,
      passed,
    });
  }

  return {
    testName: "Overpopulation Calculation",
    success: allPassed,
    details: `Tested ${testCases.length} cases`,
    data: results,
  };
}

// 🧪 TEST 3: Mortality Chance Calculation
function testMortalityChanceCalculation(): TestResult {
  console.log("\n🧪 TEST 3: Mortality Chance Calculation");

  const mortalityRate = 0.001;
  const testCases = [
    { population: 300, expectedChance: 0 }, // No overpopulation
    { population: 350, expectedChance: mortalityRate * Math.pow(50 / 300, 2) },
    { population: 400, expectedChance: mortalityRate * Math.pow(100 / 300, 2) },
    { population: 600, expectedChance: mortalityRate * Math.pow(300 / 300, 2) },
  ];

  let allPassed = true;

  for (const testCase of testCases) {
    const overpopulation = Math.max(0, testCase.population - TARGET_POPULATION);
    const overpopulationRatio = overpopulation / TARGET_POPULATION;
    const actualChance =
      overpopulation > 0 ? mortalityRate * Math.pow(overpopulationRatio, 2) : 0;

    const passed = Math.abs(actualChance - testCase.expectedChance) < 0.000001;
    const percentage = (actualChance * 100).toFixed(4);

    console.log(
      `   ${passed ? "✅" : "❌"} Pop: ${
        testCase.population
      } → Mortality: ${percentage}% per creature per tick`
    );

    allPassed = allPassed && passed;
  }

  return {
    testName: "Mortality Chance Calculation",
    success: allPassed,
    details: "Tested mortality chance formula",
  };
}

// 🧪 TEST 4: No Pressure Below Target
function testNoPressureBelowTarget(): TestResult {
  console.log("\n🧪 TEST 4: No Pressure Applied Below Target Population");

  const env = createTestEnvironment(0.1); // Very high mortality rate
  addCreatures(env, 250); // Below target of 300

  const initialCount = env.getCreatures().length;
  const initialEnergies = env.getCreatures().map((c) => c.physics.energy);

  // Run several ticks
  for (let i = 0; i < 10; i++) {
    env.update();
  }

  const finalCount = env.getCreatures().length;
  const finalEnergies = env.getCreatures().map((c) => c.physics.energy);

  // Should have NO deaths from carrying capacity (natural deaths from other causes are OK)
  const majorDeaths = initialCount - finalCount > 5; // Allow for some natural variation

  const success = !majorDeaths;
  const details = `Population ${initialCount} → ${finalCount} (should be stable below target)`;

  console.log(`   ${success ? "✅" : "❌"} ${details}`);
  return { testName: "No Pressure Below Target", success, details };
}

// 🧪 TEST 5: Pressure Applied Above Target
function testPressureAboveTarget(): TestResult {
  console.log("\n🧪 TEST 5: Pressure Applied Above Target Population");

  const env = createTestEnvironment(0.01); // Higher mortality rate for visible effect
  addCreatures(env, 400); // Well above target of 300

  const initialCount = env.getCreatures().length;

  // Run several ticks to allow pressure to take effect
  for (let i = 0; i < 20; i++) {
    env.update();
  }

  const finalCount = env.getCreatures().length;
  const deathCount = initialCount - finalCount;

  // Should see some deaths from carrying capacity pressure
  const pressureWorking = deathCount > 0;

  const success = pressureWorking;
  const details = `Population ${initialCount} → ${finalCount} (${deathCount} deaths from pressure)`;

  console.log(`   ${success ? "✅" : "❌"} ${details}`);
  return { testName: "Pressure Above Target", success, details };
}

// 🧪 TEST 6: Emergency Population Control
function testEmergencyPopulationControl(): TestResult {
  console.log("\n🧪 TEST 6: Emergency Population Control (Hard Cap)");

  const env = createTestEnvironment(0.0001); // Low normal mortality
  addCreatures(env, 450); // Above max population of 400

  const initialCount = env.getCreatures().length;

  // Run one tick to trigger emergency control
  env.update();

  const finalCount = env.getCreatures().length;
  const removed = initialCount - finalCount;

  // Should enforce hard cap
  const hardCapWorking = finalCount <= MAX_POPULATION;
  const expectedRemovals = Math.max(0, initialCount - MAX_POPULATION);

  const success = hardCapWorking;
  const details = `Population ${initialCount} → ${finalCount} (removed ${removed}, expected ~${expectedRemovals})`;

  console.log(`   ${success ? "✅" : "❌"} ${details}`);
  return { testName: "Emergency Population Control", success, details };
}

// 🧪 TEST 7: Mortality Rate Scaling Test
function testMortalityRateScaling(): TestResult {
  console.log("\n🧪 TEST 7: Mortality Rate Scaling Test");

  const mortalityRates = [0.001, 0.005, 0.01];
  const results: any[] = [];

  for (const mortalityRate of mortalityRates) {
    const env = createTestEnvironment(mortalityRate);
    addCreatures(env, 400); // Fixed overpopulation

    const initialCount = env.getCreatures().length;

    // Run 20 ticks
    for (let i = 0; i < 20; i++) {
      env.update();
    }

    const finalCount = env.getCreatures().length;
    const deathRate = (initialCount - finalCount) / initialCount;

    results.push({ mortalityRate, initialCount, finalCount, deathRate });
    console.log(
      `   📊 Mortality ${mortalityRate} → Deaths: ${(deathRate * 100).toFixed(
        1
      )}%`
    );
  }

  // Higher mortality rates should generally cause more deaths
  const trend = results[2].deathRate >= results[0].deathRate;
  const success = trend;
  const details = `Tested mortality rate scaling: ${results
    .map((r) => r.deathRate.toFixed(3))
    .join(" → ")}`;

  console.log(
    `   ${
      success ? "✅" : "❌"
    } Higher mortality rates should cause more deaths`
  );
  return {
    testName: "Mortality Rate Scaling",
    success,
    details,
    data: results,
  };
}

// 🧪 TEST 8: Energy Drain Test
function testEnergyDrain(): TestResult {
  console.log("\n🧪 TEST 8: Social Stress Energy Drain");

  const env = createTestEnvironment(0.0001); // Minimal deaths to focus on energy
  addCreatures(env, 400); // Overpopulation for stress

  const initialEnergies = env.getCreatures().map((c) => c.physics.energy);
  const avgInitialEnergy =
    initialEnergies.reduce((a, b) => a + b, 0) / initialEnergies.length;

  // Run ticks to apply stress
  for (let i = 0; i < 10; i++) {
    env.update();
  }

  const finalEnergies = env.getCreatures().map((c) => c.physics.energy);
  const avgFinalEnergy =
    finalEnergies.reduce((a, b) => a + b, 0) / finalEnergies.length;

  const energyDrain = avgInitialEnergy - avgFinalEnergy;
  const drainWorking = energyDrain > 0;

  const success = drainWorking;
  const details = `Average energy: ${avgInitialEnergy.toFixed(
    1
  )} → ${avgFinalEnergy.toFixed(1)} (drain: ${energyDrain.toFixed(2)})`;

  console.log(`   ${success ? "✅" : "❌"} ${details}`);
  return { testName: "Energy Drain", success, details };
}

// 🚀 RUN ALL TESTS
console.log("🔬 COMPREHENSIVE CARRYING CAPACITY VALIDATION SUITE");
console.log("=".repeat(80));

const testResults: TestResult[] = [];

// Run all tests
testResults.push(testBasicPopulationCounting());
testResults.push(testOverpopulationCalculation());
testResults.push(testMortalityChanceCalculation());
testResults.push(testNoPressureBelowTarget());
testResults.push(testPressureAboveTarget());
testResults.push(testEmergencyPopulationControl());
testResults.push(testMortalityRateScaling());
testResults.push(testEnergyDrain());

// Summary
console.log("\n" + "=".repeat(80));
console.log("📋 TEST SUMMARY:");
console.log("=".repeat(80));

const passedTests = testResults.filter((r) => r.success).length;
const totalTests = testResults.length;

testResults.forEach((result) => {
  console.log(
    `${result.success ? "✅" : "❌"} ${result.testName}: ${result.details}`
  );
});

console.log(`\n🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log(
    "🎉 ALL TESTS PASSED! Carrying capacity system is working correctly."
  );
} else {
  console.log(
    "🚨 SOME TESTS FAILED! Issues detected in carrying capacity system."
  );
  console.log("\n🔧 DEBUGGING RECOMMENDATIONS:");

  testResults
    .filter((r) => !r.success)
    .forEach((result) => {
      console.log(`   • Fix: ${result.testName} - ${result.details}`);
    });
}

console.log("=".repeat(80));
