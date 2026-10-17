const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const yaml = require("js-yaml");
const { loadSiteBranding } = require("../../config/loadSiteBranding.cjs");

const root = path.resolve(__dirname, "../..");
const build = path.join(root, "build");
const branding = loadSiteBranding();

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function builtFile(route) {
  const relative = decodeURIComponent(route).replace(/^\//, "");
  const choices = [path.join(build, relative), path.join(build, `${relative}.html`), path.join(build, relative, "index.html")];
  return choices.find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
}

function attribute(tag, name) {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1];
}

function structuredData(html) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map((match) => JSON.parse(match[1]));
}

const docs = walk(path.join(root, "docs")).filter((file) => file.endsWith(".md")).map((file) => {
  const id = path.relative(path.join(root, "docs"), file).replaceAll(path.sep, "/").slice(0, -3);
  const metadata = yaml.load(fs.readFileSync(file, "utf8").split("---")[1]);
  const slug = metadata.slug ?? `/${id.replace(/\/index$/, "")}`;
  const route = `/docs${slug === "/" ? "" : slug}`;
  return { id, metadata, route };
});

test("every authored page is rendered with a unique title, description, canonical, H1, and breadcrumbs", () => {
  const titles = new Set();
  const sitemap = fs.readFileSync(path.join(build, "sitemap.xml"), "utf8");
  for (const { id, route, metadata } of docs) {
    const file = builtFile(route);
    assert.ok(file, `Missing rendered page: ${route}`);
    const html = fs.readFileSync(file, "utf8");
    const title = /<title[^>]*>(.*?)<\/title>/s.exec(html)?.[1];
    assert.ok(title, `Missing title: ${id}`);
    assert.ok(!titles.has(title), `Duplicate title: ${id}`);
    titles.add(title);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `Primary heading: ${id}`);
    const description = [...html.matchAll(/<meta\b[^>]*>/g)].map((match) => match[0]).find((tag) => attribute(tag, "name") === "description");
    assert.ok(attribute(description ?? "", "content")?.length >= 30, `Description: ${id}`);
    const canonical = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => match[0]).find((tag) => attribute(tag, "rel") === "canonical");
    assert.equal(attribute(canonical ?? "", "href"), `${branding.baseUrl}${route}`, `Canonical: ${id}`);
    assert.ok(sitemap.includes(`<loc>${branding.baseUrl}${route}</loc>`), `Sitemap: ${id}`);
    assert.match(html, /property="og:title"/);
    assert.match(html, /property="og:description"/);
    assert.match(html, /property="og:image"/);
    assert.ok(structuredData(html).some((entry) => entry["@type"] === "BreadcrumbList"), `Breadcrumbs: ${id}`);
    assert.ok(metadata.title);
  }
});

test("learning activities have server-rendered accurate LearningResource metadata", () => {
  const activities = docs.filter(({ id }) => (id.startsWith("analytics/cases/") && id !== "analytics/cases/index") || (id.startsWith("learn-and-practice/") && id !== "learn-and-practice/index") || ["analytics/sql-guide", "analytics/excel-guide"].includes(id));
  assert.equal(activities.length, 23);
  for (const { route, metadata } of activities) {
    const html = fs.readFileSync(builtFile(route), "utf8");
    const resource = structuredData(html).find((entry) => entry["@type"] === "LearningResource");
    assert.ok(resource, `Missing LearningResource: ${route}`);
    assert.equal(resource.name, metadata.title);
    assert.equal(resource.description, metadata.description);
    assert.equal(resource.url, `${branding.baseUrl}${route}`);
  }
});

test("case discovery renders separate usable filter options and all cases before hydration", () => {
  const html = fs.readFileSync(builtFile("/docs/analytics/cases"), "utf8");
  const selects = Array.from(html.matchAll(/<select\b[^>]*>(.*?)<\/select>/gs), (match) => match[1]);
  assert.equal(selects.length, 4);
  for (const select of selects) {
    const values = Array.from(select.matchAll(/<option\b[^>]*value="([^"]*)"[^>]*>/g), (match) => match[1]);
    assert.ok(values.length >= 3, "Every filter needs separate named choices");
    assert.equal(new Set(values).size, values.length, "Filter choices must be unique");
    assert.ok(!values.includes("[object Set]"), "Iterable values must be materialized before rendering");
  }
  assert.match(selects[0], /value="Manufacturing"/);
  assert.match(selects[2], /value="Foundation"/);
  const catalog = /<section\b[^>]*aria-label="Browse accounting cases"[^>]*>(.*?)<\/section>/s.exec(html)?.[1];
  assert.ok(catalog, "Case catalog must be present in server-rendered HTML");
  assert.equal((catalog.match(/<article>/g) ?? []).length, 17);
});

