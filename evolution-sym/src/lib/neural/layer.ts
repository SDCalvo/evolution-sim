import { Neuron, NeuronData } from "./neuron";
import { ActivationFunctionName } from "./activations";

/**
 * A Layer is a collection of neurons that work together
 *
 * Think of a layer like a committee of experts:
 * - All experts (neurons) receive the same information (inputs)
 * - Each expert has their own opinion (weights/bias)
 * - Each expert gives their decision (output)
 * - Together they provide multiple perspectives on the same data
 */
export class Layer {
  // Array of neurons in this layer
  public neurons: Neuron[];

  // Store the last outputs for debugging/visualization
  public lastOutputs: number[] = [];
  public lastInputs: number[] = [];

  /**
   * Create a new layer
   * @param inputSize - Number of inputs each neuron will receive
   * @param outputSize - Number of neurons in this layer (number of outputs)
   * @param activationName - Activation function for all neurons in this layer
   * @param neurons - Optional: provide specific neurons (otherwise create random ones)
   */
  constructor(
    inputSize: number,
    outputSize: number,
    activationName: ActivationFunctionName = "sigmoid",
    neurons?: Neuron[]
  ) {
    if (neurons) {
      // Validate provided neurons
      if (neurons.length !== outputSize) {
        throw new Error(
          `Expected ${outputSize} neurons, got ${neurons.length}`
        );
      }

      // Validate all neurons have correct input size
      neurons.forEach((neuron, index) => {
        if (neuron.getInputCount() !== inputSize) {
          throw new Error(
            `Neuron ${index} expects ${neuron.getInputCount()} inputs, but layer expects ${inputSize}`
          );
        }
      });

      this.neurons = neurons;
    } else {
      // Create new random neurons
      this.neurons = Array.from(
        { length: outputSize },
        () => new Neuron(inputSize, activationName)
      );
    }
  }

  /**
   * Process inputs through all neurons in this layer
   *
   * This is the core operation - like asking all committee members
   * for their opinion on the same set of facts
   *
   * @param inputs - Array of input values
   * @returns Array of outputs from each neuron
   */
  public process(inputs: number[]): number[] {
    // Validate input size
    if (inputs.length !== this.getInputSize()) {
      throw new Error(
        `Expected ${this.getInputSize()} inputs, got ${inputs.length}`
      );
    }

    // Store inputs for debugging
    this.lastInputs = [...inputs];

    // Process inputs through each neuron
    const outputs = this.neurons.map((neuron) => neuron.process(inputs));

    // Store outputs for debugging
    this.lastOutputs = outputs;

    return outputs;
  }

  /**
   * Get the number of inputs this layer expects
   */
  public getInputSize(): number {
    return this.neurons.length > 0 ? this.neurons[0].getInputCount() : 0;
  }

  /**
   * Get the number of outputs this layer produces (number of neurons)
   */
  public getOutputSize(): number {
    return this.neurons.length;
  }

  /**
   * Clone this layer for evolution
   * Creates copies of all neurons
   */
  public clone(): Layer {
    const clonedNeurons = this.neurons.map((neuron) => neuron.clone());
    return new Layer(
      this.getInputSize(),
      this.getOutputSize(),
      "sigmoid", // Default, will be overridden by cloned neurons
      clonedNeurons
    );
  }

  /**
   * Mutate all neurons in this layer
   * This is how the layer evolves over time
   *
   * @param mutationRate - Probability of mutating each neuron
   * @param mutationStrength - How much to change values
   */
  public mutate(
    mutationRate: number = 0.1,
    mutationStrength: number = 0.1
  ): void {
    this.neurons.forEach((neuron) =>
      neuron.mutate(mutationRate, mutationStrength)
    );
  }

  /**
   * Get a specific neuron by index
   */
  public getNeuron(index: number): Neuron {
    if (index < 0 || index >= this.neurons.length) {
      throw new Error(
        `Neuron index ${index} out of range [0, ${this.neurons.length - 1}]`
      );
    }
    return this.neurons[index];
  }

  /**
   * Replace a specific neuron
   */
  public setNeuron(index: number, neuron: Neuron): void {
    if (index < 0 || index >= this.neurons.length) {
      throw new Error(
        `Neuron index ${index} out of range [0, ${this.neurons.length - 1}]`
      );
    }

    if (neuron.getInputCount() !== this.getInputSize()) {
      throw new Error(
        `Neuron expects ${neuron.getInputCount()} inputs, but layer expects ${this.getInputSize()}`
      );
    }

    this.neurons[index] = neuron;
  }

