import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------
// Paths
// ------------------------------------------------------------

const rootDir = path.resolve(__dirname, "..");

// Canonical source of truth
const compatibilityFile = path.join(
  rootDir,
  "docs",
  "data",
  "platform-compatibility.json"
);

// README-style compatibility tables
const compatibilityTableFiles = [
  path.join(rootDir, "README.md"),
  path.join(rootDir, "docs", "guides", "beginners-guide.md"),
];

// "What exists today" tables
const existenceTableFiles = [
  path.join(rootDir, "docs", "README.mdx"),
];

// ------------------------------------------------------------
// Markers
// ------------------------------------------------------------

const compatibilityStartMarker =
  "<!-- PLATFORM_COMPATIBILITY_START -->";

const compatibilityEndMarker =
  "<!-- PLATFORM_COMPATIBILITY_END -->";

const existenceStartMarker =
  "<!-- PLATFORM_EXISTENCE_START -->";

const existenceEndMarker =
  "<!-- PLATFORM_EXISTENCE_END -->";

// ------------------------------------------------------------
// Read compatibility dataset
// ------------------------------------------------------------

if (!fs.existsSync(compatibilityFile)) {
  throw new Error(
    "Could not find docs/data/platform-compatibility.json"
  );
}

const compatibility = JSON.parse(
  fs.readFileSync(compatibilityFile, "utf8")
);

if (!Array.isArray(compatibility.platforms)) {
  throw new Error(
    'Invalid platform-compatibility.json: "platforms" must be an array.'
  );
}

// ------------------------------------------------------------
// Generate standard compatibility table
//
// Used by:
// - README.md
// - docs/guides/beginners-guide.md
// ------------------------------------------------------------

const compatibilityHeader = [
  "| Platform | Versions | Status |",
  "| --- | --- | --- |",
];

const compatibilityRows = compatibility.platforms.map((platform) => {
  const name = platform.platform ?? "";
  const versions = platform.versions ?? "—";
  const status = platform.status ?? "";

  return `| ${name} | ${versions} | ${status} |`;
});

const generatedCompatibilityTable = [
  ...compatibilityHeader,
  ...compatibilityRows,
].join("\n");

// ------------------------------------------------------------
// Generate "What exists today" platform rows
//
// The SDK row remains outside the generated markers,
// so this script will not modify it.
// ------------------------------------------------------------

const existenceRows = compatibility.platforms.map((platform) => {
  const name = platform.platform ?? "";
  const versions = platform.versions ?? "—";
  const status = platform.status ?? "";

  if (name === "Samsung Tizen" && status === "Supported") {
    return `| Samsung Tizen player | Shipped — **${versions}** |`;
  }

  if (name === "BrightSign" && status === "Supported") {
    return `| BrightSign player | Shipped — **${versions}** |`;
  }

  if (name === "Windows" && status === "Supported") {
    return `| Windows | ${versions} |`;
  }

  return `| ${name} | ${status} |`;
});

const generatedExistenceTable = [
  "| Piece | Status |",
  "| --- | --- |",
  "| `@tomorrowos/sdk` | Shipped — CMS server, pairing, playlists, media helpers, WebSocket commands |",
  ...existenceRows,
].join("\n");

// ------------------------------------------------------------
// Helper: replace content between markers
// ------------------------------------------------------------

function updateGeneratedSection(
  targetFile,
  startMarker,
  endMarker,
  generatedContent
) {
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
      `Generated section markers are in the wrong order in ${fileName}`
    );
  }

  const before = content.slice(
    0,
    startIndex + startMarker.length
  );

  const after = content.slice(endIndex);

  const updatedContent =
    `${before}\n${generatedContent}\n${after}`;

  if (updatedContent === content) {
    console.log(`${fileName} is already up to date.`);
    return;
  }

  fs.writeFileSync(targetFile, updatedContent, "utf8");

  console.log(
    `Updated ${fileName} from docs/data/platform-compatibility.json`
  );
}

// ------------------------------------------------------------
// Update README-style compatibility tables
// ------------------------------------------------------------

for (const targetFile of compatibilityTableFiles) {
  updateGeneratedSection(
    targetFile,
    compatibilityStartMarker,
    compatibilityEndMarker,
    generatedCompatibilityTable
  );
}

// ------------------------------------------------------------
// Update "What exists today" tables
// ------------------------------------------------------------

for (const targetFile of existenceTableFiles) {
  updateGeneratedSection(
    targetFile,
    existenceStartMarker,
    existenceEndMarker,
    generatedExistenceTable
  );
}

// ------------------------------------------------------------
// Done
// ------------------------------------------------------------

console.log("Platform compatibility generation complete.");