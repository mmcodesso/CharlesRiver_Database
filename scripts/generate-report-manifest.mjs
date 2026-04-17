import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(repoRoot, "config", "report_catalog.yaml");
const manifestPath = path.join(repoRoot, "src", "generated", "reportManifest.js");
const collectionsPath = path.join(repoRoot, "src", "generated", "reportDocCollections.js");

const AREA_LABELS = {
  financial: "Financial",
  managerial: "Managerial",
  audit: "Audit",
};

const SMALL_WORDS = new Set(["and", "by", "for", "of", "on", "to", "vs"]);
const ACRONYMS = new Map([
  ["ap", "AP"],
  ["ar", "AR"],
  ["sod", "SOD"],
]);

function humanizeSlug(value) {
  return String(value)
    .split("-")
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      if (ACRONYMS.has(lowerWord)) {
        return ACRONYMS.get(lowerWord);
      }
      if (index > 0 && SMALL_WORDS.has(lowerWord)) {
        return lowerWord;
      }
      return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    })
    .join(" ");
}

function buildManifestEntry(report) {
  const assetBasePath = `/reports/${report.area}/${report.process_group}/${report.slug}`;
  return {
    slug: report.slug,
    title: report.title,
    area: report.area,
    areaLabel: AREA_LABELS[report.area] ?? humanizeSlug(report.area),
    processGroup: report.process_group,
    processGroupLabel: humanizeSlug(report.process_group),
    cadence: report.cadence,
    description: report.description,
    queryPath: report.query_path,
    previewRowLimit: report.preview_row_limit,
    excelEnabled: Boolean(report.excel_enabled),
    csvEnabled: Boolean(report.csv_enabled),
    assetBasePath,
    previewPath: `${assetBasePath}/preview.json`,
    excelPath: `${assetBasePath}/${report.slug}.xlsx`,
    csvPath: `${assetBasePath}/${report.slug}.csv`,
  };
}

function buildAreaCollections(manifestEntries) {
  const grouped = {};

  for (const entry of manifestEntries) {
    if (!grouped[entry.area]) {
      grouped[entry.area] = [];
    }

    let group = grouped[entry.area].find((candidate) => candidate.processGroup === entry.processGroup);
    if (!group) {
      group = {
        processGroup: entry.processGroup,
        processGroupLabel: entry.processGroupLabel,
        items: [],
      };
      grouped[entry.area].push(group);
    }

    group.items.push({
      reportKey: entry.slug,
    });
  }

  return grouped;
}

async function main() {
  const raw = yaml.load(await fs.readFile(catalogPath, "utf8")) ?? {};
  const reports = Array.isArray(raw) ? raw : raw.reports ?? [];
  if (!Array.isArray(reports)) {
    throw new Error(`Expected a report list in ${catalogPath}`);
  }

  const manifestEntries = reports.map(buildManifestEntry);
  const manifest = Object.fromEntries(manifestEntries.map((entry) => [entry.slug, entry]));
  const areaCollections = buildAreaCollections(manifestEntries);

  const manifestSource = `const reportManifest = ${JSON.stringify(manifest, null, 2)};\n\nexport default reportManifest;\n`;
  const collectionsSource = `export const reportAreaCollections = ${JSON.stringify(areaCollections, null, 2)};\n`;

  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, manifestSource, "utf8");
  await fs.writeFile(collectionsPath, collectionsSource, "utf8");
  console.log(`Wrote ${manifestPath}`);
  console.log(`Wrote ${collectionsPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
