const fs = require('node:fs');
const path = require('node:path');

module.exports = function reportPages(context) {
  return {
    name: 'report-presentation-pages',
    async loadContent() {
      const source = path.join(context.siteDir, 'static/report-data/manifest.json');
      if (!fs.existsSync(source)) throw new Error('Run npm run prepare-report-presentation with existing report assets first.');
      return JSON.parse(fs.readFileSync(source, 'utf8'));
    },
    async contentLoaded({ content, actions }) {
      for (const [slug, report] of Object.entries(content)) {
        const data = await actions.createData(`${slug}.json`, JSON.stringify(report));
        actions.addRoute({
          path: `/docs/analytics/reports/${slug}`,
          component: '@site/src/components/ReportViewer',
          modules: { report: data },
          exact: true,
        });
      }
    },
  };
};
