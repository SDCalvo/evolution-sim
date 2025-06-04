/**
 * Vision Range Debug Test
 *
 * Tests if creatures can actually see food at reasonable distances
 * given the current world size and food distribution.
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BiomeType } from "../src/lib/environment/environmentTypes";

async function testVisionRangeIssue() {
  console.log("🔍 VISION RANGE DEBUG TEST");
  console.log("=========================");

  // Create environment matching frontend setup
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
      description: "Balanced grassland environment",
    },
    maxCreatures: 400,
    maxFood: 1200,
    foodSpawnRate: 0.1,
    preySpawnRate: 0.05,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Let environment spawn food
  for (let i = 0; i < 100; i++) {
    environment.update();
  }

  const allFood = environment.getAllFood();
  console.log(`\n🍃 Environment has ${allFood.length} food items`);

  // Test different vision ranges
  const visionTests = [
    { range: 0.8, description: "Poor vision (default low)" },
    { range: 1.2, description: "Average vision (default high)" },
    { range: 2.0, description: "Excellent vision (maximum)" },
    { range: 3.0, description: "Super vision (beyond normal limit)" },
  ];

  for (const test of visionTests) {
    console.log(`\n👁️ Testing ${test.description}:`);
    console.log(`   Vision range: ${test.range}`);
    console.log(`   Search radius: ${test.range * 100} pixels`);
    console.log(`   World radius: 400 pixels`);
    console.log(
      `   Coverage: ${(((test.range * 100) / 400) * 100).toFixed(
        1
      )}% of world radius`
    );

    // Create creature with this vision range
    const genetics = GeneticsHelper.generateRandomGenetics();
    genetics.visionRange = test.range;

    const creature = new Creature(0, genetics, undefined, { x: 400, y: 400 }); // Center position

    // Test how much food creature can see from center
    const sensorData = (creature as any).sense(environment);
    const foodDistance = sensorData[0]; // First sensor is food distance
    const foodType = sensorData[1]; // Second sensor is food type

    console.log(
      `   Food distance sensor: ${foodDistance.toFixed(
        3
      )} (0=very close, 1=none detected)`
    );
    console.log(`   Food type sensor: ${foodType.toFixed(3)}`);

    if (foodDistance < 1.0) {
      console.log(`   ✅ CAN see food`);
    } else {
      console.log(`   ❌ CANNOT see food`);
    }

    // Test from edge position (where creatures cluster)
    creature.physics.position = { x: 200, y: 600 }; // Edge position
    const edgeSensorData = (creature as any).sense(environment);
    const edgeFoodDistance = edgeSensorData[0];

    console.log(`   From edge position:`);
    console.log(`     Food distance: ${edgeFoodDistance.toFixed(3)}`);
    if (edgeFoodDistance < 1.0) {
      console.log(`     ✅ CAN see food from edge`);
    } else {
      console.log(`     ❌ CANNOT see food from edge`);
    }
  }

  // Calculate actual food density in different areas
  const centerArea = allFood.filter((food) => {
    const dx = food.position.x - 400;
    const dy = food.position.y - 400;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= 120; // Default vision range area
  });

  const edgeArea = allFood.filter((food) => {
    const dx = food.position.x - 200;
    const dy = food.position.y - 600;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= 120; // Edge position vision area
  });

  console.log(`\n📊 Food Distribution Analysis:`);
  console.log(`   Food in center area (120px radius): ${centerArea.length}`);
  console.log(`   Food in edge area (120px radius): ${edgeArea.length}`);
  console.log(`   Total food in world: ${allFood.length}`);
  console.log(
    `   Percentage of food visible from center: ${(
      (centerArea.length / allFood.length) *
      100
    ).toFixed(1)}%`
  );
  console.log(
    `   Percentage of food visible from edge: ${(
      (edgeArea.length / allFood.length) *
      100
    ).toFixed(1)}%`
  );

  console.log(`\n💡 DIAGNOSIS:`);
  if (centerArea.length < 3) {
    console.log(
      `   🚨 PROBLEM: Creatures can't see enough food even from optimal positions!`
    );
    console.log(
      `   📝 SOLUTION: Increase default vision range or food density`
    );
  } else if (edgeArea.length < 1) {
    console.log(`   🚨 PROBLEM: Creatures at edges can't find food!`);
    console.log(
      `   📝 SOLUTION: Better movement patterns or increase vision range`
    );
  } else {
    console.log(`   ✅ Vision system appears functional`);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testVisionRangeIssue()
    .then(() => {
      console.log("\n✅ Test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}
