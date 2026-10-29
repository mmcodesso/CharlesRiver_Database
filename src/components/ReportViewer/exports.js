import modelHelpers from './model.cjs';
const { format } = modelHelpers;
const navy = '193F4A';
const teal = '176D73';
const units = 'Amounts in USD. Hours, quantities and percentages as labeled.';

function flatRows(model) {
  const rows = [];
  let group;
  for (const row of model.rows) {
    if (row.group && group !== row.group && row.type !== 'subtotal') {
      group = row.group;
      rows.push({ values: { [model.columns[0].key]: group }, type: 'heading' });
    }
    rows.push(row);
  }
  if (Object.keys(model.totals).length) rows.push({ values: { ...model.totals, [model.columns[0].key]: 'Selected total' }, type: 'subtotal' });
  return rows;
}

export async function createExport({ type, report, model, company, basis }) {
  if (!model.source.length) throw new Error('There are no rows to export.');
  if (type === 'pdf' && model.source.length > 10000) throw new Error('Choose a narrower period or filter for PDF. Excel includes the complete selection.');
  const rows = flatRows(model);
  const metadata = [model.selection, units, basis];
  if (type === 'xlsx') {
    const module = await import('exceljs');
    const ExcelJS = module.default || module;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = company;
    const sheet = workbook.addWorksheet('Report');
    sheet.properties.defaultRowHeight = 20;
    const width = model.columns.length;
    sheet.addRow([company]);
    sheet.addRow([report.title]);
    metadata.forEach(text => sheet.addRow([text]));
    for (let n = 1; n <= 5; n++) {
      if (width > 1) sheet.mergeCells(n, 1, n, width);
      sheet.getRow(n).height = n === 3 || n === 5 ? 34 : 24;
      sheet.getCell(n, 1).alignment = { wrapText: true, vertical: 'middle' };
    }
    sheet.getCell('A1').font = { name: 'Aptos', size: 11, color: { argb: teal } };
    sheet.getCell('A2').font = { name: 'Georgia', size: 18, bold: true, color: { argb: navy } };
    sheet.addRow(model.columns.map(c => c.label));
    rows.forEach(row => {
      const added = sheet.addRow(model.columns.map(c => {
        const value = row.values[c.key] ?? null;
        return c.kind === 'date' && value ? new Date(`${value}T00:00:00Z`) : c.kind === 'percent' && value !== null && c.key !== 'AbsenceRate' ? Number(value) / 100 : value;
      }));
      added.alignment = { vertical: 'top', wrapText: true };
      added.height = row.type === 'heading' ? 25 : Math.max(22, ...model.columns.map(c => Math.ceil(String(row.values[c.key] ?? '').length / (c.kind === 'text' ? 32 : 16)) * 15));
      if (row.type === 'heading' && width > 1) sheet.mergeCells(added.number, 1, added.number, width);
      if (row.type === 'heading' || row.type === 'subtotal') {
        added.font = { bold: true, color: { argb: navy } };
        added.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row.type === 'heading' ? 'E8F1EF' : 'F0F3F4' } }; });
      }
    });
    model.columns.forEach((c, index) => {
      const column = sheet.getColumn(index + 1);
      column.width = c.kind === 'text' ? (index === 0 ? 45 : 28) : 19;
      for (let n = 7; n <= sheet.rowCount; n++) {
        const cell = sheet.getCell(n, index + 1);
        if (rows[n - 7]?.type === 'heading') {
          if (index === 0) { cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }; cell.numFmt = '@'; }
          continue;
        }
        cell.numFmt = c.kind === 'date' ? 'mm/dd/yy' : c.kind === 'percent' ? '0.00%;(0.00%);"â€”"' : c.kind === 'integer' ? '#,##0;(#,##0);"â€”"' : c.kind === 'text' ? '@' : '#,##0.00;(#,##0.00);"â€”"';
        cell.alignment = { ...cell.alignment, horizontal: c.kind === 'text' ? 'left' : 'right', indent: report.family === 'statement' && index === 0 && rows[n - 7]?.type === 'account' ? 1 : 0 };
      }
    });
    sheet.getRow(6).height = 38;
    sheet.getRow(6).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navy } };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { wrapText: true, vertical: 'middle' };
    });
    sheet.views = [{ state: 'frozen', ySplit: 6, xSplit: 1, showGridLines: false }];
    sheet.pageSetup = { paperSize: 1, orientation: width > 4 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: width > 8 ? Math.ceil((width - 1) / 4) : 1, fitToHeight: 0, printTitlesRow: '1:6', printTitlesColumn: 'A:A', printArea: `A1:${sheet.getColumn(width).letter}${sheet.rowCount}` };
    sheet.headerFooter.oddFooter = '&L' + company + '&RPage &P of &N';
    const data = workbook.addWorksheet('Data');
    const sourceFields = report.fields;
    data.addTable({ name: 'ReportData', ref: 'A1', headerRow: true, style: { theme: 'TableStyleMedium2', showRowStripes: true }, columns: sourceFields.map(f => ({ name: f.key, filterButton: true })), rows: model.source.map(row => sourceFields.map(f => f.kind === 'date' && row[f.key] ? new Date(`${row[f.key]}T00:00:00Z`) : row[f.key] ?? null)) });
    sourceFields.forEach((field, i) => {
      const column = data.getColumn(i + 1);
      column.width = field.kind === 'text' ? 28 : 20;
      column.numFmt = field.kind === 'date' ? 'mm/dd/yy' : field.kind === 'text' ? '@' : field.kind === 'integer' ? '#,##0' : '#,##0.00';
    });
    data.views = [{ state: 'frozen', ySplit: 1 }];
    const readme = workbook.addWorksheet('Read Me');
    readme.getColumn(1).width = 24;
    readme.getColumn(2).width = 105;
    [['Report', report.title], ['Selection', model.selection], ['Units', units], ['Period basis', basis], ['Source SQL', report.query_path], ['Source rows', model.source.length], ['Interpretation', 'Source values and supplied statement subtotals are preserved. Percentages and snapshot balances are not added across periods. Exception flags require investigation.'], ['Data sheet', 'Contains complete selected source rows. Percentage fields retain source units (Pct fields use percentage points; AbsenceRate uses a fraction).']].forEach(row => { const added = readme.addRow(row); added.alignment = { wrapText: true, vertical: 'top' }; added.height = 36; });
    return { bytes: await workbook.xlsx.writeBuffer(), mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx' };
  }
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: model.columns.length > 4 ? 'landscape' : 'portrait', unit: 'pt', format: 'letter' });
  doc.setProperties({ title: report.title, author: company });
  // Repeat the line/entity column on each horizontal panel rather than shrinking text.
  const panels = [];
  const numeric = model.columns.slice(1);
  const panelSize = report.family === 'statement' ? 4 : 5;
  for (let start = 0; start < numeric.length; start += panelSize) panels.push([model.columns[0], ...numeric.slice(start, start + panelSize)]);
  if (!panels.length) panels.push(model.columns);
  let firstPage = true;
  for (const columns of panels) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const tableWidth = pageWidth - 64;
    const firstWidth = report.family === 'statement' ? 220 : 150;
    const weights = columns.slice(1).map(c => c.kind === 'text' ? 1.6 : 1);
    const weightSum = weights.reduce((sum, value) => sum + value, 0);
    const widths = [firstWidth, ...weights.map(w => (tableWidth - firstWidth) * w / weightSum)];
    const titleLines = doc.splitTextToSize(report.title, tableWidth / 1.8);
    const metaLines = metadata.flatMap(text => doc.splitTextToSize(text, tableWidth));
    const top = 60 + titleLines.length * 20 + metaLines.length * 10;
    const headerHeight = Math.max(...columns.map((c, i) => doc.splitTextToSize(c.label, widths[i] - 12).length)) * 12 + 14;
    function height(row) {
      doc.setFont('helvetica', row.type === 'heading' || row.type === 'subtotal' ? 'bold' : 'normal');
      doc.setFontSize(9);
      if (row.type === 'heading') return Math.max(25, doc.splitTextToSize(String(row.values[model.columns[0].key]), tableWidth - 12).length * 12 + 12);
      return Math.max(...columns.map((c, i) => doc.splitTextToSize(format(row.values[c.key], c.kind, c.key), widths[i] - 12).length)) * 12 + 12;
    }
    const heights = rows.map(height);
    const chunks = [];
    let chunk = [], used = headerHeight;
    rows.forEach((row, index) => {
      const needed = heights[index] + (row.type === 'heading' ? heights[index + 1] || 0 : 0);
      if (chunk.length && used + needed > pageHeight - top - 46) { chunks.push(chunk); chunk = []; used = headerHeight; }
      chunk.push(row); used += heights[index];
    });
    if (chunk.length) chunks.push(chunk);
    for (const pageRows of chunks) {
      if (!firstPage) doc.addPage();
      firstPage = false;
      doc.setTextColor(23, 109, 115); doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(company, 32, 27);
      doc.setTextColor(25, 63, 74); doc.setFont('times', 'bold'); doc.setFontSize(18);
      doc.text(titleLines, 32, 49);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text(metaLines, 32, 56 + titleLines.length * 20);
      autoTable(doc, {
        startY: top,
        head: [columns.map(c => c.label)],
        body: pageRows.map(row => row.type === 'heading'
          ? [{ content: row.values[model.columns[0].key], colSpan: columns.length }]
          : columns.map(c => format(row.values[c.key], c.kind, c.key))),
        margin: { top, bottom: 44, left: 32, right: 32 },
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 5, overflow: 'linebreak', textColor: [25, 45, 54] },
        headStyles: { fillColor: [25, 63, 74], textColor: [255, 255, 255], fontSize: 9 },
        alternateRowStyles: { fillColor: [247, 249, 248] },
        rowPageBreak: 'avoid', showHead: 'everyPage',
        columnStyles: Object.fromEntries(columns.map((c, i) => [i, { halign: c.kind === 'text' || c.kind === 'date' ? 'left' : 'right', cellWidth: widths[i] }])),
        didParseCell(data) {
          if (data.section !== 'body') return;
          const row = pageRows[data.row.index];
          if (row.type === 'heading' || row.type === 'subtotal') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = row.type === 'heading' ? [232, 241, 239] : [239, 243, 244];
            data.cell.styles.halign = row.type === 'heading' ? 'left' : data.cell.styles.halign;
          }
        },
      });
    }
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(60);
    doc.text(`${company}  |  Page ${page} of ${pages}`, 32, doc.internal.pageSize.getHeight() - 20);
  }
  return { bytes: doc.output('arraybuffer'), mime: 'application/pdf', extension: 'pdf' };
}
