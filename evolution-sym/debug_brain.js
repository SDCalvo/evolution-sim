// Quick debug script to test bootstrap brain outputs
const {
  BootstrapBrainFactory,
} = require("./dist/lib/creatures/bootstrapBrains.js");
const { GeneticsHelper } = require("./dist/lib/genetics/genetics.js");

console.log("🧠 Testing Bootstrap Brain Outputs...\n");

// Create a founder brain (Generation 0)
const genetics = GeneticsHelper.generateRandomGenetics();
const brain = BootstrapBrainFactory.createFounderBrain(genetics);

// Test with different sensor scenarios
const testScenarios = [
  {
    name: "Low Energy + Food Nearby",
    sensors: [
      0.2, // food distance (close)
      0.8, // food type (plant)
      1.0, // carrion distance (far)
      0.0, // carrion freshness
      1.0, // predator distance (far)
      1.0, // prey distance (far)
      0.1, // energy (LOW!)
      0.8, // health
      0.3, // age
      0.5, // population
      1.0,
      1.0,
      1.0,
      1.0, // vision clear
    ],
  },
  {
    name: "High Energy + No Food",
    sensors: [
      1.0, // food distance (far)
      0.5, // food type
      1.0, // carrion distance (far)
      0.0, // carrion freshness
      1.0, // predator distance (far)
      1.0, // prey distance (far)
      0.9, // energy (HIGH!)
      0.8, // health
      0.3, // age
      0.5, // population
      1.0,
      1.0,
      1.0,
      1.0, // vision clear
    ],
  },
  {
    name: "Normal State",
    sensors: Array(14).fill(0.5), // All neutral
  },
];

testScenarios.forEach((scenario) => {
  console.log(`📋 Scenario: ${scenario.name}`);
  console.log(
    `   Sensors: [energy=${scenario.sensors[6]}, foodDist=${scenario.sensors[0]}]`
  );

  const outputs = brain.process(scenario.sensors);

  // Convert to actions like the creature does
  const actions = {
    moveX: outputs[0] * 2 - 1,
    moveY: outputs[1] * 2 - 1,
    eat: outputs[2],
    attack: outputs[3],
    reproduce: outputs[4],
  };

  console.log(
    `   Raw Neural Output: [${outputs.map((x) => x.toFixed(3)).join(", ")}]`
  );
  console.log(
    `   Actions: moveX=${actions.moveX.toFixed(
      3
    )}, moveY=${actions.moveY.toFixed(3)}, eat=${actions.eat.toFixed(
      3
    )}, attack=${actions.attack.toFixed(
      3
    )}, reproduce=${actions.reproduce.toFixed(3)}`
  );

  // Calculate movement magnitude
  const movementMag = Math.abs(actions.moveX) + Math.abs(actions.moveY);
  console.log(`   Movement Magnitude: ${movementMag.toFixed(3)}`);

  // Determine primary action (like simulation does)
  const maxAction = Math.max(
    actions.eat,
    actions.attack,
    actions.reproduce,
    movementMag
  );

  let primaryAction = "idle";
  if (maxAction === actions.eat && actions.eat > 0.5) primaryAction = "eating";
  else if (maxAction === actions.attack && actions.attack > 0.7)
    primaryAction = "attacking";
  else if (maxAction === actions.reproduce && actions.reproduce > 0.6)
    primaryAction = "reproducing";
  else if (movementMag > 0.1) primaryAction = "moving";

  console.log(
    `   Primary Action: ${primaryAction} (max=${maxAction.toFixed(3)})`
  );
  console.log("");
});
