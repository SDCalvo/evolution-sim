# Evolution Simulation Tests

This directory contains all tests for the evolution simulation project. We use TypeScript with `tsx` runner for fast testing without compilation.

## 🧪 Test Files

- `neuron.test.ts` - Comprehensive tests for individual neuron functionality
- _(More test files will be added as we build layers, networks, creatures, etc.)_

## 🚀 Running Tests

### Run All Tests

```bash
npm run test:all
```

### Run Specific Test Files

```bash
npm run test:neuron        # Run neuron tests
npm run test              # Default: runs neuron tests
```

### Manual Test Execution

```bash
npx tsx tests/neuron.test.ts
npx tsx tests/[testfile].test.ts
```

## 📋 What Each Test Covers

### Neuron Tests (`neuron.test.ts`)

1. **Basic Creation** - Neuron instantiation with different configurations
2. **Input Processing** - Forward propagation through activation functions
3. **Activation Functions** - Comparing sigmoid, tanh, ReLU, and linear behaviors
4. **Creature Simulation** - Real-world decision-making scenarios
5. **Mutation Testing** - Evolution mechanics validation
6. **Serialization** - Save/load functionality for evolved networks
7. **Edge Cases** - Extreme inputs and boundary conditions

## 🎯 Test Philosophy

- **Learning-Focused**: Each test explains what's happening and why
- **Real-World Scenarios**: Tests simulate actual creature behaviors
- **Evolution-Ready**: Tests validate mutation and serialization for evolution
- **Console Output**: Visual feedback showing decision-making processes
- **Comprehensive Coverage**: From basic math to complex behaviors

## 📈 Future Test Plans

As we build more components, we'll add:

- `layer.test.ts` - Neural network layer functionality
- `network.test.ts` - Complete neural network testing
- `creature.test.ts` - Creature behavior and integration testing
- `evolution.test.ts` - Genetic algorithm validation
- `simulation.test.ts` - Full simulation system testing

## 🔧 Adding New Tests

When adding new test files:

1. Use the naming convention: `[component].test.ts`
2. Include comprehensive console output for learning
3. Test both normal and edge cases
4. Add npm script to `package.json` for easy execution
5. Document the new test in this README

## 💡 Test Output Examples

Our tests are designed to be educational. For example, the neuron test shows:

- How activation functions transform the same input differently
- Real creature decision-making scenarios with explanations
- Evolution mechanics in action with mutation examples
- Serialization proving networks can be saved and loaded

This makes testing both validation AND learning!
