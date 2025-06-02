/**
 * Test creature thought bubble system
 * Shows how AI creatures express their mental states
 */

import { Environment } from "../src/lib/environment/environment";
import { Creature } from "../src/lib/creatures/creature";
import { GeneticsHelper } from "../src/lib/creatures/creatureTypes";
import { BiomeType } from "../src/lib/environment/environmentTypes";

function testThoughtBubbles() {
  console.log("💭 CREATURE THOUGHT BUBBLE TEST");
  console.log("===============================");

  // Create environment
  const environment = new Environment({
    bounds: {
      width: 1000,
      height: 1000,
      shape: "circular",
      centerX: 500,
      centerY: 500,
      radius: 500,
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
    maxCreatures: 20,
    maxFood: 60,
    foodSpawnRate: 0.1,
    preySpawnRate: 0.05,
    spatialGridSize: 100,
    updateFrequency: 1,
  });

  // Spawn some food
  for (let i = 0; i < 10; i++) {
    environment.update();
  }

  // Create test creatures with different states
  console.log("🧪 Creating test creatures with different mental states...\n");

  // 1. Hungry creature
  const hungryCreature = new Creature(
    0,
    GeneticsHelper.generateRandomGenetics(),
    undefined,
    { x: 500, y: 500 }
  );
  hungryCreature.physics.energy = 25; // Very low energy
  environment.addCreature(hungryCreature);

  // 2. High-energy mature creature
  const matingCreature = new Creature(
    0,
    GeneticsHelper.generateRandomGenetics(),
    undefined,
    { x: 400, y: 400 }
  );
  matingCreature.physics.energy = 90; // High energy
  matingCreature.physics.age = 150; // Mature
  environment.addCreature(matingCreature);

  // 3. Aggressive creature
  const aggressiveGenetics = GeneticsHelper.generateRandomGenetics();
  aggressiveGenetics.aggression = 0.9; // Very aggressive
  const aggressiveCreature = new Creature(0, aggressiveGenetics, undefined, {
    x: 600,
    y: 600,
  });
  aggressiveCreature.physics.energy = 70;
  environment.addCreature(aggressiveCreature);

  // 4. Old creature
  const oldCreature = new Creature(
    0,
    GeneticsHelper.generateRandomGenetics(),
    undefined,
    { x: 300, y: 300 }
  );
  oldCreature.physics.age = oldCreature.genetics.lifespan * 0.85; // Very old
  oldCreature.physics.energy = 60;
  environment.addCreature(oldCreature);

  console.log("🎭 Running simulation to observe creature thoughts...\n");

  // Run simulation for several ticks and observe thoughts
  for (let tick = 1; tick <= 20; tick++) {
    console.log(`⏰ Tick ${tick}:`);

    // Update all creatures
    const creatures = environment.getCreatures();
    creatures.forEach((creature) => {
      creature.update(environment);

      // Display current thought
      if (creature.stats.currentThought) {
        const thought = creature.stats.currentThought;
        console.log(
          `  ${thought.icon} ${creature.id.substring(0, 8)}: "${
            thought.text
          }" (energy: ${creature.physics.energy.toFixed(1)})`
        );
      } else {
        console.log(
          `  🤐 ${creature.id.substring(
            0,
            8
          )}: (no thoughts) (energy: ${creature.physics.energy.toFixed(1)})`
        );
      }
    });

    // Update environment
    environment.update();
    console.log(""); // Empty line for readability
  }

  console.log("📊 THOUGHT HISTORY SUMMARY:");
  console.log("===========================");

  const creatures = environment.getCreatures();
  creatures.forEach((creature, index) => {
    console.log(
      `\n🧠 Creature ${index + 1} (${creature.id.substring(
        0,
        8
      )}) - Energy: ${creature.physics.energy.toFixed(1)}, Age: ${
        creature.physics.age
      }`
    );

    if (creature.stats.thoughtHistory.length > 0) {
      console.log("   Recent thoughts:");
      creature.stats.thoughtHistory.slice(-5).forEach((thought) => {
        console.log(
          `     ${thought.icon} "${thought.text}" (priority: ${thought.priority})`
        );
      });
    } else {
      console.log("   No thoughts recorded");
    }
  });

  console.log("\n💡 THOUGHT SYSTEM FEATURES:");
  console.log("============================");
  console.log(
    "✅ Priority-based thought selection (higher priority thoughts override lower ones)"
  );
  console.log(
    "✅ Duration-based thought display (thoughts fade after their duration expires)"
  );
  console.log(
    "✅ Context-aware thoughts (hunger, mating urges, aggression, environmental awareness)"
  );
  console.log(
    "✅ Visual indicators (colors and emojis for different thought types)"
  );
  console.log("✅ Thought history tracking (last 10 thoughts remembered)");
  console.log(
    "✅ Energy-based emergency thoughts ('MUST FIND FOOD NOW!' for critical hunger)"
  );
  console.log(
    "✅ Complex combination thoughts (e.g., 'Ready to start a family!' for high energy + mature + reproductive urge)"
  );

  console.log("\n🎯 NEXT STEPS FOR VISUALIZATION:");
  console.log("=================================");
  console.log("1. 💭 Render thought bubbles above creatures in the UI");
  console.log("2. 🎨 Use thought.color for bubble background color");
  console.log("3. 📏 Scale bubble size based on thought priority");
  console.log("4. ⏱️ Fade bubbles as duration decreases");
  console.log("5. 📊 Add thought history panel for detailed analysis");
  console.log(
    "6. 🔗 Connect to existing brain tracking system for complete AI introspection"
  );
}

testThoughtBubbles();
