const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const yaml = require("js-yaml");
const config = require("../../docusaurus.config.js");
const { docsSidebar } = require("../../sidebars.js");
const { loadSiteBranding } = require("../../config/loadSiteBranding.cjs");
const { getTeachingDownloadBaseUrl } = require("../../src/data/teachingRelease.cjs");
const {
  buildDatasetStructuredData,
  buildLearningResourceStructuredData,
  getReleaseDownloadUrl,
  serializeStructuredData,
} = require("../../src/components/SiteBranding/structuredData.cjs");

const root = path.resolve(__dirname, "../..");
const branding = loadSiteBranding();

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function sidebarIds(items, depth = 0) {
  return items.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item.type === "doc") return [item.id];
    assert.ok(depth < 2, `Sidebar is too deeply nested: ${item.label}`);
    return [
      ...(item.link?.type === "doc" ? [item.link.id] : []),
      ...sidebarIds(item.items ?? [], depth + 1),
    ];
  });
}

test("learning sequence is shallow and every authored doc is discoverable once", () => {
  assert.deepEqual(docsSidebar.map((item) => item.label), [
    "Getting Started", "Company Story", "Business Processes", "Learn and Practice",
    "Cases", "Reports and Analytics", "Query Library", "Dataset Reference", "For Instructors", "Technical",
  ]);
  const ids = sidebarIds(docsSidebar);
  const files = walk(path.join(root, "docs")).filter((file) => file.endsWith(".md"));
  const authoredIds = files.map((file) => path.relative(path.join(root, "docs"), file).replaceAll(path.sep, "/").slice(0, -3));
  assert.equal(new Set(ids).size, ids.length, "A doc appears more than once in the sidebar");
  assert.deepEqual([...ids].sort(), authoredIds.sort());
  const cases = docsSidebar.find((item) => item.label === "Cases");
  assert.equal(cases.items.length, 8);
  assert.ok(cases.items.every((item) => typeof item === "string"));
  const reportIndex = docsSidebar.findIndex((item) => item.label === "Reports and Analytics");
  assert.equal(docsSidebar[reportIndex + 1].label, "Query Library");
  assert.equal(docsSidebar[reportIndex + 1].id, "analytics/analysis-tracks");
  assert.equal(docsSidebar[reportIndex + 1].type, "doc");
});

test("established public routes and redirects remain stable", () => {
  const routes = {
    "start-here/index": "/", "start-here/why-this-dataset": "/why-this-dataset",
    "start-here/downloads": "/downloads", "start-here/dataset-overview": "/dataset-overview",
    "learn-the-business/company-story": "/company-story", "learn-the-business/process-flows": "/process-flows",
    "analytics/index": "/analytics", "teach-with-data/instructor-guide": "/teach-with-data/instructor-adoption",
    "technical/technical-guide": "/technical-guide", "technical/dataset-delivery": "/technical/dataset-delivery",
    "technical/roadmap": "/roadmap", "technical/contributing": "/technical/contributing",
    "technical/license": "/technical/license",
  };
  for (const [id, slug] of Object.entries(routes)) {
    const source = fs.readFileSync(path.join(root, "docs", `${id}.md`), "utf8");
    assert.equal(yaml.load(source.split("---")[1]).slug, slug, id);
  }
  for (const file of walk(path.join(root, "docs")).filter((entry) => entry.endsWith(".md"))) {
    const id = path.relative(path.join(root, "docs"), file).replaceAll(path.sep, "/").slice(0, -3);
    const metadata = yaml.load(fs.readFileSync(file, "utf8").split("---")[1]);
    const expected = routes[id] ?? `/${id.replace(/\/index$/, "")}`;
    assert.equal(metadata.slug ?? `/${id.replace(/\/index$/, "")}`, expected, `Changed route: ${id}`);
  }
  const redirects = config.plugins.find(([name]) => name === "@docusaurus/plugin-client-redirects")[1].redirects;
  const sources = redirects.flatMap((redirect) => redirect.from);
  for (const route of ["/docs/quick-start", "/docs/accounting-analytics-dataset", "/docs/accounting-sql-practice-database", "/docs/processes/o2c-returns-credits-refunds", "/docs/processes/time-clocks", "/docs/analytics/cases/audit-exception-lab", "/docs/process-models"]) {
    assert.ok(sources.includes(route), `Missing established redirect: ${route}`);
  }
  assert.equal(redirects.find((redirect) => redirect.from.includes("/docs/process-models")).to, "/docs/process-flows");
});

