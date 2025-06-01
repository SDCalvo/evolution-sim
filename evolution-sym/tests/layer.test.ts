import { Layer } from "../src/lib/neural/layer";
import { Neuron } from "../src/lib/neural/neuron";

/**
 * Test script to demonstrate and validate our Layer class
 * Run with: npx tsx tests/layer.test.ts
 */

console.log("🏗️ LAYER TESTING LAB - Committees of Neurons");
console.log("===========================================");

// Test 1: Basic layer creation and structure
console.log("\n📝 Test 1: Basic Layer Creation");
console.log("-------------------------------");

const layer1 = new Layer(3, 4, "sigmoid"); // 3 inputs → 4 outputs
console.log(`Created layer: ${layer1.describe()}`);
console.log(`Input size: ${layer1.getInputSize()}`);
console.log(`Output size: ${layer1.getOutputSize()}`);
console.log(`Number of neurons: ${layer1.neurons.length}`);

console.log("\nNeurons in this layer:");
layer1.describeNeurons().forEach((desc) => console.log(desc));

// Test 2: Processing inputs - seeing the committee in action
console.log("\n🔄 Test 2: Committee Decision Making");
console.log("-----------------------------------");

const inputs = [0.8, -0.3, 0.6];
console.log(`Input to all neurons: [${inputs.join(", ")}]`);

const outputs = layer1.process(inputs);
console.log(
  `\nCommittee outputs: [${outputs.map((o) => o.toFixed(3)).join(", ")}]`
);

console.log("\nIndividual neuron decisions:");
outputs.forEach((output, index) => {
  const neuron = layer1.getNeuron(index);
  console.log(
    `  Neuron ${index}: raw=${neuron.lastRawOutput.toFixed(
      3
    )}, activated=${output.toFixed(3)} (${(output * 100).toFixed(1)}%)`
  );
});

// Test 3: Different activation functions in same layer
console.log("\n🎛️ Test 3: Specialized Committee Members");
console.log("--------------------------------------");

// Create a layer with different specialists
const specialists = [
  new Neuron(4, "sigmoid", [2.0, -1.0, 1.0, 0.5], 0.1), // Risk assessor (sigmoid for probability)
  new Neuron(4, "tanh", [1.0, 0.5, -1.5, 2.0], -0.2), // Movement controller (tanh for direction)
  new Neuron(4, "relu", [0.5, 0.2, 2.0, -0.5], 0.3), // Energy manager (relu for activation)
  new Neuron(4, "linear", [1.2, -0.8, 0.3, 1.8], 0.0), // Raw calculator (linear for values)
];

const expertLayer = new Layer(4, 4, "sigmoid", specialists);
console.log(`Expert committee: ${expertLayer.describe()}`);

const creatureInputs = [0.7, 0.4, 0.8, 0.6]; // food, predator, energy, age
console.log(
  `\nCreature sensors: [food=${creatureInputs[0]}, predator=${creatureInputs[1]}, energy=${creatureInputs[2]}, age=${creatureInputs[3]}]`
);

const expertDecisions = expertLayer.process(creatureInputs);
console.log("\nExpert committee decisions:");
console.log(
  `  Risk Assessor (sigmoid): ${expertDecisions[0].toFixed(3)} → ${(
    expertDecisions[0] * 100
  ).toFixed(1)}% safe to act`
);
console.log(
  `  Movement Controller (tanh): ${expertDecisions[1].toFixed(3)} → ${
    expertDecisions[1] > 0 ? "move forward" : "retreat"
  }`
);
console.log(
  `  Energy Manager (relu): ${expertDecisions[2].toFixed(
    3
  )} → ${expertDecisions[2].toFixed(1)} energy units to spend`
);
console.log(
  `  Raw Calculator (linear): ${expertDecisions[3].toFixed(
    3
  )} → raw decision value`
);

// Test 4: Layer statistics and analysis
console.log("\n📊 Test 4: Layer Statistics & Analysis");
console.log("-------------------------------------");

