const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const build = path.join(root,'build');
const sitemap = fs.readFileSync(path.join(build,'sitemap.xml'),'utf8');
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
const target = pathname => [pathname.replace(/^\//,''), pathname.replace(/^\//,'')+'.html', path.join(pathname.replace(/^\//,''),'index.html')]
  .map(name => path.join(build,name)).find(name => fs.existsSync(name) && fs.statSync(name).isFile());
const ids = new Map();
const missing = new Map();
const fragments = [];
let linkCount = 0;
for (const route of routes) {
  const file = target(route);
  if (!file) throw new Error('Missing page '+route);
  const html = fs.readFileSync(file,'utf8');
  for (const [,raw] of html.matchAll(/<a\b[^>]*href="([^"]*)"/g)) {
    const href = raw.replaceAll('&amp;','&');
    if ((!href.startsWith('/') && !href.startsWith('#')) || href.startsWith('//')) continue;
    linkCount++;
    const url = new URL(href,'https://charlesriver.accountinganalyticshub.com'+route);
    const file = target(decodeURIComponent(url.pathname));
    if (!file) {
      if (!missing.has(url.pathname)) missing.set(url.pathname,new Set());
      missing.get(url.pathname).add(route);
      continue;
    }
    if (url.hash && file.endsWith('.html')) {
      if (!ids.has(file)) ids.set(file,new Set([...fs.readFileSync(file,'utf8').matchAll(/\bid="([^"]+)"/g)].map(match => match[1])));
      if (!ids.get(file).has(decodeURIComponent(url.hash.slice(1)))) fragments.push({route,href});
    }
  }
}
const result = {
  sitemapRoutes: routes.length,
  internalLinkOccurrences: linkCount,
  missingTargets: [...missing].map(([target,origins]) => ({target,from:[...origins]})),
  missingFragments: fragments,
};
fs.writeFileSync(path.join(__dirname,'rendered-link-audit.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,missingTargets:result.missingTargets.map(item=>item.target)},null,2));
if (fragments.length || result.missingTargets.some(item => !item.target.startsWith('/reports/'))) process.exitCode=1;