  /**
   * Set a specific weight between input and neuron
   * Used for hardcoding specific behaviors in bootstrap brains
   */
  public setWeight(fromNeuron: number, toNeuron: number, weight: number): void {
    if (toNeuron < 0 || toNeuron >= this.neurons.length) {
      throw new Error(
        `Invalid toNeuron ${toNeuron}, must be 0-${this.neurons.length - 1}`
      );
    }

    this.neurons[toNeuron].setWeight(fromNeuron, weight);
  }

  /**
   * Set a specific bias for a neuron
   * Used for hardcoding specific behaviors in bootstrap brains
   */
  public setBias(neuron: number, bias: number): void {
    if (neuron < 0 || neuron >= this.neurons.length) {
      throw new Error(
        `Invalid neuron ${neuron}, must be 0-${this.neurons.length - 1}`
      );
    }

    this.neurons[neuron].setBias(bias);
  }

  /**
   * Get total number of weights in this layer
   */
  public getTotalWeights(): number {
    return this.neurons.reduce(
      (total, neuron) => total + neuron.weights.length,
      0
    );
  }

  /**
   * Get sum of all weights in this layer
   */
  public getWeightSum(): number {
    return this.neurons.reduce((sum, neuron) => {
      return (
        sum +
        neuron.weights.reduce((neuronSum, weight) => neuronSum + weight, 0)
      );
    }, 0);
  }

  /**
   * Create offspring layer through sexual reproduction (crossover)
   * Takes neurons randomly from either parent
   */
  public static crossover(parent1: Layer, parent2: Layer): Layer {
    if (
      parent1.getInputSize() !== parent2.getInputSize() ||
      parent1.getOutputSize() !== parent2.getOutputSize()
    ) {
      throw new Error("Cannot crossover layers with different sizes");
    }

    const inputSize = parent1.getInputSize();
    const outputSize = parent1.getOutputSize();
    const childNeurons: Neuron[] = [];

    // For each neuron position, randomly choose from either parent
    for (let i = 0; i < outputSize; i++) {
      const useParent1 = Math.random() < 0.5;
      const sourceNeuron = useParent1 ? parent1.neurons[i] : parent2.neurons[i];
      childNeurons.push(sourceNeuron.clone());
    }

    return new Layer(inputSize, outputSize, "sigmoid", childNeurons);
  }

  /**
   * Get statistics about this layer
   */
  public getStats(): LayerStats {
    const allWeights = this.neurons.flatMap((neuron) => neuron.weights);
    const allBiases = this.neurons.map((neuron) => neuron.bias);

    return {
      neuronCount: this.neurons.length,
      inputSize: this.getInputSize(),
      outputSize: this.getOutputSize(),
      totalWeights: allWeights.length,
      avgWeight: allWeights.reduce((sum, w) => sum + w, 0) / allWeights.length,
      avgBias: allBiases.reduce((sum, b) => sum + b, 0) / allBiases.length,
      weightRange: {
        min: Math.min(...allWeights),
        max: Math.max(...allWeights),
      },
      biasRange: {
        min: Math.min(...allBiases),
        max: Math.max(...allBiases),
      },
    };
  }

  /**
   * Serialize this layer to JSON
   */
  public toJSON(): LayerData {
    return {
      inputSize: this.getInputSize(),
      outputSize: this.getOutputSize(),
      neurons: this.neurons.map((neuron) => neuron.toJSON()),
    };
  }

  /**
   * Create a layer from serialized data
   */
  public static fromJSON(data: LayerData): Layer {
    const neurons = data.neurons.map((neuronData) =>
      Neuron.fromJSON(neuronData)
    );
    return new Layer(data.inputSize, data.outputSize, "sigmoid", neurons);
  }

  /**
   * Get a human-readable description of this layer
   */
  public describe(): string {
    const activations = [...new Set(this.neurons.map((n) => n.activationName))];
    const activationStr = activations.length === 1 ? activations[0] : "mixed";

    return `Layer(${this.getInputSize()}→${this.getOutputSize()}, activation=${activationStr})`;
  }

  /**
   * Get detailed information about each neuron in the layer
   */
  public describeNeurons(): string[] {
    return this.neurons.map(
      (neuron, index) => `  Neuron ${index}: ${neuron.describe()}`
    );
  }
}

/**
 * Interface for layer statistics
 */
export interface LayerStats {
  neuronCount: number;
  inputSize: number;
  outputSize: number;
  totalWeights: number;
  avgWeight: number;
  avgBias: number;
  weightRange: { min: number; max: number };
  biasRange: { min: number; max: number };
}

/**
 * Interface for serializing layer data
 */
export interface LayerData {
  inputSize: number;
  outputSize: number;
  neurons: NeuronData[];
}
