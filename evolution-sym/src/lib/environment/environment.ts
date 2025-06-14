/**
 * Environment Class - Ecosystem Management System
 *
 * Manages the 2D world containing creatures, food, and environmental features.
 * Designed for expansion from single biome to complex multi-biome ecosystems.
 */

import { Creature } from "../creatures/creature";
import { Vector2, CreatureState } from "../creatures/creatureTypes";
import {
  Biome,
  BiomeType,
  Entity,
  EntityType,
  FoodEntity,
  ConsumableEntity,
  EnvironmentalEntity,
  SpatialGrid,
  SpatialQuery,
  EntityQuery,
  WorldBounds,
  EnvironmentStats,
  EnvironmentConfig,
  CombatInteraction,
  FeedingInteraction,
  PRESET_BIOMES,
  Carrion,
} from "./environmentTypes";
import { simulationLogger, LogCategory } from "../logging/simulationLogger";

export class Environment {
  // Core configuration
  public readonly config: EnvironmentConfig;
  public readonly biome: Biome;
  public readonly bounds: WorldBounds;

  // Entity management
  private creatures: Map<string, Creature> = new Map();
  private food: Map<string, FoodEntity> = new Map();
  private environmental: Map<string, EnvironmentalEntity> = new Map();
  private entities: Map<string, Entity> = new Map();

  // Spatial partitioning for efficient queries
  private spatialGrid: SpatialGrid;

  // Performance tracking
  private stats: EnvironmentStats;
  private tickCount: number = 0;

  /**
   * Create a new environment
   */
  constructor(config?: Partial<EnvironmentConfig>) {
    // Set up configuration with defaults
    this.config = this.mergeConfig(config);
    this.biome = this.config.biome;
    this.bounds = this.config.bounds;

    // Initialize spatial grid
    this.spatialGrid = this.createSpatialGrid();

    // Initialize statistics
    this.stats = this.initializeStats();

    // Spawn initial entities
    this.spawnInitialEntities();

    // Update stats to reflect initial spawning
    this.updateStats(0);
  }

  /**
   * Main environment update - called every simulation tick
   */
  public update(): void {
    const startTime = performance.now();

    // 1. Update moving entities (prey food)
    this.updateMovingEntities();

    // 2. Update carrion decay
    this.updateCarrion();

    // 3. 🎯 NEW: Apply carrying capacity pressure
    this.applyCarryingCapacityPressure();

    // 4. Process creature actions and interactions
    this.processCreatureInteractions();

    // 5. Spawn new entities based on biome characteristics
    this.spawnEntities();

    // 6. Clean up dead/consumed entities
    this.cleanupEntities();

    // 7. Update spatial grid
    this.updateSpatialGrid();

    // 8. Update statistics
    const endTime = performance.now();
    this.updateStats(endTime - startTime);

    this.tickCount++;
  }

  /**
   * Add a creature to the environment
   */
  public addCreature(creature: Creature): void {
    this.creatures.set(creature.id, creature);
    this.addToSpatialGrid(creature);
  }

  /**
   * Remove a creature from the environment
   */
  public removeCreature(creatureId: string): boolean {
    const creature = this.creatures.get(creatureId);
    if (!creature) return false;

    // Convert dead creature to carrion instead of just removing it
    if (creature.state === CreatureState.Dead) {
      this.createCarrionFromCreature(creature);
    }

    this.creatures.delete(creatureId);
    this.removeFromSpatialGrid(creature);
    return true;
  }

  /**
   * Get all living creatures
   */
  public getCreatures(): Creature[] {
    return Array.from(this.creatures.values()).filter(
      (creature) => creature.state === CreatureState.Alive
    );
  }

