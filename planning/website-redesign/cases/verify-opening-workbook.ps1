$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -TypeDefinition @'
using System; using System.IO; using System.IO.Compression; using System.Xml; using System.Xml.Linq; using System.Linq; using System.Collections.Generic; using System.Globalization;
public static class CaseLedgerReader {
 public static string Read(string file) {
  var sums=new SortedDictionary<int,decimal[]>(); int history=0,quarter=0;
  using(var z=ZipFile.OpenRead(file)) using(var s=z.GetEntry("xl/worksheets/sheet3.xml").Open()) using(var r=XmlReader.Create(s)) {
   while(r.ReadToFollowing("row")) { XElement row; using(var sub=r.ReadSubtree()) row=XElement.Load(sub); if((string)row.Attribute("r")=="1")continue;
    var vals=new Dictionary<string,string>(); XNamespace ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    foreach(var c in row.Elements(ns+"c")){var col=new string(((string)c.Attribute("r")).TakeWhile(Char.IsLetter).ToArray());if(col=="B"||col=="C"||col=="D"||col=="E") vals[col]=c.Element(ns+"v")?.Value ?? String.Concat(c.Descendants(ns+"t").Select(x=>x.Value));}
    DateTime d; if(!DateTime.TryParse(vals["B"],CultureInfo.InvariantCulture,DateTimeStyles.None,out d)) d=DateTime.FromOADate(double.Parse(vals["B"],CultureInfo.InvariantCulture));
    if(d>new DateTime(2026,12,31))continue; var id=int.Parse(vals["C"]);var amount=decimal.Parse(vals["D"],CultureInfo.InvariantCulture)-decimal.Parse(vals["E"],CultureInfo.InvariantCulture);
    if(!sums.ContainsKey(id))sums[id]=new decimal[3]; int bucket=d<new DateTime(2026,10,1)?0:1;if(bucket==0)history++;else quarter++;sums[id][bucket]+=amount;sums[id][2]+=amount;
   }
  }
  return "{\"history\":"+history+",\"quarter\":"+quarter+",\"accounts\":["+String.Join(",",sums.Select(k=>"{\"AccountID\":"+k.Key+",\"Opening\":"+k.Value[0].ToString(CultureInfo.InvariantCulture)+",\"Quarter\":"+k.Value[1].ToString(CultureInfo.InvariantCulture)+",\"Closing\":"+k.Value[2].ToString(CultureInfo.InvariantCulture)+"}"))+"]}";
 }
}
'@
$taskRepo=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../..')).Path
$taskResult=[CaseLedgerReader]::Read((Join-Path $taskRepo 'outputs/CharlesRiver.xlsx'))
$taskResult | Set-Content -LiteralPath (Join-Path $taskRepo 'outputs/_website_redesign/cases/workbook-opening-result.json') -Encoding utf8
Write-Output 'Read full published workbook ledger and aggregated prior history, quarter movement, and closing balances.'
