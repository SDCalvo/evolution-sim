import { Layer, LayerData, LayerStats } from "./layer";
import { ActivationFunctionName } from "./activations";

/**
 * A Neural Network is a collection of layers connected in sequence
 *
 * Think of it like an organization:
 * - Input Layer: Receptionist (receives raw information)
 * - Hidden Layers: Departments (process and transform information)
 * - Output Layer: Decision Makers (final actions/conclusions)
 *
 * Information flows: Input → Hidden Layer 1 → Hidden Layer 2 → ... → Output
 */
export class NeuralNetwork {
  // Array of layers in order (input → hidden → ... → output)
  public layers: Layer[];

  // Store the complete forward pass for debugging/visualization
  public lastLayerOutputs: number[][] = [];
  public lastInput: number[] = [];
  public lastOutput: number[] = [];

  /**
   * Create a new neural network
   * @param layerSizes - Array of layer sizes [inputSize, hidden1, hidden2, ..., outputSize]
   * @param activations - Activation functions for each layer (or single function for all)
   * @param layers - Optional: provide specific layers (otherwise create random ones)
   */
  constructor(
    layerSizes: number[],
    activations: ActivationFunctionName | ActivationFunctionName[] = "sigmoid",
    layers?: Layer[]
  ) {
    if (layerSizes.length < 2) {
      throw new Error(
        "Neural network must have at least 2 layers (input and output)"
      );
    }

    if (layers) {
      // Validate provided layers
      if (layers.length !== layerSizes.length - 1) {
        throw new Error(
          `Expected ${layerSizes.length - 1} layers, got ${layers.length}`
        );
      }

      // Validate layer connections
      for (let i = 0; i < layers.length; i++) {
        const expectedInputSize = layerSizes[i];
        const expectedOutputSize = layerSizes[i + 1];

        if (layers[i].getInputSize() !== expectedInputSize) {
          throw new Error(
            `Layer ${i} expects ${layers[
              i
            ].getInputSize()} inputs, but should expect ${expectedInputSize}`
          );
        }

        if (layers[i].getOutputSize() !== expectedOutputSize) {
          throw new Error(
            `Layer ${i} produces ${layers[
              i
            ].getOutputSize()} outputs, but should produce ${expectedOutputSize}`
          );
        }
      }

      this.layers = layers;
    } else {
      // Create new layers
      this.layers = [];

      for (let i = 0; i < layerSizes.length - 1; i++) {
        const inputSize = layerSizes[i];
        const outputSize = layerSizes[i + 1];

        // Determine activation function for this layer
        let activation: ActivationFunctionName;
        if (Array.isArray(activations)) {
          if (i >= activations.length) {
            throw new Error(
              `Not enough activation functions provided. Need ${
                layerSizes.length - 1
              }, got ${activations.length}`
            );
          }
          activation = activations[i];
        } else {
          activation = activations;
        }

        const layer = new Layer(inputSize, outputSize, activation);
        this.layers.push(layer);
      }
    }
  }

  /**
   * Process input through the entire neural network
   * This is the "forward pass" or "forward propagation"
   *
   * @param inputs - Input values (must match first layer's input size)
   * @returns Final output from the last layer
   */
  public process(inputs: number[]): number[] {
    if (inputs.length !== this.getInputSize()) {
      throw new Error(
        `Expected ${this.getInputSize()} inputs, got ${inputs.length}`
      );
    }

    // Store input for debugging
    this.lastInput = [...inputs];
    this.lastLayerOutputs = [];

    // Forward propagation through all layers
    let currentOutput = inputs;

    for (let i = 0; i < this.layers.length; i++) {
      currentOutput = this.layers[i].process(currentOutput);

      // Store each layer's output for debugging/visualization
      this.lastLayerOutputs.push([...currentOutput]);
    }

    // Store final output
    this.lastOutput = [...currentOutput];

    return currentOutput;
  }

  /**
   * Get the number of inputs this network expects
   */
  public getInputSize(): number {
    return this.layers.length > 0 ? this.layers[0].getInputSize() : 0;
  }