  /**
   * Find entities near a position (for creature sensors)
   */
  public queryNearbyEntities(query: SpatialQuery): EntityQuery {
    this.stats.spatialQueries++;

    const results: EntityQuery = {
      food: [],
      creatures: [],
      environmental: [],
      distance: Infinity,
    };

    // Calculate which grid cells to check
    const cellsToCheck = this.getCellsInRadius(query.position, query.radius);

    // Check each cell for matching entities
    for (const cellKey of cellsToCheck) {
      const cell = this.spatialGrid.cells.get(cellKey);
      if (!cell) continue;

      // Check food entities
      for (const food of cell.food) {
        if (this.matchesQuery(food, query)) {
          const distance = this.calculateDistance(
            query.position,
            food.position
          );
          if (distance <= query.radius) {
            results.food.push(food);
            results.distance = Math.min(results.distance, distance);
          }
        }
      }

      // Check creatures
      for (const creature of cell.creatures) {
        if (
          this.matchesQuery(creature, query) &&
          creature !== query.excludeCreature
        ) {
          const distance = this.calculateDistance(
            query.position,
            creature.physics.position
          );
          if (distance <= query.radius) {
            results.creatures.push(creature);
            results.distance = Math.min(results.distance, distance);
          }
        }
      }

      // Check environmental entities
      for (const env of cell.environmental) {
        if (this.matchesQuery(env, query)) {
          const distance = this.calculateDistance(query.position, env.position);
          if (distance <= query.radius) {
            results.environmental.push(env);
            results.distance = Math.min(results.distance, distance);
          }
        }
      }
    }

    // Sort by distance if requested
    if (query.sortByDistance) {
      // Sort food entities
      results.food.sort((a, b) => {
        const distA = this.calculateDistance(query.position, a.position);
        const distB = this.calculateDistance(query.position, b.position);
        return distA - distB;
      });

      // Sort creatures (different position structure)
      results.creatures.sort((a, b) => {
        const distA = this.calculateDistance(
          query.position,
          a.physics.position
        );
        const distB = this.calculateDistance(
          query.position,
          b.physics.position
        );
        return distA - distB;
      });

      // Sort environmental entities
      results.environmental.sort((a, b) => {
        const distA = this.calculateDistance(query.position, a.position);
        const distB = this.calculateDistance(query.position, b.position);
        return distA - distB;
      });
    }

    // Limit results if requested
    if (query.maxResults) {
      results.food = results.food.slice(0, query.maxResults);
      results.creatures = results.creatures.slice(0, query.maxResults);
      results.environmental = results.environmental.slice(0, query.maxResults);
    }

    return results;
  }

  /**
   * Process combat between creatures
   */
  public processCombat(
    attacker: Creature,
    defender: Creature,
    attackPower: number
  ): CombatInteraction {
    this.stats.collisionChecks++;

    const distance = this.calculateDistance(
      attacker.physics.position,
      defender.physics.position
    );

    // Check if creatures are close enough for combat
    const maxRange =
      attacker.physics.collisionRadius + defender.physics.collisionRadius;
    if (distance > maxRange) {
      return {
        attacker,
        defender,
        attackPower,
        distance,
        success: false,
        damage: 0,
        energyLoss: 2, // Energy cost for attempted attack
      };
    }

    // Calculate combat success chance based on size and aggression
    const combatSuccess = this.calculateCombatSuccess(
      attacker,
      defender,
      attackPower
    );

    if (Math.random() < combatSuccess) {
      // Attack succeeds
      const damage = attackPower * 20; // Scale damage
      defender.physics.health = Math.max(0, defender.physics.health - damage);

      // 👊 COMBAT SUCCESS LOGGING
      simulationLogger.logCombat(
        attacker.id,
        defender.id,
        true,
        damage,
        defender.physics.health
      );

      // Update statistics
      attacker.stats.attacksGiven++;
      defender.stats.attacksReceived++;

      const energyLoss = 2 + attackPower * 3; // Energy cost for attacking
      attacker.physics.energy = Math.max(
        0,
        attacker.physics.energy - energyLoss
      );

      return {
        attacker,
        defender,
        attackPower,
        distance: this.calculateDistance(
          attacker.physics.position,
          defender.physics.position
        ),
        success: true,
        damage,
        energyLoss,
      };
    } else {
      // Attack fails
      simulationLogger.logCombat(
        attacker.id,
        defender.id,
        false,
        0,
        defender.physics.health
      );

      const energyLoss = 1 + attackPower; // Small energy cost for failed attack
      attacker.physics.energy = Math.max(
        0,
        attacker.physics.energy - energyLoss
      );

      return {
        attacker,
        defender,
        attackPower,
        distance: this.calculateDistance(
          attacker.physics.position,
          defender.physics.position
        ),
        success: false,
        damage: 0,
        energyLoss,
      };
    }
  }

