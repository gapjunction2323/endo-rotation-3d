# Regenerates the PNG app icons in ../icons using System.Drawing (Windows PowerShell).
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot '..\icons'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-Icon([int]$size, [string]$name, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'

  $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(11, 19, 36)), ([System.Drawing.Color]::FromArgb(19, 40, 74)), 45
  $g.FillRectangle($bg, $rect)

  # Safe zone: maskable icons keep artwork inside the central 80%.
  $scale = if ($maskable) { 0.62 } else { 0.78 }
  $d = [int]($size * $scale)
  $o = [int](($size - $d) / 2)

  $ringPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(45, 212, 191)), ([float]($size * 0.045))
  $g.DrawEllipse($ringPen, $o, $o, $d, $d)

  # Feedback-loop arc
  $arcPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(56, 189, 248)), ([float]($size * 0.03))
  $inset = [int]($d * 0.12)
  $g.DrawArc($arcPen, $o + $inset, $o + $inset, $d - 2 * $inset, $d - 2 * $inset, 200, 140)

  $font = New-Object System.Drawing.Font 'Segoe UI', ([float]($size * $scale * 0.25)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'
  $fmt.LineAlignment = 'Center'
  $textRect = New-Object System.Drawing.RectangleF 0, ([float]($size * 0.03)), $size, $size
  $g.DrawString('ENDO', $font, [System.Drawing.Brushes]::White, $textRect, $fmt)

  $bmp.Save((Join-Path $outDir $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-Icon 192 'icon-192.png' $false
New-Icon 512 'icon-512.png' $false
New-Icon 512 'icon-maskable-512.png' $true
New-Icon 180 'apple-touch-icon.png' $false
Write-Output "Icons written to $outDir"
