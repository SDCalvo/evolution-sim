/**
 * Bootstrap vs Random Brains Test
 *
 * Compare the behavior of creatures with bootstrap brains vs completely random brains
 * to determine if the bootstrap system is helping or causing problems
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BiomeType, EntityType } from "../src/lib/environment/environmentTypes";
import { NeuralNetwork } from "../src/lib/neural/network";
import { BootstrapBrainFactory } from "../src/lib/creatures/bootstrapBrains";

interface BrainAnalysis {
  brainType: "Bootstrap" | "Random";
  avgMoveX: number;
  avgMoveY: number;
  movementVariance: number;
  hiddenLayerActivity: number;
  sensorResponsiveness: number;
  finalPosition: { x: number; y: number };
  distanceToFood: number;
  directionChanges: number;
  stuckAtEdge: boolean;
  weights: {
    inputToHidden: { min: number; max: number; avg: number };
    hiddenToOutput: { min: number; max: number; avg: number };
  };
  biases: {
    hidden: { min: number; max: number; avg: number };
    output: { min: number; max: number; avg: number };
  };
}

async function testBootstrapVsRandomBrains() {
  console.log("🧠 BOOTSTRAP VS RANDOM BRAINS TEST");
  console.log("===================================");

  // Create test environment
  const environment = new Environment({
    bounds: {
      width: 800,
      height: 800,
      shape: "circular",
      centerX: 400,
      centerY: 400,
      radius: 400,
    },
    biome: {
      type: BiomeType.Grassland,
      name: "Grassland",
      characteristics: {
        temperature: 0.6,
        humidity: 0.5,
        waterAvailability: 0.7,
        plantDensity: 0.8,
        preyDensity: 0.4,
        shelterAvailability: 0.3,
        predationPressure: 0.3,
        competitionLevel: 0.5,
        seasonalVariation: 0.2,
      },
      color: "#4ade80",
      description: "Test environment",
    },
    maxCreatures: 50,
    maxFood: 200,
    foodSpawnRate: 0.0, // No random spawning
    preySpawnRate: 0.0,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Clear existing food and add test food
  const allFood = environment.getAllFood();
  allFood.forEach((food) => {
    (environment as any).food.delete(food.id);
    (environment as any).removeFromSpatialGrid(food);
  });

  const testFood = {
    id: "test_food_comparison",
    position: { x: 450, y: 450 },
    type: EntityType.PlantFood,
    isActive: true,
    energy: 5,
    size: 3,
    spawnRate: 0.5,
    maxQuantity: 200,
  };

  (environment as any).food.set(testFood.id, testFood);
  (environment as any).addToSpatialGrid(testFood);

  console.log(
    `\n🥕 Test food at (${testFood.position.x}, ${testFood.position.y})`
  );
  console.log(
    `   Distance from center: ${Math.sqrt(
      (testFood.position.x - 400) ** 2 + (testFood.position.y - 400) ** 2
    ).toFixed(1)}px`
  );

  // Test both brain types
  const results: BrainAnalysis[] = [];

  for (const brainType of ["Bootstrap", "Random"] as const) {
    console.log(`\n🔬 TESTING ${brainType.toUpperCase()} BRAINS:`);
    console.log("=".repeat(40));

    const result = await testBrainType(environment, brainType, testFood);
    results.push(result);

    // Print individual results
    console.log(`\n📊 ${brainType} Brain Results:`);
    console.log(
      `   Movement: X=${result.avgMoveX.toFixed(
        3
      )}, Y=${result.avgMoveY.toFixed(3)}`
    );
    console.log(`   Movement variance: ${result.movementVariance.toFixed(3)}`);
    console.log(
      `   Hidden layer activity: ${result.hiddenLayerActivity.toFixed(3)}`
    );
    console.log(
      `   Sensor responsiveness: ${result.sensorResponsiveness.toFixed(3)}`
    );
    console.log(
      `   Final distance to food: ${result.distanceToFood.toFixed(1)}px`
    );
    console.log(`   Direction changes: ${result.directionChanges}`);
    console.log(`   Stuck at edge: ${result.stuckAtEdge ? "❌ YES" : "✅ NO"}`);

    console.log(`\n⚖️ Weight Analysis:`);
    console.log(
      `   Input→Hidden: ${result.weights.inputToHidden.min.toFixed(
        2
      )} to ${result.weights.inputToHidden.max.toFixed(
        2
      )} (avg: ${result.weights.inputToHidden.avg.toFixed(2)})`
    );
    console.log(
      `   Hidden→Output: ${result.weights.hiddenToOutput.min.toFixed(
        2
      )} to ${result.weights.hiddenToOutput.max.toFixed(
        2
      )} (avg: ${result.weights.hiddenToOutput.avg.toFixed(2)})`
    );

    console.log(`\n🎯 Bias Analysis:`);
    console.log(
      `   Hidden biases: ${result.biases.hidden.min.toFixed(
        2
      )} to ${result.biases.hidden.max.toFixed(
        2
      )} (avg: ${result.biases.hidden.avg.toFixed(2)})`
    );
    console.log(
      `   Output biases: ${result.biases.output.min.toFixed(
        2
      )} to ${result.biases.output.max.toFixed(
        2
      )} (avg: ${result.biases.output.avg.toFixed(2)})`
    );
  }

  // Compare results
  console.log(`\n🏆 COMPARISON RESULTS:`);
  console.log("====================");

  const bootstrap = results[0];
  const random = results[1];

  console.log(`\n📊 Movement Quality:`);
  console.log(
    `   Bootstrap variance: ${bootstrap.movementVariance.toFixed(3)}`
  );
  console.log(`   Random variance: ${random.movementVariance.toFixed(3)}`);
  console.log(
    `   Winner: ${
      random.movementVariance > bootstrap.movementVariance
        ? "🎉 Random (more varied)"
        : "🎉 Bootstrap (more varied)"
    }`
  );

  console.log(`\n🧠 Brain Activity:`);
  console.log(
    `   Bootstrap hidden activity: ${bootstrap.hiddenLayerActivity.toFixed(3)}`
  );
  console.log(
    `   Random hidden activity: ${random.hiddenLayerActivity.toFixed(3)}`
  );
  console.log(
    `   Winner: ${
      random.hiddenLayerActivity > bootstrap.hiddenLayerActivity
        ? "🎉 Random (more active)"
        : "🎉 Bootstrap (more active)"
    }`
  );

  console.log(`\n📡 Environmental Responsiveness:`);
  console.log(
    `   Bootstrap responsiveness: ${bootstrap.sensorResponsiveness.toFixed(3)}`
  );
  console.log(
    `   Random responsiveness: ${random.sensorResponsiveness.toFixed(3)}`
  );
  console.log(
    `   Winner: ${
      random.sensorResponsiveness > bootstrap.sensorResponsiveness
        ? "🎉 Random (more responsive)"
        : "🎉 Bootstrap (more responsive)"
    }`
  );

  console.log(`\n🎯 Goal Achievement (closer to food):`);
  console.log(
    `   Bootstrap distance: ${bootstrap.distanceToFood.toFixed(1)}px`
  );
  console.log(`   Random distance: ${random.distanceToFood.toFixed(1)}px`);
  console.log(
    `   Winner: ${
      random.distanceToFood < bootstrap.distanceToFood
        ? "🎉 Random (closer)"
        : "🎉 Bootstrap (closer)"
    }`
  );

  console.log(`\n🚫 Edge Avoidance:`);
  console.log(
    `   Bootstrap stuck at edge: ${bootstrap.stuckAtEdge ? "❌ YES" : "✅ NO"}`
  );
  console.log(
    `   Random stuck at edge: ${random.stuckAtEdge ? "❌ YES" : "✅ NO"}`
  );

  console.log(`\n🏁 FINAL VERDICT:`);
  let bootstrapScore = 0;
  let randomScore = 0;

  if (bootstrap.movementVariance > random.movementVariance) bootstrapScore++;
  else randomScore++;
  if (bootstrap.hiddenLayerActivity > random.hiddenLayerActivity)
    bootstrapScore++;
  else randomScore++;
  if (bootstrap.sensorResponsiveness > random.sensorResponsiveness)
    bootstrapScore++;
  else randomScore++;
  if (bootstrap.distanceToFood < random.distanceToFood) bootstrapScore++;
  else randomScore++;
  if (!bootstrap.stuckAtEdge && random.stuckAtEdge) bootstrapScore++;
  if (bootstrap.stuckAtEdge && !random.stuckAtEdge) randomScore++;

  console.log(`   Bootstrap score: ${bootstrapScore}/5`);
  console.log(`   Random score: ${randomScore}/5`);

  if (randomScore > bootstrapScore) {
    console.log(
      `   🎉 RANDOM BRAINS WIN! Bootstrap system may be hurting performance.`
    );
  } else if (bootstrapScore > randomScore) {
    console.log(`   🎉 BOOTSTRAP BRAINS WIN! Bootstrap system is helping.`);
  } else {
    console.log(`   🤝 TIE! Both approaches have similar performance.`);
  }

  console.log(`\n💡 RECOMMENDATIONS:`);
  if (bootstrap.hiddenLayerActivity < 0.1) {
    console.log(
      `   🚨 Bootstrap brains have dead hidden layers - fix weight initialization`
    );
  }
  if (bootstrap.movementVariance < 0.01) {
    console.log(
      `   🚨 Bootstrap brains too predictable - reduce movement biases`
    );
  }
  if (random.sensorResponsiveness > bootstrap.sensorResponsiveness * 2) {
    console.log(
      `   🚨 Bootstrap brains ignore sensors - fix sensor-to-hidden weights`
    );
  }
}

async function testBrainType(
  environment: Environment,
  brainType: "Bootstrap" | "Random",
  testFood: any
): Promise<BrainAnalysis> {
  // Create genetics
  const genetics = GeneticsHelper.generateRandomGenetics();
  genetics.visionRange = 0.8; // Fixed for fair comparison
  genetics.plantPreference = 0.8;
  genetics.meatPreference = 0.2;

  // Create creature
  let creature: Creature;
  if (brainType === "Bootstrap") {
    creature = new Creature(0, genetics, undefined, { x: 400, y: 400 });
  } else {
    // Create creature with random brain
    creature = new Creature(0, genetics, undefined, { x: 400, y: 400 });
    // Replace bootstrap brain with completely random brain
    const randomBrain = new NeuralNetwork([14, 10, 5], "tanh"); // Same architecture
    (creature as any).brain = randomBrain;
  }

  // Analyze brain weights and biases
  const brain = creature.brain;

  // Collect weights from layers
  const inputToHiddenWeights: number[] = [];
  const hiddenToOutputWeights: number[] = [];
  const hiddenBiases: number[] = [];
  const outputBiases: number[] = [];

  try {
    // Layer 0 (input to hidden)
    if (
      (brain as any).layers &&
      (brain as any).layers[0] &&
      (brain as any).layers[0].neurons
    ) {
      (brain as any).layers[0].neurons.forEach((neuron: any) => {
        if (neuron.weights) inputToHiddenWeights.push(...neuron.weights);
        if (typeof neuron.bias === "number") hiddenBiases.push(neuron.bias);
      });
    }

    // Layer 1 (hidden to output)
    if (
      (brain as any).layers &&
      (brain as any).layers[1] &&
      (brain as any).layers[1].neurons
    ) {
      (brain as any).layers[1].neurons.forEach((neuron: any) => {
        if (neuron.weights) hiddenToOutputWeights.push(...neuron.weights);
        if (typeof neuron.bias === "number") outputBiases.push(neuron.bias);
      });
    }
  } catch (error) {
    console.warn("Error accessing brain structure:", error);
  }

  const weightsAnalysis = {
    inputToHidden: {
      min:
        inputToHiddenWeights.length > 0 ? Math.min(...inputToHiddenWeights) : 0,
      max:
        inputToHiddenWeights.length > 0 ? Math.max(...inputToHiddenWeights) : 0,
      avg:
        inputToHiddenWeights.length > 0
          ? inputToHiddenWeights.reduce((a: number, b: number) => a + b, 0) /
            inputToHiddenWeights.length
          : 0,
    },
    hiddenToOutput: {
      min:
        hiddenToOutputWeights.length > 0
          ? Math.min(...hiddenToOutputWeights)
          : 0,
      max:
        hiddenToOutputWeights.length > 0
          ? Math.max(...hiddenToOutputWeights)
          : 0,
      avg:
        hiddenToOutputWeights.length > 0
          ? hiddenToOutputWeights.reduce((a: number, b: number) => a + b, 0) /
            hiddenToOutputWeights.length
          : 0,
    },
  };

  const biasesAnalysis = {
    hidden: {
      min: hiddenBiases.length > 0 ? Math.min(...hiddenBiases) : 0,
      max: hiddenBiases.length > 0 ? Math.max(...hiddenBiases) : 0,
      avg:
        hiddenBiases.length > 0
          ? hiddenBiases.reduce((a: number, b: number) => a + b, 0) /
            hiddenBiases.length
          : 0,
    },
    output: {
      min: outputBiases.length > 0 ? Math.min(...outputBiases) : 0,
      max: outputBiases.length > 0 ? Math.max(...outputBiases) : 0,
      avg:
        outputBiases.length > 0
          ? outputBiases.reduce((a: number, b: number) => a + b, 0) /
            outputBiases.length
          : 0,
    },
  };

  // Run simulation
  const moveXValues: number[] = [];
  const moveYValues: number[] = [];
  const hiddenActivations: number[][] = [];
  const sensorValues: number[][] = [];
  let directionChanges = 0;
  let previousDirection = { x: 0, y: 0 };

  console.log(`\n   Running ${brainType} brain simulation...`);

  for (let tick = 0; tick < 50; tick++) {
    const oldPos = {
      x: creature.physics.position.x,
      y: creature.physics.position.y,
    };

    // Get sensors and brain activity
    const sensors = (creature as any).sense(environment);
    const brainOutputs = creature.brain.process(sensors);

    // Get hidden layer activations
    const hiddenLayer = getHiddenLayerActivations(creature.brain, sensors);

    moveXValues.push(brainOutputs[0]);
    moveYValues.push(brainOutputs[1]);
    hiddenActivations.push(hiddenLayer);
    sensorValues.push([...sensors]);

    // Update creature
    creature.update(environment);
    environment.update();

    // Track direction changes
    const newPos = {
      x: creature.physics.position.x,
      y: creature.physics.position.y,
    };
    const movement = { x: newPos.x - oldPos.x, y: newPos.y - oldPos.y };
    const movementMagnitude = Math.sqrt(movement.x ** 2 + movement.y ** 2);

    if (movementMagnitude > 0.01) {
      const currentDirection = {
        x: movement.x / movementMagnitude,
        y: movement.y / movementMagnitude,
      };

      if (tick > 0) {
        const dotProduct =
          previousDirection.x * currentDirection.x +
          previousDirection.y * currentDirection.y;
        const angle =
          Math.acos(Math.max(-1, Math.min(1, dotProduct))) * (180 / Math.PI);
        if (angle > 20) {
          directionChanges++;
        }
      }

      previousDirection = currentDirection;
    }
  }

  // Calculate metrics
  const avgMoveX = moveXValues.reduce((a, b) => a + b, 0) / moveXValues.length;
  const avgMoveY = moveYValues.reduce((a, b) => a + b, 0) / moveYValues.length;

  const moveXVariance =
    moveXValues.reduce((sum, val) => sum + Math.pow(val - avgMoveX, 2), 0) /
    moveXValues.length;
  const moveYVariance =
    moveYValues.reduce((sum, val) => sum + Math.pow(val - avgMoveY, 2), 0) /
    moveYValues.length;
  const movementVariance = Math.sqrt(moveXVariance + moveYVariance);

  // Hidden layer activity (average absolute activation)
  const hiddenLayerActivity =
    hiddenActivations.reduce((sum, activations) => {
      return (
        sum +
        activations.reduce((sum2, act) => sum2 + Math.abs(act), 0) /
          activations.length
      );
    }, 0) / hiddenActivations.length;

  // Sensor responsiveness (how much outputs change when sensors change)
  let sensorResponsiveness = 0;
  if (sensorValues.length > 1) {
    for (let i = 1; i < sensorValues.length; i++) {
      const sensorChange = sensorValues[i].reduce(
        (sum, val, idx) => sum + Math.abs(val - sensorValues[i - 1][idx]),
        0
      );
      const outputChange =
        Math.abs(moveXValues[i] - moveXValues[i - 1]) +
        Math.abs(moveYValues[i] - moveYValues[i - 1]);
      if (sensorChange > 0.01) {
        sensorResponsiveness += outputChange / sensorChange;
      }
    }
    sensorResponsiveness /= Math.max(1, sensorValues.length - 1);
  }

  const finalPos = {
    x: creature.physics.position.x,
    y: creature.physics.position.y,
  };
  const distanceToFood = Math.sqrt(
    (finalPos.x - testFood.position.x) ** 2 +
      (finalPos.y - testFood.position.y) ** 2
  );
  const distanceToEdge = getDistanceToEdge(finalPos);

  return {
    brainType,
    avgMoveX,
    avgMoveY,
    movementVariance,
    hiddenLayerActivity,
    sensorResponsiveness,
    finalPosition: finalPos,
    distanceToFood,
    directionChanges,
    stuckAtEdge: distanceToEdge < 20,
    weights: weightsAnalysis,
    biases: biasesAnalysis,
  };
}

function getHiddenLayerActivations(brain: any, sensors: number[]): number[] {
  try {
    // Process through first layer to get hidden activations
    if (brain.layers && brain.layers[0]) {
      const hiddenOutputs = brain.layers[0].process(sensors);
      return hiddenOutputs || new Array(8).fill(0); // Bootstrap uses 8 hidden neurons
    }
    return new Array(8).fill(0);
  } catch (error) {
    return new Array(10).fill(0);
  }
}

function getDistanceToEdge(pos: { x: number; y: number }): number {
  const centerX = 400,
    centerY = 400,
    radius = 400;
  const distFromCenter = Math.sqrt(
    (pos.x - centerX) ** 2 + (pos.y - centerY) ** 2
  );
  return Math.max(0, radius - distFromCenter);
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBootstrapVsRandomBrains()
    .then(() => {
      console.log("\n✅ Bootstrap vs Random brains test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Bootstrap vs Random brains test failed:", error);
      process.exit(1);
    });
}
