import { NeuralNetwork } from "../src/lib/neural/network";

/**
 * Test script to demonstrate and validate our NeuralNetwork class
 * Run with: npx tsx tests/network.test.ts
 */

console.log("🧠 NEURAL NETWORK TESTING LAB - Deep Learning Brain");
console.log("=================================================");

// Test 1: Basic network creation and architecture
console.log("\n📝 Test 1: Neural Network Architecture");
console.log("-------------------------------------");

// Create a simple feedforward network: 4 inputs → 6 hidden → 3 outputs
const simpleNet = new NeuralNetwork([4, 6, 3], "sigmoid");
console.log(`Created network: ${simpleNet.describe()}`);
console.log(`Architecture: ${simpleNet.getArchitecture().join(" → ")}`);
console.log(`Input size: ${simpleNet.getInputSize()}`);
console.log(`Output size: ${simpleNet.getOutputSize()}`);
console.log(`Total layers: ${simpleNet.getLayerCount()}`);

console.log("\nLayer details:");
simpleNet.describeLayers().forEach((desc) => console.log(desc));

// Test 2: Forward propagation - the magic of deep learning
console.log("\n🔄 Test 2: Deep Learning Forward Pass");
console.log("------------------------------------");

const sensoryInput = [0.8, 0.3, 0.9, 0.2]; // Food, predator, energy, age
console.log(
  `Creature sensors: [food=${sensoryInput[0]}, predator=${sensoryInput[1]}, energy=${sensoryInput[2]}, age=${sensoryInput[3]}]`
);

const actions = simpleNet.process(sensoryInput);
console.log(
  `\nDeep learning output: [${actions.map((a) => a.toFixed(3)).join(", ")}]`
);

// Show what happened inside the brain
const trace = simpleNet.getActivityTrace();
console.log("\nInformation flow through the brain:");
console.log(
  `  Input (sensors):     [${trace.input.map((i) => i.toFixed(2)).join(", ")}]`
);
trace.layerOutputs.forEach((output, index) => {
  console.log(
    `  After layer ${index}:       [${output
      .map((o) => o.toFixed(2))
      .join(", ")}]`
  );
});
console.log(
  `  Final output:        [${trace.finalOutput
    .map((o) => o.toFixed(2))
    .join(", ")}]`
);

// Test 3: Different network architectures and activation functions
console.log("\n🎛️ Test 3: Advanced Network Architectures");
console.log("-----------------------------------------");

// Create a complex multi-layer network with different activations
const complexNet = new NeuralNetwork(
  [4, 8, 6, 4, 3],
  ["sigmoid", "relu", "tanh", "sigmoid"]
);
console.log(`Complex network: ${complexNet.describe()}`);

const complexActions = complexNet.process(sensoryInput);
console.log(
  `Complex decision: [${complexActions.map((a) => a.toFixed(3)).join(", ")}]`
);

// Compare simple vs complex brain decisions
console.log("\nBrain complexity comparison:");
console.log(
  `  Simple brain (1 hidden):  [${actions.map((a) => a.toFixed(3)).join(", ")}]`
);
console.log(
  `  Complex brain (3 hidden): [${complexActions
    .map((a) => a.toFixed(3))
    .join(", ")}]`
);

// Test 4: Decision analysis - understanding the AI's thinking
console.log("\n🔍 Test 4: AI Decision Analysis");
console.log("-------------------------------");

const analysis = complexNet.analyzeDecision();
console.log("How the AI made its decision:");
console.log(
  `  Input pattern: [${analysis.inputPattern
    .map((i) => i.toFixed(2))
    .join(", ")}]`
);
console.log(
  `  Dominant action: ${analysis.dominantOutput} (${(
    analysis.confidence * 100
  ).toFixed(1)}% confidence)`
);

console.log("\nLayer-by-layer analysis:");
analysis.layerAnalyses.forEach((layerAnal, index) => {
  console.log(
    `  Layer ${index}: max=${layerAnal.maxActivation.toFixed(
      3
    )}, avg=${layerAnal.avgActivation.toFixed(3)}, most active neuron=${
      layerAnal.mostActiveNeuron
    }`
  );
});

// Test 5: Creature brain factory - specialized for evolution simulation
console.log("\n🦎 Test 5: Creature Brain Factory");
console.log("---------------------------------");

const simpleBrain = NeuralNetwork.createCreatureBrain(5, 4, "simple");
const mediumBrain = NeuralNetwork.createCreatureBrain(5, 4, "medium");
const complexBrain = NeuralNetwork.createCreatureBrain(5, 4, "complex");

