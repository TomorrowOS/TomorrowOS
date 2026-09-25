import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root
const rootDir = path.resolve(__dirname, "..");

// Source of truth
const compatibilityFile = path.join(
  rootDir,
  "docs",
  "data",
  "platform-compatibility.json"
);

// README to update
const readmeFile = path.join(rootDir, "README.md");

// Markers inside README.md
const startMarker = "<!-- PLATFORM_COMPATIBILITY_START -->";
const endMarker = "<!-- PLATFORM_COMPATIBILITY_END -->";

// Read compatibility dataset
const compatibility = JSON.parse(
  fs.readFileSync(compatibilityFile, "utf8")
);

if (!Array.isArray(compatibility.platforms)) {
  throw new Error(
    'Invalid platform-compatibility.json: "platforms" must be an array.'
  );
}

// Generate Markdown table
const header = [
  "| Platform | Versions | Status |",
  "| --- | --- | --- |",
];

const rows = compatibility.platforms.map((platform) => {
  const name = platform.platform ?? "";
  const versions = platform.versions ?? "—";
  const status = platform.status ?? "";

  return `| ${name} | ${versions} | ${status} |`;
});

const generatedTable = [...header, ...rows].join("\n");

// Read README
const readme = fs.readFileSync(readmeFile, "utf8");

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

if (startIndex === -1) {
  throw new Error(`Could not find ${startMarker} in README.md`);
}

if (endIndex === -1) {
  throw new Error(`Could not find ${endMarker} in README.md`);
}

if (endIndex <= startIndex) {
  throw new Error("Platform compatibility markers are in the wrong order.");
}

// Replace only the generated section
const before = readme.slice(0, startIndex + startMarker.length);
const after = readme.slice(endIndex);

const updatedReadme =
  `${before}\n${generatedTable}\n${after}`;

// Only write when something actually changed
if (updatedReadme === readme) {
  console.log("Platform compatibility table is already up to date.");
  process.exit(0);
}

fs.writeFileSync(readmeFile, updatedReadme, "utf8");

console.log(
  "Updated README.md from docs/data/platform-compatibility.json"
);