export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Evolution Simulation
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Watch neural networks evolve through natural selection as creatures
            compete for survival in a 2D environment
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                🧠 Neural Networks
              </h2>
              <p className="text-gray-300">
                Each creature has its own neural network that controls behavior.
                Networks are built from scratch to help you understand how they
                work.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 text-green-400">
                🧬 Genetic Evolution
              </h2>
              <p className="text-gray-300">
                Successful creatures reproduce and pass their neural networks to
                offspring, with mutations introducing variation for evolution.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">
                🌍 Environment
              </h2>
              <p className="text-gray-300">
                A 2D world with food, obstacles, and physics where creatures
                must survive and compete for limited resources.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">
                📊 Evolution Tracking
              </h2>
              <p className="text-gray-300">
                Visualize fitness improvements, population dynamics, and
                behavioral changes across generations.
              </p>
            </div>
          </div>

          <div className="text-center bg-gray-800/30 rounded-lg p-8 border border-gray-600">
            <h3 className="text-2xl font-semibold mb-4">🚧 Coming Soon</h3>
            <p className="text-gray-300 mb-6">
              We&apos;re building this step by step, starting with neural
              networks from scratch. Follow along as we implement each component
              and learn how evolution works!
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>✅ Phase 1: Project Setup</p>
              <p>🔄 Phase 2: Neural Networks (Next)</p>
              <p>⏳ Phase 3: Creatures & Environment</p>
              <p>⏳ Phase 4: Genetic Algorithms</p>
              <p>⏳ Phase 5: Full Evolution Simulation</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
