Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$outDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# The in-game Speedometer uses Tailwind w-48 h-24 and SVG viewBox 0 0 200 100.
# Export at 5.12x that exact ratio so the sprite downscales cleanly in the current UI.
$w = 1024
$h = 512
$pivotX = 512.0
$pivotY = 472.0
$outerR = 432.0
$innerR = 305.0
$gearOuterR = 315.0
$gearInnerR = 230.0
$numberR = 360.0
$minorTickOuterR = 416.0
$minorTickInnerR = 392.0
$majorTickOuterR = 420.0
$majorTickInnerR = 372.0

function New-Bitmap($width, $height) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    return @($bmp, $g)
}

function Brush($hex) {
    return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function Pen($hex, $width) {
    $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($hex)), $width
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Flat
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Flat
    return $pen
}

function Point-OnGauge($speed, $radius) {
    $deg = 180.0 + (($speed / 140.0) * 180.0)
    $rad = $deg * [Math]::PI / 180.0
    return New-Object System.Drawing.PointF (($pivotX + [Math]::Cos($rad) * $radius)), (($pivotY + [Math]::Sin($rad) * $radius))
}

function Draw-CenteredText($g, $text, $font, $brush, $x, $y) {
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($text, $font, $brush, (New-Object System.Drawing.PointF $x, $y), $fmt)
    $fmt.Dispose()
}

function Draw-ArcBand($g, $fromSpeed, $toSpeed, $outerRadius, $innerRadius, $fillHex) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $start = 180.0 + (($fromSpeed / 140.0) * 180.0)
    $sweep = (($toSpeed - $fromSpeed) / 140.0) * 180.0
    $outerRect = New-Object System.Drawing.RectangleF ($pivotX - $outerRadius), ($pivotY - $outerRadius), ($outerRadius * 2), ($outerRadius * 2)
    $path.AddArc($outerRect, $start, $sweep)
    if ($innerRadius -le 0) {
        $path.AddLine((Point-OnGauge $toSpeed $outerRadius), (New-Object System.Drawing.PointF $pivotX, $pivotY))
        $path.AddLine((New-Object System.Drawing.PointF $pivotX, $pivotY), (Point-OnGauge $fromSpeed $outerRadius))
    } else {
        $innerRect = New-Object System.Drawing.RectangleF ($pivotX - $innerRadius), ($pivotY - $innerRadius), ($innerRadius * 2), ($innerRadius * 2)
        $path.AddArc($innerRect, $start + $sweep, -$sweep)
    }
    $path.CloseFigure()
    $g.FillPath((Brush $fillHex), $path)
    $path.Dispose()
}

function Draw-Needle($g, $speed, $includeHub) {
    $angle = 180.0 + (($speed / 140.0) * 180.0)
    $rad = $angle * [Math]::PI / 180.0
    $tipR = 422.0
    $tailR = 44.0
    $halfW = 15.0
    $ux = [Math]::Cos($rad)
    $uy = [Math]::Sin($rad)
    $px = -$uy
    $py = $ux
    $tip = New-Object System.Drawing.PointF ($pivotX + $ux * $tipR), ($pivotY + $uy * $tipR)
    $left = New-Object System.Drawing.PointF ($pivotX - $ux * $tailR + $px * $halfW), ($pivotY - $uy * $tailR + $py * $halfW)
    $right = New-Object System.Drawing.PointF ($pivotX - $ux * $tailR - $px * $halfW), ($pivotY - $uy * $tailR - $py * $halfW)
    $needle = @($tip, $left, $right)
    $g.FillPolygon((Brush "#ef1d22"), $needle)
    $g.DrawPolygon((Pen "#380608" 4), $needle)

    if ($includeHub) {
        $g.FillEllipse((Brush "#2a2420"), $pivotX - 46, $pivotY - 46, 92, 92)
        $g.DrawEllipse((Pen "#9b7a40" 8), $pivotX - 46, $pivotY - 46, 92, 92)
        $g.FillEllipse((Brush "#121212"), $pivotX - 25, $pivotY - 25, 50, 50)
        $g.DrawEllipse((Pen "#4a4038" 5), $pivotX - 25, $pivotY - 25, 50, 50)
    }
}

