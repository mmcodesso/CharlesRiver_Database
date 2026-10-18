const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const root = path.resolve(__dirname, "../../..");
const filters = require("./workbook-selections.json");
const db = new DatabaseSync(path.join(root, "outputs/CharlesRiver.sqlite"), { readOnly: true });
try {
  const checks = Object.entries(filters).map(([table, filter]) => ({ table, key: db.prepare("PRAGMA table_info(" + table + ")").all()[0].name, rows: db.prepare("SELECT * FROM " + table + " WHERE " + filter).all() }));
  const output = path.join(root, "outputs/_website_redesign/tutorials/workbook-check-input.json");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(checks));
  console.log("Prepared read-only workbook comparisons for " + checks.length + " tables.");
} finally { db.close(); }
