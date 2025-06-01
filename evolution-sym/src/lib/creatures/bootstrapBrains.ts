/**
 * Bootstrap Brain Factory - Solving the "Random Death" Problem
 *
 * This system provides pre-configured neural networks with basic survival instincts
 * to prevent the entire first generation from dying due to random decision-making.
 *
 * Evolution Strategy:
 * - Generation 0: All creatures get identical "Minimum Viable Creature" brains
 * - Generations 1-50: Small mutations create diversity while preserving survival
 * - Generations 50+: Full evolutionary crossover and mutation
 */

import { NeuralNetwork } from "../neural/network";
import { CreatureGenetics } from "./creatureTypes";

export interface BootstrapStrategy {
  name: string;
  description: string;
  generation: number;
  survivalRate: number; // Expected survival rate to reproduction
}

/**
 * Factory for creating neural networks with built-in survival instincts
 */
export class BootstrapBrainFactory {
  /**
   * Create a brain based on the current generation and evolutionary stage
   */
  public static createBrainForGeneration(
    generation: number,
    genetics: CreatureGenetics,
    parents?: NeuralNetwork[]
  ): NeuralNetwork {
    if (generation === 0) {
      // Generation 0: Everyone gets the same survival template
      return this.createFounderBrain(genetics);
    } else if (generation <= 50) {
      // Early generations: Survival base + mutations
      return this.createEarlyGenerationBrain(genetics, generation);
    } else {
      // Mature evolution: Full crossover + mutation
      return this.createEvolutionaryBrain(genetics, parents);
    }
  }

  /**
   * Generation 0: Minimum Viable Creature brain
   * Hardcoded with just enough survival instinct to reproduce once
   */
  public static createFounderBrain(genetics: CreatureGenetics): NeuralNetwork {
    // Network architecture: 14 sensors → 8 hidden → 5 actions
    // Sensors: food dist, food type, carrion dist, carrion freshness, predator, prey, energy, health, age, population, vision rays (4)
    const brain = new NeuralNetwork([14, 8, 5]);

    // RULE 1: Survival Priority - Energy Management
    // When energy is low (< 0.3) and food is nearby (< 0.5), prioritize eating
    this.encodeRule(
      brain,
      [6, 0], // energy sensor + food distance sensor (updated indices!)
      [2], // eating action
      [-0.7, -0.6], // low energy + close food
      0.8 // strong eating response
    );

    // RULE 2: Reproduction Priority - Energy + Maturity
    // When energy is high (> 0.6) and mature (age > 0.4), attempt reproduction
    this.encodeRule(
      brain,
      [6, 8], // energy sensor + age sensor (updated indices!)
      [4], // reproduction action
      [0.6, 0.4], // high energy + mature age
      0.7 // strong reproduction response
    );

    // RULE 3: Predator Avoidance - Safety First
    // When predator is very close (< 0.2), flee in opposite direction
    this.encodeRule(
      brain,
      [4], // predator distance sensor (updated index!)
      [0, 1], // movement actions
      [-0.8], // very close predator (inverted - close = negative)
      0.9 // very strong flee response
    );

    // RULE 4: 🦴 CARRION SCAVENGING - New Survival Strategy!
    // When energy is low and fresh carrion is nearby, prioritize scavenging
    this.encodeRule(
      brain,
      [6, 2, 3], // energy sensor + carrion distance + carrion freshness
      [2], // eating action
      [-0.6, -0.5, 0.7], // low energy + close carrion + fresh carrion
      0.75 // strong scavenging response
    );

    // RULE 5: Basic Exploration - Default Behavior
    // When nothing urgent, slow exploration based on curiosity
    this.encodeExploration(brain, genetics.curiosity);

    // RULE 6: Food Seeking - Basic Foraging
    // Move toward food when moderately hungry
    this.encodeFoodSeeking(brain, genetics);

    // Add small amount of randomness for diversity (5% variation)
    brain.mutate(1.0, 0.05);

    return brain;
  }

  /**
   * Generations 1-50: Early evolution with survival preservation
   */
  public static createEarlyGenerationBrain(
    genetics: CreatureGenetics,
    generation: number
  ): NeuralNetwork {
    // Start with founder brain template
    const brain = this.createFounderBrain(genetics);

    // Gradually increase mutation as generations progress
    const mutationStrength = 0.05 + (generation / 50) * 0.15; // 5% → 20%
    const mutationRate = 0.6 + (generation / 50) * 0.3; // 60% → 90%

    // Apply evolutionary pressure while preserving core survival
    brain.mutate(mutationRate, mutationStrength);

    return brain;
  }

  /**
   * Generations 50+: Full evolutionary brain creation
   */
  public static createEvolutionaryBrain(
    genetics: CreatureGenetics,
    parents?: NeuralNetwork[]
  ): NeuralNetwork {
    if (!parents || parents.length < 2) {
      // Fallback: create early generation brain
      return this.createEarlyGenerationBrain(genetics, 50);
    }

    // Sexual reproduction: crossover parent brains
    const child = NeuralNetwork.crossover(parents[0], parents[1]);

    // Apply mutation based on genetics
    const baseMutationRate = 0.3;
    const baseMutationStrength = 0.2;

    // Some creatures are more genetically stable than others
    const stabilityFactor =
      (genetics.efficiency + genetics.lifespan / 1000) / 2;
    const mutationRate = baseMutationRate * (2 - stabilityFactor);
    const mutationStrength = baseMutationStrength * (2 - stabilityFactor);

    child.mutate(mutationRate, mutationStrength);

    return child;
  }

