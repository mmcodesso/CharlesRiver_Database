const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const yaml = require("js-yaml");
const { loadSiteBranding } = require("../../config/loadSiteBranding.cjs");
const { getTeachingDownloadBaseUrl } = require("../../src/data/teachingRelease.cjs");

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
    const page = structuredData(html).find(entry => entry['@type'] === 'WebPage');
    assert.equal(page.mainEntity['@id'], resource['@id']);
    assert.equal(resource.isPartOf['@id'], branding.baseUrl + '/#website');
  }
});

test("all authored pages have one consistent social preview and unique descriptions", () => {
  const publication = require('../../src/components/SiteBranding/publication.cjs');
  const descriptions = new Set();
  const bytes = fs.readFileSync(path.join(root, 'static', publication.socialImage));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 630);
  for (const route of ['/', ...docs.map(doc => doc.route)]) {
    const html = fs.readFileSync(builtFile(route), 'utf8');
    const tags = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => match[0]);
    const get = key => {
      const matches = tags.filter(tag => attribute(tag, 'name') === key || attribute(tag, 'property') === key);
      assert.equal(matches.length, 1, route + ': ' + key);
      return attribute(matches[0], 'content');
    };
    const description = get('description');
    assert.ok(!descriptions.has(description), 'Duplicate description: ' + route);
    descriptions.add(description);
    assert.equal(get('og:description'), description);
    assert.equal(get('twitter:description'), description);
    assert.equal(get('twitter:title'), get('og:title'));
    assert.equal(get('og:site_name'), branding.datasetName);
    assert.equal(get('og:type'), 'website');
    assert.equal(get('og:image'), branding.baseUrl + '/' + publication.socialImage);
    assert.equal(get('twitter:image'), get('og:image'));
    assert.equal(get('og:image:type'), 'image/png');
    assert.equal(get('og:image:width'), '1200');
    assert.equal(get('og:image:height'), '630');
    assert.equal(get('twitter:image:alt'), get('og:image:alt'));
    assert.ok(html.includes(`href="${publication.discoveryUrl}"`), 'Global publisher discovery: ' + route);
    assert.ok(html.includes('href="/docs/analytics/analysis-tracks"'), 'Global query discovery: ' + route);
    assert.ok(builtFile('/' + publication.socialImage));
  }
});