test("navigation retains Downloads, Hub and textbook while release links stay on Downloads", () => {
  const items = config.themeConfig.navbar.items;
  assert.ok(items.some((item) => item.to === "/docs/downloads"));
  const links = JSON.stringify({ navbar: items, footer: config.themeConfig.footer.links });
  assert.ok(links.includes("https://accountinganalyticshub.com/"));
  assert.ok(links.includes("https://aa.accountinganalyticshub.com/"));
  assert.ok(!links.includes("/releases"));
  for (const [type, suffix] of [["sqlite", ".sqlite"], ["excel", ".xlsx"], ["csv", "_csv.zip"]]) {
    assert.equal(getReleaseDownloadUrl(branding, type), `${getTeachingDownloadBaseUrl(branding.repositoryUrl)}/${branding.shortName}${suffix}`);
  }
});

test("one report hub covers the frozen catalog once and redirects every former report page", () => {
  const topics = require("../../src/data/reportTopics.json");
  const reports = yaml.load(fs.readFileSync(path.join(root, "config/report_catalog.yaml"), "utf8")).reports;
  const ids = topics.flatMap((topic) => topic.reports);
  assert.equal(topics.length, 6);
  assert.equal(new Set(topics.map((topic) => topic.id)).size, topics.length);
  const additional = Object.values(require('../../src/data/additionalReports.json'));
  assert.equal(ids.length, 48 + additional.length);
  assert.equal(new Set(ids).size, ids.length, "A report must appear in exactly one topic");
  assert.deepEqual([...ids].sort(), [...reports, ...additional].map((report) => report.slug).sort());
  const redirects = config.plugins.find(([name]) => name === "@docusaurus/plugin-client-redirects")[1].redirects;
  for (const name of ["", "/lens-packs", "/financial", "/managerial", "/audit", "/executive-overview", "/commercial-and-working-capital", "/payroll-perspective", "/operations-and-risk"]) {
    const redirect = redirects.find((item) => item.from.includes(`/docs/analytics/reports${name}`));
    assert.ok(redirect, `Missing report redirect: ${name}`);
    assert.equal(redirect.to.split("#")[0], "/docs/analytics");
    const anchor = redirect.to.split("#")[1];
    if (anchor) assert.ok(topics.some((topic) => topic.id === anchor), `Unknown report topic: ${anchor}`);
  }
  const reportNav = config.themeConfig.navbar.items.flatMap((item) => item.items ?? [item]);
  assert.equal(reportNav.filter((item) => item.to === "/docs/analytics").length, 1);
  assert.ok(!reportNav.some((item) => item.to?.startsWith("/docs/analytics/reports")));
});