test("dataset metadata and direct release links are present before JavaScript runs", () => {
  const identities = [];
  for (const route of ["/", "/docs/downloads", "/docs/dataset-overview"]) {
    const html = fs.readFileSync(builtFile(route), "utf8");
    const dataset = structuredData(html).find((entry) => entry["@type"] === "Dataset");
    assert.ok(dataset, `Dataset schema: ${route}`);
    assert.equal(dataset.creator.name, "Mauricio Mello Codesso");
    assert.equal(dataset.version, "2027.1");
    assert.equal(dataset.distribution.length, 3);
    identities.push(dataset["@id"]);
  }
  assert.equal(new Set(identities).size, 1);
  const downloads = fs.readFileSync(builtFile("/docs/downloads"), "utf8");
  for (const suffix of [".sqlite", ".xlsx", "_csv.zip"]) {
    assert.ok(downloads.includes(`${branding.releaseBaseUrl}/${branding.shortName}${suffix}`));
  }
  assert.ok(fs.readFileSync(path.join(build, "robots.txt"), "utf8").includes(`${branding.baseUrl}/sitemap.xml`));
});

test("rendered internal links and static downloads point to existing build files", () => {
  for (const route of ["/", ...docs.map((doc) => doc.route)]) {
    const file = builtFile(route);
    const html = fs.readFileSync(file, "utf8");
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map((match) => match[1]);
    for (const href of links) {
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const url = new URL(href.replaceAll("&amp;", "&"), branding.baseUrl);
      assert.ok(builtFile(url.pathname), `Missing target ${href} from ${route}`);
    }
  }
});

test("BPMN library publishes every editable source, SVG, evidence explanation, and learning connection", () => {
  const models = require("../../src/data/bpmnModels.json");
  const library = fs.readFileSync(builtFile("/docs/process-flows"), "utf8");
  assert.ok(!docs.some(({ id }) => id === "process-models/index"), "The separate model page must be removed");
  const redirect = fs.readFileSync(builtFile("/docs/process-models"), "utf8");
  assert.ok(redirect.includes("/docs/process-flows"), "The previous URL must redirect to the combined hub");
  assert.equal((library.match(/src="\/diagrams\/bpmn\/process-architecture\.svg"/g) ?? []).length, 1, "The architecture must appear once");
  assert.ok(!fs.readFileSync(path.join(build, "sitemap.xml"), "utf8").includes(`<loc>${branding.baseUrl}/docs/process-models</loc>`));
  assert.equal(models.length, 11);
  assert.match(library, /BPMN model inventory/);
  assert.match(library, /executable BPMN/);
  for (const model of models) {
    for (const suffix of ["svg", "drawio"]) {
      const asset = `/diagrams/bpmn/${model.id}.${suffix}`;
      if (suffix === "drawio") assert.ok(library.includes(`href="${asset}"`), `Missing library download: ${asset}`);
      assert.ok(builtFile(asset), `Unpublished diagram: ${asset}`);
    }
    for (const route of [model.processPath, model.exercisePath, model.casePath]) {
      assert.ok(builtFile(route), `Missing learning connection: ${model.id} -> ${route}`);
      assert.ok(library.includes(`href="${route}"`), `Missing library connection: ${route}`);
    }
    const process = fs.readFileSync(builtFile(model.processPath), "utf8");
    assert.ok(!process.includes(`href="/diagrams/bpmn/${model.id}.svg"`), `Diagram must open its viewer rather than a standalone SVG: ${model.id}`);
    assert.match(process, new RegExp(`<button[^>]*aria-label="View ${model.title} in diagram viewer"[^>]*><img[^>]*src="/diagrams/bpmn/${model.id}\\.svg"`));
    assert.ok(process.includes(`/diagrams/bpmn/${model.id}.svg`), `Model absent from its process guide: ${model.id}`);
    assert.ok(process.includes("Text description and database evidence"));
    assert.ok(process.includes(model.tables[0]), `Missing evidence explanation: ${model.id}`);
    assert.match(process, /<img[^>]*alt="[^"]{80,}"/);
  }
});
