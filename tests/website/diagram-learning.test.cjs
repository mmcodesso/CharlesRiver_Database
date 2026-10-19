const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const schema = require('../../src/data/schemaDiagrams.json');
const evidence = require('../../src/data/processEvidenceDiagrams.json');
const catalogs = { er:schema, evidence, bpmn:require('../../src/data/bpmnModels.json'), tutorials:require('../../src/data/tutorialFigures.json'), cases:require('../../src/data/caseFigures.json') };
const built = route => {
  const file = ['build'+route+'.html','build'+route+'/index.html'].find(file=>fs.existsSync(path.join(root,file)));
  assert.ok(file,route);return read(file);
};

test('schema renders every focused view and all primary table grains before JavaScript',()=>{
  const html = built('/docs/reference/schema');
  assert.equal(schema.length,19);
  assert.equal(schema.flatMap(m=>m.primary).length,82);
  for(const model of schema) {
    assert.equal(html.split('id="er-'+model.id+'"').length-1,1,model.id);
    for(const table of model.tables.filter(t=>t.primary)) {
      assert.ok(html.includes(table.name),table.name);
      assert.ok(html.includes(table.grain),table.grain);
    }
    for(const route of [model.processPath,model.exercisePath,model.casePath])built(route);
  }
  assert.ok(html.includes('(FK) marks a foreign key.'));
  assert.ok(!html.includes('does not enforce')&&!html.includes('not an enforced'));
});

test('all 107 native sources and SVG exports reach the production build unchanged',()=>{
  assert.equal(Object.values(catalogs).flat().length,107);
  for(const [family,models] of Object.entries(catalogs))for(const model of models)for(const extension of ['drawio','svg']) {
    const asset='diagrams/'+family+'/'+model.id+'.'+extension;
    assert.equal(read('static/'+asset),read('build/'+asset),asset);
  }
});

test('every published diagram uses Draw.io with a named native asset',()=>{
  const walk = dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
  const docs=walk(path.join(root,'docs')).filter(f=>f.endsWith('.md'));
  for(const file of docs)assert.ok(!fs.readFileSync(file,'utf8').includes('```mermaid'),file);
  assert.equal(evidence.length,34);
  for(const model of evidence)assert.ok(model.title && model.alt && model.relationships.length);
});