test("catalog topics expose process, schema, practice and case links before JavaScript", () => {
  const source = fs.readFileSync(path.join(root, 'src/components/CatalogNavigation/TopicLearningLinks.jsx'), 'utf8');
  const targets = [...source.matchAll(/\['[^']+', '([^']+)'\]/g)].map(match => match[1]);
  assert.equal(targets.length, 25);
  for (const route of ['/docs/analytics', '/docs/analytics/analysis-tracks']) {
    const html = fs.readFileSync(builtFile(route), 'utf8');
    assert.equal((html.match(/Connect the evidence:/g) ?? []).length, 6);
    for (const target of targets) assert.ok(html.includes(`href="${target}"`), route + ' -> ' + target);
  }
  for (const route of ['/docs', '/docs/downloads', '/docs/teach-with-data/instructor-adoption']) {
    const html = fs.readFileSync(builtFile(route), 'utf8');
    assert.ok(html.includes('href="https://accountinganalyticshub.com/charles-river/"'), route);
  }
});

test("case discovery renders eight investigations in three levels without tool filters", () => {
  const html = fs.readFileSync(builtFile("/docs/analytics/cases"), "utf8");
  assert.equal((html.match(/<select\b/g) ?? []).length, 0);
  for (const level of ["basic", "intermediate", "advanced"]) assert.ok(html.includes('id="cases-' + level + '"'));
  assert.equal((html.replace(/<!--.*?-->/g, "").match(/>Case [1-8] ·/g) ?? []).length, 8);
  assert.equal((html.match(/<dt>Deliverable<\/dt>/g) ?? []).length, 8);
  assert.ok(html.includes("Excel or SQL"));
});

test("dataset metadata and direct release links are present before JavaScript runs", () => {
  const publication = require('../../src/components/SiteBranding/publication.cjs');
  for (const route of ['/', ...docs.map(doc => doc.route)]) {
    const html = fs.readFileSync(builtFile(route), 'utf8');
    const entries = structuredData(html);
    const datasets = entries.filter(entry => entry['@type'] === 'Dataset');
    assert.equal(datasets.length, route === '/docs/downloads' ? 1 : 0, route);
    const page = entries.find(entry => entry['@type'] === 'WebPage');
    assert.ok(page, 'WebPage: ' + route);
    assert.equal(page.url, branding.baseUrl + (route === '/' ? '/' : route));
    assert.equal(page.about['@id'], publication.datasetId);
    if (datasets.length) {
      assert.equal(datasets[0]['@id'], publication.datasetId);
      assert.equal(datasets[0].creator.name, publication.creatorName);
      assert.equal(datasets[0].distribution.length, 3);
      assert.equal(datasets[0].subjectOf['@id'], publication.discoveryUrl + '#webpage');
      assert.equal(datasets[0].datePublished, undefined);
    }
  }
  const homeEntries = structuredData(fs.readFileSync(builtFile('/'), 'utf8'));
  assert.equal(homeEntries.filter(entry => entry['@type'] === 'WebSite').length, 1);
  for (const { route } of [{ route: "/" }, ...docs]) {
    const html = fs.readFileSync(builtFile(route), "utf8");
    assert.doesNotMatch(html, /\bv\d{4}\.\d+\b/, `Numbered dataset version on ${route}`);
    if (route !== "/docs/downloads") {
      assert.ok(!html.includes(`${branding.repositoryUrl}/releases`), `Release link outside Downloads: ${route}`);
    }
  }
  const downloads = fs.readFileSync(builtFile("/docs/downloads"), "utf8");
  for (const suffix of [".sqlite", ".xlsx", "_csv.zip"]) {
    assert.ok(downloads.includes(`${getTeachingDownloadBaseUrl(branding.repositoryUrl)}/${branding.shortName}${suffix}`));
  }
  assert.ok(fs.readFileSync(path.join(build, "robots.txt"), "utf8").includes(`${branding.baseUrl}/sitemap.xml`));
});

test("unified report catalog renders every report, topic, learning prompt, and unchanged download", () => {
  const topics = require("../../src/data/reportTopics.json");
  const html = fs.readFileSync(builtFile("/docs/analytics"), "utf8");
  const reports = yaml.load(fs.readFileSync(path.join(root, "config/report_catalog.yaml"), "utf8")).reports;
  assert.match(html, /aria-label="Browse business reports"/);
  assert.match(html, /id="report-search"/);
  assert.match(html, /id="report-topic"/);
  assert.equal((html.match(/<article\b[^>]*id="report-/g) ?? []).length, 48);
  for (const topic of topics) assert.ok(html.includes(`id="${topic.id}"`), `Missing topic anchor: ${topic.id}`);
  for (const report of reports) {
    assert.equal((html.match(new RegExp(`id="report-${report.slug}"`, "g")) ?? []).length, 1, report.slug);
  }
  const packs = yaml.load(fs.readFileSync(path.join(root, "config/report_pack_catalog.yaml"), "utf8"));
  // All reports with prior teaching guidance retain an expandable interpretation section.
  const guidedIds = new Set(packs.packs.flatMap((pack) => pack.reports.map((item) => item.report_slug)));
  assert.equal((html.match(/<summary\b[^>]*>Interpret this report<\/summary>/g) ?? []).length, guidedIds.size);
  const sitemap = fs.readFileSync(path.join(build, "sitemap.xml"), "utf8");
  assert.ok(!sitemap.includes(`${branding.baseUrl}/docs/analytics/reports`));
  for (const name of ["", "/lens-packs", "/financial", "/managerial", "/audit", "/executive-overview", "/commercial-and-working-capital", "/payroll-perspective", "/operations-and-risk"]) {
    const redirect = fs.readFileSync(builtFile(`/docs/analytics/reports${name}`), "utf8");
    assert.ok(redirect.includes("/docs/analytics"), `Former report page: ${name}`);
  }
});

test("top-level query library renders every SQL file with shared browsing controls", () => {
  const html = fs.readFileSync(builtFile("/docs/analytics/analysis-tracks"), "utf8");
  assert.match(html, /aria-label="Browse SQL queries"/);
  assert.match(html, /id="query-search"/);
  assert.match(html, /id="query-topic"/);
  for (const topic of require("../../src/data/queryTopics.json")) {
    assert.ok(html.includes(`id="${topic.id}"`), `Missing query topic: ${topic.id}`);
  }
  assert.equal((html.match(/>Show SQL<\/button>/g) ?? []).length, 170);
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*download[^>]*>Download SQL<\/a>/g)].map((match) => match[1]);
  assert.equal(links.length, 170);
  assert.equal(new Set(links).size, 170);
  for (const link of links) assert.ok(builtFile(link), `Missing SQL asset: ${link}`);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const queryPaths = require("../../src/data/queryLearningPaths.json");
  for (const learningPath of queryPaths) {
    assert.ok(ids.has(learningPath.id), `Missing learning path: ${learningPath.id}`);
    for (const item of learningPath.items) {
      const anchor = `query-${item.queryKey.replace(/\.sql$/, "").replace(/[\/_]/g, "-")}`;
      assert.ok(ids.has(anchor), `Missing guided query target: ${anchor}`);
      assert.ok(html.includes(`href="#${anchor}"`));
    }
  }
  for (const area of ["financial", "managerial", "audit"]) {
    assert.ok(fs.readFileSync(builtFile(`/docs/analytics/${area}`), "utf8").includes("/docs/analytics/analysis-tracks"));
    assert.ok(!fs.readFileSync(path.join(build, "sitemap.xml"), "utf8").includes(`<loc>${branding.baseUrl}/docs/analytics/${area}</loc>`));
  }
});

test("rendered internal links and static downloads point to existing build files", () => {
  assert.equal(docs.length, 47, "Update the reviewed authored-page inventory if intentionally changed");
  const sitemap = fs.readFileSync(path.join(build, "sitemap.xml"), "utf8");
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 49);
  const anchorCache = new Map();
  for (const route of ["/", ...docs.map((doc) => doc.route)]) {
    const file = builtFile(route);
    const html = fs.readFileSync(file, "utf8");
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map((match) => match[1]);
    for (const href of links) {
      if ((!href.startsWith("/") && !href.startsWith("#")) || href.startsWith("//")) continue;
      const url = new URL(href.replaceAll("&amp;", "&"), `${branding.baseUrl}${route}`);
      const target = builtFile(url.pathname);
      assert.ok(target, `Missing target ${href} from ${route}`);
      if (url.hash && target.endsWith(".html")) {
        if (!anchorCache.has(target)) {
          anchorCache.set(target, new Set([...fs.readFileSync(target, "utf8").matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])));
        }
        assert.ok(anchorCache.get(target).has(decodeURIComponent(url.hash.slice(1))), `Missing fragment ${href} from ${route}`);
      }
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
