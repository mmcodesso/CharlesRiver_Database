const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const test = require('node:test');
const yaml = require('js-yaml');
const { DatabaseSync } = require('node:sqlite');
const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const examples = require('../../planning/website-redesign/cases/verified-examples.json');
const legacy = require('../../planning/website-redesign/cases/legacy-routes.json');
const drafts = require('../../planning/website-redesign/cases/case-drafts.json');
const figures = require('../../src/data/caseFigures.json');
const built = route => {
  const p = ['build'+route+'.html','build'+route+'/index.html'].find(p=>fs.existsSync(path.join(root,p)));
  assert.ok(p,route); return read(p);
};

test('eight cases retain the learning sequence, both routes, session outputs, and challenge boundary',()=>{
  assert.equal(drafts.length,8);
  assert.deepEqual(drafts.map(c=>c.level),['Basic','Basic','Basic','Intermediate','Intermediate','Intermediate','Advanced','Advanced']);
  const sidebar = require('../../sidebars.js').docsSidebar.find(s=>s.label==='Cases');
  assert.deepEqual(sidebar.items,drafts.map(c=>'analytics/cases/'+c.slug));
  for(const c of drafts){
    const source=read('docs/analytics/cases/'+c.slug+'.md');
    const meta=yaml.load(source.split('---')[1]);
    assert.equal(meta.case_number,c.number);
    assert.equal(meta.case_sessions,c.sessions);
    assert.equal((source.match(/^## Session /gm)||[]).length,c.sessions);
    assert.equal((source.match(/<TabItem value="excel">/g)||[]).length,(source.match(/<TabItem value="sql">/g)||[]).length);
    for(const heading of ['Key Data Sources','Recommended Query Sequence','Next Steps','Independent Challenge'])assert.ok(source.includes('## '+heading));
    const challenge=source.split('## Independent Challenge')[1].split('\n## ')[0];
    assert.ok(challenge.includes('Assessment criteria'));
    assert.ok(!challenge.includes('~~~text')&&!challenge.includes('sql title='),'No public challenge solution');
    const html=built('/docs/analytics/cases/'+c.slug);
    assert.match(html,/"learningResourceType":"Case study"/);
    assert.ok(html.includes('Session stopping point'));
    assert.equal((html.match(/src="\/diagrams\/cases\//g)||[]).length,c.level==='Basic'?3:c.level==='Intermediate'?4:5);
  }
});

test('all authored case SQL executes read-only and matches reviewed results',()=>{
  const file=path.join(root,'outputs/CharlesRiver.sqlite');
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),examples.sha256);
  const db=new DatabaseSync(file,{readOnly:true});
  try {
    const published=[];
    for(const c of drafts){
      const page='docs/analytics/cases/'+c.slug+'.md';
      for(const m of read(page).matchAll(/\x60\x60\x60sql title="([^"]+)"\n([\s\S]*?)\n\x60\x60\x60/g))published.push({page,name:m[1],sql:m[2]});
    }
    assert.equal(published.length,62);
    assert.equal(new Set(published.map(x=>x.name)).size,published.length);
    for(const p of published){
      assert.match(p.sql,/^(SELECT|WITH)\b/i);
      assert.doesNotMatch(p.sql,/\b(INSERT|UPDATE|DELETE|DROP|ATTACH|CREATE|REPLACE)\b/i);
      const expected=examples.examples.find(e=>e.name===p.name);
      assert.ok(expected,p.name);assert.equal(expected.page,p.page);assert.equal(expected.sql,p.sql);
      // JSON represents rounded negative zero as zero, as the saved fixture does.
      const actual = JSON.parse(JSON.stringify(db.prepare(p.sql).all()));
      assert.deepEqual(actual,expected.expected,p.name);
    }
    const result=name=>examples.examples.find(x=>x.name===name+'.sql').expected;
    assert.equal(result('c01-orders').length,6);
    assert.equal(result('c01-fulfillment').length,22);
    assert.equal(result('c01-balances').filter(r=>r.AsOf==='2024-03-31').length,17);
    assert.equal(result('c01-balances').filter(r=>r.AsOf==='2024-04-30').length,20);
    assert.equal(result('c02-cutoff')[0].Entries,204);
    assert.equal(result('c05-costs').length,336);
    assert.equal(result('c05-timing')[0].ClosedByCutoff,290);
    assert.equal(result('c06-unpaid')[0].NetPay,7971.1);
    const profit=result('c07-profit').reduce((s,r)=>s+r.PreCloseProfit,0);
    const effects=result('c07-bridge').reduce((s,r)=>s+r.BridgeEffect,0);
    const cash=result('c07-rollforward').find(r=>r.AccountNumber===1010);
    assert.ok(Math.abs(profit+effects-cash.QuarterDebitNet)<0.005);
    assert.ok(Math.abs(cash.OpeningDebitNet+cash.QuarterDebitNet-cash.ClosingDebitNet)<0.005);
    assert.equal(result('c07-annual-check')[0].AnnualPostClosePL,0);
    assert.equal(result('c08-overtime').length,1895);
    assert.equal(result('c08-overtime').filter(r=>r.HoursTest==='Missing linked approval').length,336);
    assert.equal(result('c08-duplicates').length,12);
    assert.equal(result('c08-checks').length,4);
  } finally { db.close(); }
});

test('31 Draw.io sources match accessible native SVG exports',()=>{
  assert.equal(figures.length,31);
  for(const f of figures){
    const stem='static/diagrams/cases/'+f.id;
    const xml=read(stem+'.drawio'), svg=read(stem+'.svg');
    assert.match(xml,/<mxGraphModel/);
    assert.ok(xml.includes('id="n0"')&&xml.includes('id="n2"'));
    assert.match(svg,/content="/);
    assert.match(svg,/<title id="case-title">/);
    assert.match(svg,/<desc id="case-description">/);
    const sha=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,stem+'.drawio'))).digest('hex');
    assert.ok(svg.includes('data-source-sha256="'+sha+'"'),f.id);
    assert.equal(read('build/diagrams/cases/'+f.id+'.svg'),svg);
    assert.equal(f.steps.length,3);
  }
});

test('retired routes redirect directly and all established case fragments survive',()=>{
  const config=require('../../docusaurus.config.js');
  const redirects=config.plugins.find(([p])=>p==='@docusaurus/plugin-client-redirects')[1].redirects;
  const sitemap=read('build/sitemap.xml');
  let retired=0;
  for(const [old,item] of Object.entries(legacy)){
    const html=built('/docs/analytics/cases/'+item.destination);
    for(const id of item.anchors)assert.ok(html.includes('id="'+id+'"'),old+'#'+id);
    if(old!==item.destination){
      retired++;
      const r=redirects.find(r=>[].concat(r.from).includes('/docs/analytics/cases/'+old));
      assert.equal(r.to,'/docs/analytics/cases/'+item.destination);
      const redirect=built('/docs/analytics/cases/'+old);
      assert.ok(redirect.includes('window.location.hash'));
      assert.ok(!sitemap.includes('/docs/analytics/cases/'+old+'</loc>'));
    }
  }
  assert.equal(retired,10);
});