function Draw-Base($g) {
    $majorFont = New-Object System.Drawing.Font "Arial", 50, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $gearFont = New-Object System.Drawing.Font "Arial", 34, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $white = Brush "#f8f8ef"
    $dark = Brush "#0b0b0b"

    $g.Clear([System.Drawing.Color]::Transparent)
    Draw-ArcBand $g 0 140 $outerR 0 "#080808"
    $g.FillRectangle((Brush "#080808"), $pivotX - $outerR, $pivotY - 4, $outerR * 2, 44)

    Draw-ArcBand $g 0 20 $gearOuterR $gearInnerR "#dca940"
    Draw-ArcBand $g 20 50 $gearOuterR $gearInnerR "#98b756"
    Draw-ArcBand $g 50 80 $gearOuterR $gearInnerR "#b5cf73"
    Draw-ArcBand $g 80 110 $gearOuterR $gearInnerR "#c66136"
    Draw-ArcBand $g 110 140 $gearOuterR $gearInnerR "#a63824"

    $g.DrawArc((Pen "#f6f1e8" 9), $pivotX - $outerR, $pivotY - $outerR, $outerR * 2, $outerR * 2, 180, 180)
    $g.DrawLine((Pen "#f6f1e8" 7), $pivotX - $outerR, $pivotY, $pivotX + $outerR, $pivotY)
    $g.DrawArc((Pen "#222222" 5), $pivotX - $gearOuterR, $pivotY - $gearOuterR, $gearOuterR * 2, $gearOuterR * 2, 180, 180)
    $g.DrawArc((Pen "#222222" 5), $pivotX - $gearInnerR, $pivotY - $gearInnerR, $gearInnerR * 2, $gearInnerR * 2, 180, 180)

    for ($speed = 0; $speed -le 140; $speed += 5) {
        $isMajor = @(0,20,50,80,110,140) -contains $speed
        $isTen = $speed % 10 -eq 0
        $p1 = Point-OnGauge $speed $(if ($isMajor) { $majorTickOuterR } else { $minorTickOuterR })
        $p2 = Point-OnGauge $speed $(if ($isMajor) { $majorTickInnerR } elseif ($isTen) { 384.0 } else { $minorTickInnerR })
        $g.DrawLine((Pen $(if ($isMajor) { "#f8f8ef" } else { "#c9c9c3" }) $(if ($isMajor) { 6 } elseif ($isTen) { 4 } else { 3 })), $p1, $p2)
    }

    foreach ($speed in @(20, 50, 80, 110)) {
        $p1 = Point-OnGauge $speed $gearInnerR
        $p2 = Point-OnGauge $speed $gearOuterR
        $g.DrawLine((Pen "#121212" 5), $p1, $p2)
    }

    foreach ($speed in @(0, 20, 50, 80, 110, 140)) {
        $p = Point-OnGauge $speed $numberR
        if ($speed -eq 0) { $p.X += 26; $p.Y -= 8 }
        if ($speed -eq 140) { $p.X -= 30; $p.Y -= 8 }
        Draw-CenteredText $g ([string]$speed) $majorFont $white $p.X $p.Y
    }

    $gearLabels = @(
        @{ Speed = 10; Label = "G1" },
        @{ Speed = 34; Label = "G2" },
        @{ Speed = 65; Label = "G3" },
        @{ Speed = 95; Label = "G4" },
        @{ Speed = 125; Label = "G5" }
    )
    foreach ($gear in $gearLabels) {
        $p = Point-OnGauge $gear.Speed 274.0
        Draw-CenteredText $g $gear.Label $gearFont $dark $p.X $p.Y
    }
}

function Save-Base {
    $created = New-Bitmap $w $h
    $bmp = $created[0]
    $g = $created[1]
    Draw-Base $g
    $bmp.Save((Join-Path $outDir "speed_meter_hud_base.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Save-Preview {
    $created = New-Bitmap $w $h
    $bmp = $created[0]
    $g = $created[1]
    Draw-Base $g
    Draw-Needle $g 80 $true
    $bmp.Save((Join-Path $outDir "speed_meter_hud_preview_80.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Save-NeedleOverlay {
    $created = New-Bitmap $w $h
    $bmp = $created[0]
    $g = $created[1]
    $g.Clear([System.Drawing.Color]::Transparent)
    Draw-Needle $g 70 $true
    $bmp.Save((Join-Path $outDir "speed_meter_hud_needle_overlay.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Save-Base
Save-Preview
Save-NeedleOverlay
