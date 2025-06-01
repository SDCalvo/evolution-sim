/**
 * Parental Care System - r-strategy vs K-strategy Trade-offs
 *
 * This system implements the evolutionary trade-off between:
 * - r-strategy: Many offspring, low investment, lower survival rate
 * - K-strategy: Few offspring, high investment, higher survival rate
 */

import { CreatureGenetics, CreatureStats } from "./creatureTypes";

export interface ReproductionResult {
  canReproduce: boolean;
  energyCost: number;
  offspringCount: number;
  offspringStartingEnergy: number;
  offspringStartingHealth: number;
  reproductionCooldown: number; // Ticks until can reproduce again
}

export interface OffspringQuality {
  startingEnergy: number; // 20-80: Higher = better chance of survival
  startingHealth: number; // 60-100: Health boost from parental care
  growthRate: number; // 0.8-1.2: How fast they mature
  immunityBoost: number; // 0.0-0.5: Resistance to environmental damage
}

/**
 * Helper class for calculating parental care effects on reproduction
 */
export class ParentalCareHelper {
  /**
   * Calculate reproduction parameters based on genetics
   * High parentalCare = fewer, higher-quality offspring (K-strategy)
   * Low parentalCare = more, lower-quality offspring (r-strategy)
   */
  public static calculateReproduction(
    genetics: CreatureGenetics,
    stats: CreatureStats,
    partnerGenetics?: CreatureGenetics
  ): ReproductionResult {
    // Average parental care with partner (for sexual reproduction)
    const avgParentalCare = partnerGenetics
      ? (genetics.parentalCare + partnerGenetics.parentalCare) / 2
      : genetics.parentalCare;

    // Base reproduction requirements
    const minEnergyForReproduction = 40 + avgParentalCare * 30; // 40-70 energy needed
    const canReproduce =
      stats.energy >= minEnergyForReproduction &&
      stats.age >= genetics.maturityAge &&
      stats.health > 30;

    if (!canReproduce) {
      return {
        canReproduce: false,
        energyCost: 0,
        offspringCount: 0,
        offspringStartingEnergy: 0,
        offspringStartingHealth: 0,
        reproductionCooldown: 0,
      };
    }

    // r-strategy vs K-strategy trade-offs

    // 1. Offspring count: High care = fewer children (1-2), Low care = more children (2-4)
    const baseOffspringCount = Math.round(2.5 - avgParentalCare * 1.5); // 2.5-1.0 → round to 1-3
    const offspringCount = Math.max(
      1,
      Math.min(4, baseOffspringCount + (Math.random() < 0.3 ? 1 : 0))
    );

    // 2. Energy cost per child: High care = expensive children, Low care = cheap children
    const baseCostPerChild = genetics.reproductionCost;
    const careFactor = 0.5 + avgParentalCare * 1.0; // 0.5-1.5 multiplier
    const energyCostPerChild = baseCostPerChild * careFactor;
    const totalEnergyCost = energyCostPerChild * offspringCount;

    // 3. Child quality: High care = strong children, Low care = weak children
    const childQuality = this.calculateOffspringQuality(avgParentalCare);

    // 4. Reproduction cooldown: High care = longer between births, Low care = shorter
    const baseCooldown = 50; // Base ticks between reproductions
    const cooldownMultiplier = 0.7 + avgParentalCare * 0.8; // 0.7-1.5
    const reproductionCooldown = Math.round(baseCooldown * cooldownMultiplier);

    return {
      canReproduce: true,
      energyCost: Math.min(totalEnergyCost, stats.energy - 10), // Leave some energy for survival
      offspringCount,
      offspringStartingEnergy: childQuality.startingEnergy,
      offspringStartingHealth: childQuality.startingHealth,
      reproductionCooldown,
    };
  }

  /**
   * Calculate the quality of offspring based on parental care investment
   */
  public static calculateOffspringQuality(
    parentalCare: number
  ): OffspringQuality {
    // Base offspring stats
    const baseEnergy = 25; // Standard starting energy
    const baseHealth = 70; // Standard starting health

    // Parental care bonuses
    const careBonus = parentalCare; // 0.0-1.0

    // 1. Starting energy: More care = more energy reserves
    const energyBonus = careBonus * 35; // 0-35 bonus energy
    const startingEnergy = Math.min(80, baseEnergy + energyBonus); // Cap at 80

    // 2. Starting health: More care = better initial health
    const healthBonus = careBonus * 25; // 0-25 bonus health
    const startingHealth = Math.min(100, baseHealth + healthBonus); // Cap at 100

    // 3. Growth rate: More care = faster development
    const growthBonus = careBonus * 0.3; // 0-0.3 bonus
    const growthRate = 0.8 + growthBonus; // 0.8-1.1 (faster growth rate)

    // 4. Immunity boost: More care = better disease resistance
    const immunityBoost = careBonus * 0.4; // 0-0.4 damage resistance

    return {
      startingEnergy,
      startingHealth,
      growthRate,
      immunityBoost,
    };
  }

