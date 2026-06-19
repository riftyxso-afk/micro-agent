#!/usr/bin/env node
// postinstall: detect Python, pip install microagent-cli from source / PyPI

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const CYAN = "\x1b[1;36m";
const GREEN = "\x1b[1;32m";
const RED = "\x1b[1;31m";
const NC = "\x1b[0m";

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: "pipe", ...opts }).toString().trim();
  } catch {
    return null;
  }
}

console.log(`${CYAN}
  ┌────────────────────────────────────┐
  │      MicroAgent CLI Installer      │
  └────────────────────────────────────┘${NC}
`);

// find Python
let py = run("python3 --version") ? "python3" : run("python --version") ? "python" : null;
if (!py) {
  console.log(`  ${RED}✗${NC} Python 3.10+ required. Install from https://python.org/downloads`);
  process.exit(1);
}
console.log(`  ${GREEN}✓${NC} Python: ${run(`${py} --version`)}`);

// find pip
let pip = run("pip3 --version") ? "pip3" : run("pip --version") ? "pip" : null;
if (!pip) {
  console.log(`  ${RED}✗${NC} pip not found. Run: ${py} -m ensurepip --upgrade`);
  process.exit(1);
}
console.log(`  ${GREEN}✓${NC} pip: ${run(`${pip} --version`).split("\n")[0]}`);

// install deps
console.log(`\n  ${CYAN}µ${NC} Installing dependencies...`);
run(`${pip} install --quiet rich textual httpx prompt-toolkit`, { stdio: "inherit" });

// install cli
const srcDir = path.join(__dirname, "..");
if (fs.existsSync(path.join(srcDir, "pyproject.toml"))) {
  console.log(`  ${CYAN}µ${NC} Installing microagent-cli from local source...`);
  run(`${pip} install --quiet -e "${srcDir}"`, { stdio: "inherit" });
} else {
  console.log(`  ${RED}✗${NC} pyproject.toml not found at ${srcDir}`);
  process.exit(1);
}

console.log(`\n  ${GREEN}✓${NC} MicroAgent CLI installed!`);
console.log(`\n  ${CYAN}µ${NC} Run: microagent${NC}\n`);
