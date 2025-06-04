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
    // 🚨 CRITICAL FIX: Use tanh activation for better responsiveness around zero
    const brain = new NeuralNetwork([14, 8, 5], "tanh");

    // BALANCED APPROACH: Set all biases explicitly to prevent random directional bias
    // This ensures creatures will DO things but without systematic movement bias

    // 🎯 MOVEMENT BIASES: CRITICAL FIX - Center movement biases at exactly 0
    brain.setBias(1, 0, 0.0); // moveX - NO bias to prevent left/right preference
    brain.setBias(1, 1, 0.0); // moveY - NO bias to prevent up/down preference

    // 🍽️ EATING BIAS: Make creatures want to eat when energy is low
    brain.setBias(1, 2, 2.0); // Moderate bias toward eating action (tanh-friendly)

    // ⚔️ ATTACK BIAS: Small bias toward attacking when threatened
    brain.setBias(1, 3, -0.5); // Small negative bias - discourage random attacking

    // 💕 REPRODUCTION BIAS: Make creatures want to reproduce when mature
    brain.setBias(1, 4, 1.5); // Moderate bias toward reproduction (tanh-friendly)

    // 🧠 HIDDEN LAYER SETUP: Give hidden neurons proper input connections and biases
    // This is the missing piece - hidden neurons need to receive and process inputs!

    // Hidden neuron 0: Food-seeking specialist
    brain.setBias(0, 0, 0.5); // Small positive bias to keep it active
    brain.setWeight(0, 0, 1, 0, -3.0); // Food distance → hidden 0 (food detector)
    brain.setWeight(0, 1, 1, 0, -2.0); // Food type → hidden 0 (food detector)

    // Hidden neuron 1: Energy management specialist
    brain.setBias(0, 1, -0.3); // Small negative bias
    brain.setWeight(0, 6, 1, 1, -4.0); // Energy → hidden 1 (energy monitor)
    brain.setWeight(0, 7, 1, 1, -2.0); // Health → hidden 1 (energy monitor)

    // Hidden neuron 2: Predator avoidance specialist
    brain.setBias(0, 2, -0.8); // Negative bias - only activate when needed
    brain.setWeight(0, 4, 1, 2, -3.0); // Predator distance → hidden 2 (threat detector)

    // Hidden neuron 3: Social behavior specialist
    brain.setBias(0, 3, 0.2); // Small positive bias
    brain.setWeight(0, 9, 1, 3, 2.0); // Population density → hidden 3 (social)
    brain.setWeight(0, 8, 1, 3, 3.0); // Age → hidden 3 (reproductive drive)

    // Hidden neuron 4: Movement X specialist (food-seeking)
    brain.setBias(0, 4, 0.0); // Neutral bias
    brain.setWeight(0, 0, 1, 4, -2.0); // Food distance → hidden 4 (move toward food X)
    brain.setWeight(0, 4, 1, 4, -1.5); // Predator distance → hidden 4 (flee X)

    // Hidden neuron 5: Movement Y specialist (food-seeking)
    brain.setBias(0, 5, 0.0); // Neutral bias
    brain.setWeight(0, 0, 1, 5, -2.0); // Food distance → hidden 5 (move toward food Y)
    brain.setWeight(0, 4, 1, 5, -1.5); // Predator distance → hidden 5 (flee Y)

    // Hidden neuron 6: Movement X specialist (exploration/social)
    brain.setBias(0, 6, 0.0); // Neutral bias
    brain.setWeight(0, 9, 1, 6, -1.0); // Population density → hidden 6 (social movement X)
    brain.setWeight(0, 10, 1, 6, 1.0); // Vision forward → hidden 6 (exploration X)

    // Hidden neuron 7: Movement Y specialist (exploration/social)
    brain.setBias(0, 7, 0.0); // Neutral bias
    brain.setWeight(0, 9, 1, 7, -1.0); // Population density → hidden 7 (social movement Y)
    brain.setWeight(0, 11, 1, 7, 1.0); // Vision left → hidden 7 (exploration Y)

    // 🔗 KEY CONNECTIONS: Connect important sensors to actions (REDUCED - let hidden layer do more work)
    // Energy sensor (6) to eating action (2) - when energy low, eat more
    brain.setWeight(0, 6, 1, 2, -1.5); // Reduced weight: let hidden layer contribute more

    // Food distance sensor (0) to eating action (2) - when food close, eat more
    brain.setWeight(0, 0, 1, 2, -1.0); // Reduced weight: let hidden layer contribute more

    // Age sensor (8) to reproduction action (4) - when mature, reproduce more
    brain.setWeight(0, 8, 1, 4, 2.0); // Reduced weight: let hidden layer contribute more

    // Energy sensor (6) to reproduction action (4) - when high energy, reproduce more
    brain.setWeight(0, 6, 1, 4, 1.5); // Reduced weight: let hidden layer contribute more

    // 🚀 HIDDEN LAYER TO ACTION CONNECTIONS - BIAS-NEUTRAL APPROACH!
    // Use different hidden neurons for X and Y movement to prevent systematic bias

    // Food-seeking neuron 0 → eating (primary function)
    brain.setWeight(1, 0, 2, 2, 3.0); // Food detector → eat (when food detected, eat!)

    // Energy management neuron 1 → eating and reproduction
    brain.setWeight(1, 1, 2, 2, 4.0); // Energy monitor → eat (when low energy, eat!)
    brain.setWeight(1, 1, 2, 4, -2.0); // Energy monitor → reproduce (low energy = less reproduction)

    // Predator avoidance neuron 2 → attack
    brain.setWeight(1, 2, 2, 3, 4.0); // Threat detector → attack (fight if cornered)

    // Social behavior neuron 3 → reproduction
    brain.setWeight(1, 3, 2, 4, 3.5); // Social → reproduce (when mature and social, reproduce!)

    // 🎯 MOVEMENT CONNECTIONS: Use separate hidden neurons for X and Y to prevent bias
    // Hidden neuron 4 → moveX (use different inputs than Y)
    brain.setWeight(1, 4, 2, 0, 1.8); // Hidden 4 → moveX

    // Hidden neuron 5 → moveY (use different inputs than X)
    brain.setWeight(1, 5, 2, 1, 1.8); // Hidden 5 → moveY

    // Hidden neuron 6 → moveX (opposite polarity for balance)
    brain.setWeight(1, 6, 2, 0, -1.8); // Hidden 6 → moveX (opposite)

    // Hidden neuron 7 → moveY (opposite polarity for balance)
    brain.setWeight(1, 7, 2, 1, -1.8); // Hidden 7 → moveY (opposite)

    // 💕 MATE-SEEKING BEHAVIOR: Minimal direct connections (let hidden layer handle this)
    // 🔧 BALANCED: Equal weights to prevent directional bias
    brain.setWeight(0, 9, 1, 0, -0.5); // Population density → moveX (reduced)
    brain.setWeight(0, 9, 1, 1, -0.5); // Population density → moveY (reduced)

    // 🧭 EXPLORATION DISABLED: Removing vision-based movement to eliminate directional bias
    // The vision sensors default to 1.0 which was creating constant movement bias
    // Food-seeking and population density should provide enough movement motivation

    // ⭐ REMOVED: Vision-based movement weights that were causing edge-seeking behavior
    // These will be evolved naturally through mutation and selection instead

    // 🔧 FIXED: Increased mutation for more behavioral diversity
    brain.mutate(1.0, 0.05); // Increased from 0.01 to 0.05 (5% variation)

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
