/**
 * Bootstrap Brain Analysis Test
 *
 * Deep dive into the bootstrap brain system to understand exactly what
 * kind of neural networks it's creating and why they might be problematic
 */

import { BootstrapBrainFactory } from "../src/lib/creatures/bootstrapBrains";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { NeuralNetwork } from "../src/lib/neural/network";

interface BootstrapAnalysis {
  brainCount: number;
  weightDistribution: {
    inputToHidden: {
      min: number;
      max: number;
      mean: number;
      std: number;
      zeros: number;
    };
    hiddenToOutput: {
      min: number;
      max: number;
      mean: number;
      std: number;
      zeros: number;
    };
  };
  biasDistribution: {
    hidden: {
      min: number;
      max: number;
      mean: number;
      std: number;
      zeros: number;
    };
    output: {
      min: number;
      max: number;
      mean: number;
      std: number;
      zeros: number;
    };
  };
  activationAnalysis: {
    hiddenLayerDeadNeurons: number;
    outputSaturation: number;
    responsiveness: number;
  };
  movementBias: {
    magnitude: number;
    direction: { x: number; y: number };
    consistency: number;
  };
}

async function analyzeBootstrapBrains() {
  console.log("🔬 BOOTSTRAP BRAIN ANALYSIS");
  console.log("===========================");

  const numSamples = 20;
  const testInputs = generateTestInputs();

  console.log(`\nGenerating ${numSamples} bootstrap brains for analysis...`);

  const brains: any[] = [];
  const outputs: number[][] = [];

  // Generate bootstrap brains
  for (let i = 0; i < numSamples; i++) {
    const genetics = GeneticsHelper.generateRandomGenetics();
    const brain = BootstrapBrainFactory.createFounderBrain(genetics);
    brains.push(brain);

    // Test with neutral inputs
    const neutralInputs = new Array(14).fill(0.5);
    const output = brain.process(neutralInputs);
    outputs.push(output);
  }

  console.log(`✅ Generated ${brains.length} brains\n`);

  // Analyze weight distributions
  console.log("📊 WEIGHT ANALYSIS:");
  console.log("==================");

  const weightAnalysis = analyzeWeights(brains);

  console.log("\n🔗 Input → Hidden Layer Weights:");
  console.log(
    `   Range: ${weightAnalysis.inputToHidden.min.toFixed(
      3
    )} to ${weightAnalysis.inputToHidden.max.toFixed(3)}`
  );
  console.log(
    `   Mean: ${weightAnalysis.inputToHidden.mean.toFixed(
      3
    )} ± ${weightAnalysis.inputToHidden.std.toFixed(3)}`
  );
  console.log(
    `   Zero weights: ${
      weightAnalysis.inputToHidden.zeros
    } / ${getTotalWeightCount(brains[0], 0)}`
  );
  console.log(
    `   Zero percentage: ${(
      (weightAnalysis.inputToHidden.zeros / getTotalWeightCount(brains[0], 0)) *
      100
    ).toFixed(1)}%`
  );

  console.log("\n🔗 Hidden → Output Layer Weights:");
  console.log(
    `   Range: ${weightAnalysis.hiddenToOutput.min.toFixed(
      3
    )} to ${weightAnalysis.hiddenToOutput.max.toFixed(3)}`
  );
  console.log(
    `   Mean: ${weightAnalysis.hiddenToOutput.mean.toFixed(
      3
    )} ± ${weightAnalysis.hiddenToOutput.std.toFixed(3)}`
  );
  console.log(
    `   Zero weights: ${
      weightAnalysis.hiddenToOutput.zeros
    } / ${getTotalWeightCount(brains[0], 1)}`
  );
  console.log(
    `   Zero percentage: ${(
      (weightAnalysis.hiddenToOutput.zeros /
        getTotalWeightCount(brains[0], 1)) *
      100
    ).toFixed(1)}%`
  );

  // Analyze bias distributions
  console.log("\n🎯 BIAS ANALYSIS:");
  console.log("=================");

  const biasAnalysis = analyzeBiases(brains);

  console.log("\n🧠 Hidden Layer Biases:");
  console.log(
    `   Range: ${biasAnalysis.hidden.min.toFixed(
      3
    )} to ${biasAnalysis.hidden.max.toFixed(3)}`
  );
  console.log(
    `   Mean: ${biasAnalysis.hidden.mean.toFixed(
      3
    )} ± ${biasAnalysis.hidden.std.toFixed(3)}`
  );
  console.log(
    `   Zero biases: ${biasAnalysis.hidden.zeros} / ${getBiasCount(
      brains[0],
      0
    )}`
  );

  console.log("\n📤 Output Layer Biases:");
  console.log(
    `   Range: ${biasAnalysis.output.min.toFixed(
      3
    )} to ${biasAnalysis.output.max.toFixed(3)}`
  );
  console.log(
    `   Mean: ${biasAnalysis.output.mean.toFixed(
      3
    )} ± ${biasAnalysis.output.std.toFixed(3)}`
  );
  console.log(
    `   Zero biases: ${biasAnalysis.output.zeros} / ${getBiasCount(
      brains[0],
      1
    )}`
  );

  // Analyze activation patterns
  console.log("\n⚡ ACTIVATION ANALYSIS:");
  console.log("=====================");

  const activationAnalysis = analyzeActivations(brains, testInputs);

  console.log(`\n🔍 Hidden Layer Analysis:`);
  console.log(
    `   Dead neurons (always output 0): ${activationAnalysis.hiddenLayerDeadNeurons}/10`
  );
  console.log(
    `   Dead neuron percentage: ${(
      (activationAnalysis.hiddenLayerDeadNeurons / 10) *
      100
    ).toFixed(1)}%`
  );

  console.log(`\n📊 Output Saturation:`);
  console.log(
    `   Saturation level: ${(activationAnalysis.outputSaturation * 100).toFixed(
      1
    )}%`
  );
  console.log(
    `   Responsiveness: ${activationAnalysis.responsiveness.toFixed(3)}`
  );

  // Analyze movement bias
  console.log("\n🎯 MOVEMENT BIAS ANALYSIS:");
  console.log("=========================");

  const movementAnalysis = analyzeMovementBias(outputs);

  console.log(`\n📍 Movement Direction:`);
  console.log(
    `   Average X movement: ${movementAnalysis.direction.x.toFixed(3)}`
  );
  console.log(
    `   Average Y movement: ${movementAnalysis.direction.y.toFixed(3)}`
  );
  console.log(`   Bias magnitude: ${movementAnalysis.magnitude.toFixed(3)}`);
  console.log(
    `   Consistency: ${movementAnalysis.consistency.toFixed(
      3
    )} (0=random, 1=always same)`
  );

  // Compare with random brains
  console.log("\n🆚 COMPARISON WITH RANDOM BRAINS:");
  console.log("=================================");

  const randomBrains = generateRandomBrains(numSamples);
  const randomOutputs = randomBrains.map((brain) =>
    brain.process(new Array(14).fill(0.5))
  );

  const randomWeightAnalysis = analyzeWeights(randomBrains);
  const randomActivationAnalysis = analyzeActivations(randomBrains, testInputs);
  const randomMovementAnalysis = analyzeMovementBias(randomOutputs);

  console.log(`\n🔢 Weight Comparison:`);
  console.log(
    `   Bootstrap std dev: ${weightAnalysis.inputToHidden.std.toFixed(
      3
    )} (input→hidden), ${weightAnalysis.hiddenToOutput.std.toFixed(
      3
    )} (hidden→output)`
  );
  console.log(
    `   Random std dev: ${randomWeightAnalysis.inputToHidden.std.toFixed(
      3
    )} (input→hidden), ${randomWeightAnalysis.hiddenToOutput.std.toFixed(
      3
    )} (hidden→output)`
  );

  console.log(`\n🧠 Activity Comparison:`);
  console.log(
    `   Bootstrap dead neurons: ${activationAnalysis.hiddenLayerDeadNeurons}/10`
  );
  console.log(
    `   Random dead neurons: ${randomActivationAnalysis.hiddenLayerDeadNeurons}/10`
  );

  console.log(`\n🎯 Bias Comparison:`);
  console.log(
    `   Bootstrap movement bias: ${movementAnalysis.magnitude.toFixed(3)}`
  );
  console.log(
    `   Random movement bias: ${randomMovementAnalysis.magnitude.toFixed(3)}`
  );

  // Final assessment
  console.log("\n🏁 ASSESSMENT:");
  console.log("==============");

  const problems: string[] = [];
  const recommendations: string[] = [];

  if (activationAnalysis.hiddenLayerDeadNeurons > 5) {
    problems.push("🚨 Over 50% of hidden neurons are dead (always output 0)");
    recommendations.push(
      "💡 Reduce weight magnitudes or adjust bias initialization"
    );
  }

  if (movementAnalysis.magnitude > 0.5) {
    problems.push("🚨 Strong systematic movement bias detected");
    recommendations.push(
      "💡 Center output biases around 0 and reduce magnitude"
    );
  }

  if (activationAnalysis.responsiveness < 0.1) {
    problems.push("🚨 Very low responsiveness to input changes");
    recommendations.push("💡 Increase weight variance or reduce saturation");
  }

  if (
    weightAnalysis.inputToHidden.zeros >
    getTotalWeightCount(brains[0], 0) * 0.1
  ) {
    problems.push("🚨 Too many zero weights in input layer");
    recommendations.push("💡 Ensure all weights are properly initialized");
  }

  if (problems.length === 0) {
    console.log("✅ Bootstrap brain system appears to be working correctly!");
  } else {
    console.log(`❌ Found ${problems.length} potential issues:`);
    problems.forEach((problem) => console.log(`   ${problem}`));

    console.log(`\n💭 Recommendations:`);
    recommendations.forEach((rec) => console.log(`   ${rec}`));
  }

  console.log(`\n📋 Summary:`);
  console.log(
    `   Bootstrap brains: ${
      activationAnalysis.hiddenLayerDeadNeurons
    }/10 dead neurons, ${movementAnalysis.magnitude.toFixed(3)} bias`
  );
  console.log(
    `   Random brains: ${
      randomActivationAnalysis.hiddenLayerDeadNeurons
    }/10 dead neurons, ${randomMovementAnalysis.magnitude.toFixed(3)} bias`
  );

  if (
    randomActivationAnalysis.hiddenLayerDeadNeurons <
    activationAnalysis.hiddenLayerDeadNeurons
  ) {
    console.log(
      `   🎯 CONCLUSION: Random brains are more active than bootstrap brains!`
    );
  } else {
    console.log(
      `   🎯 CONCLUSION: Bootstrap brains are performing as expected`
    );
  }
}