  /**
   * Process creature feeding on food entity
   */
  public processFeeding(
    creature: Creature,
    food: ConsumableEntity,
    feedingPower: number
  ): FeedingInteraction {
    const distance = this.calculateDistance(
      creature.physics.position,
      food.position
    );

    // Check if creature is close enough to feed
    const maxRange = creature.physics.collisionRadius + food.size + 50;
    if (distance > maxRange) {
      return {
        creature,
        food,
        feedingPower,
        success: false,
        energyGain: 0,
        foodConsumed: false,
      };
    }

    // Calculate energy gain based on diet preferences - INCLUDING CARRION! 🦴
    let energyMultiplier = 1.0;
    let actualEnergyValue =
      "energy" in food ? food.energy : food.currentEnergyValue;

    if (food.type === EntityType.PlantFood) {
      energyMultiplier = creature.genetics.plantPreference;
    } else if (
      food.type === EntityType.MushroomFood ||
      food.type === EntityType.SmallPrey
    ) {
      energyMultiplier = creature.genetics.meatPreference;
    } else if (food.type === EntityType.Carrion) {
      // 🦴 CARRION FEEDING - Special scavenger mechanics!
      energyMultiplier = creature.genetics.meatPreference; // Meat eaters = better scavengers

      // Access carrion-specific energy (decays over time)
      const carrion = food as Carrion;
      if (carrion.currentEnergyValue !== undefined) {
        actualEnergyValue = carrion.currentEnergyValue;
      }

      console.log(
        `🦴 Scavenging! Energy: ${actualEnergyValue.toFixed(
          1
        )}, Multiplier: ${energyMultiplier.toFixed(2)}`
      );
    }

    const energyGain = actualEnergyValue * feedingPower * energyMultiplier;
    creature.physics.energy = Math.min(
      100,
      creature.physics.energy + energyGain
    );

    // Update creature statistics
    creature.stats.foodEaten++;

    // 🍽️ FEEDING SUCCESS LOGGING
    simulationLogger.logFeeding(
      creature.id,
      food.type,
      energyGain,
      creature.physics.energy
    );

    // Remove consumed food or carrion 🦴
    this.removeFromSpatialGrid(food);

    if (food.type === EntityType.Carrion) {
      // Carrion is stored in entities map
      this.entities.delete(food.id);
      console.log(`🦴 Carrion consumed and removed: ${food.id}`);
    } else {
      // Regular food is stored in food map
      this.food.delete(food.id);
    }

    return {
      creature,
      food,
      feedingPower,
      success: true,
      energyGain,
      foodConsumed: true,
    };
  }

  /**
   * Get all consumable food entities (regular food + carrion) for visualization
   */
  public getAllFood(): ConsumableEntity[] {
    const regularFood = Array.from(this.food.values());
    const carrion = Array.from(this.entities.values()).filter(
      (e) => e.type === EntityType.Carrion
    ) as Carrion[];
    return [...regularFood, ...carrion];
  }

  /**
   * Get only carrion entities for advanced visualization
   */
  public getCarrion(): Carrion[] {
    return Array.from(this.entities.values()).filter(
      (e) => e.type === EntityType.Carrion
    ) as Carrion[];
  }

