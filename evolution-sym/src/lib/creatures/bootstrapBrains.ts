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
   * Founder generation: Hand-coded survival instincts
   * These brains are designed to keep creatures alive long enough to reproduce
   */
  public static createFounderBrain(genetics: CreatureGenetics): NeuralNetwork {
    // Network architecture: 14 sensors → 8 hidden → 5 actions
    // Sensors: [0]foodDist, [1]foodType, [2]carrionDist, [3]carrionFresh, [4]predatorDist, [5]preyDist,
    //          [6]energy, [7]health, [8]age, [9]population, [10]visionForward, [11]visionLeft, [12]visionRight, [13]visionBack
    const brain = new NeuralNetwork([14, 8, 5]);

    // SIMPLE APPROACH: Use strong biases and basic input connections
    // This ensures creatures will actually DO things instead of just sitting still

    // 🍽️ EATING BIAS: Make creatures want to eat when energy is low
    brain.setBias(1, 2, 5.0); // VERY STRONG bias toward eating action (increased from 3.0)

    // 🏃 MOVEMENT BIAS: Strong enough to ensure exploration and mate-seeking
    brain.setBias(1, 0, 2.0); // INCREASED: Strong movement bias for exploration
    brain.setBias(1, 1, 2.0); // INCREASED: Strong movement bias for exploration

    // 💕 REPRODUCTION BIAS: Make creatures want to reproduce when mature
    brain.setBias(1, 4, 4.0); // VERY STRONG bias toward reproduction (increased from 2.5)

    // ⚔️ ATTACK BIAS: Small bias toward attacking when threatened
    brain.setBias(1, 3, -1.0); // NEGATIVE bias - discourage random attacking

    // 🔗 KEY CONNECTIONS: Connect important sensors to actions
    // Energy sensor (6) to eating action (2) - when energy low, eat more
    brain.setWeight(0, 6, 1, 2, -6.0); // MUCH STRONGER negative weight: low energy = high eating desire

    // Food distance sensor (0) to eating action (2) - when food close, eat more
    brain.setWeight(0, 0, 1, 2, -5.0); // MUCH STRONGER negative weight: close food = high eating desire

    // FOOD-SEEKING MOVEMENT: Make creatures move toward food!
    // Food distance sensor (0) to movement actions - when food far, move more
    brain.setWeight(0, 0, 1, 0, 3.0); // Positive weight: far food = move to find it
    brain.setWeight(0, 0, 1, 1, 3.0); // Positive weight: far food = move to find it

    // Predator distance sensor (4) to movement actions (0,1) - when predator close, move more
    brain.setWeight(0, 4, 1, 0, -2.0); // Negative weight: close predator = high movement
    brain.setWeight(0, 4, 1, 1, -2.0); // Negative weight: close predator = high movement

    // Age sensor (8) to reproduction action (4) - when mature, reproduce more
    brain.setWeight(0, 8, 1, 4, 5.0); // STRONGER weight: high age = high reproduction desire (increased from 3.0)

    // Energy sensor (6) to reproduction action (4) - when high energy, reproduce more
    brain.setWeight(0, 6, 1, 4, 4.0); // STRONGER weight: high energy = high reproduction desire (increased from 2.5)

    // 🚀 HIDDEN LAYER TO ACTION CONNECTIONS - THE MISSING PIECE!
    // These ensure the hidden layer processing actually affects movement
    brain.setWeight(1, 0, 2, 0, 3.0); // Hidden neuron 0 → moveX action
    brain.setWeight(1, 1, 2, 1, 3.0); // Hidden neuron 1 → moveY action
    brain.setWeight(1, 2, 2, 2, 4.0); // Hidden neuron 2 → eat action (strong)
    brain.setWeight(1, 4, 2, 4, 3.0); // Hidden neuron 4 → reproduce action

    // 💕 MATE-SEEKING BEHAVIOR: When want to reproduce, move to find mates
    brain.setWeight(0, 9, 1, 0, -2.0); // Population density sensor → moveX (low density = explore more)
    brain.setWeight(0, 9, 1, 1, -2.0); // Population density sensor → moveY (low density = explore more)

    // 🧭 EXPLORATION BIAS: When no food/mates detected, explore randomly
    brain.setWeight(0, 10, 1, 0, 1.0); // Vision forward → moveX (clear vision = move forward)
    brain.setWeight(0, 11, 1, 1, -1.0); // Vision left → moveY (obstacle left = move right)
    brain.setWeight(0, 12, 1, 1, 1.0); // Vision right → moveY (obstacle right = move left)

    // Add tiny bit of randomness for diversity (1% variation)
    brain.mutate(1.0, 0.01);

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
