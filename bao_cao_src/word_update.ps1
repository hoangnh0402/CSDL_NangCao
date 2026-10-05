param([string]$Docx, [string]$Pdf, [switch]$UnlinkLists)
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($Docx, $false, $false)
  for ($k = 0; $k -lt 2; $k++) {
    foreach ($t in $doc.TablesOfContents) { $t.Update() }
    $doc.Fields.Update() | Out-Null
    $doc.Repaginate()
  }
  if ($UnlinkLists) {
    # Danh mục hình (TOC 2) và bảng (TOC 3) -> văn bản tĩnh để Google Docs không dựng lại thành mục lục tiêu đề
    foreach ($k in 3, 2) {
      $r = $doc.TablesOfContents.Item($k).Range
      $r.Fields.Unlink()
      $r.Font.Underline = 0
      $r.Font.Color = -16777216
    }
  }
  $doc.Save()
  $pages = $doc.ComputeStatistics(2)
  # số trang của từng section
  $info = @()
  foreach ($s in $doc.Sections) {
    $st = $s.Range.Information(3); $en = $s.Range.Information(3)
    $info += ('section ' + $s.Index + ': start page ' + $s.Range.Characters.First.Information(3) + ' end page ' + $s.Range.Characters.Last.Information(3))
  }
  if ($Pdf) { $doc.ExportAsFixedFormat($Pdf, 17) }
  $doc.Close($false)
  Write-Output ("TOTAL_PAGES=" + $pages)
  $info | ForEach-Object { Write-Output $_ }
} finally {
  $word.Quit()
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