  /**
   * Get only regular food entities (no carrion)
   */
  public getRegularFood(): FoodEntity[] {
    return Array.from(this.food.values());
  }

  /**
   * Get environment statistics
   */
  public getStats(): EnvironmentStats {
    return { ...this.stats };
  }

  /**
   * Get current biome information
   */
  public getBiome(): Biome {
    return this.biome;
  }

  /**
   * 🎯 Apply carrying capacity pressure to control population growth
   */
  private applyCarryingCapacityPressure(): void {
    const carryingCapacity = this.config.carryingCapacity;
    if (!carryingCapacity) return; // No carrying capacity system enabled

    const currentPopulation = this.creatures.size;
    const targetPopulation = carryingCapacity.targetPopulation;
    const maxPopulation = carryingCapacity.maxPopulation;

    // Skip if population is within healthy range
    if (currentPopulation <= targetPopulation) return;

    // Calculate pressure intensity based on overpopulation
    const overpopulation = currentPopulation - targetPopulation;
    const overpopulationRatio = overpopulation / targetPopulation;

    // 1. DENSITY-DEPENDENT MORTALITY - natural death from overcrowding
    if (currentPopulation > targetPopulation) {
      // Mortality rate increases exponentially with overpopulation
      const mortalityChance =
        carryingCapacity.mortalityRate * Math.pow(overpopulationRatio, 2);

      for (const creature of this.creatures.values()) {
        if (Math.random() < mortalityChance) {
          // Mark for natural death (will be processed in cleanup)
          creature.physics.health = 0; // Environmental stress death

          simulationLogger.warning(
            LogCategory.POPULATION,
            `🌍 Environmental stress killed ${creature.id.substring(
              0,
              8
            )} (population: ${currentPopulation}/${targetPopulation})`
          );
        }
      }
    }

    // 2. SOCIAL STRESS - energy drain from overcrowding
    const stressMultiplier =
      1 + overpopulationRatio * carryingCapacity.densityStressFactor * 100;

    for (const creature of this.creatures.values()) {
      // Calculate local density around this creature
      const nearbyCreatures = this.queryNearbyEntities({
        position: creature.physics.position,
        radius: 150, // 150px radius for stress calculation
        entityTypes: [], // We want creatures, which aren't in entityTypes
      }).creatures.length;

      // More stress with more nearby creatures
      const localStress =
        nearbyCreatures * carryingCapacity.densityStressFactor;
      creature.physics.energy = Math.max(
        0,
        creature.physics.energy - localStress
      );
    }

    // 3. EMERGENCY MEASURES - hard population cap
    if (currentPopulation > maxPopulation) {
      // Kill oldest, weakest creatures to enforce hard cap
      const excessCreatures = currentPopulation - maxPopulation;
      const sortedCreatures = Array.from(this.creatures.values())
        .filter((c) => c.state === CreatureState.Alive)
        .sort((a, b) => {
          // Sort by fitness (lowest first) and then by age (oldest first)
          const fitnessDiff = a.stats.fitness - b.stats.fitness;
          if (Math.abs(fitnessDiff) < 0.1) {
            return b.physics.age - a.physics.age; // Older dies first if similar fitness
          }
          return fitnessDiff; // Lower fitness dies first
        });

      for (
        let i = 0;
        i < Math.min(excessCreatures, sortedCreatures.length);
        i++
      ) {
        const victim = sortedCreatures[i];
        victim.physics.health = 0; // Emergency population control

        simulationLogger.critical(
          LogCategory.POPULATION,
          `⚠️ Emergency population control: eliminated ${victim.id.substring(
            0,
            8
          )} (${currentPopulation}/${maxPopulation})`
        );
      }
    }

    // 4. LOG POPULATION PRESSURE
    if (this.tickCount % 100 === 0 && overpopulation > 0) {
      simulationLogger.warning(
        LogCategory.POPULATION,
        `🌍 Population pressure: ${currentPopulation}/${targetPopulation} (+${overpopulation}) - stress multiplier: ${stressMultiplier.toFixed(
          2
        )}x`
      );
    }
  }