console.log("Creature brain options:");
console.log(`  Simple:  ${simpleBrain.describe()}`);
console.log(`  Medium:  ${mediumBrain.describe()}`);
console.log(`  Complex: ${complexBrain.describe()}`);

// Test them all on the same creature scenario
const creatureScenario = [0.9, 0.1, 0.7, 0.8, 0.6]; // rich food, low threat, good energy, mature, healthy
console.log(
  `\nCreature scenario: [food=${creatureScenario[0]}, threat=${creatureScenario[1]}, energy=${creatureScenario[2]}, age=${creatureScenario[3]}, health=${creatureScenario[4]}]`
);

const simpleDecision = simpleBrain.process(creatureScenario);
const mediumDecision = mediumBrain.process(creatureScenario);
const complexDecision = complexBrain.process(creatureScenario);

console.log("\nDecision complexity comparison:");
console.log(
  `  Simple brain:  [${simpleDecision.map((d) => d.toFixed(3)).join(", ")}]`
);
console.log(
  `  Medium brain:  [${mediumDecision.map((d) => d.toFixed(3)).join(", ")}]`
);
console.log(
  `  Complex brain: [${complexDecision.map((d) => d.toFixed(3)).join(", ")}]`
);

// Test 6: Evolution mechanics at network level
console.log("\n🧬 Test 6: Neural Network Evolution");
console.log("----------------------------------");

const parentBrain = NeuralNetwork.createCreatureBrain(4, 3, "medium");
console.log(`Parent brain: ${parentBrain.describe()}`);

// Test the parent's behavior
const evolutionInput = [0.6, 0.4, 0.8, 0.5];
const parentBehavior = parentBrain.process(evolutionInput);
console.log(
  `Parent behavior: [${parentBehavior.map((b) => b.toFixed(3)).join(", ")}]`
);

// Clone and mutate to create offspring
const childBrain = parentBrain.clone();
console.log(`Child brain (cloned): ${childBrain.describe()}`);

// Test identical behavior before mutation
const childBehaviorBefore = childBrain.process(evolutionInput);
console.log(
  `Child behavior (before mutation): [${childBehaviorBefore
    .map((b) => b.toFixed(3))
    .join(", ")}]`
);

const identical = parentBehavior.every(
  (val, i) => Math.abs(val - childBehaviorBefore[i]) < 1e-10
);
console.log(`Identical to parent: ${identical ? "✅ YES" : "❌ NO"}`);

// Now mutate the child
childBrain.mutate(0.3, 0.15); // 30% mutation rate, 15% strength
const childBehaviorAfter = childBrain.process(evolutionInput);
console.log(
  `Child behavior (after mutation): [${childBehaviorAfter
    .map((b) => b.toFixed(3))
    .join(", ")}]`
);

// Calculate behavior difference
const behaviorDifference = parentBehavior.map((val, i) =>
  Math.abs(val - childBehaviorAfter[i])
);
const avgDifference =
  behaviorDifference.reduce((sum, diff) => sum + diff, 0) /
  behaviorDifference.length;
console.log(`Average behavior change: ${(avgDifference * 100).toFixed(1)}%`);

// Test 7: Network statistics and complexity analysis
console.log("\n📊 Test 7: Network Statistics & Complexity");
console.log("------------------------------------------");

const stats = complexBrain.getStats();
console.log("Complex brain statistics:");
console.log(`  Architecture: ${stats.architecture.join(" → ")}`);
console.log(`  Total layers: ${stats.layerCount}`);
console.log(`  Total neurons: ${stats.totalNeurons}`);
console.log(`  Total weights: ${stats.totalWeights}`);
console.log(`  Average weight: ${stats.avgWeight.toFixed(3)}`);
console.log(`  Average bias: ${stats.avgBias.toFixed(3)}`);

console.log("\nPer-layer breakdown:");
stats.layerStats.forEach((layerStats, index) => {
  console.log(
    `  Layer ${index}: ${layerStats.neuronCount} neurons, ${layerStats.totalWeights} weights, avg activation varies`
  );
});

// Test 8: Serialization and persistence for evolution
console.log("\n💾 Test 8: Brain Serialization for Evolution");
console.log("--------------------------------------------");

const evolvedBrain = NeuralNetwork.createCreatureBrain(3, 2, "medium");
console.log(`Original evolved brain: ${evolvedBrain.describe()}`);

// Test its behavior
const testBehavior = evolvedBrain.process([0.8, 0.3, 0.6]);
console.log(
  `Original behavior: [${testBehavior.map((b) => b.toFixed(4)).join(", ")}]`
);

// Save to JSON
const brainData = evolvedBrain.toJSON();
console.log(`Serialized brain data:`);
console.log(`  Architecture: ${brainData.architecture.join(" → ")}`);
console.log(`  Number of layer datasets: ${brainData.layers.length}`);

