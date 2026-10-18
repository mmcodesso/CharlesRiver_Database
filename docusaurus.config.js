const { themes } = require("prism-react-renderer");
const { loadSiteBranding } = require("./config/loadSiteBranding.cjs");
const { TEACHING_RELEASE, getTeachingReleaseUrl } = require("./src/data/teachingRelease.cjs");

const branding = loadSiteBranding();

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: branding.datasetName,
  tagline: "One company. Connected accounting processes. Evidence for better decisions.",
  favicon: "img/favicon.svg",
  url: branding.baseUrl,
  baseUrl: "/",
  organizationName: "mmcodesso",
  projectName: "CharlesRiver_Database",
  trailingSlash: false,
  onBrokenLinks: "throw",
  staticDirectories: ["static", "queries"],
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },
  themes: [
    "@docusaurus/theme-mermaid",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        indexDocs: true,
        indexPages: true,
        indexBlog: false,
        docsRouteBasePath: "/docs",
        language: ["en"],
        hashed: true,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchBarPosition: "right",
      },
    ],
  ],
  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "docs",
          sidebarPath: require.resolve("./sidebars.js"),
          breadcrumbs: true,
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        sitemap: {
          changefreq: null,
          priority: null,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          { from: "/docs/analytics/cases/product-portfolio-and-lifecycle-case", to: "/docs/analytics/cases/product-portfolio-profitability-case" },
          { from: "/docs/analytics/cases/pricing-and-margin-governance-case", to: "/docs/analytics/cases/product-portfolio-profitability-case" },
          { from: "/docs/analytics/cases/demand-planning-and-replenishment-case", to: "/docs/analytics/cases/manufacturing-labor-cost-case" },
          { from: "/docs/analytics/cases/workforce-cost-and-org-control-case", to: "/docs/analytics/cases/workforce-coverage-and-attendance-case" },
          { from: "/docs/analytics/cases/working-capital-and-cash-conversion-case", to: "/docs/analytics/cases/financial-statement-bridge-case" },
          { from: "/docs/analytics/cases/capex-fixed-asset-lifecycle-case", to: "/docs/analytics/cases/financial-statement-bridge-case" },
          { from: "/docs/analytics/cases/master-data-and-workforce-audit-case", to: "/docs/analytics/cases/audit-review-pack-case" },
          { from: "/docs/analytics/cases/attendance-control-audit-case", to: "/docs/analytics/cases/audit-review-pack-case" },
          { from: "/docs/analytics/cases/replenishment-support-audit-case", to: "/docs/analytics/cases/audit-review-pack-case" },
          { from: "/docs/analytics/cases/pricing-governance-audit-case", to: "/docs/analytics/cases/audit-review-pack-case" },
          {
            to: "/docs/analytics/analysis-tracks",
            from: ["/docs/analytics/financial", "/docs/analytics/managerial", "/docs/analytics/audit"],
          },
          {
            to: "/docs/analytics",
            from: ["/docs/analytics/reports", "/docs/analytics/reports/lens-packs"],
          },
          {
            to: "/docs/analytics#statements-and-cash",
            from: ["/docs/analytics/reports/financial", "/docs/analytics/reports/executive-overview"],
          },
          {
            to: "/docs/analytics#sales-and-customers",
            from: ["/docs/analytics/reports/commercial-and-working-capital"],
          },
          {
            to: "/docs/analytics#production-and-planning",
            from: ["/docs/analytics/reports/managerial", "/docs/analytics/reports/operations-and-risk"],
          },
          {
            to: "/docs/analytics#people-and-payroll",
            from: ["/docs/analytics/reports/payroll-perspective"],
          },
          {
            to: "/docs/analytics#controls-and-exceptions",
            from: ["/docs/analytics/reports/audit"],
          },
          {
            to: "/docs/process-flows",
            from: ["/docs/process-models"],
          },
          {
            to: "/docs/",
            from: ["/docs/quick-start"],
          },
          {
            to: "/docs/",
            from: ["/docs/accounting-analytics-dataset"],
          },
          {
            to: "/docs/",
            from: ["/docs/accounting-sql-practice-database"],
          },
          {
            to: "/docs/processes/o2c#returns-credits-and-refunds",
            from: ["/docs/processes/o2c-returns-credits-refunds"],
          },
          {
            to: "/docs/processes/payroll#time-attendance-and-approved-hours",
            from: ["/docs/processes/time-clocks"],
          },
          {
            to: "/docs/analytics/cases/audit-review-pack-case",
            from: ["/docs/analytics/cases/audit-exception-lab"],
          },
        ],
      },
    ],
  ],
  customFields: {
    branding,
  },
  themeConfig: {
    image: "img/site-social-card.svg",
    metadata: [
      { name: "theme-color", content: "#196252" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    mermaid: {
      theme: {
        light: "neutral",
        dark: "forest",
      },
      options: {
        fontFamily: "IBM Plex Sans, Trebuchet MS, sans-serif",
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: "linear",
        },
        sequence: {
          useMaxWidth: true,
        },
      },
    },
    navbar: {
      title: branding.displayName,
      items: [
        {
          label: "Learn",
          position: "left",
          items: [
            { to: "/docs/", label: "Getting Started" },
            { to: "/docs/company-story", label: "Company Story" },
            { to: "/docs/process-flows", label: "Business Processes" },
            { to: "/docs/learn-and-practice", label: "Learn and Practice" },
            { to: "/docs/analytics/cases", label: "Cases" },
          ],
        },
        {
          label: "Explore",
          position: "left",
          items: [
            { to: "/docs/analytics", label: "Reports and Analytics" },
            { to: "/docs/analytics/analysis-tracks", label: "Query Library" },
            { to: "/docs/reference/schema", label: "Dataset Reference" },
            { to: "/docs/technical-guide", label: "Technical Guide" },
          ],
        },
        { to: "/docs/downloads", label: "Downloads", position: "left" },
        {
          to: "/docs/teach-with-data/instructor-adoption",
          label: "For Instructors",
          position: "left",
        },
        {
          label: "Hub & Textbook",
          position: "right",
          items: [
            { href: "https://accountinganalyticshub.com/", label: "Accounting Analytics Hub" },
            { href: "https://aa.accountinganalyticshub.com/", label: "Accounting Analytics Textbook" },
          ],
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Learn",
          items: [
            { label: "Getting Started", to: "/docs/" },
            { label: "Company Story", to: "/docs/company-story" },
            { label: "Learn and Practice", to: "/docs/learn-and-practice" },
            { label: "Downloads", to: "/docs/downloads" },
          ],
        },
        {
          title: "Investigate",
          items: [
            { label: "Business Processes", to: "/docs/process-flows" },
            { label: "Cases", to: "/docs/analytics/cases" },
            { label: "Reports and Analytics", to: "/docs/analytics" },
            { label: "Dataset Reference", to: "/docs/reference/schema" },
          ],
        },
        {
          title: "Teach and Connect",
          items: [
            {
              label: "Instructor Adoption Guide",
              to: "/docs/teach-with-data/instructor-adoption",
            },
            { label: "Accounting Analytics Hub", href: "https://accountinganalyticshub.com/" },
            { label: "Accounting Analytics Textbook", href: "https://aa.accountinganalyticshub.com/" },
          ],
        },
        {
          title: "Repository",
          items: [
            {
              label: "GitHub Repository",
              href: branding.repositoryUrl,
            },
            {
              label: `Teaching Release ${TEACHING_RELEASE.tag}`,
              href: getTeachingReleaseUrl(branding.repositoryUrl),
            },
            {
              label: "Contributing",
              to: "/docs/technical/contributing",
            },
            {
              label: "License",
              to: "/docs/technical/license",
            },
          ],
        },
      ],
      copyright: `Copyright &copy; ${new Date().getFullYear()} <a href="https://AccountingAnalyticsHub.com" target="_blank" rel="noopener noreferrer">Accounting Analytics Hub</a>.`,
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ["sql"],
    },
  },
};

module.exports = config;
