#!/usr/bin/env node
// Proxy: run the Python microagent CLI
const { spawn } = require("child_process");
const { resolve } = require("path");

// prefer pip-installed microagent, fallback to python -m
const py = process.platform === "win32" ? "python" : "python3";

const child = spawn(py, ["-m", "microagent_cli.cli", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env },
});

child.on("exit", (code) => process.exit(code));