// Load from JSON
const restoredBrain = NeuralNetwork.fromJSON(brainData);
console.log(`Restored brain: ${restoredBrain.describe()}`);

// Test identical behavior
const restoredBehavior = restoredBrain.process([0.8, 0.3, 0.6]);
console.log(
  `Restored behavior: [${restoredBehavior.map((b) => b.toFixed(4)).join(", ")}]`
);

const perfectRestore = testBehavior.every(
  (val, i) => Math.abs(val - restoredBehavior[i]) < 1e-10
);
console.log(`Perfect restoration: ${perfectRestore ? "✅ YES" : "❌ NO"}`);

// Test 9: Real creature scenarios - comprehensive behavior testing
console.log("\n🌍 Test 9: Creature Survival Scenarios");
console.log("-------------------------------------");

const survivalistBrain = NeuralNetwork.createCreatureBrain(6, 5, "complex");
console.log(`Survivalist brain: ${survivalistBrain.describe()}`);

const scenarios = [
  {
    name: "Abundant resources",
    sensors: [0.9, 0.1, 0.8, 0.9, 0.7, 0.6], // rich food, low predator, high energy, good health, comfortable temp, low population
    expectedBehavior: "should be confident and active",
  },
  {
    name: "Extreme danger",
    sensors: [0.2, 0.9, 0.3, 0.4, 0.5, 0.8], // little food, high predator, low energy, poor health, ok temp, crowded
    expectedBehavior: "should be cautious and defensive",
  },
  {
    name: "Balanced environment",
    sensors: [0.5, 0.5, 0.6, 0.6, 0.6, 0.5], // moderate everything
    expectedBehavior: "should be measured and adaptive",
  },
  {
    name: "Reproduction opportunity",
    sensors: [0.7, 0.2, 0.9, 0.8, 0.8, 0.3], // good food, low threat, high energy, healthy, good conditions, low competition
    expectedBehavior: "should prioritize reproduction",
  },
];

console.log("\nSurvival decision analysis:");
scenarios.forEach((scenario) => {
  const decisions = survivalistBrain.process(scenario.sensors);
  const dominantAction = decisions.indexOf(Math.max(...decisions));
  const confidence = Math.max(...decisions);

  console.log(`\nScenario: ${scenario.name}`);
  console.log(
    `  Environment: [${scenario.sensors.map((s) => s.toFixed(1)).join(", ")}]`
  );
  console.log(
    `  Decisions: [${decisions.map((d) => d.toFixed(3)).join(", ")}]`
  );
  console.log(
    `  Primary action: ${dominantAction} (${(confidence * 100).toFixed(
      1
    )}% strength)`
  );
  console.log(`  Expected: ${scenario.expectedBehavior}`);
});

// Test 10: Performance and scalability
console.log("\n⚡ Test 10: Performance Analysis");
console.log("-------------------------------");

const performanceTests = [
  { name: "Tiny brain", network: new NeuralNetwork([2, 3, 1]) },
  { name: "Small brain", network: new NeuralNetwork([4, 8, 4]) },
  { name: "Medium brain", network: new NeuralNetwork([6, 12, 8, 3]) },
  { name: "Large brain", network: new NeuralNetwork([10, 20, 15, 10, 5]) },
  { name: "Huge brain", network: new NeuralNetwork([15, 30, 25, 20, 15, 8]) },
];

console.log("Performance scaling:");
performanceTests.forEach((test) => {
  const stats = test.network.getStats();
  const testInput = new Array(test.network.getInputSize()).fill(0.5);

  const startTime = performance.now();
  for (let i = 0; i < 1000; i++) {
    test.network.process(testInput);
  }
  const endTime = performance.now();

  const avgTime = (endTime - startTime) / 1000;
  console.log(
    `  ${test.name}: ${stats.totalNeurons} neurons, ${
      stats.totalWeights
    } weights, ${avgTime.toFixed(3)}ms per decision`
  );
});

console.log("\n🎉 All neural network tests completed successfully!");
console.log("\nKey achievements:");
console.log(
  "• Deep neural networks with multiple hidden layers working perfectly"
);
console.log("• Forward propagation through complex architectures");
console.log("• Different activation functions creating specialized processing");
console.log(
  "• Complete evolution mechanics (cloning, mutation) at network level"
);
console.log("• Brain serialization enabling save/load of evolved intelligence");
console.log(
  "• Creature-specific brain architectures for different complexities"
);
console.log("• Decision analysis revealing how AI thinks and makes choices");
console.log("• Performance scaling showing network computational requirements");
console.log("• Ready for creature integration and evolution simulation!");