function analyzeWeights(brains: any[]): any {
  const allInputToHidden: number[] = [];
  const allHiddenToOutput: number[] = [];

  brains.forEach((brain) => {
    try {
      // Access layer 0 (input to hidden) weights
      if (brain.layers && brain.layers[0] && brain.layers[0].neurons) {
        brain.layers[0].neurons.forEach((neuron: any) => {
          if (neuron.weights) allInputToHidden.push(...neuron.weights);
        });
      }

      // Access layer 1 (hidden to output) weights
      if (brain.layers && brain.layers[1] && brain.layers[1].neurons) {
        brain.layers[1].neurons.forEach((neuron: any) => {
          if (neuron.weights) allHiddenToOutput.push(...neuron.weights);
        });
      }
    } catch (error) {
      console.warn("Error accessing weights:", error);
    }
  });

  return {
    inputToHidden: calculateStats(allInputToHidden),
    hiddenToOutput: calculateStats(allHiddenToOutput),
  };
}

function analyzeBiases(brains: any[]): any {
  const allHiddenBiases: number[] = [];
  const allOutputBiases: number[] = [];

  brains.forEach((brain) => {
    try {
      // Access layer 0 (hidden layer) biases
      if (brain.layers && brain.layers[0] && brain.layers[0].neurons) {
        brain.layers[0].neurons.forEach((neuron: any) => {
          if (typeof neuron.bias === "number")
            allHiddenBiases.push(neuron.bias);
        });
      }

      // Access layer 1 (output layer) biases
      if (brain.layers && brain.layers[1] && brain.layers[1].neurons) {
        brain.layers[1].neurons.forEach((neuron: any) => {
          if (typeof neuron.bias === "number")
            allOutputBiases.push(neuron.bias);
        });
      }
    } catch (error) {
      console.warn("Error accessing biases:", error);
    }
  });

  return {
    hidden: calculateStats(allHiddenBiases),
    output: calculateStats(allOutputBiases),
  };
}