  /**
   * Private helper methods
   */

  private mergeConfig(config?: Partial<EnvironmentConfig>): EnvironmentConfig {
    const defaultConfig: EnvironmentConfig = {
      bounds: {
        width: 1000,
        height: 1000,
        shape: "circular",
        centerX: 500,
        centerY: 500,
        radius: 500,
      },
      biome: PRESET_BIOMES[BiomeType.Grassland],
      maxCreatures: 200,
      maxFood: 500,
      foodSpawnRate: 0.5,
      preySpawnRate: 0.1,
      spatialGridSize: 100,
      updateFrequency: 1,

      // 🎯 Evidence-tuned carrying capacity settings for 300 target population (Iteration 22 - AGGRESSIVE Sweet Spot!)
      carryingCapacity: {
        targetPopulation: 300,
        maxPopulation: 400,
        densityStressFactor: 0.0001, // Reduced from 0.0005 - was causing energy crisis even at low pop
        mortalityRate: 0.005, // Further reduced from 0.015 (44 creatures) - let population grow first
        resourceScaling: 0.85, // Optimal resource competition
      },
    };

    return { ...defaultConfig, ...config };
  }

  private createSpatialGrid(): SpatialGrid {
    const cellSize = this.config.spatialGridSize;
    const width = Math.ceil(this.bounds.width / cellSize);
    const height = Math.ceil(this.bounds.height / cellSize);

    return {
      cellSize,
      width,
      height,
      cells: new Map(),
    };
  }

  private initializeStats(): EnvironmentStats {
    return {
      totalCreatures: 0,
      livingCreatures: 0,
      deadCreatures: 0,
      totalFood: 0,
      plantFood: 0,
      meatFood: 0,
      preyFood: 0,
      spatialQueries: 0,
      collisionChecks: 0,
      updateTimeMs: 0,
    };
  }

  private spawnInitialEntities(): void {
    // Spawn initial plant food based on biome
    const plantCount = Math.floor(
      this.config.maxFood * this.biome.characteristics.plantDensity * 0.3
    );
    for (let i = 0; i < plantCount; i++) {
      this.spawnPlantFood();
    }

    // Spawn initial prey based on biome
    const preyCount = Math.floor(
      this.config.maxFood * this.biome.characteristics.preyDensity * 0.1
    );
    for (let i = 0; i < preyCount; i++) {
      this.spawnSmallPrey();
    }
  }

  private updateMovingEntities(): void {
    for (const food of this.food.values()) {
      if (
        food.type === EntityType.SmallPrey &&
        food.velocity &&
        food.maxSpeed
      ) {
        // Simple random movement for prey
        const randomDirection = Math.random() * Math.PI * 2;
        food.velocity.x = Math.cos(randomDirection) * food.maxSpeed;
        food.velocity.y = Math.sin(randomDirection) * food.maxSpeed;

        // Update position
        food.position.x += food.velocity.x;
        food.position.y += food.velocity.y;

        // Keep within bounds
        this.keepWithinBounds(food.position);
      }
    }
  }

  private processCreatureInteractions(): void {
    // Update all living creatures - this is where AI brains make decisions!
    for (const creature of this.creatures.values()) {
      if (creature.state === CreatureState.Alive) {
        // Pass environment reference so creatures can query for food, threats, etc.
        creature.update(this);
      }
    }
  }

