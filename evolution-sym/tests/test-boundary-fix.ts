/**
 * Test Boundary Wrapping Fix - Verify creatures stay in world bounds
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BiomePresets } from "../src/lib/environment/biomePresets";

function testBoundaryWrapping() {
  console.log("🗺️ BOUNDARY WRAPPING TEST");
  console.log("==========================");

  // Create circular environment (400x400 with radius 200)
  const environment = new Environment({
    bounds: {
      width: 400,
      height: 400,
      shape: "circular",
      centerX: 200,
      centerY: 200,
      radius: 200,
    },
    biome: BiomePresets.grassland,
    maxCreatures: 10,
    maxFood: 30,
    foodSpawnRate: 0.1,
    preySpawnRate: 0.05,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Create creatures at various positions including near/outside boundaries
  const testPositions = [
    { x: 200, y: 200, name: "Center" },
    { x: 50, y: 200, name: "Left edge" },
    { x: 350, y: 200, name: "Right edge" },
    { x: 200, y: 50, name: "Top edge" },
    { x: 200, y: 350, name: "Bottom edge" },
    { x: 10, y: 10, name: "Outside corner" },
    { x: 390, y: 390, name: "Outside opposite corner" },
  ];

  const creatures: Creature[] = [];

  testPositions.forEach((pos, i) => {
    const genetics = GeneticsHelper.generateRandomGenetics();
    const creature = new Creature(0, genetics, undefined, pos);
    creatures.push(creature);
    environment.addCreature(creature);

    console.log(
      `🦌 Created creature ${i + 1} (${pos.name}): position (${pos.x}, ${
        pos.y
      })`
    );
  });

  console.log(`\n📊 Initial stats: ${creatures.length} creatures created`);

  // Run simulation for several ticks to test boundary enforcement
  console.log("\n🏃 Running 50 ticks to test boundary wrapping...");

  for (let tick = 0; tick < 50; tick++) {
    environment.update();

    // Check every 10 ticks
    if ((tick + 1) % 10 === 0) {
      console.log(`\nTick ${tick + 1}:`);

      creatures.forEach((creature, i) => {
        const pos = creature.physics.position;
        const centerX = 200;
        const centerY = 200;
        const radius = 200;

        // Calculate distance from center
        const distance = Math.sqrt(
          (pos.x - centerX) ** 2 + (pos.y - centerY) ** 2
        );

        const isInside = distance <= radius;
        const status = isInside ? "✅ INSIDE" : "❌ OUTSIDE";

        console.log(
          `  Creature ${i + 1}: (${pos.x.toFixed(1)}, ${pos.y.toFixed(
            1
          )}) - ${distance.toFixed(1)}px from center - ${status}`
        );
      });
    }
  }

  // Final boundary check
  console.log("\n🔍 FINAL BOUNDARY CHECK:");
  let allInside = true;

  creatures.forEach((creature, i) => {
    const pos = creature.physics.position;
    const centerX = 200;
    const centerY = 200;
    const radius = 200;

    const distance = Math.sqrt((pos.x - centerX) ** 2 + (pos.y - centerY) ** 2);

    const isInside = distance <= radius + 5; // Allow small margin for floating point precision
    if (!isInside) {
      allInside = false;
      console.log(
        `❌ Creature ${i + 1} is OUTSIDE bounds! Distance: ${distance.toFixed(
          1
        )}px`
      );
    }
  });

  if (allInside) {
    console.log("✅ SUCCESS: All creatures stayed within world bounds!");
  } else {
    console.log("❌ FAILED: Some creatures escaped the world bounds!");
  }

  console.log(`\n📈 Final simulation stats:`);
  const finalStats = environment.getStats();
  console.log(`  Living creatures: ${finalStats.livingCreatures}`);
  console.log(`  Total food: ${finalStats.totalFood}`);
  console.log(`  Spatial queries: ${finalStats.spatialQueries}`);

  return allInside;
}

const success = testBoundaryWrapping();
console.log(`\n🎯 Test result: ${success ? "PASSED" : "FAILED"}`);