  /**
   * Encode a simple behavioral rule into the neural network
   */
  private static encodeRule(
    brain: NeuralNetwork,
    sensorIndices: number[],
    actionIndices: number[],
    triggerValues: number[],
    responseStrength: number
  ): void {
    const inputToHiddenLayer = 0; // Layer connecting input to hidden
    const hiddenToOutputLayer = 1; // Layer connecting hidden to output

    // Connect sensors to hidden neurons
    for (let i = 0; i < sensorIndices.length; i++) {
      const sensorIdx = sensorIndices[i];
      const triggerValue = triggerValues[i];

      // Connect to multiple hidden neurons for redundancy
      for (let h = 0; h < 3; h++) {
        brain.setWeight(
          inputToHiddenLayer,
          sensorIdx,
          inputToHiddenLayer + 1,
          h,
          triggerValue * 0.8
        );
      }
    }

    // Connect hidden neurons to action outputs
    for (const actionIdx of actionIndices) {
      for (let h = 0; h < 3; h++) {
        brain.setWeight(
          hiddenToOutputLayer,
          h,
          hiddenToOutputLayer + 1,
          actionIdx,
          responseStrength
        );
      }
    }
  }

  /**
   * Encode basic exploration behavior
   */
  private static encodeExploration(
    brain: NeuralNetwork,
    curiosity: number
  ): void {
    // Higher curiosity = more random movement when nothing urgent
    const explorationStrength = curiosity * 0.3;

    // Connect population density sensor (index 7 in 12-sensor system) to movement (avoid crowds)
    brain.setWeight(0, 7, 1, 0, -explorationStrength); // Move away from crowds
    brain.setWeight(0, 7, 1, 1, explorationStrength); // Random direction

    // Use vision ray sensors for exploration too (indices 8-11)
    brain.setWeight(0, 8, 1, 0, explorationStrength * 0.2); // Forward vision
    brain.setWeight(0, 9, 1, 1, explorationStrength * 0.2); // Left vision

    // Add bias for gentle movement
    brain.setBias(1, 0, explorationStrength * 0.5);
    brain.setBias(1, 1, explorationStrength * 0.5);
  }

  /**
   * Encode food seeking behavior based on dietary preferences
   */
  private static encodeFoodSeeking(
    brain: NeuralNetwork,
    genetics: CreatureGenetics
  ): void {
    // Food type preference affects response strength
    const plantPreference = genetics.plantPreference;
    const meatPreference = genetics.meatPreference;

    // Food type sensor (0 = plant, 1 = meat) influences food seeking
    // If creature prefers plants, respond more to food type = 0
    // If creature prefers meat, respond more to food type = 1

    const foodTypeWeight = (meatPreference - plantPreference) * 0.4;
    brain.setWeight(0, 1, 1, 0, -foodTypeWeight); // Food type to movement X
    brain.setWeight(0, 1, 1, 1, foodTypeWeight); // Food type to movement Y

    // Food distance affects movement strength
    brain.setWeight(0, 0, 1, 0, -0.5); // Close food = move toward
    brain.setWeight(0, 0, 1, 1, -0.3); // Close food = move toward
  }

  /**
   * Get information about bootstrap strategy for a given generation
   */
  public static getBootstrapStrategy(generation: number): BootstrapStrategy {
    if (generation === 0) {
      return {
        name: "Founder Generation",
        description:
          "Identical minimum viable creature brains with basic survival instincts",
        generation,
        survivalRate: 0.4,
      };
    } else if (generation <= 50) {
      return {
        name: "Early Evolution",
        description:
          "Survival-based template with increasing mutations for diversity",
        generation,
        survivalRate: 0.3 + (generation / 50) * 0.2, // 30% → 50%
      };
    } else {
      return {
        name: "Full Evolution",
        description: "Complete sexual reproduction with crossover and mutation",
        generation,
        survivalRate: 0.2, // Natural selection takes over
      };
    }
  }

  /**
   * Analyze a brain to see how much "bootstrap DNA" remains
   */
  public static analyzeBootstrapRetention(brain: NeuralNetwork): {
    retentionPercentage: number;
    description: string;
  } {
    // This is a simplified analysis - in practice we'd compare weights
    // to the original founder brain template

    // For now, estimate based on network complexity and weight patterns
    const totalWeights = brain.getTotalWeights();
    const averageWeight = brain.getAverageWeight();

    // Bootstrap brains have specific weight patterns
    const isStructured = Math.abs(averageWeight) > 0.1 && totalWeights > 50;

    if (isStructured) {
      return {
        retentionPercentage: 70,
        description: "Strong bootstrap influence - retains survival instincts",
      };
    } else {
      return {
        retentionPercentage: 20,
        description: "Heavily evolved - mostly natural selection patterns",
      };
    }
  }
}

/**
 * Emergency brain creation for population collapse scenarios
 */
export class EmergencyBrainFactory {
  /**
   * Create brains when population drops too low
   */
  public static createEmergencyBrain(
    bestSurvivors: NeuralNetwork[],
    genetics: CreatureGenetics
  ): NeuralNetwork {
    if (bestSurvivors.length === 0) {
      // Complete population collapse - restart with founder brain
      return BootstrapBrainFactory.createFounderBrain(genetics);
    }

    // Clone and mutate the best survivor
    const bestBrain = bestSurvivors[0];
    const emergencyBrain = bestBrain.clone();

    // Light mutation to create some diversity
    emergencyBrain.mutate(0.5, 0.1);

    return emergencyBrain;
  }
}