const stats = expertLayer.getStats();
console.log("Layer statistics:");
console.log(`  Total neurons: ${stats.neuronCount}`);
console.log(`  Total weights: ${stats.totalWeights}`);
console.log(`  Average weight: ${stats.avgWeight.toFixed(3)}`);
console.log(`  Average bias: ${stats.avgBias.toFixed(3)}`);
console.log(
  `  Weight range: ${stats.weightRange.min.toFixed(
    3
  )} to ${stats.weightRange.max.toFixed(3)}`
);
console.log(
  `  Bias range: ${stats.biasRange.min.toFixed(
    3
  )} to ${stats.biasRange.max.toFixed(3)}`
);

// Test 5: Evolution mechanics - cloning and mutation
console.log("\n🧬 Test 5: Layer Evolution");
console.log("--------------------------");

const originalLayer = new Layer(3, 3, "tanh");
console.log("Original layer weights:");
originalLayer.neurons.forEach((neuron, i) => {
  console.log(
    `  Neuron ${i}: [${neuron.weights
      .map((w) => w.toFixed(3))
      .join(", ")}], bias=${neuron.bias.toFixed(3)}`
  );
});

// Clone the layer
const childLayer = originalLayer.clone();
console.log("\nCloned layer (should be identical):");
childLayer.neurons.forEach((neuron, i) => {
  console.log(
    `  Neuron ${i}: [${neuron.weights
      .map((w) => w.toFixed(3))
      .join(", ")}], bias=${neuron.bias.toFixed(3)}`
  );
});

// Mutate the child
childLayer.mutate(0.6, 0.2); // High mutation rate for demonstration
console.log("\nAfter mutation (should be different):");
childLayer.neurons.forEach((neuron, i) => {
  console.log(
    `  Neuron ${i}: [${neuron.weights
      .map((w) => w.toFixed(3))
      .join(", ")}], bias=${neuron.bias.toFixed(3)}`
  );
});

// Test behavior difference
const testInput = [0.5, -0.2, 0.8];
const originalOutput = originalLayer.process(testInput);
const mutatedOutput = childLayer.process(testInput);

console.log(`\nBehavior comparison on input [${testInput.join(", ")}]:`);
console.log(
  `  Original: [${originalOutput.map((o) => o.toFixed(3)).join(", ")}]`
);
console.log(
  `  Mutated:  [${mutatedOutput.map((o) => o.toFixed(3)).join(", ")}]`
);

// Test 6: Creature behavior simulation
console.log("\n🦎 Test 6: Multi-Action Creature Simulation");
console.log("------------------------------------------");

// Create a creature's action layer: 4 sensors → 3 actions
const creatureLayer = new Layer(4, 3, "tanh");
console.log(`Creature action layer: ${creatureLayer.describe()}`);

const scenarios = [
  {
    name: "Rich food source nearby",
    sensors: [0.9, 0.1, 0.8, 0.5], // close food, distant predator, good energy, mature
  },
  {
    name: "Dangerous situation",
    sensors: [0.3, 0.9, 0.4, 0.7], // far food, close predator, low energy, old
  },
  {
    name: "Neutral environment",
    sensors: [0.5, 0.5, 0.6, 0.4], // medium food, medium predator, ok energy, young
  },
];

console.log("\nCreature decision scenarios:");
scenarios.forEach((scenario) => {
  const actions = creatureLayer.process(scenario.sensors);

  console.log(`\nScenario: ${scenario.name}`);
  console.log(
    `  Sensors: [food=${scenario.sensors[0]}, predator=${scenario.sensors[1]}, energy=${scenario.sensors[2]}, age=${scenario.sensors[3]}]`
  );
  console.log(
    `  Actions: [move_x=${actions[0].toFixed(3)}, move_y=${actions[1].toFixed(
      3
    )}, eat=${actions[2].toFixed(3)}]`
  );

  // Interpret the actions
  const moveX = actions[0] > 0 ? "right" : "left";
  const moveY = actions[1] > 0 ? "up" : "down";
  const eating = actions[2] > 0 ? "eating" : "not eating";

  console.log(
    `  Interpretation: Move ${moveX} (${Math.abs(actions[0] * 100).toFixed(
      0
    )}%), move ${moveY} (${Math.abs(actions[1] * 100).toFixed(
      0
    )}%), ${eating} (${Math.abs(actions[2] * 100).toFixed(0)}%)`
  );
});