  private spawnEntities(): void {
    // 🎯 Calculate resource scaling based on population pressure
    let resourceMultiplier = 1.0;
    if (this.config.carryingCapacity) {
      const currentPopulation = this.creatures.size;
      const targetPopulation = this.config.carryingCapacity.targetPopulation;

      if (currentPopulation > targetPopulation) {
        // Reduce food spawning when overpopulated
        const overpopulationRatio =
          (currentPopulation - targetPopulation) / targetPopulation;
        resourceMultiplier = Math.max(
          0.2,
          this.config.carryingCapacity.resourceScaling -
            overpopulationRatio * 0.3
        );
      } else if (currentPopulation < targetPopulation * 0.5) {
        // Increase food spawning when underpopulated
        resourceMultiplier = 1.5;
      }
    }

    // Spawn food based on biome characteristics and population pressure
    if (
      this.stats.plantFood <
      this.config.maxFood * this.biome.characteristics.plantDensity * 0.5
    ) {
      if (
        Math.random() <
        this.config.foodSpawnRate *
          this.biome.characteristics.plantDensity *
          resourceMultiplier
      ) {
        this.spawnPlantFood();
      }
    }

    if (
      this.stats.preyFood <
      this.config.maxFood * this.biome.characteristics.preyDensity * 0.2
    ) {
      if (
        Math.random() <
        this.config.preySpawnRate *
          this.biome.characteristics.preyDensity *
          resourceMultiplier
      ) {
        this.spawnSmallPrey();
      }
    }
  }

  private cleanupEntities(): void {
    // Remove dead creatures (use proper removeCreature method to create carrion)
    const deadCreatureIds: string[] = [];
    for (const [id, creature] of this.creatures) {
      if (creature.state === CreatureState.Dead) {
        deadCreatureIds.push(id);
      }
    }

    // Remove using proper method that creates carrion
    for (const id of deadCreatureIds) {
      this.removeCreature(id);
    }
  }

  private updateSpatialGrid(): void {
    // Clear all cells
    this.spatialGrid.cells.clear();

    // Re-add all entities to grid
    for (const creature of this.creatures.values()) {
      this.addToSpatialGrid(creature);
    }

    for (const food of this.food.values()) {
      this.addToSpatialGrid(food);
    }

    // 🚨 FIX: Add entities (including carrion) to spatial grid!
    for (const entity of this.entities.values()) {
      this.addToSpatialGrid(entity);
    }

    for (const env of this.environmental.values()) {
      this.addToSpatialGrid(env);
    }
  }

  private addToSpatialGrid(entity: Entity | Creature): void {
    const position =
      "physics" in entity ? entity.physics.position : entity.position;
    const cellKey = this.getCellKey(position);

    if (!this.spatialGrid.cells.has(cellKey)) {
      this.spatialGrid.cells.set(cellKey, {
        creatures: [],
        food: [],
        environmental: [],
      });
    }

    const cell = this.spatialGrid.cells.get(cellKey)!;

    if ("physics" in entity) {
      cell.creatures.push(entity as Creature);
    } else if (
      entity.type === EntityType.PlantFood ||
      entity.type === EntityType.MushroomFood ||
      entity.type === EntityType.SmallPrey ||
      entity.type === EntityType.Carrion // 🦴 Carrion counts as food!
    ) {
      cell.food.push(entity as FoodEntity);
    } else {
      cell.environmental.push(entity as EnvironmentalEntity);
    }
  }

  private removeFromSpatialGrid(entity: Entity | Creature): void {
    const position =
      "physics" in entity ? entity.physics.position : entity.position;
    const cellKey = this.getCellKey(position);
    const cell = this.spatialGrid.cells.get(cellKey);

    if (!cell) return;

    if ("physics" in entity) {
      const index = cell.creatures.indexOf(entity as Creature);
      if (index > -1) cell.creatures.splice(index, 1);
    } else if (
      entity.type === EntityType.PlantFood ||
      entity.type === EntityType.MushroomFood ||
      entity.type === EntityType.SmallPrey ||
      entity.type === EntityType.Carrion // 🦴 Carrion removal from food!
    ) {
      const index = cell.food.indexOf(entity as FoodEntity);
      if (index > -1) cell.food.splice(index, 1);
    } else {
      const index = cell.environmental.indexOf(entity as EnvironmentalEntity);
      if (index > -1) cell.environmental.splice(index, 1);
    }
  }

