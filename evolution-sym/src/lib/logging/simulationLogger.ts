/**
 * Simulation Logging System
 * Centralized logging for simulation events with UI integration
 */

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export enum LogCategory {
  POPULATION = "population",
  CREATURE_LIFE = "creature_life",
  FEEDING = "feeding",
  COMBAT = "combat",
  REPRODUCTION = "reproduction",
  BRAIN = "brain",
  ENVIRONMENT = "environment",
  CARRION = "carrion",
  SYSTEM = "system",
}

export interface SimulationLogEntry {
  id: string;
  timestamp: number;
  tick: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  icon: string;
  data?: Record<string, any>; // Additional structured data
}

export interface LogFilter {
  levels?: LogLevel[];
  categories?: LogCategory[];
  searchTerm?: string;
  maxEntries?: number;
}

type LogSubscriber = (entry: SimulationLogEntry) => void;

export class SimulationLogger {
  private static instance: SimulationLogger;
  private logs: SimulationLogEntry[] = [];
  private subscribers: LogSubscriber[] = [];
  private currentTick: number = 0;
  private maxLogs: number = 1000; // Prevent memory overflow

  private constructor() {}

  public static getInstance(): SimulationLogger {
    if (!SimulationLogger.instance) {
      SimulationLogger.instance = new SimulationLogger();
    }
    return SimulationLogger.instance;
  }

