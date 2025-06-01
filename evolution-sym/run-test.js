import { spawn } from "child_process";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFile = process.argv[2];
if (!testFile) {
  console.error("Usage: node run-test.js <test-file>");
  process.exit(1);
}

const testPath = resolve(__dirname, testFile);

// Use tsx directly from node_modules
const tsxPath = resolve(__dirname, "node_modules", ".bin", "tsx.cmd");

const child = spawn(tsxPath, [testPath], {
  stdio: "inherit",
  shell: true,
  cwd: __dirname,
});

child.on("exit", (code) => {
  process.exit(code);
});

child.on("error", (err) => {
  console.error("Error running test:", err);
  process.exit(1);
});
