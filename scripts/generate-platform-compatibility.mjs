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

// Files that use the generated platform compatibility table
const targetFiles = [
  path.join(rootDir, "README.md"),
  path.join(rootDir, "docs", "guides", "beginners-guide.md"),
];

// Markers
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

// Update each target file
for (const targetFile of targetFiles) {
  const fileName = path.relative(rootDir, targetFile);

  if (!fs.existsSync(targetFile)) {
    throw new Error(`File not found: ${fileName}`);
  }

  const content = fs.readFileSync(targetFile, "utf8");

  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1) {
    throw new Error(
      `Could not find ${startMarker} in ${fileName}`
    );
  }

  if (endIndex === -1) {
    throw new Error(
      `Could not find ${endMarker} in ${fileName}`
    );
  }

  if (endIndex <= startIndex) {
    throw new Error(
      `Platform compatibility markers are in the wrong order in ${fileName}`
    );
  }

  const before = content.slice(
    0,
    startIndex + startMarker.length
  );

  const after = content.slice(endIndex);

  const updatedContent =
    `${before}\n${generatedTable}\n${after}`;

  if (updatedContent === content) {
    console.log(`${fileName} is already up to date.`);
    continue;
  }

  fs.writeFileSync(targetFile, updatedContent, "utf8");

  console.log(
    `Updated ${fileName} from docs/data/platform-compatibility.json`
  );
}