function analyzeActivations(brains: any[], testInputs: number[][]): any {
  let totalDeadNeurons = 0;
  let totalSaturation = 0;
  let totalResponsiveness = 0;

  brains.forEach((brain) => {
    // Count dead neurons
    let deadNeurons = 0;
    testInputs.forEach((inputs) => {
      const hiddenActivations = getHiddenActivations(brain, inputs);
      hiddenActivations.forEach((activation) => {
        if (Math.abs(activation) < 0.001) deadNeurons++;
      });
    });
    totalDeadNeurons += deadNeurons / testInputs.length;

    // Measure saturation
    const outputs = testInputs.map((inputs) => brain.process(inputs));
    const saturatedOutputs = outputs.filter((output) =>
      output.some((val: number) => Math.abs(val) > 0.9)
    ).length;
    totalSaturation += saturatedOutputs / outputs.length;

    // Measure responsiveness
    let responsiveness = 0;
    for (let i = 1; i < testInputs.length; i++) {
      const output1 = brain.process(testInputs[i - 1]);
      const output2 = brain.process(testInputs[i]);
      const outputChange = output1.reduce(
        (sum: number, val: number, idx: number) =>
          sum + Math.abs(val - output2[idx]),
        0
      );
      const inputChange = testInputs[i - 1].reduce(
        (sum: number, val: number, idx: number) =>
          sum + Math.abs(val - testInputs[i][idx]),
        0
      );
      if (inputChange > 0) {
        responsiveness += outputChange / inputChange;
      }
    }
    totalResponsiveness += responsiveness / Math.max(1, testInputs.length - 1);
  });

  return {
    hiddenLayerDeadNeurons: Math.round(totalDeadNeurons / brains.length),
    outputSaturation: totalSaturation / brains.length,
    responsiveness: totalResponsiveness / brains.length,
  };
}