  private getCellKey(position: Vector2): string {
    const x = Math.floor(position.x / this.spatialGrid.cellSize);
    const y = Math.floor(position.y / this.spatialGrid.cellSize);
    return `${x},${y}`;
  }

  private getCellsInRadius(position: Vector2, radius: number): string[] {
    const cells: string[] = [];
    const cellRadius = Math.ceil(radius / this.spatialGrid.cellSize);
    const centerX = Math.floor(position.x / this.spatialGrid.cellSize);
    const centerY = Math.floor(position.y / this.spatialGrid.cellSize);

    for (let x = centerX - cellRadius; x <= centerX + cellRadius; x++) {
      for (let y = centerY - cellRadius; y <= centerY + cellRadius; y++) {
        cells.push(`${x},${y}`);
      }
    }

    return cells;
  }

  private matchesQuery(
    entity: Entity | Creature,
    query: SpatialQuery
  ): boolean {
    if (!query.entityTypes) return true;

    const entityType = "physics" in entity ? EntityType.Creature : entity.type;
    return query.entityTypes.includes(entityType);
  }

  private calculateDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateCombatSuccess(
    attacker: Creature,
    defender: Creature,
    attackPower: number
  ): number {
    // Hybrid emergent/rule-based combat system
    const sizeAdvantage =
      (attacker.genetics.size / defender.genetics.size) * 0.3;
    const aggressionBonus = attacker.genetics.aggression * 0.4;
    const defenseBonus = defender.genetics.speed * 0.2; // Speed helps escape
    const attackBonus = attackPower * 0.2;

    // Base 30% chance, modified by traits (prevents guaranteed outcomes)
    return Math.max(
      0.1,
      Math.min(
        0.9,
        0.3 + sizeAdvantage + aggressionBonus + attackBonus - defenseBonus
      )
    );
  }

  private spawnPlantFood(): void {
    const position = this.getRandomPosition();
    const food: FoodEntity = {
      id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      position,
      type: EntityType.PlantFood,
      isActive: true,
      energy: 5,
      size: 3,
      spawnRate: 0.5,
      maxQuantity: 200,
    };

    this.food.set(food.id, food);
    this.addToSpatialGrid(food);
  }