  /**
   * Get the number of outputs this network produces
   */
  public getOutputSize(): number {
    return this.layers.length > 0
      ? this.layers[this.layers.length - 1].getOutputSize()
      : 0;
  }

  /**
   * Get the total number of layers
   */
  public getLayerCount(): number {
    return this.layers.length;
  }

  /**
   * Get a specific layer by index
   */
  public getLayer(index: number): Layer {
    if (index < 0 || index >= this.layers.length) {
      throw new Error(
        `Layer index ${index} out of range [0, ${this.layers.length - 1}]`
      );
    }
    return this.layers[index];
  }

  /**
   * Get the architecture of this network as an array
   */
  public getArchitecture(): number[] {
    if (this.layers.length === 0) return [];

    const architecture = [this.layers[0].getInputSize()];
    this.layers.forEach((layer) => {
      architecture.push(layer.getOutputSize());
    });

    return architecture;
  }

  /**
   * Clone this neural network for evolution
   * Creates deep copies of all layers and neurons
   */
  public clone(): NeuralNetwork {
    const clonedLayers = this.layers.map((layer) => layer.clone());
    const architecture = this.getArchitecture();

    return new NeuralNetwork(architecture, "sigmoid", clonedLayers);
  }

  /**
   * Mutate this neural network
   * Applies mutation to all layers and their neurons
   *
   * @param mutationRate - Probability of mutating each neuron
   * @param mutationStrength - How much to change values
   */
  public mutate(
    mutationRate: number = 0.1,
    mutationStrength: number = 0.1
  ): void {
    this.layers.forEach((layer) =>
      layer.mutate(mutationRate, mutationStrength)
    );
  }

  /**
   * Get comprehensive statistics about this network
   */
  public getStats(): NetworkStats {
    const layerStats = this.layers.map((layer) => layer.getStats());

    const totalNeurons = layerStats.reduce(
      (sum, stats) => sum + stats.neuronCount,
      0
    );
    const totalWeights = layerStats.reduce(
      (sum, stats) => sum + stats.totalWeights,
      0
    );

    const allWeights = layerStats.flatMap((stats) => [stats.avgWeight]);
    const allBiases = layerStats.flatMap((stats) => [stats.avgBias]);

    return {
      architecture: this.getArchitecture(),
      layerCount: this.layers.length,
      totalNeurons,
      totalWeights,
      avgWeight: allWeights.reduce((sum, w) => sum + w, 0) / allWeights.length,
      avgBias: allBiases.reduce((sum, b) => sum + b, 0) / allBiases.length,
      layerStats,
    };
  }

  /**
   * Get a human-readable description of this network
   */
  public describe(): string {
    const arch = this.getArchitecture();
    const archStr = arch.join("→");
    const totalNeurons = this.layers.reduce(
      (sum, layer) => sum + layer.getOutputSize(),
      0
    );

    return `NeuralNetwork(${archStr}, ${totalNeurons} neurons, ${this.layers.length} layers)`;
  }

  /**
   * Get detailed information about each layer
   */
  public describeLayers(): string[] {
    return this.layers.map(
      (layer, index) => `  Layer ${index}: ${layer.describe()}`
    );
  }

  /**
   * Get the activity trace of the last forward pass
   * Useful for visualization and debugging
   */
  public getActivityTrace(): ActivityTrace {
    return {
      input: [...this.lastInput],
      layerOutputs: this.lastLayerOutputs.map((outputs) => [...outputs]),
      finalOutput: [...this.lastOutput],
      layerDescriptions: this.layers.map((layer) => layer.describe()),
    };
  }

