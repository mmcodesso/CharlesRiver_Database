const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const test = require("node:test");
const yaml = require("js-yaml");
const { DatabaseSync } = require("node:sqlite");

const root = path.resolve(__dirname, "../..");
const lessons = require("../../src/data/tutorialLessons.json");
const figures = require("../../src/data/tutorialFigures.json");
const verified = require("../../planning/website-redesign/tutorials/verified-examples.json");
const originalAnchors = require("../../planning/website-redesign/TUTORIAL_ORIGINAL_ANCHORS.json");
// Compare canonical text across LF and Windows CRLF checkouts.
const source = (p) => fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n");
const built = (route) => {
  const candidates = ["build" + route + ".html", "build" + route + "/index.html"];
  const file = candidates.find((p) => fs.existsSync(path.join(root, p)));
  assert.ok(file, "Missing rendered route: " + route);
  return source(file);
};

test("twelve tutorials form a complete path with both tool routes and accurate metadata", () => {
  assert.equal(lessons.length, 12);
  const { docsSidebar } = require("../../sidebars.js");
  const section = docsSidebar.find((item) => item.label === "Learn and Practice");
  assert.deepEqual(section.items.slice(0, 12), lessons.map((l) => "learn-and-practice/" + l.id));
  for (const [index, lesson] of lessons.entries()) {
    const text = source("docs/learn-and-practice/" + lesson.id + ".md");
    const meta = yaml.load(text.split("---")[1]);
    assert.equal(meta.tutorial_number, index + 1);
    assert.equal(meta.pagination_prev, index ? "learn-and-practice/" + lessons[index - 1].id : "learn-and-practice/index");
    assert.equal(meta.pagination_next, index === 11 ? "analytics/cases/index" : "learn-and-practice/" + lessons[index + 1].id);
    const html = built("/docs/learn-and-practice/" + lesson.id);
    assert.ok(html.includes('role="tablist"'));
    assert.ok(html.includes('>Excel</li>') && html.includes('>SQL</li>'));
    assert.match(html, /"learningResourceType":"Tutorial"/);
    assert.ok(html.includes("Try One Change") && html.includes("Keep Your Evidence"));
    assert.ok(html.includes("/diagrams/tutorials/" + lesson.id + ".svg"));
  }
});

test("every published worked SQL block executes against the verified read-only release", () => {
  const database = path.join(root, "outputs/CharlesRiver.sqlite");
  assert.ok(fs.existsSync(database), "The verified release is required for tutorial result validation");
  const hash = crypto.createHash("sha256").update(fs.readFileSync(database)).digest("hex");
  assert.equal(hash, verified.sha256, "Wrong tutorial release");
  const db = new DatabaseSync(database, { readOnly: true });
  try {
    const pages = new Set(verified.examples.map((e) => e.page));
    const published = [];
    for (const page of pages) {
      const text = source(page);
      for (const match of text.matchAll(/\x60\x60\x60sql title="([^"]+)"\n([\s\S]*?)\n\x60\x60\x60/g)) {
        published.push({ page, name: match[1], sql: match[2] });
      }
    }
    assert.equal(published.length, 43);
    assert.equal(new Set(published.map((e) => e.name)).size, published.length);
    for (const example of published) {
      assert.match(example.sql, /^SELECT\b/i, example.name);
      const baseline = verified.examples.find((e) => e.name === example.name);
      assert.ok(baseline, "Missing reviewed result: " + example.name);
      assert.equal(example.page, baseline.page);
      assert.equal(example.sql, baseline.sql, "Changed example needs result review: " + example.name);
      const actual = db.prepare(example.sql).all().map((row) => ({ ...row }));
      assert.deepEqual(actual, baseline.expected, example.name);
    }
    // Independent tutorial checks catch the reporting-date and multiplicity mistakes taught.
    const asOf = db.prepare("SELECT ROUND(SUM(AppliedAmount),2) AS Applied FROM CashReceiptApplication WHERE SalesInvoiceID=202 AND ApplicationDate <= ?");
    assert.equal(asOf.get("2024-02-29").Applied, 1190.23);
    assert.equal(asOf.get("2024-04-16").Applied, 12248.33);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM CashReceiptApplication WHERE CashReceiptID=528").get().n > 1, true);
    assert.equal(db.prepare("SELECT ROUND(SUM(LineTotal),2) AS Amount FROM SalesOrderLine WHERE SalesOrderID=11 AND LineNumber=2").get().Amount, 7845.57);
    assert.equal(db.prepare("SELECT ROUND(SUM(ExtendedStandardTotalCost),2) AS Amount FROM ProductionCompletionLine WHERE ProductionCompletionID IN (1,2)").get().Amount, 1019.85);
    assert.equal(db.prepare("SELECT ROUND(SUM(TotalAmount),2) AS Amount FROM JournalEntry WHERE ReversesJournalEntryID=9").get().Amount, 19.74);
  } finally { db.close(); }
});

test("tutorial diagrams preserve editable Draw.io sources and matching accessible exports", () => {
  assert.deepEqual(figures.map((f) => f.id), lessons.map((l) => l.id));
  for (const figure of figures) {
    const stem = "static/diagrams/tutorials/" + figure.id;
    const xml = source(stem + ".drawio");
    const svg = source(stem + ".svg");
    assert.match(xml, /<mxGraphModel/);
    assert.ok((xml.match(/vertex="1"/g) || []).length >= 3);
    assert.match(svg, /<svg\b/);
    assert.match(svg, /content="/);
    assert.match(svg, /<title id="tutorial-title">/);
    assert.match(svg, /<desc id="tutorial-description">/);
    // The export's source hash uses LF; Git may check out the editable XML as CRLF.
    const digest = crypto.createHash("sha256").update(xml).digest("hex");
    assert.ok(svg.includes('data-source-sha256="' + digest + '"'), figure.id);
    assert.equal(source("build/diagrams/tutorials/" + figure.id + ".svg"), svg);
  }
});

test("all established tutorial and setup section anchors remain available", () => {
  for (const [page, anchors] of Object.entries(originalAnchors)) {
    const text = source(page);
    const meta = yaml.load(text.split("---")[1]);
    const slug = meta.slug || "/" + page.replace(/^docs\//, "").replace(/\.md$/, "").replace(/\/index$/, "");
    const html = built("/docs" + slug);
    for (const id of anchors) assert.ok(html.includes('id="' + id + '"'), page + "#" + id);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, "Duplicate rendered ID: " + page);
  }
});
