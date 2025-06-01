import {
  ActivationFunction,
  ActivationFunctionName,
  getActivationFunction,
} from "./activations";

/**
 * A single neuron in a neural network
 *
 * Think of a neuron like a tiny decision-maker that:
 * 1. Receives multiple inputs (like sensor data)
 * 2. Multiplies each input by a weight (importance)
 * 3. Adds a bias (personal preference)
 * 4. Applies an activation function (makes the final decision)
 */
export class Neuron {
  // The weights for each input connection
  // weights[i] determines how important input[i] is to this neuron
  public weights: number[];

  // The bias - like the neuron's "default opinion"
  // Even with no inputs, bias affects the output
  public bias: number;

  // The activation function this neuron uses
  public activationFunction: ActivationFunction;
  public activationName: ActivationFunctionName;

  // Store the last computed values for debugging/visualization
  public lastRawOutput: number = 0; // Before activation function
  public lastActivatedOutput: number = 0; // After activation function
  public lastInputs: number[] = []; // The inputs we received

  /**
   * Create a new neuron
   * @param numInputs - How many inputs this neuron will receive
   * @param activationName - Which activation function to use
   * @param weights - Optional: provide specific weights (otherwise random)
   * @param bias - Optional: provide specific bias (otherwise random)
   */
  constructor(
    numInputs: number,
    activationName: ActivationFunctionName = "sigmoid",
    weights?: number[],
    bias?: number
  ) {
    this.activationName = activationName;
    this.activationFunction = getActivationFunction(activationName);

    if (weights) {
      if (weights.length !== numInputs) {
        throw new Error(`Expected ${numInputs} weights, got ${weights.length}`);
      }
      this.weights = [...weights]; // Copy the array
    } else {
      // Initialize with random weights between -1 and 1
      this.weights = this.initializeRandomWeights(numInputs);
    }

    if (bias !== undefined) {
      this.bias = bias;
    } else {
      // Initialize with random bias between -1 and 1
      this.bias = this.randomWeight();
    }
  }

  /**
   * Generate a random weight between -1 and 1
   * This range works well for most activation functions
   */
  private randomWeight(): number {
    return Math.random() * 2 - 1; // Random between -1 and 1
  }

  /**
   * Initialize an array of random weights
   */
  private initializeRandomWeights(count: number): number[] {
    return Array.from({ length: count }, () => this.randomWeight());
  }

  /**
   * Process inputs through this neuron - the core operation!
   *
   * This is the "forward pass" or "forward propagation"
   *
   * @param inputs - Array of input values
   * @returns The neuron's output after activation
   */
  public process(inputs: number[]): number {
    if (inputs.length !== this.weights.length) {
      throw new Error(
        `Expected ${this.weights.length} inputs, got ${inputs.length}`
      );
    }

    // Store inputs for debugging/visualization
    this.lastInputs = [...inputs];

    // Step 1: Calculate weighted sum
    // Each input is multiplied by its corresponding weight
    let weightedSum = 0;
    for (let i = 0; i < inputs.length; i++) {
      weightedSum += inputs[i] * this.weights[i];
    }

    // Step 2: Add bias
    // The bias is like the neuron's "default opinion"
    const rawOutput = weightedSum + this.bias;
    this.lastRawOutput = rawOutput;

    // Step 3: Apply activation function
    // This transforms the raw output into the final result
    const activatedOutput = this.activationFunction(rawOutput);
    this.lastActivatedOutput = activatedOutput;

    return activatedOutput;
  }

  /**
   * Create a copy of this neuron
   * Useful for evolution - copying parents to children
   */
  public clone(): Neuron {
    return new Neuron(
      this.weights.length,
      this.activationName,
      [...this.weights], // Copy weights array
      this.bias
    );
  }

  /**
   * Generate a random mutation value
   * @param mutationStrength - How much to change values (standard deviation)
   * @returns Random value between -mutationStrength and +mutationStrength
   */
  private generateMutation(mutationStrength: number): number {
    return (Math.random() * 2 - 1) * mutationStrength;
  }

  /**
   * Clamp a value to reasonable neural network range
   * Prevents weights/bias from becoming too extreme
   * @param value - Value to clamp
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   * @returns Clamped value
   */
  private clampValue(value: number, min: number = -5, max: number = 5): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Mutate a single value if random chance allows it
   * @param currentValue - Current value to potentially mutate
   * @param mutationRate - Probability of mutation (0 to 1)
   * @param mutationStrength - How much to change the value
   * @returns Mutated (or unchanged) value
   */
  private mutateValue(
    currentValue: number,
    mutationRate: number,
    mutationStrength: number
  ): number {
    if (Math.random() < mutationRate) {
      const mutation = this.generateMutation(mutationStrength);
      const newValue = currentValue + mutation;
      return this.clampValue(newValue);
    }
    return currentValue;
  }

  /**
   * Mutate this neuron's weights and bias
   * This is how evolution introduces variation
   *
   * @param mutationRate - Probability of mutating each weight/bias (0 to 1)
   * @param mutationStrength - How much to change values (standard deviation)
   */
  public mutate(
    mutationRate: number = 0.1,
    mutationStrength: number = 0.1
  ): void {
    // Mutate each weight using the extracted method
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] = this.mutateValue(
        this.weights[i],
        mutationRate,
        mutationStrength
      );
    }

    // Mutate bias using the same method
    this.bias = this.mutateValue(this.bias, mutationRate, mutationStrength);
  }

  /**
   * Set specific weights (useful for testing or loading saved networks)
   */
  public setWeights(weights: number[]): void {
    if (weights.length !== this.weights.length) {
      throw new Error(
        `Expected ${this.weights.length} weights, got ${weights.length}`
      );
    }
    this.weights = [...weights];
  }

  /**
   * Set the bias
   */
  public setBias(bias: number): void {
    this.bias = bias;
  }

  /**
   * Get the number of inputs this neuron expects
   */
  public getInputCount(): number {
    return this.weights.length;
  }

  /**
   * Serialize this neuron to a plain object (for saving/loading)
   */
  public toJSON(): NeuronData {
    return {
      weights: [...this.weights],
      bias: this.bias,
      activationName: this.activationName,
    };
  }

  /**
   * Create a neuron from serialized data
   */
  public static fromJSON(data: NeuronData): Neuron {
    return new Neuron(
      data.weights.length,
      data.activationName,
      data.weights,
      data.bias
    );
  }

  /**
   * Get a human-readable description of this neuron
   */
  public describe(): string {
    return `Neuron(inputs=${this.weights.length}, activation=${
      this.activationName
    }, bias=${this.bias.toFixed(3)})`;
  }
}

/**
 * Interface for serializing neuron data
 */
export interface NeuronData {
  weights: number[];
  bias: number;
  activationName: ActivationFunctionName;
}
