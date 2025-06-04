/**
 * Edge-Seeking Behavior Analysis Test
 *
 * Comprehensive test to identify why creatures move toward edges and stay there.
 * Tests multiple scenarios and tracks direction changes to find the root cause.
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BiomeType } from "../src/lib/environment/environmentTypes";

interface DirectionChange {
  tick: number;
  oldDirection: { x: number; y: number };
  newDirection: { x: number; y: number };
  angleDelta: number;
  reason: string;
  sensorChanges: string[];
  brainOutputChanges: string[];
}

interface BrainSnapshot {
  tick: number;
  sensors: number[];
  hiddenLayerActivations: number[];
  outputs: number[];
  position: { x: number; y: number };
  distanceToEdge: number;
  nearestFoodDistance: number | null;
}

interface ScenarioResult {
  scenarioName: string;
  totalTicks: number;
  directionChanges: DirectionChange[];
  finalPosition: { x: number; y: number };
  distanceToEdge: number;
  avgMovementMagnitude: number;
  stuckAtEdge: boolean;
  edgeSeekingDetected: boolean;
  brainSnapshots: BrainSnapshot[];
  neuralBiasAnalysis: {
    avgMoveX: number;
    avgMoveY: number;
    moveXVariance: number;
    moveYVariance: number;
    dominantNeurons: { index: number; avgActivation: number }[];
  };
}

async function testEdgeSeekingBehavior() {
  console.log("🎯 EDGE-SEEKING BEHAVIOR ANALYSIS");
  console.log("==================================");

  const scenarios = [
    {
      name: "Food Close, Edge Far",
      creaturePos: { x: 400, y: 400 },
      foodPos: { x: 420, y: 420 },
      description: "Creature at center with nearby food",
    },
    {
      name: "Food Far, Edge Far",
      creaturePos: { x: 400, y: 400 },
      foodPos: { x: 300, y: 300 },
      description: "Creature at center with distant food",
    },
    {
      name: "No Food, Edge Far",
      creaturePos: { x: 400, y: 400 },
      foodPos: null,
      description: "Creature at center with no specific food",
    },
    {
      name: "Near Left Edge",
      creaturePos: { x: 50, y: 400 },
      foodPos: { x: 400, y: 400 },
      description: "Creature near left edge with center food",
    },
    {
      name: "Near Top Edge",
      creaturePos: { x: 400, y: 50 },
      foodPos: { x: 400, y: 400 },
      description: "Creature near top edge with center food",
    },
    {
      name: "Near Bottom Edge",
      creaturePos: { x: 400, y: 750 },
      foodPos: { x: 400, y: 400 },
      description: "Creature near bottom edge with center food",
    },
    {
      name: "Near Right Edge",
      creaturePos: { x: 750, y: 400 },
      foodPos: { x: 400, y: 400 },
      description: "Creature near right edge with center food",
    },
    {
      name: "At Left Edge",
      creaturePos: { x: 10, y: 400 },
      foodPos: { x: 400, y: 400 },
      description: "Creature at left edge with center food",
    },
  ];

  const results: ScenarioResult[] = [];

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    console.log(`\n🧪 SCENARIO ${i + 1}: ${scenario.name}`);
    console.log("=".repeat(60));
    console.log(`   📍 ${scenario.description}`);

    const result = await runScenario(scenario);
    results.push(result);

    // Print scenario summary with brain analysis
    console.log(`\n📊 SCENARIO SUMMARY:`);
    console.log(`   Direction changes: ${result.directionChanges.length}`);
    console.log(
      `   Final position: (${result.finalPosition.x.toFixed(
        1
      )}, ${result.finalPosition.y.toFixed(1)})`
    );
    console.log(
      `   Distance to edge: ${result.distanceToEdge.toFixed(1)} pixels`
    );
    console.log(
      `   Avg movement: ${result.avgMovementMagnitude.toFixed(3)} pixels/tick`
    );
    console.log(`   Stuck at edge: ${result.stuckAtEdge ? "❌ YES" : "✅ NO"}`);
    console.log(
      `   Edge-seeking: ${
        result.edgeSeekingDetected ? "🚨 DETECTED" : "✅ NONE"
      }`
    );

    // Brain bias analysis
    const bias = result.neuralBiasAnalysis;
    console.log(`\n🧠 BRAIN BIAS ANALYSIS:`);
    console.log(
      `   Avg MoveX: ${bias.avgMoveX.toFixed(
        3
      )} (variance: ${bias.moveXVariance.toFixed(3)})`
    );
    console.log(
      `   Avg MoveY: ${bias.avgMoveY.toFixed(
        3
      )} (variance: ${bias.moveYVariance.toFixed(3)})`
    );
    console.log(`   Dominant Neurons:`);
    bias.dominantNeurons.slice(0, 3).forEach((neuron, idx) => {
      console.log(
        `     #${neuron.index}: ${neuron.avgActivation.toFixed(
          3
        )} avg activation`
      );
    });

    // Show brain snapshots for edge scenarios
    if (result.stuckAtEdge || result.edgeSeekingDetected) {
      console.log(`\n🔬 DETAILED BRAIN ACTIVITY (First 10 ticks):`);
      result.brainSnapshots.slice(0, 10).forEach((snap, idx) => {
        console.log(`   Tick ${snap.tick}:`);
        console.log(
          `     Pos: (${snap.position.x.toFixed(1)}, ${snap.position.y.toFixed(
            1
          )}) Edge: ${snap.distanceToEdge.toFixed(1)}px`
        );
        console.log(
          `     Outputs: MoveX=${snap.outputs[0].toFixed(
            3
          )}, MoveY=${snap.outputs[1].toFixed(3)}`
        );
        console.log(
          `     Key Sensors: Food=${snap.sensors[0].toFixed(
            3
          )}, Vision=[${snap.sensors
            .slice(10, 14)
            .map((s) => s.toFixed(2))
            .join(",")}]`
        );
        console.log(
          `     Top Hidden: [${snap.hiddenLayerActivations
            .slice(0, 5)
            .map((h) => h.toFixed(2))
            .join(",")}]`
        );
      });
    }

    if (i < scenarios.length - 1) {
      console.log(`\n${"═".repeat(80)}`);
    }
  }

  // Cross-scenario analysis
  console.log(`\n🔍 CROSS-SCENARIO ANALYSIS:`);
  console.log("============================");

  const edgeSeekingScenarios = results.filter((r) => r.edgeSeekingDetected);
  const stuckAtEdgeScenarios = results.filter((r) => r.stuckAtEdge);

  console.log(`\n📈 EDGE-SEEKING PATTERNS:`);
  console.log(
    `   Scenarios with edge-seeking: ${edgeSeekingScenarios.length}/${results.length}`
  );
  console.log(
    `   Scenarios stuck at edge: ${stuckAtEdgeScenarios.length}/${results.length}`
  );

  // Neural bias comparison
  console.log(`\n🧠 NEURAL BIAS COMPARISON:`);
  results.forEach((result) => {
    const bias = result.neuralBiasAnalysis;
    const biasDirection =
      Math.atan2(bias.avgMoveY, bias.avgMoveX) * (180 / Math.PI);
    const biasMagnitude = Math.sqrt(bias.avgMoveX ** 2 + bias.avgMoveY ** 2);
    console.log(
      `   ${result.scenarioName}: Bias=${biasMagnitude.toFixed(
        3
      )} at ${biasDirection.toFixed(1)}°`
    );
  });

  // Weight analysis for edge scenarios
  if (stuckAtEdgeScenarios.length > 0) {
    console.log(`\n⚖️ NEURAL WEIGHT ANALYSIS:`);
    const creature = await createTestCreature({ x: 400, y: 400 });
    analyzeNeuralWeights(creature);
  }
}

async function runScenario(scenario: any): Promise<ScenarioResult> {
  // Create environment
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
    foodSpawnRate: 0.1,
    preySpawnRate: 0.05,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Clear random food and add specific food if needed
  const allFood = environment.getAllFood();
  allFood.forEach((food) => {
    (environment as any).food.delete(food.id);
    (environment as any).removeFromSpatialGrid(food);
  });

  if (scenario.foodPos) {
    const testFood = {
      id: `test_food_${Date.now()}`,
      position: { x: scenario.foodPos.x, y: scenario.foodPos.y },
      type: "PlantFood" as any,
      isActive: true,
      energy: 5,
      size: 3,
      spawnRate: 0.5,
      maxQuantity: 200,
    };
    (environment as any).food.set(testFood.id, testFood);
    (environment as any).addToSpatialGrid(testFood);
  }

  // Create creature
  const creature = await createTestCreature(scenario.creaturePos);

  const directionChanges: DirectionChange[] = [];
  const brainSnapshots: BrainSnapshot[] = [];
  const ticksToRun = 50;
  let previousDirection = { x: 0, y: 0 };
  let previousSensors: number[] = [];
  let previousBrainOutputs: number[] = [];
  let totalMovement = 0;
  const moveXValues: number[] = [];
  const moveYValues: number[] = [];

  console.log(
    `\n   Starting position: (${scenario.creaturePos.x}, ${scenario.creaturePos.y})`
  );
  if (scenario.foodPos) {
    console.log(
      `   Food position: (${scenario.foodPos.x}, ${scenario.foodPos.y})`
    );
  }

  for (let tick = 0; tick < ticksToRun; tick++) {
    const oldPos = {
      x: creature.physics.position.x,
      y: creature.physics.position.y,
    };

    // Get sensor and brain data with detailed brain analysis
    const sensors = (creature as any).sense(environment);
    const brainOutputs = creature.brain.process(sensors);

    // Access hidden layer activations (need to modify brain to expose this)
    const hiddenActivations = getHiddenLayerActivations(
      creature.brain,
      sensors
    );

    // Calculate distance to nearest food
    const nearestFoodDistance = scenario.foodPos
      ? Math.sqrt(
          (oldPos.x - scenario.foodPos.x) ** 2 +
            (oldPos.y - scenario.foodPos.y) ** 2
        )
      : null;

    // Store brain snapshot
    brainSnapshots.push({
      tick,
      sensors: [...sensors],
      hiddenLayerActivations: hiddenActivations,
      outputs: [...brainOutputs],
      position: { ...oldPos },
      distanceToEdge: getDistanceToEdge(oldPos),
      nearestFoodDistance,
    });

    // Track movement outputs for bias analysis
    moveXValues.push(brainOutputs[0]);
    moveYValues.push(brainOutputs[1]);

    // Update creature
    creature.update(environment);

    const newPos = {
      x: creature.physics.position.x,
      y: creature.physics.position.y,
    };
    const movement = {
      x: newPos.x - oldPos.x,
      y: newPos.y - oldPos.y,
    };

    const movementMagnitude = Math.sqrt(movement.x ** 2 + movement.y ** 2);
    totalMovement += movementMagnitude;

    // Calculate direction
    const currentDirection = {
      x: movementMagnitude > 0.01 ? movement.x / movementMagnitude : 0,
      y: movementMagnitude > 0.01 ? movement.y / movementMagnitude : 0,
    };

    // Check for direction change
    if (tick > 0) {
      const dotProduct =
        previousDirection.x * currentDirection.x +
        previousDirection.y * currentDirection.y;
      const angle =
        Math.acos(Math.max(-1, Math.min(1, dotProduct))) * (180 / Math.PI);

      if (angle > 15) {
        // 15 degree threshold for direction change
        // Analyze what caused the change
        const sensorChanges = analyzeSensorChanges(previousSensors, sensors);
        const brainChanges = analyzeBrainChanges(
          previousBrainOutputs,
          brainOutputs
        );

        let reason = "Unknown";
        if (sensorChanges.length > 0) {
          reason = `Sensor: ${sensorChanges[0]}`;
        } else if (brainChanges.length > 0) {
          reason = `Brain: ${brainChanges[0]}`;
        } else if (isNearEdge(newPos)) {
          reason = "Near boundary";
        }

        directionChanges.push({
          tick,
          oldDirection: previousDirection,
          newDirection: currentDirection,
          angleDelta: angle,
          reason,
          sensorChanges,
          brainOutputChanges: brainChanges,
        });

        if (tick < 10) {
          // Log early direction changes for debugging
          console.log(
            `   🔄 Tick ${tick}: Direction change ${angle.toFixed(
              1
            )}° - ${reason}`
          );
        }
      }
    }

    previousDirection = currentDirection;
    previousSensors = [...sensors];
    previousBrainOutputs = [...brainOutputs];

    // Update environment
    environment.update();
  }

  const finalPos = {
    x: creature.physics.position.x,
    y: creature.physics.position.y,
  };
  const distanceToEdge = getDistanceToEdge(finalPos);
  const avgMovement = totalMovement / ticksToRun;

  // Calculate neural bias analysis
  const avgMoveX = moveXValues.reduce((a, b) => a + b, 0) / moveXValues.length;
  const avgMoveY = moveYValues.reduce((a, b) => a + b, 0) / moveYValues.length;
  const moveXVariance =
    moveXValues.reduce((sum, val) => sum + Math.pow(val - avgMoveX, 2), 0) /
    moveXValues.length;
  const moveYVariance =
    moveYValues.reduce((sum, val) => sum + Math.pow(val - avgMoveY, 2), 0) /
    moveYValues.length;

  // Find dominant hidden neurons
  const neuronSums = brainSnapshots[0].hiddenLayerActivations.map(
    (_, neuronIdx) => {
      const sum = brainSnapshots.reduce(
        (sum, snap) => sum + Math.abs(snap.hiddenLayerActivations[neuronIdx]),
        0
      );
      return { index: neuronIdx, avgActivation: sum / brainSnapshots.length };
    }
  );
  const dominantNeurons = neuronSums.sort(
    (a, b) => b.avgActivation - a.avgActivation
  );

  return {
    scenarioName: scenario.name,
    totalTicks: ticksToRun,
    directionChanges,
    finalPosition: finalPos,
    distanceToEdge,
    avgMovementMagnitude: avgMovement,
    stuckAtEdge: distanceToEdge < 20,
    edgeSeekingDetected: detectEdgeSeeking(directionChanges, finalPos),
    brainSnapshots,
    neuralBiasAnalysis: {
      avgMoveX,
      avgMoveY,
      moveXVariance,
      moveYVariance,
      dominantNeurons,
    },
  };
}

async function createTestCreature(position: {
  x: number;
  y: number;
}): Promise<Creature> {
  const genetics = GeneticsHelper.generateRandomGenetics();
  return new Creature(0, genetics, undefined, position);
}

function getHiddenLayerActivations(brain: any, sensors: number[]): number[] {
  // Try to access hidden layer activations
  // This might need adjustment based on the actual NeuralNetwork implementation
  try {
    // Process through the brain manually to get hidden layer
    const inputs = sensors;
    const hiddenWeights = brain.weights[0]; // Assuming first layer is input to hidden
    const hiddenBiases = brain.biases[0];

    const hiddenSize = hiddenBiases.length;
    const hidden = new Array(hiddenSize).fill(0);

    // Calculate hidden layer activations
    for (let h = 0; h < hiddenSize; h++) {
      let sum = hiddenBiases[h];
      for (let i = 0; i < inputs.length; i++) {
        sum += inputs[i] * hiddenWeights[i * hiddenSize + h];
      }
      hidden[h] = Math.tanh(sum); // Assuming tanh activation
    }

    return hidden;
  } catch (error: unknown) {
    // Fallback if we can't access hidden layer
    return new Array(10).fill(0);
  }
}

function analyzeNeuralWeights(creature: Creature) {
  try {
    const brain = creature.brain;
    console.log(`   🔍 Analyzing neural network weights...`);

    // Access weights if possible
    const weights = (brain as any).weights;
    const biases = (brain as any).biases;

    if (weights && weights.length > 0) {
      console.log(`   Input->Hidden weights: ${weights[0].length} connections`);

      // Check for systematic biases in input->hidden weights
      const avgWeightsByInput = [];
      const inputSize = 14; // Based on sensor count
      const hiddenSize = biases[0].length;

      for (let i = 0; i < inputSize; i++) {
        let sum = 0;
        for (let h = 0; h < hiddenSize; h++) {
          sum += weights[0][i * hiddenSize + h];
        }
        avgWeightsByInput.push(sum / hiddenSize);
      }

      console.log(`   Average weights by sensor:`);
      const sensorNames = [
        "Food Dist",
        "Food Type",
        "Carrion Dist",
        "Carrion Fresh",
        "Predator",
        "Prey",
        "Energy",
        "Health",
        "Age",
        "Population",
        "Vision Fwd",
        "Vision L",
        "Vision R",
        "Vision Back",
      ];

      avgWeightsByInput.forEach((avgWeight, idx) => {
        if (Math.abs(avgWeight) > 0.5) {
          console.log(
            `     ${sensorNames[idx]}: ${avgWeight.toFixed(3)} (STRONG)`
          );
        }
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`   ❌ Could not analyze weights: ${errorMessage}`);
  }
}

function analyzeSensorChanges(prev: number[], current: number[]): string[] {
  const changes: string[] = [];
  const sensorNames = [
    "Food Distance",
    "Food Type",
    "Carrion Distance",
    "Carrion Fresh",
    "Predator Distance",
    "Prey Distance",
    "Energy",
    "Health",
    "Age",
    "Population",
    "Vision Forward",
    "Vision Left",
    "Vision Right",
    "Vision Back",
  ];

  for (let i = 0; i < Math.min(prev.length, current.length); i++) {
    const delta = Math.abs(current[i] - prev[i]);
    if (delta > 0.1) {
      // Significant change threshold
      changes.push(`${sensorNames[i]} Δ${delta.toFixed(3)}`);
    }
  }

  return changes.slice(0, 3); // Return top 3 changes
}

function analyzeBrainChanges(prev: number[], current: number[]): string[] {
  const changes: string[] = [];
  const outputNames = ["MoveX", "MoveY", "Eat", "Attack", "Reproduce"];

  for (let i = 0; i < Math.min(prev.length, current.length); i++) {
    const delta = Math.abs(current[i] - prev[i]);
    if (delta > 0.1) {
      // Significant change threshold
      changes.push(`${outputNames[i]} Δ${delta.toFixed(3)}`);
    }
  }

  return changes.slice(0, 2); // Return top 2 changes
}

function isNearEdge(pos: { x: number; y: number }): boolean {
  const centerX = 400,
    centerY = 400,
    radius = 400;
  const distFromCenter = Math.sqrt(
    (pos.x - centerX) ** 2 + (pos.y - centerY) ** 2
  );
  return distFromCenter > radius - 50; // Within 50 pixels of edge
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

function detectEdgeSeeking(
  changes: DirectionChange[],
  finalPos: { x: number; y: number }
): boolean {
  // Edge-seeking detected if:
  // 1. Few direction changes AND close to edge, OR
  // 2. Direction changes trend toward edge
  const fewChanges = changes.length < 3;
  const nearEdge = getDistanceToEdge(finalPos) < 50;

  return fewChanges && nearEdge;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEdgeSeekingBehavior()
    .then(() => {
      console.log("\n✅ Edge-seeking analysis completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Edge-seeking analysis failed:", error);
      process.exit(1);
    });
}