  /**
   * Calculate lifetime reproductive success based on strategy
   */
  public static estimateLifetimeOffspring(genetics: CreatureGenetics): {
    totalOffspring: number;
    strategy: "r-strategy" | "balanced" | "K-strategy";
    description: string;
  } {
    const lifespan = genetics.lifespan;
    const maturityAge = genetics.maturityAge;
    const parentalCare = genetics.parentalCare;

    // Reproductive period
    const reproductiveLife = lifespan - maturityAge;

    // Reproduction frequency
    const baseCooldown = 50;
    const cooldownMultiplier = 0.7 + parentalCare * 0.8;
    const reproductionInterval = baseCooldown * cooldownMultiplier;

    // Number of reproduction events
    const reproductionEvents = Math.floor(
      reproductiveLife / reproductionInterval
    );

    // Offspring per event
    const offspringPerEvent = Math.round(2.5 - parentalCare * 1.5);

    // Total theoretical offspring
    const totalOffspring = reproductionEvents * Math.max(1, offspringPerEvent);

    // Strategy classification
    let strategy: "r-strategy" | "balanced" | "K-strategy";
    let description: string;

    if (parentalCare < 0.3) {
      strategy = "r-strategy";
      description = `High reproduction: ${totalOffspring} children with basic care`;
    } else if (parentalCare > 0.7) {
      strategy = "K-strategy";
      description = `Quality focused: ${totalOffspring} children with extensive care`;
    } else {
      strategy = "balanced";
      description = `Balanced approach: ${totalOffspring} children with moderate care`;
    }

    return {
      totalOffspring,
      strategy,
      description,
    };
  }

  /**
   * Calculate child survival probability based on care received
   */
  public static calculateChildSurvivalRate(parentalCare: number): {
    survivalToMaturity: number;
    description: string;
  } {
    // Base survival rate (without parental care)
    const baseSurvival = 0.3; // 30% survive to maturity in harsh environment

    // Parental care dramatically improves survival
    const careBonus = parentalCare * 0.5; // Up to 50% bonus survival
    const survivalToMaturity = Math.min(0.85, baseSurvival + careBonus); // Cap at 85%

    let description: string;
    if (survivalToMaturity < 0.4) {
      description = "Low survival - many children lost to environment";
    } else if (survivalToMaturity < 0.6) {
      description = "Moderate survival - some children reach maturity";
    } else {
      description = "High survival - most children reach maturity";
    }

    return {
      survivalToMaturity,
      description,
    };
  }

  /**
   * Analyze optimal reproductive strategy for given environment
   */
  public static analyzeOptimalStrategy(environmentConditions: {
    foodAbundance: number; // 0.0-1.0
    predationPressure: number; // 0.0-1.0
    populationDensity: number; // 0.0-1.0
    resourceStability: number; // 0.0-1.0
  }): {
    optimalParentalCare: number;
    reasoning: string;
  } {
    const {
      foodAbundance,
      predationPressure,
      populationDensity,
      resourceStability,
    } = environmentConditions;

    // Environmental factors favoring different strategies

    // r-strategy favored when:
    // - High predation (need many offspring to replace losses)
    // - Unstable resources (reproduce quickly when possible)
    // - Low population density (more opportunities)
    const rStrategyScore =
      predationPressure * 0.4 +
      (1 - resourceStability) * 0.3 +
      (1 - populationDensity) * 0.3;

    // K-strategy favored when:
    // - Low food abundance (need efficient offspring)
    // - High population density (competition requires quality)
    // - Stable resources (can invest in long-term care)
    const kStrategyScore =
      (1 - foodAbundance) * 0.4 +
      populationDensity * 0.3 +
      resourceStability * 0.3;

    // Calculate optimal parental care (0.0 = pure r, 1.0 = pure K)
    const totalScore = rStrategyScore + kStrategyScore;
    const optimalParentalCare =
      totalScore > 0 ? kStrategyScore / totalScore : 0.5;

    // Generate reasoning
    let reasoning = "Environmental analysis suggests ";
    if (optimalParentalCare < 0.3) {
      reasoning +=
        "r-strategy (many cheap offspring) due to high predation/instability";
    } else if (optimalParentalCare > 0.7) {
      reasoning +=
        "K-strategy (few quality offspring) due to resource scarcity/competition";
    } else {
      reasoning +=
        "balanced strategy adapting to mixed environmental pressures";
    }

    return {
      optimalParentalCare,
      reasoning,
    };
  }
}

export interface StrategyAnalysis {
  totalOffspring: number;
  strategy: "r-strategy" | "balanced" | "K-strategy";
  description: string;
  survival: {
    survivalToMaturity: number;
    description: string;
  };
  effectiveOffspring: number;
}

/**
 * Reproductive strategy analyzer for educational purposes
 */
export class StrategyAnalyzer {
  /**
   * Compare two reproductive strategies
   */
  public static compareStrategies(
    rStrategyGenetics: CreatureGenetics,
    kStrategyGenetics: CreatureGenetics
  ): {
    rStrategy: StrategyAnalysis;
    kStrategy: StrategyAnalysis;
    prediction: string;
  } {
    const rAnalysis =
      ParentalCareHelper.estimateLifetimeOffspring(rStrategyGenetics);
    const kAnalysis =
      ParentalCareHelper.estimateLifetimeOffspring(kStrategyGenetics);

    const rSurvival = ParentalCareHelper.calculateChildSurvivalRate(
      rStrategyGenetics.parentalCare
    );
    const kSurvival = ParentalCareHelper.calculateChildSurvivalRate(
      kStrategyGenetics.parentalCare
    );

    // Effective reproduction (offspring × survival rate)
    const rEffective = rAnalysis.totalOffspring * rSurvival.survivalToMaturity;
    const kEffective = kAnalysis.totalOffspring * kSurvival.survivalToMaturity;

    let prediction: string;
    if (rEffective > kEffective * 1.2) {
      prediction = "r-strategy likely to dominate through sheer numbers";
    } else if (kEffective > rEffective * 1.2) {
      prediction = "K-strategy likely to dominate through offspring quality";
    } else {
      prediction = "Strategies likely to coexist, creating species diversity";
    }

    return {
      rStrategy: {
        ...rAnalysis,
        survival: rSurvival,
        effectiveOffspring: rEffective,
      },
      kStrategy: {
        ...kAnalysis,
        survival: kSurvival,
        effectiveOffspring: kEffective,
      },
      prediction,
    };
  }
}
