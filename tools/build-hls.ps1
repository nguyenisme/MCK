param(
  [Parameter(Mandatory = $true)]
  [string]$FfmpegBin
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$songsDir = Join-Path $projectRoot "songs"
$outputDir = Join-Path $projectRoot "hls"
$ffmpeg = Join-Path $FfmpegBin "ffmpeg.exe"
$ffprobe = Join-Path $FfmpegBin "ffprobe.exe"

if (!(Test-Path -LiteralPath $ffmpeg) -or !(Test-Path -LiteralPath $ffprobe)) {
  throw "Cannot find ffmpeg.exe/ffprobe.exe in $FfmpegBin"
}

$scriptText = [IO.File]::ReadAllText(
  (Join-Path $projectRoot "script.js"),
  [Text.UTF8Encoding]::new($false)
)
$songsBlock = [regex]::Match($scriptText, 'const songs = \[(.*?)\];', 'Singleline')
if (!$songsBlock.Success) {
  throw "Cannot read the songs array from script.js"
}
$songNames = @(
  [regex]::Matches($songsBlock.Groups[1].Value, '"([^"]+\.mp3)"') |
    ForEach-Object { $_.Groups[1].Value }
)
if (!$songNames.Count) {
  throw "The songs array is empty"
}

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$timeline = @()
$start = 0.0
$concatLines = @("ffconcat version 1.0")

foreach ($songName in $songNames) {
  $songPath = Join-Path $songsDir $songName
  if (!(Test-Path -LiteralPath $songPath)) {
    throw "Missing file: $songPath"
  }

  $durationText = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $songPath
  $duration = [double]::Parse($durationText.Trim(), [Globalization.CultureInfo]::InvariantCulture)
  $timeline += [ordered]@{
    file = $songName
    start = [Math]::Round($start, 6)
    duration = [Math]::Round($duration, 6)
  }
  $start += $duration

  $escapedPath = $songPath.Replace("'", "'\''")
  $concatLines += "file '$escapedPath'"
}

$concatPath = [IO.Path]::GetTempFileName()
[IO.File]::WriteAllLines($concatPath, $concatLines, [Text.UTF8Encoding]::new($false))

$timelineJson = $timeline | ConvertTo-Json -Depth 4 -Compress
$timelineScript = "window.TRACK_TIMELINE = $timelineJson;"
[IO.File]::WriteAllText((Join-Path $outputDir "track-timeline.js"), $timelineScript, [Text.UTF8Encoding]::new($false))

& $ffmpeg -y -hide_banner -loglevel warning `
  -f concat -safe 0 -i $concatPath `
  -map 0:a:0 -vn -c:a aac -b:a 192k -ar 44100 -ac 2 `
  -f hls -hls_time 6 -hls_playlist_type vod `
  -hls_segment_filename (Join-Path $outputDir "segment_%05d.ts") `
  (Join-Path $outputDir "library.m3u8")

if ($LASTEXITCODE -ne 0) {
  throw "FFmpeg failed with exit code $LASTEXITCODE"
}

[IO.File]::Delete($concatPath)

Write-Host "Built HLS for $($songNames.Count) tracks, total $([Math]::Round($start, 2)) seconds."
