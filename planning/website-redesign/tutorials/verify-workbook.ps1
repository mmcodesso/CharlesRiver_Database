$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.IO.Compression;
using System.Xml;
using System.Xml.Linq;
using System.Linq;
using System.Collections.Generic;
public static class TutorialWorkbookReader {
  public static Dictionary<string,Dictionary<string,string>> Read(string file, int sheet, string[] wanted) {
    var ids = new HashSet<string>(wanted);
    var result = new Dictionary<string,Dictionary<string,string>>();
    using (var zip=ZipFile.OpenRead(file))
    using (var stream=zip.GetEntry("xl/worksheets/sheet"+sheet+".xml").Open())
    using (var reader=XmlReader.Create(stream)) {
      XNamespace ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main";
      var headers=new Dictionary<string,string>();
      while(reader.ReadToFollowing("row")) {
        XElement row;
        using(var sub=reader.ReadSubtree()) row=XElement.Load(sub);
        var cells=row.Elements(ns+"c").ToArray();
        if((string)row.Attribute("r")=="1") {
          foreach(var c in cells) {
            var col=new string(((string)c.Attribute("r")).TakeWhile(Char.IsLetter).ToArray());
            headers[col]=String.Concat(c.Descendants(ns+"t").Select(x=>x.Value));
          }
          continue;
        }
        if(cells.Length==0)continue;
        var id=cells[0].Element(ns+"v")?.Value;
        if(id==null || !ids.Contains(id))continue;
        var data=new Dictionary<string,string>();
        foreach(var c in cells) {
          var col=new string(((string)c.Attribute("r")).TakeWhile(Char.IsLetter).ToArray());
          var type=(string)c.Attribute("t")??"n";
          var value=type=="inlineStr"?String.Concat(c.Descendants(ns+"t").Select(x=>x.Value)):c.Element(ns+"v")?.Value;
          data[headers[col]]=type+"|"+(value??"");
        }
        result[id]=data;
        if(result.Count==ids.Count)break;
      }
    }
    return result;
  }
}
'@
$taskRepo=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../..')).Path
$taskFile=Join-Path $taskRepo 'outputs/CharlesRiver.xlsx'
$taskChecks=Get-Content -LiteralPath (Join-Path $taskRepo 'outputs/_website_redesign/tutorials/workbook-check-input.json') -Raw | ConvertFrom-Json
$taskTableNumbers=@{}
$taskZip=[System.IO.Compression.ZipFile]::OpenRead($taskFile)
try {
  foreach($taskEntry in ($taskZip.Entries | Where-Object FullName -Match '^xl/tables/table[0-9]+\.xml$')) {
    $taskReader=[System.IO.StreamReader]::new($taskEntry.Open())
    try { [xml]$taskTable=$taskReader.ReadToEnd() } finally {$taskReader.Dispose()}
    if($taskTable.table.name -match '^T([0-9]+)_(.+)$') {$taskTableNumbers[$Matches[2]]=[int]$Matches[1]}
  }
} finally {$taskZip.Dispose()}
$taskRows=0
$taskCells=0
foreach($taskCheck in $taskChecks) {
  $taskIDs=[string[]]@($taskCheck.rows | ForEach-Object { [string]$_.$($taskCheck.key) })
  $taskActual=[TutorialWorkbookReader]::Read($taskFile,$taskTableNumbers[$taskCheck.table],$taskIDs)
  if($taskActual.Count -ne $taskCheck.rows.Count) {throw "Missing workbook rows: $($taskCheck.table)"}
  foreach($taskExpected in $taskCheck.rows) {
    $taskID=[string]$taskExpected.$($taskCheck.key)
    foreach($taskProperty in $taskExpected.PSObject.Properties) {
      $taskName=$taskProperty.Name
      $taskValue=$taskProperty.Value
      $taskParts=$taskActual[$taskID][$taskName] -split '\|',2
      $taskRaw=if($taskParts.Count -eq 2){$taskParts[1]}else{''}
      $taskLabel="$($taskCheck.table)[$taskID].$taskName"
      if($null -eq $taskValue) {if($taskRaw -ne ''){throw "Unexpected nonblank $taskLabel"}}
      elseif($taskValue -is [string]) {
        if($taskParts[0] -eq 'n' -and $taskValue -match '^\d{4}-\d{2}-\d{2}') {
          $taskDate=[datetime]::FromOADate([double]::Parse($taskRaw,[Globalization.CultureInfo]::InvariantCulture))
          $taskFormat=if($taskValue.Length -gt 10){'yyyy-MM-dd HH:mm:ss'}else{'yyyy-MM-dd'}
          $taskRaw=$taskDate.ToString($taskFormat)
        }
        if($taskRaw -cne $taskValue){throw "Workbook differs at $taskLabel : $taskRaw versus $taskValue"}
      } else {
        if($taskRaw -eq '' -or [math]::Abs([double]::Parse($taskRaw,[Globalization.CultureInfo]::InvariantCulture)-[double]$taskValue) -gt 0.000001){throw "Numeric workbook difference at $taskLabel"}
      }
      $taskCells++
    }
    $taskRows++
  }
  Write-Output "PASS: $($taskCheck.table), $($taskActual.Count) selected rows"
}
Write-Output "PASS: $taskRows rows and $taskCells cells across $($taskChecks.Count) tables agree between released Excel and SQLite."