test("query and report topics agree and every SQL file appears once in the unified library", () => {
  const topics = require("../../src/data/queryTopics.json");
  const reportTopics = require("../../src/data/reportTopics.json");
  const paths = require("../../src/data/queryLearningPaths.json");
  assert.deepEqual(topics.map(({ id, title }) => ({ id, title })), reportTopics.map(({ id, title }) => ({ id, title })));
  const keys = topics.flatMap((topic) => topic.queries);
  const sourceKeys = walk(path.join(root, "queries")).filter((file) => file.endsWith(".sql")).map((file) => path.relative(path.join(root, "queries"), file).replaceAll(path.sep, "/"));
  assert.equal(keys.length, 170);
  assert.equal(new Set(keys).size, 170);
  assert.deepEqual([...keys].sort(), sourceKeys.sort());
  const queryTopics = new Map(topics.flatMap((topic) => topic.queries.map((key) => [key, topic.id])));
  const reports = yaml.load(fs.readFileSync(path.join(root, "config/report_catalog.yaml"), "utf8")).reports;
  const reportDefinitions = new Map([...reports, ...Object.values(require('../../src/data/additionalReports.json'))].map((report) => [report.slug, report]));
  for (const topic of reportTopics) for (const slug of topic.reports) {
    const key = reportDefinitions.get(slug).query_path.replace(/^queries\//, "");
    assert.equal(queryTopics.get(key), topic.id, `Query/report topic mismatch: ${slug}`);
  }
  assert.equal(paths.length, 2);
  for (const learningPath of paths) {
    assert.equal(learningPath.items.length, 6);
    assert.ok(learningPath.items.every((item) => queryTopics.has(item.queryKey)));
  }
  const redirects = config.plugins.find(([name]) => name === "@docusaurus/plugin-client-redirects")[1].redirects;
  for (const area of ["financial", "managerial", "audit"]) {
    assert.equal(redirects.find((item) => item.from.includes(`/docs/analytics/${area}`)).to, "/docs/analytics/analysis-tracks");
  }
});

test("indexing, sitemap, breadcrumb, and canonical settings remain enabled", () => {
  assert.equal(config.url, branding.baseUrl);
  assert.equal(config.baseUrl, "/");
  assert.equal(config.trailingSlash, false);
  assert.equal(config.onBrokenLinks, "throw");
  assert.equal(config.markdown.hooks.onBrokenMarkdownLinks, "throw");
  assert.equal(config.presets[0][1].docs.breadcrumbs, true);
  assert.notEqual(config.presets[0][1].sitemap, false);
  const robots = fs.readFileSync(path.join(root, "static/robots.txt"), "utf8");
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.ok(robots.includes(`${branding.baseUrl}/sitemap.xml`));
  assert.doesNotMatch(robots, /Disallow: \/\s*$/m);
});

test("dataset identity and citation follow the DOI and verified Zenodo record", () => {
  const publication = require('../../src/components/SiteBranding/publication.cjs');
  const downloads = buildDatasetStructuredData(branding);
  assert.equal(downloads['@id'], publication.datasetId);
  assert.equal(downloads.identifier.url, publication.conceptDoi);
  assert.equal(downloads.url, branding.baseUrl + '/');
  assert.equal(downloads.creator.name, publication.creatorName);
  assert.equal(downloads.creator.alternateName, publication.archivalCreatorName);
  assert.equal(downloads.license, 'https://creativecommons.org/licenses/by-sa/4.0/');
  assert.equal(downloads.version, undefined);
  assert.equal(downloads.datePublished, undefined);
  assert.equal(downloads.citation.datePublished, publication.citationYear);
  assert.equal(downloads.citation.url, publication.versionDoi);
  assert.equal(downloads.distribution.length, 3);
  assert.equal(downloads.subjectOf['@id'], publication.discoveryUrl + '#webpage');
  assert.equal(downloads.sameAs, publication.conceptDoi);
  assert.ok(downloads.distribution.every(item => item.contentUrl.includes('/releases/latest/download/')));
  assert.ok(downloads.distribution.every(item => !item.contentUrl.includes('_support')));
  assert.equal(downloads.mainEntityOfPage, branding.baseUrl + '/docs/downloads');
});

test("learning schema describes visible page metadata without invented outcomes", () => {
  const metadata = { title: "Trace an order", description: "Follow source documents to their accounting entries.", permalink: "/docs/analytics/cases/o2c-trace-case" };
  const resource = buildLearningResourceStructuredData(branding, metadata, "Case study");
  assert.equal(resource.name, metadata.title);
  assert.equal(resource.description, metadata.description);
  assert.equal(resource.learningResourceType, "Case study");
  assert.equal(resource.url, `${branding.baseUrl}${metadata.permalink}`);
  assert.equal(resource.dateModified, undefined);
  assert.equal(resource.educationalLevel, undefined);
});

test("cross-site entity identities match the recorded clean Hub main source", () => {
  const expected = require('../../planning/website-redesign/learning-seo-2026/hub-alignment-evidence.json').verified;
  const publication = require('../../src/components/SiteBranding/publication.cjs');
  const { buildWebPageStructuredData, buildWebSiteStructuredData } = require('../../src/components/SiteBranding/structuredData.cjs');
  const dataset = buildDatasetStructuredData(branding);
  assert.equal(dataset['@id'], expected.datasetId);
  assert.equal(dataset.url, expected.datasetUrl);
  assert.equal(dataset.publisher['@id'], expected.publisherId);
  assert.equal(dataset.publisher.name, expected.publisherName);
  assert.equal(dataset.creator['@id'], expected.authorId);
  assert.equal(dataset.creator.url, expected.authorUrl);
  assert.equal(dataset.creator.name, expected.authorName);
  assert.equal(dataset.sameAs, expected.conceptDoi);
  assert.equal(dataset.citation.url, expected.revisionDoi);
  assert.equal(dataset.citation.name, expected.registryTitle);
  assert.equal(dataset.citation.datePublished, expected.citationYear);
  assert.equal(dataset.citation.publisher['@id'], expected.publisherId);
  assert.equal(dataset.license, expected.license);
  const website = buildWebSiteStructuredData(branding, 'Company and evidence learning.');
  assert.equal(website.publisher['@id'], expected.publisherId);
  assert.equal(website.isPartOf['@id'], 'https://accountinganalyticshub.com/#website');
  const learning = buildLearningResourceStructuredData(branding, { title: 'Trace', description: 'Trace evidence.', permalink: '/docs/example' }, 'Exercise');
  const page = buildWebPageStructuredData(branding, { title: 'Trace', description: 'Trace evidence.', permalink: '/docs/example', learningResourceId: learning['@id'] });
  assert.equal(learning.isPartOf['@id'], website['@id']);
  assert.equal(learning.about['@id'], expected.datasetId);
  assert.equal(page.mainEntity['@id'], learning['@id']);
  assert.equal(publication.archivalCreatorName, 'Mauricio Mello Codesso');
});

test("JSON-LD serialization cannot close its script element", () => {
  const value = { description: "</script><script>alert(1)</script>" };
  const serialized = serializeStructuredData(value);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), value);
});
