/**
 * Carrion Debug Test - Find out why creatures won't eat carrion! 🦴
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { EntityType } from "../src/lib/environment/environmentTypes";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";

console.log("🔍 CARRION DEBUG TEST - Investigating Feeding Issues");
console.log("====================================================");

// Create tiny environment for easier debugging
const environment = new Environment({
  bounds: {
    width: 100,
    height: 100,
    shape: "rectangular",
    centerX: 50,
    centerY: 50,
  },
  maxCreatures: 5,
  maxFood: 5,
});

// Create ONE perfect scavenger creature
const genetics = GeneticsHelper.generateRandomGenetics();
genetics.meatPreference = 1.0; // Perfect carnivore
genetics.plantPreference = 0.0; // No plant preference
genetics.aggression = 0.8; // High aggression
genetics.visionRange = 2.0; // Maximum vision
genetics.size = 1.0; // Medium size

const scavenger = new Creature(0, genetics);
scavenger.physics.position = { x: 50, y: 50 }; // Center position
scavenger.physics.energy = 30; // Low energy to motivate feeding

environment.addCreature(scavenger);

console.log(`🦎 Created perfect scavenger:`);
console.log(
  `   - Position: (${scavenger.physics.position.x}, ${scavenger.physics.position.y})`
);
console.log(`   - Energy: ${scavenger.physics.energy}`);
console.log(`   - Meat preference: ${scavenger.genetics.meatPreference}`);
console.log(`   - Vision range: ${scavenger.genetics.visionRange}`);

// Create carrion manually VERY close to the creature
const carrionPosition = { x: 55, y: 55 }; // Just 5 pixels away!
const mockCarrion = {
  id: "debug_carrion_001",
  type: EntityType.Carrion,
  subtype: "fresh" as const,
  position: carrionPosition,
  size: 10,
  isActive: true,
  originalCreatureId: "dead_creature",
  timeOfDeath: 0,
  currentDecayStage: 0,
  maxDecayTime: 500,
  originalEnergyValue: 50,
  currentEnergyValue: 50,
  scent: 1.0,
  decayVisual: { opacity: 0.9, color: "red" },
};

// Add carrion directly to environment entities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(environment as any).entities.set(mockCarrion.id, mockCarrion);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(environment as any).addToSpatialGrid(mockCarrion);

console.log(`\n🦴 Created fresh carrion:`);
console.log(
  `   - Position: (${mockCarrion.position.x}, ${mockCarrion.position.y})`
);
console.log(`   - Energy: ${mockCarrion.currentEnergyValue}`);
console.log(`   - Scent: ${mockCarrion.scent}`);
console.log(
  `   - Distance from scavenger: ${Math.sqrt(
    (55 - 50) ** 2 + (55 - 50) ** 2
  ).toFixed(1)} pixels`
);

// Now test step by step what happens
console.log(`\n🔬 STEP-BY-STEP DEBUGGING:`);
console.log("===========================");

// Test 1: Can creature detect carrion in spatial query?
console.log(`\n1️⃣ Testing spatial query detection...`);
const searchRadius = scavenger.genetics.visionRange * 100; // Should be 200 pixels
const spatialQuery = {
  position: scavenger.physics.position,
  radius: searchRadius,
  entityTypes: [EntityType.Carrion],
  sortByDistance: true,
  excludeCreature: scavenger,
};

const queryResults = environment.queryNearbyEntities(spatialQuery);
console.log(`   Search radius: ${searchRadius} pixels`);
console.log(`   Carrion detected: ${queryResults.food.length}`);
if (queryResults.food.length > 0) {
  console.log(`   ✅ Carrion found in spatial query!`);
  const foundCarrion = queryResults.food[0];
  console.log(`   - Carrion ID: ${foundCarrion.id}`);
  console.log(`   - Carrion type: ${foundCarrion.type}`);
} else {
  console.log(`   ❌ No carrion found in spatial query!`);
}

// Test 2: Test creature sensors
console.log(`\n2️⃣ Testing creature sensor system...`);
// We need to access the private sense method, so let's update the creature manually
scavenger.update(environment);

// Check creature's internal state after update
console.log(
  `   Creature energy after update: ${scavenger.physics.energy.toFixed(1)}`
);
console.log(`   Food eaten so far: ${scavenger.stats.foodEaten}`);

// Test 3: Manual feeding attempt
console.log(`\n3️⃣ Testing manual feeding...`);
if (queryResults.food.length > 0) {
  const carrionToEat = queryResults.food[0];
  const distance = Math.sqrt(
    (scavenger.physics.position.x - carrionToEat.position.x) ** 2 +
      (scavenger.physics.position.y - carrionToEat.position.y) ** 2
  );

  console.log(`   Distance to carrion: ${distance.toFixed(1)} pixels`);
  console.log(
    `   Creature collision radius: ${scavenger.physics.collisionRadius}`
  );
  console.log(`   Carrion size: ${carrionToEat.size}`);
  console.log(
    `   Max feeding range: ${
      scavenger.physics.collisionRadius + carrionToEat.size
    }`
  );

  if (distance <= scavenger.physics.collisionRadius + carrionToEat.size) {
    console.log(`   ✅ Creature is close enough to feed!`);

    // Try manual feeding
    const feedingResult = environment.processFeeding(
      scavenger,
      carrionToEat,
      0.8
    );
    console.log(`   Feeding success: ${feedingResult.success}`);
    console.log(`   Energy gained: ${feedingResult.energyGain.toFixed(1)}`);
    console.log(`   Food consumed: ${feedingResult.foodConsumed}`);
  } else {
    console.log(`   ❌ Creature is too far away to feed!`);
    console.log(
      `   Need to move closer by ${(
        distance -
        (scavenger.physics.collisionRadius + carrionToEat.size)
      ).toFixed(1)} pixels`
    );
  }
}

// Test 4: Run simulation for a few ticks to see behavior
console.log(`\n4️⃣ Running simulation for behavior analysis...`);
const initialEnergy = scavenger.physics.energy;
const initialFoodEaten = scavenger.stats.foodEaten;

for (let tick = 1; tick <= 5; tick++) {
  environment.update();
  scavenger.update(environment);

  const energyChange = scavenger.physics.energy - initialEnergy;
  const foodChange = scavenger.stats.foodEaten - initialFoodEaten;

  console.log(
    `   Tick ${tick}: Energy=${scavenger.physics.energy.toFixed(1)} (${
      energyChange >= 0 ? "+" : ""
    }${energyChange.toFixed(1)}), Food=${
      scavenger.stats.foodEaten
    } (+${foodChange})`
  );

  // Check if carrion is still there
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const remainingCarrion = Array.from((environment as any).entities.values())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((e: any) => e.type === EntityType.Carrion);
  console.log(`   Carrion remaining: ${remainingCarrion.length}`);

  if (scavenger.stats.foodEaten > initialFoodEaten) {
    console.log(`   🎉 SUCCESS! Scavenger ate something!`);
    break;
  }
}

console.log(`\n📊 FINAL RESULTS:`);
console.log("=================");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const finalCarrion = Array.from((environment as any).entities.values())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .filter((e: any) => e.type === EntityType.Carrion);
console.log(`🦴 Carrion remaining: ${finalCarrion.length}`);
console.log(`🍽️ Food eaten by scavenger: ${scavenger.stats.foodEaten}`);
console.log(`⚡ Final energy: ${scavenger.physics.energy.toFixed(1)}`);

if (scavenger.stats.foodEaten > 0) {
  console.log(`✅ CARRION FEEDING WORKS! 🎉`);
} else {
  console.log(`❌ CARRION FEEDING FAILED - Needs investigation 🔍`);
}

console.log(`\n🦴 CARRION DEBUG TEST COMPLETE!`);