  private spawnSmallPrey(): void {
    const position = this.getRandomPosition();
    const food: FoodEntity = {
      id: `prey_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      position,
      type: EntityType.SmallPrey,
      isActive: true,
      energy: 15,
      size: 5,
      velocity: { x: 0, y: 0 },
      maxSpeed: 1,
      spawnRate: 0.1,
      maxQuantity: 50,
    };

    this.food.set(food.id, food);
    this.addToSpatialGrid(food);
  }

  private getRandomPosition(): Vector2 {
    if (this.bounds.shape === "circular") {
      // Generate position within circular bounds
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (this.bounds.radius! * 0.9); // 90% of radius for margin
      return {
        x: this.bounds.centerX + Math.cos(angle) * radius,
        y: this.bounds.centerY + Math.sin(angle) * radius,
      };
    } else {
      // Rectangular bounds
      return {
        x: Math.random() * this.bounds.width,
        y: Math.random() * this.bounds.height,
      };
    }
  }

  private keepWithinBounds(position: Vector2): void {
    if (this.bounds.shape === "circular") {
      const dx = position.x - this.bounds.centerX;
      const dy = position.y - this.bounds.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > this.bounds.radius!) {
        const scale = this.bounds.radius! / distance;
        position.x = this.bounds.centerX + dx * scale;
        position.y = this.bounds.centerY + dy * scale;
      }
    } else {
      position.x = Math.max(0, Math.min(this.bounds.width, position.x));
      position.y = Math.max(0, Math.min(this.bounds.height, position.y));
    }
  }

  private updateStats(updateTimeMs: number): void {
    // Count entities
    this.stats.totalCreatures = this.creatures.size;
    this.stats.livingCreatures = Array.from(this.creatures.values()).filter(
      (c) => c.state === CreatureState.Alive
    ).length;
    this.stats.deadCreatures =
      this.stats.totalCreatures - this.stats.livingCreatures;

    this.stats.totalFood = this.food.size;
    this.stats.plantFood = Array.from(this.food.values()).filter(
      (f) => f.type === EntityType.PlantFood
    ).length;
    this.stats.preyFood = Array.from(this.food.values()).filter(
      (f) => f.type === EntityType.SmallPrey
    ).length;
    this.stats.meatFood = Array.from(this.food.values()).filter(
      (f) => f.type === EntityType.MushroomFood
    ).length;

    this.stats.updateTimeMs = updateTimeMs;

    // Reset per-tick counters
    this.stats.spatialQueries = 0;
    this.stats.collisionChecks = 0;
  }

  /**
   * Create carrion when a creature dies
   */
  private createCarrionFromCreature(creature: Creature): void {
    const carrion: Carrion = {
      id: `carrion_${creature.id}_${Date.now()}`,
      type: EntityType.Carrion,
      subtype: "fresh",
      position: { ...creature.physics.position },
      size: creature.physics.collisionRadius,
      isActive: true,

      // Decay properties
      originalCreatureId: creature.id,
      timeOfDeath: this.tickCount,
      currentDecayStage: 0,
      maxDecayTime: 200 + Math.random() * 300, // 200-500 ticks to fully decay

      // Energy properties - carrion starts with remaining creature energy
      originalEnergyValue: creature.stats.energy || 20,
      currentEnergyValue: creature.stats.energy || 20,

      // Scavenger attraction
      scent: 1.0, // Fresh carrion has strong scent

      // Visual properties
      decayVisual: {
        opacity: 0.9, // Slightly faded
        color: creature.getHSLColor().hue + "deg, 30%, 40%", // Darker, less saturated
      },
    };

    this.entities.set(carrion.id, carrion);
    this.addToSpatialGrid(carrion);

    console.log(
      `🦴 Carrion created from ${creature.id} at (${carrion.position.x.toFixed(
        0
      )}, ${carrion.position.y.toFixed(0)})`
    );
  }

  /**
   * Update all carrion - decay over time
   */
  private updateCarrion(): void {
    const carrion = Array.from(this.entities.values()).filter(
      (e) => e.type === EntityType.Carrion
    ) as Carrion[];

    for (const c of carrion) {
      this.processCarrionDecay(c);
    }
  }

  /**
   * Process decay for a single carrion
   */
  private processCarrionDecay(carrion: Carrion): void {
    const ticksSinceDeath = this.tickCount - carrion.timeOfDeath;
    carrion.currentDecayStage = ticksSinceDeath / carrion.maxDecayTime;

    // Update decay properties
    if (carrion.currentDecayStage < 0.3) {
      carrion.subtype = "fresh";
      carrion.scent = 1.0 - carrion.currentDecayStage * 0.5; // Strong scent
    } else if (carrion.currentDecayStage < 0.7) {
      carrion.subtype = "aged";
      carrion.scent = 0.8 - carrion.currentDecayStage * 0.3; // Moderate scent
    } else {
      carrion.subtype = "rotting";
      carrion.scent = 0.3 - carrion.currentDecayStage * 0.2; // Weak scent
    }

    // Reduce energy value as it decays
    carrion.currentEnergyValue =
      carrion.originalEnergyValue * (1 - carrion.currentDecayStage * 0.8);

    // Update visual decay
    carrion.decayVisual.opacity = 0.9 - carrion.currentDecayStage * 0.7; // Becomes transparent

    // Remove completely decayed carrion
    if (carrion.currentDecayStage >= 1.0) {
      this.entities.delete(carrion.id);
      this.removeFromSpatialGrid(carrion);
      console.log(`🪦 Carrion ${carrion.id} fully decomposed`);
    }
  }
}
