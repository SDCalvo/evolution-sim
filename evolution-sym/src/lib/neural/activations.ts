/**
 * Activation functions for neural networks
 * These functions determine the output of neurons based on their input
 */

export type ActivationFunction = (x: number) => number;

/**
 * Sigmoid activation function
 * Maps any real number to a value between 0 and 1
 * Formula: 1 / (1 + e^(-x))
 */
export const sigmoid: ActivationFunction = (x: number): number => {
  // Prevent overflow for very large negative numbers
  if (x < -500) return 0;
  if (x > 500) return 1;
  return 1 / (1 + Math.exp(-x));
};

/**
 * Derivative of sigmoid function
 * Used for backpropagation (though we won't use it in evolution)
 */
export const sigmoidDerivative: ActivationFunction = (x: number): number => {
  const s = sigmoid(x);
  return s * (1 - s);
};

/**
 * Hyperbolic tangent activation function
 * Maps any real number to a value between -1 and 1
 * Formula: (e^x - e^(-x)) / (e^x + e^(-x))
 */
export const tanh: ActivationFunction = (x: number): number => {
  // Use built-in Math.tanh for better precision and performance
  return Math.tanh(x);
};

/**
 * Derivative of tanh function
 */
export const tanhDerivative: ActivationFunction = (x: number): number => {
  const t = tanh(x);
  return 1 - t * t;
};

/**
 * ReLU (Rectified Linear Unit) activation function
 * Returns x if x > 0, otherwise returns 0
 * Formula: max(0, x)
 */
export const relu: ActivationFunction = (x: number): number => {
  return Math.max(0, x);
};

/**
 * Derivative of ReLU function
 */
export const reluDerivative: ActivationFunction = (x: number): number => {
  return x > 0 ? 1 : 0;
};

/**
 * Leaky ReLU activation function
 * Like ReLU but allows small negative values
 * Formula: x if x > 0, otherwise 0.01 * x
 */
export const leakyRelu: ActivationFunction = (
  x: number,
  alpha: number = 0.01
): number => {
  return x > 0 ? x : alpha * x;
};

/**
 * Linear activation function (identity function)
 * Returns the input unchanged
 */
export const linear: ActivationFunction = (x: number): number => {
  return x;
};

/**
 * Map of activation function names to functions
 * Useful for serialization and configuration
 */
export const ACTIVATION_FUNCTIONS = {
  sigmoid,
  tanh,
  relu,
  leakyRelu,
  linear,
} as const;

export type ActivationFunctionName = keyof typeof ACTIVATION_FUNCTIONS;

/**
 * Get activation function by name
 */
export const getActivationFunction = (
  name: ActivationFunctionName
): ActivationFunction => {
  return ACTIVATION_FUNCTIONS[name];
};