function analyzeMovementBias(outputs: number[][]): any {
  const avgX =
    outputs.reduce((sum, output) => sum + output[0], 0) / outputs.length;
  const avgY =
    outputs.reduce((sum, output) => sum + output[1], 0) / outputs.length;
  const magnitude = Math.sqrt(avgX * avgX + avgY * avgY);

  // Calculate consistency (how similar all outputs are)
  const varX =
    outputs.reduce((sum, output) => sum + Math.pow(output[0] - avgX, 2), 0) /
    outputs.length;
  const varY =
    outputs.reduce((sum, output) => sum + Math.pow(output[1] - avgY, 2), 0) /
    outputs.length;
  const consistency = 1 - Math.sqrt(varX + varY) / 2; // Normalized inverse of variance

  return {
    magnitude,
    direction: { x: avgX, y: avgY },
    consistency: Math.max(0, consistency),
  };
}

function generateRandomBrains(count: number): any[] {
  const brains = [];
  for (let i = 0; i < count; i++) {
    brains.push(new NeuralNetwork([14, 10, 5], "tanh"));
  }
  return brains;
}

function generateTestInputs(): number[][] {
  const inputs = [];

  // Neutral inputs
  inputs.push(new Array(14).fill(0.5));

  // All zeros
  inputs.push(new Array(14).fill(0));

  // All ones
  inputs.push(new Array(14).fill(1));

  // Random variations
  for (let i = 0; i < 10; i++) {
    inputs.push(Array.from({ length: 14 }, () => Math.random()));
  }

  return inputs;
}

function getHiddenActivations(brain: any, inputs: number[]): number[] {
  try {
    // Process through first layer to get hidden activations
    if (brain.layers && brain.layers[0]) {
      const hiddenOutputs = brain.layers[0].process(inputs);
      return hiddenOutputs || [];
    }
    return [];
  } catch (error) {
    return [];
  }
}

function calculateStats(values: number[]): any {
  if (values.length === 0) return { min: 0, max: 0, mean: 0, std: 0, zeros: 0 };

  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const std = Math.sqrt(variance);
  const zeros = values.filter((val) => Math.abs(val) < 0.001).length;

  return { min, max, mean, std, zeros };
}

function getTotalWeightCount(brain: any, layer: number): number {
  try {
    if (brain.layers && brain.layers[layer] && brain.layers[layer].neurons) {
      return brain.layers[layer].neurons.reduce(
        (total: number, neuron: any) => {
          return total + (neuron.weights ? neuron.weights.length : 0);
        },
        0
      );
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

function getBiasCount(brain: any, layer: number): number {
  try {
    if (brain.layers && brain.layers[layer] && brain.layers[layer].neurons) {
      return brain.layers[layer].neurons.length;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  analyzeBootstrapBrains()
    .then(() => {
      console.log("\n✅ Bootstrap brain analysis completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Bootstrap brain analysis failed:", error);
      process.exit(1);
    });
}