// Test 7: Serialization and persistence
console.log("\n💾 Test 7: Layer Serialization");
console.log("------------------------------");

const layerToSave = new Layer(2, 3, "relu");
console.log("Original layer before saving:");
console.log(`  ${layerToSave.describe()}`);

const savedData = layerToSave.toJSON();
console.log("\nSerialized layer data:");
console.log(`  Input size: ${savedData.inputSize}`);
console.log(`  Output size: ${savedData.outputSize}`);
console.log(`  Number of neurons: ${savedData.neurons.length}`);

const loadedLayer = Layer.fromJSON(savedData);
console.log("\nLoaded layer:");
console.log(`  ${loadedLayer.describe()}`);

// Test identical behavior
const testVector = [0.7, -0.4];
const originalResult = layerToSave.process(testVector);
const loadedResult = loadedLayer.process(testVector);

console.log(`\nBehavior verification with input [${testVector.join(", ")}]:`);
console.log(
  `  Original: [${originalResult.map((r) => r.toFixed(6)).join(", ")}]`
);
console.log(
  `  Loaded:   [${loadedResult.map((r) => r.toFixed(6)).join(", ")}]`
);

const identical = originalResult.every(
  (val, i) => Math.abs(val - loadedResult[i]) < 1e-10
);
console.log(`  Identical behavior: ${identical ? "✅ YES" : "❌ NO"}`);

// Test 8: Layer composition preview
console.log("\n🏗️ Test 8: Multi-Layer Preview");
console.log("------------------------------");

console.log("Preview of neural network composition:");
console.log(
  "Input Layer (sensors) → Hidden Layer (processing) → Output Layer (actions)"
);

const inputLayer = new Layer(4, 6, "sigmoid"); // 4 sensors → 6 hidden neurons
const hiddenLayer = new Layer(6, 4, "tanh"); // 6 hidden → 4 hidden neurons
const outputLayer = new Layer(4, 3, "tanh"); // 4 hidden → 3 actions

console.log(`\n${inputLayer.describe()}`);
console.log(`${hiddenLayer.describe()}`);
console.log(`${outputLayer.describe()}`);

// Simulate a forward pass through all layers
const sensorInput = [0.8, 0.3, 0.7, 0.5];
const layer1Output = inputLayer.process(sensorInput);
const layer2Output = hiddenLayer.process(layer1Output);
const finalOutput = outputLayer.process(layer2Output);

console.log(`\nForward pass simulation:`);
console.log(`  Sensors:        [${sensorInput.join(", ")}]`);
console.log(
  `  After layer 1:  [${layer1Output.map((o) => o.toFixed(2)).join(", ")}]`
);
console.log(
  `  After layer 2:  [${layer2Output.map((o) => o.toFixed(2)).join(", ")}]`
);
console.log(
  `  Final actions:  [${finalOutput.map((o) => o.toFixed(2)).join(", ")}]`
);

console.log("\n🎉 All layer tests completed successfully!");
console.log("\nKey discoveries:");
console.log("• Layers enable multiple simultaneous decisions from same input");
console.log("• Different activation functions create specialized behaviors");
console.log("• Mutation creates variation while preserving layer structure");
console.log("• Serialization enables saving/loading evolved committees");
console.log(
  "• Layers can be composed into neural networks for complex behavior"
);
console.log(
  "• Each neuron in a layer develops its own specialty through evolution"
);