  /**
   * Subscribe to log updates (for UI components)
   */
  public subscribe(callback: LogSubscriber): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }

  /**
   * Update current simulation tick
   */
  public setTick(tick: number): void {
    this.currentTick = tick;
  }

  /**
   * Clear all logs
   */
  public clear(): void {
    this.logs = [];
    this.notifySubscribers();
  }

  /**
   * Get filtered logs
   */
  public getLogs(filter?: LogFilter): SimulationLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter?.levels) {
      filteredLogs = filteredLogs.filter((log) =>
        filter.levels!.includes(log.level)
      );
    }

    if (filter?.categories) {
      filteredLogs = filteredLogs.filter((log) =>
        filter.categories!.includes(log.category)
      );
    }

    if (filter?.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(term) ||
          log.category.toLowerCase().includes(term)
      );
    }

    if (filter?.maxEntries) {
      filteredLogs = filteredLogs.slice(-filter.maxEntries);
    }

    return filteredLogs.reverse(); // Most recent first
  }

  /**
   * Export logs to clipboard
   */
  public async exportToClipboard(filter?: LogFilter): Promise<void> {
    const logs = this.getLogs(filter);
    const text = logs
      .map(
        (log) =>
          `[T${log.tick.toString().padStart(4, "0")}] ${log.level
            .toUpperCase()
            .padEnd(8)} ${log.category.padEnd(15)} ${log.icon} ${log.message}`
      )
      .join("\n");

    await navigator.clipboard.writeText(text);
  }

  /**
   * Export logs as JSON
   */
  public exportAsJSON(filter?: LogFilter): string {
    const logs = this.getLogs(filter);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Main logging methods
   */

  public debug(
    category: LogCategory,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.DEBUG, category, message, "🐛", data);
  }

  public info(
    category: LogCategory,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.INFO, category, message, "ℹ️", data);
  }

  public success(
    category: LogCategory,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.SUCCESS, category, message, "✅", data);
  }

  public warning(
    category: LogCategory,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.WARNING, category, message, "⚠️", data);
  }

  public error(
    category: LogCategory,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.ERROR, category, message, "❌", data);
  }

  public critical(
    category: LogCategory,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.CRITICAL, category, message, "🚨", data);
  }

  /**
   * Specialized logging methods for common simulation events
   */

  public logDeath(
    creatureId: string,
    age: number,
    cause: string,
    fitness: number
  ): void {
    this.log(
      LogLevel.INFO,
      LogCategory.CREATURE_LIFE,
      `DEATH: ${creatureId.substring(
        0,
        8
      )} (age: ${age}, cause: ${cause}, fitness: ${fitness.toFixed(1)})`,
      "💀",
      { creatureId, age, cause, fitness }
    );
  }

  public logBirth(parentIds: string[], childId: string): void {
    this.log(
      LogLevel.SUCCESS,
      LogCategory.REPRODUCTION,
      `BIRTH! ${parentIds[0]?.substring(0, 8)} + ${parentIds[1]?.substring(
        0,
        8
      )} → ${childId.substring(0, 8)}`,
      "🍼",
      { parentIds, childId }
    );
  }

  public logFeeding(
    creatureId: string,
    foodType: string,
    energyGain: number,
    finalEnergy: number
  ): void {
    this.log(
      LogLevel.SUCCESS,
      LogCategory.FEEDING,
      `FED: ${creatureId.substring(
        0,
        8
      )} ate ${foodType} (+${energyGain.toFixed(
        1
      )} energy → ${finalEnergy.toFixed(1)})`,
      "🍽️",
      { creatureId, foodType, energyGain, finalEnergy }
    );
  }

  public logCombat(
    attackerId: string,
    defenderId: string,
    success: boolean,
    damage: number,
    defenderHealth: number
  ): void {
    const icon = success ? "⚔️" : "🛡️";
    const result = success
      ? `(-${damage.toFixed(1)} health → ${defenderHealth.toFixed(1)})`
      : "failed";
    this.log(
      LogLevel.INFO,
      LogCategory.COMBAT,
      `COMBAT: ${attackerId.substring(0, 8)} attacked ${defenderId.substring(
        0,
        8
      )} ${result}`,
      icon,
      { attackerId, defenderId, success, damage, defenderHealth }
    );
  }

  public logMaturity(
    creatureId: string,
    age: number,
    maturityAge: number,
    energy: number
  ): void {
    this.log(
      LogLevel.SUCCESS,
      LogCategory.CREATURE_LIFE,
      `MATURE: ${creatureId.substring(
        0,
        8
      )} reached maturity (age:${age}/${maturityAge}) energy:${energy.toFixed(
        1
      )}`,
      "🌟",
      { creatureId, age, maturityAge, energy }
    );
  }

  public logCriticalEnergy(
    creatureId: string,
    energy: number,
    age: number
  ): void {
    this.log(
      LogLevel.WARNING,
      LogCategory.CREATURE_LIFE,
      `CRITICAL: ${creatureId.substring(0, 8)} low energy (${energy.toFixed(
        1
      )}) age:${age}`,
      "🔋",
      { creatureId, energy, age }
    );
  }

  public logPopulationHealth(
    tick: number,
    population: number,
    avgEnergy: number,
    avgAge: number,
    totalFood: number
  ): void {
    this.log(
      LogLevel.INFO,
      LogCategory.POPULATION,
      `TICK ${tick}: Pop=${population}, AvgEnergy=${avgEnergy.toFixed(
        1
      )}, AvgAge=${avgAge.toFixed(1)}, Food=${totalFood}`,
      "📊",
      { tick, population, avgEnergy, avgAge, totalFood }
    );
  }

  public logBrainDecisions(
    movePercent: number,
    eatPercent: number,
    reproducePercent: number,
    attackPercent: number,
    idlePercent: number
  ): void {
    this.log(
      LogLevel.DEBUG,
      LogCategory.BRAIN,
      `BRAIN: Move=${movePercent.toFixed(1)}% Eat=${eatPercent.toFixed(
        1
      )}% Reproduce=${reproducePercent.toFixed(
        1
      )}% Attack=${attackPercent.toFixed(1)}% Idle=${idlePercent.toFixed(1)}%`,
      "🧠",
      { movePercent, eatPercent, reproducePercent, attackPercent, idlePercent }
    );
  }

  public logCarrionEvent(
    type: "created" | "consumed" | "scavenged",
    carrionId: string,
    details?: Record<string, any>
  ): void {
    const icons = { created: "🦴", consumed: "🦴", scavenged: "🦴" };
    const messages = {
      created: `Carrion created: ${carrionId}`,
      consumed: `Carrion consumed: ${carrionId}`,
      scavenged: `Scavenging attempt on: ${carrionId}`,
    };
    this.log(LogLevel.INFO, LogCategory.CARRION, messages[type], icons[type], {
      carrionId,
      ...details,
    });
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    icon: string,
    data?: Record<string, any>
  ): void {
    const entry: SimulationLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      tick: this.currentTick,
      level,
      category,
      message,
      icon,
      data,
    };

    this.logs.push(entry);

    // Prevent memory overflow
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify subscribers
    this.notifySubscribers(entry);
  }

  private notifySubscribers(entry?: SimulationLogEntry): void {
    this.subscribers.forEach((callback) => {
      if (entry) {
        callback(entry);
      }
    });
  }
}

// Export singleton instance
export const simulationLogger = SimulationLogger.getInstance();