  /**
   * Analyze decision-making by showing which neurons are most active
   */
  public analyzeDecision(): DecisionAnalysis {
    if (this.lastLayerOutputs.length === 0) {
      throw new Error("No forward pass recorded. Call process() first.");
    }

    const layerAnalyses = this.lastLayerOutputs.map((outputs, layerIndex) => {
      const maxOutput = Math.max(...outputs);
      const minOutput = Math.min(...outputs);
      const avgOutput =
        outputs.reduce((sum, out) => sum + out, 0) / outputs.length;

      // Find most and least active neurons
      const mostActiveIndex = outputs.indexOf(maxOutput);
      const leastActiveIndex = outputs.indexOf(minOutput);

      return {
        layerIndex,
        maxActivation: maxOutput,
        minActivation: minOutput,
        avgActivation: avgOutput,
        mostActiveNeuron: mostActiveIndex,
        leastActiveNeuron: leastActiveIndex,
        activationPattern: outputs.map((out, i) => ({
          neuronIndex: i,
          activation: out,
        })),
      };
    });

    return {
      inputPattern: this.lastInput,
      outputPattern: this.lastOutput,
      layerAnalyses,
      dominantOutput: this.lastOutput.indexOf(Math.max(...this.lastOutput)),
      confidence: Math.max(...this.lastOutput),
    };
  }

  /**
   * Serialize this network to JSON
   */
  public toJSON(): NetworkData {
    return {
      architecture: this.getArchitecture(),
      layers: this.layers.map((layer) => layer.toJSON()),
    };
  }

  /**
   * Create a neural network from serialized data
   */
  public static fromJSON(data: NetworkData): NeuralNetwork {
    const layers = data.layers.map((layerData) => Layer.fromJSON(layerData));
    return new NeuralNetwork(data.architecture, "sigmoid", layers);
  }

  /**
   * Create common network architectures quickly
   */
  public static createFeedforward(
    inputSize: number,
    hiddenSizes: number[],
    outputSize: number,
    activation: ActivationFunctionName = "sigmoid"
  ): NeuralNetwork {
    const architecture = [inputSize, ...hiddenSizes, outputSize];
    return new NeuralNetwork(architecture, activation);
  }

  /**
   * Create a creature-specific neural network
   */
  public static createCreatureBrain(
    sensorCount: number,
    actionCount: number,
    complexity: "simple" | "medium" | "complex" = "medium"
  ): NeuralNetwork {
    let hiddenLayers: number[];
    let activations: ActivationFunctionName[];

    switch (complexity) {
      case "simple":
        hiddenLayers = [
          Math.max(4, Math.ceil((sensorCount + actionCount) / 2)),
        ];
        activations = ["sigmoid", "tanh"];
        break;
      case "medium":
        hiddenLayers = [
          sensorCount * 2,
          Math.max(6, Math.ceil((sensorCount + actionCount) * 1.5)),
        ];
        activations = ["sigmoid", "tanh", "tanh"];
        break;
      case "complex":
        hiddenLayers = [
          sensorCount * 3,
          sensorCount * 2,
          Math.max(8, actionCount * 2),
        ];
        activations = ["sigmoid", "relu", "tanh", "tanh"];
        break;
    }

    const architecture = [sensorCount, ...hiddenLayers, actionCount];
    return new NeuralNetwork(architecture, activations);
  }
}

/**
 * Interface for network statistics
 */
export interface NetworkStats {
  architecture: number[];
  layerCount: number;
  totalNeurons: number;
  totalWeights: number;
  avgWeight: number;
  avgBias: number;
  layerStats: LayerStats[];
}

/**
 * Interface for activity tracing
 */
export interface ActivityTrace {
  input: number[];
  layerOutputs: number[][];
  finalOutput: number[];
  layerDescriptions: string[];
}

/**
 * Interface for decision analysis
 */
export interface DecisionAnalysis {
  inputPattern: number[];
  outputPattern: number[];
  layerAnalyses: LayerAnalysis[];
  dominantOutput: number; // Index of strongest output
  confidence: number; // Strength of strongest output
}

export interface LayerAnalysis {
  layerIndex: number;
  maxActivation: number;
  minActivation: number;
  avgActivation: number;
  mostActiveNeuron: number;
  leastActiveNeuron: number;
  activationPattern: { neuronIndex: number; activation: number }[];
}

/**
 * Interface for serializing network data
 */
export interface NetworkData {
  architecture: number[];
  layers: LayerData[];
}
