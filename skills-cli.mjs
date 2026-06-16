#!/usr/bin/env node

const API = process.env.API_URL || "http://127.0.0.1:8001";

async function main() {
  const [, , cmd, ...args] = process.argv;

  if (cmd !== "add" || args.length === 0) {
    console.log("Usage: npx skills add <source> [--skill <name>]");
    console.log("");
    console.log("Sources:");
    console.log("  owner/repo                  Import from GitHub repo");
    console.log("  https://www.skills.sh/...   Import from skills.sh");
    console.log("  https://...                 Import from any .md URL");
    console.log("  github:owner/repo           Explicit GitHub import");
    console.log("");
    console.log("Options:");
    console.log("  --skill <name>      Filter specific skill file");
    process.exit(1);
  }

  let source = args[0];
  const skillIdx = args.indexOf("--skill");
  const skillName = skillIdx >= 0 ? args[skillIdx + 1] : "";

  // Strip github: prefix
  if (source.startsWith("github:")) source = source.slice(7);

  const body = { source };
  if (skillName) body.skill = skillName;

  console.log(`Importing from: ${source}...`);

  try {
    const res = await fetch(`${API}/api/skills/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`Imported: ${data.slug}`);
      console.log(`Source: ${data.source}`);
    } else {
      console.error(`Error: ${data.error}`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`Failed: ${e.message}`);
    process.exit(1);
  }
}

main();
