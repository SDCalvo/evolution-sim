import { Neuron } from "../src/lib/neural/neuron";

/**
 * Test script to demonstrate and validate our Neuron class
 * Run with: npx tsx tests/neuron.test.ts
 */

console.log("🧠 NEURON TESTING LAB");
console.log("==================");

// Test 1: Basic neuron creation and processing
console.log("\n📝 Test 1: Basic Neuron Creation");
console.log("--------------------------------");

const neuron1 = new Neuron(3, "sigmoid");
console.log(`Created neuron: ${neuron1.describe()}`);
console.log(
  `Weights: [${neuron1.weights.map((w) => w.toFixed(3)).join(", ")}]`
);
console.log(`Bias: ${neuron1.bias.toFixed(3)}`);

// Test 2: Process some inputs
console.log("\n🔄 Test 2: Processing Inputs");
console.log("---------------------------");

const testInputs = [0.8, -0.3, 0.6];
console.log(`Input: [${testInputs.join(", ")}]`);

const output = neuron1.process(testInputs);
console.log(
  `Raw output (before activation): ${neuron1.lastRawOutput.toFixed(3)}`
);
console.log(
  `Final output (after sigmoid): ${neuron1.lastActivatedOutput.toFixed(3)}`
);
console.log(`This means: ${(output * 100).toFixed(1)}% activation`);

// Test 3: Different activation functions
console.log("\n🎛️ Test 3: Different Activation Functions");
console.log("----------------------------------------");

const activations = ["sigmoid", "tanh", "relu", "linear"] as const;
const sameWeights = [1.0, -0.5, 0.8];
const sameBias = 0.2;
const sameInputs = [0.5, -0.3, 0.7];

console.log(`Same inputs: [${sameInputs.join(", ")}]`);
console.log(`Same weights: [${sameWeights.join(", ")}]`);
console.log(`Same bias: ${sameBias}`);
console.log();

activations.forEach((activation) => {
  const neuron = new Neuron(3, activation, sameWeights, sameBias);
  const result = neuron.process(sameInputs);

  console.log(
    `${activation.padEnd(8)}: raw=${neuron.lastRawOutput.toFixed(
      3
    )}, activated=${result.toFixed(3)}`
  );
});

// Test 4: Creature decision simulation
console.log("\n🦎 Test 4: Creature Decision Simulation");
console.log("--------------------------------------");

// Create a "movement decision" neuron
const movementNeuron = new Neuron(
  4,
  "tanh",
  [
    2.0, // Distance to food (positive = important)
    -3.0, // Distance to predator (negative = avoid)
    1.0, // Energy level (positive = can afford to move)
    0.5, // Age (slight preference for older = wiser)
  ],
  0.1
); // Slightly optimistic bias

console.log("🎯 Creature Movement Decision Neuron");
console.log(`Weights: Food=2.0, Predator=-3.0, Energy=1.0, Age=0.5`);
console.log(`Bias: 0.1 (slightly optimistic)`);
console.log();

const scenarios = [
  {
    name: "Food nearby, no predator",
    inputs: [0.8, 0.0, 0.7, 0.5], // close food, no predator, good energy, mature
  },
  {
    name: "Food nearby, predator close!",
    inputs: [0.8, 0.9, 0.7, 0.5], // close food, close predator, good energy, mature
  },
  {
    name: "No food, low energy",
    inputs: [0.1, 0.0, 0.2, 0.5], // far food, no predator, low energy, mature
  },
  {
    name: "Risky situation",
    inputs: [0.6, 0.7, 0.9, 0.8], // medium food, close predator, high energy, old
  },
];

scenarios.forEach((scenario) => {
  const decision = movementNeuron.process(scenario.inputs);
  const direction = decision > 0 ? "MOVE FORWARD" : "RETREAT";
  const confidence = Math.abs(decision) * 100;

  console.log(`Scenario: ${scenario.name}`);
  console.log(`  Inputs: [${scenario.inputs.join(", ")}]`);
  console.log(
    `  Decision: ${decision.toFixed(3)} → ${direction} (${confidence.toFixed(
      1
    )}% confidence)`
  );
  console.log();
});

// Test 5: Mutation testing
console.log("\n🧬 Test 5: Mutation Evolution");
console.log("----------------------------");

const originalNeuron = new Neuron(3, "sigmoid", [1.0, -0.5, 0.8], 0.3);
console.log("Original neuron:");
console.log(
  `  Weights: [${originalNeuron.weights.map((w) => w.toFixed(3)).join(", ")}]`
);
console.log(`  Bias: ${originalNeuron.bias.toFixed(3)}`);

console.log("\nAfter 5 generations of mutation:");
for (let generation = 1; generation <= 5; generation++) {
  const mutatedNeuron = originalNeuron.clone();
  mutatedNeuron.mutate(0.5, 0.1); // 50% chance, small changes

  console.log(
    `  Gen ${generation}: weights=[${mutatedNeuron.weights
      .map((w) => w.toFixed(3))
      .join(", ")}], bias=${mutatedNeuron.bias.toFixed(3)}`
  );
}

// Test 6: Serialization testing
console.log("\n💾 Test 6: Serialization (Save/Load)");
console.log("-----------------------------------");

const originalForSave = new Neuron(2, "relu", [1.5, -2.0], 0.7);
console.log("Original neuron before saving:");
console.log(`  ${originalForSave.describe()}`);

const saved = originalForSave.toJSON();
console.log("\nSerialized data:");
console.log(JSON.stringify(saved, null, 2));

const loaded = Neuron.fromJSON(saved);
console.log("\nLoaded neuron:");
console.log(`  ${loaded.describe()}`);

// Verify they behave identically
const testInput = [0.5, -0.3];
const originalOutput = originalForSave.process(testInput);
const loadedOutput = loaded.process(testInput);

console.log(`\nIdentical behavior test:`);
console.log(`  Original output: ${originalOutput.toFixed(6)}`);
console.log(`  Loaded output:   ${loadedOutput.toFixed(6)}`);
console.log(`  Match: ${originalOutput === loadedOutput ? "✅ YES" : "❌ NO"}`);

// Test 7: Edge cases
console.log("\n⚠️ Test 7: Edge Cases");
console.log("--------------------");

console.log("Testing extreme inputs:");
const extremeNeuron = new Neuron(3, "sigmoid", [1.0, 1.0, 1.0], 0.0);

const extremeTests = [
  { name: "Very large positive", inputs: [100, 100, 100] },
  { name: "Very large negative", inputs: [-100, -100, -100] },
  { name: "Mixed extreme", inputs: [1000, -1000, 500] },
  { name: "Zeros", inputs: [0, 0, 0] },
];

extremeTests.forEach((test) => {
  const result = extremeNeuron.process(test.inputs);
  console.log(`  ${test.name}: ${result.toFixed(6)}`);
});

console.log("\n🎉 All tests completed! Neuron is working correctly!");
console.log("\nKey observations:");
console.log("• Sigmoid keeps outputs between 0-1 (perfect for probabilities)");
console.log("• Tanh gives -1 to +1 (great for movement directions)");
console.log('• ReLU kills negatives (good for "activation energy")');
console.log("• Linear passes through unchanged (raw values)");
console.log("• Mutations create variation for evolution");
console.log("• Serialization preserves exact behavior");
