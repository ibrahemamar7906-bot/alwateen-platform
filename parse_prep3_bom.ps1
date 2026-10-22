$ErrorActionPreference = "Stop"

$curriculumPath = ".\‏‏prep3_curriculum.txt"
$outputPath = ".\app\kids-corner\pathway\prep3_data.js"

$content = [System.IO.File]::ReadAllText($curriculumPath, [System.Text.Encoding]::UTF8)

# Split by ###
$sections = $content -split "###" | Where-Object { $_.Trim().Length -gt 0 }

$idCounter = 1
$unitCounter = 1
$nodes = @()

$nodes += "  nodes.push({ id: idCounter++, unit: 1, title: 'مرحباً بك في الصف الثالث الإعدادي', desc: 'مقدمة المنهج', type: 'unit_start', icon: '🌟', data: {} });"
$idCounter++

foreach ($section in $sections) {
    if (-not $section.Contains("**")) { continue }

    $lines = $section -split "`n"
    $titleLine = $lines[0].Replace("**", "").Trim()
    
    if ($titleLine.StartsWith("أولاً:") -or $titleLine.StartsWith("ثانياً:") -or $titleLine.StartsWith("ثالثاً:") -or $titleLine.StartsWith("رابعاً:") -or $titleLine.StartsWith("خامساً:") -or $titleLine.StartsWith("سادساً:")) {
        $parts = $titleLine -split ":"
        $titleLine = ($parts[1..($parts.Length-1)] -join ":").Trim()
    } elseif ($titleLine.StartsWith("الدرس")) {
        $parts = $titleLine -split "-"
        $titleLine = $parts[$parts.Length - 1].Trim()
    }

    $titleLine = $titleLine.Replace("'", "").Replace('"', '').Trim()
    if ($titleLine.Length -lt 3) { continue }

    # Helper function inside loop to extract parts
    function Extract-Part {
        param (
            [string[]]$startStrs,
            [string[]]$nextStrs,
            [string]$text
        )
        $startIndex = -1
        foreach ($s in $startStrs) {
            $idx = $text.IndexOf($s)
            if ($idx -ne -1) {
                $startIndex = $idx
                break
            }
        }

        if ($startIndex -eq -1) { return "" }
        $startIndex = $text.IndexOf("`n", $startIndex)
        if ($startIndex -eq -1) { return "" }

        $endIndex = $text.Length
        foreach ($next in $nextStrs) {
            $idx = $text.IndexOf($next, $startIndex)
            if ($idx -ne -1 -and $idx -lt $endIndex) {
                $endIndex = $idx
            }
        }
        return $text.Substring($startIndex, $endIndex - $startIndex).Trim()
    }

    $originalText = Extract-Part -startStrs @("**النص الأصلي", "**النص الأدبي", "**النص المعلوماتي", "**نص الدرس") -nextStrs @("**معاني المفردات", "**💡 دليل الطالب", "**📝 أسئلة") -text $section
    $originalText = $originalText.Replace(">", "").Trim()

    $vocabText = Extract-Part -startStrs @("**معاني المفردات", "**اللغويات") -nextStrs @("**💡 دليل الطالب", "**📝 أسئلة") -text $section
    
    $guideText = Extract-Part -startStrs @("**💡 دليل الطالب") -nextStrs @("**📝 أسئلة") -text $section
    $guideText = $guideText.Replace(">", "").Trim()

    $questionsText = Extract-Part -startStrs @("**📝 أسئلة") -nextStrs @() -text $section

    # Parse Vocab
    $vocabCode = "{}"
    if ($vocabText.Length -gt 0) {
        $meaning = @()
        $vLines = $vocabText -split "`n"
        foreach ($v in $vLines) {
            $cleanV = $v -replace "^\*?\s*", ""
            $cleanV = $cleanV.Replace("*", "").Trim()
            if ($cleanV.Contains("=")) {
                $parts = $cleanV -split "="
                $w = $parts[0].Trim().Replace('"', '').Replace("'", "")
                $m = $parts[1].Trim().Replace('"', '').Replace("'", "")
                $meaning += "{ w: `"$w`", m: `"$m`" }"
            } elseif ($cleanV.Contains(":")) {
                $parts = $cleanV -split ":"
                $w = $parts[0].Trim().Replace('"', '').Replace("'", "")
                $m = ($parts[1..($parts.Length-1)] -join ":").Trim().Replace('"', '').Replace("'", "")
                $meaning += "{ w: `"$w`", m: `"$m`" }"
            }
        }
        if ($meaning.Length -gt 0) {
            $joinedM = $meaning -join ",`n          "
            $vocabCode = "{`n        meaning: [`n          $joinedM`n        ]`n      }"
        }
    }

    # Parse Questions
    $questionsCode = "[]"
    if ($questionsText.Length -gt 0) {
        $qBlocks = $questionsText -split "(?=`n\d+\.\s+)" | Where-Object { $_.Trim().Length -gt 0 }
        $parsedQuestions = @()
        foreach ($qBlock in $qBlocks) {
            $qLines = $qBlock -split "`n"
            $qText = $qLines[0] -replace "^\d+\.\s*", ""
            $qText = $qText.Replace('"', "'").Replace("`*", "").Trim()
            $options = @()
            $correct = ""

            for ($i = 1; $i -lt $qLines.Length; $i++) {
                $line = $qLines[$i].Trim()
                if ($line.StartsWith("*")) {
                    $optText = $line -replace "^\*\s*[أ-د]\)\s*", ""
                    $optText = $optText.Trim()
                    $isCorrect = $optText.Contains("*(الإجابة الصحيحة)*") -or $optText.Contains("(الإجابة الصحيحة)")
                    $optText = $optText.Replace("*(الإجابة الصحيحة)*", "").Replace("(الإجابة الصحيحة)", "").Trim()
                    $optText = $optText.Replace('"', "'")
                    if ($optText.Length -gt 0) {
                        $options += "`"$optText`""
                    }
                    if ($isCorrect) {
                        $correct = $optText
                    }
                }
            }
            if ($options.Length -gt 0) {
                $joinedOpts = $options -join ", "
                $parsedQuestions += "{ q: `"$qText`", opts: [$joinedOpts], correct: `"$correct`" }"
            }
        }
        if ($parsedQuestions.Length -gt 0) {
            $joinedQ = $parsedQuestions -join ",`n        "
            $questionsCode = "[`n        $joinedQ`n      ]"
        }
    }

    # Combine text
    $combinedText = ""
    if ($originalText.Length -gt 0) { $combinedText += $originalText + "`n`n" }
    if ($guideText.Length -gt 0) { $combinedText += $guideText + "`n`n" }
    $combinedText = $combinedText.Replace('"', "'").Replace("`r", "").Replace("`n", "\n").Trim()

    $safeTitle = $titleLine.Replace("'", "\'")

    $nodeType = "story"
    $icon = "📖"
    if ($titleLine.Contains("تدريب") -or $titleLine.Contains("أسئلة") -or $titleLine.Contains("مراجعة") -or $titleLine.Contains("نحو")) {
        $nodeType = "quiz_word"
        $icon = "📝"
    } elseif ($titleLine.Contains("نص") -or $titleLine.Contains("قصة") -or $titleLine.Contains("قراءة")) {
        $nodeType = "story"
        $icon = "📖"
    } elseif ($titleLine.Contains("نشيد") -or $titleLine.Contains("شعر")) {
        $nodeType = "song"
        $icon = "🎵"
    }

    $desc = if ($nodeType -eq "quiz_word") { "تحدي" } else { "درس جديد" }

    $nodes += @"
  nodes.push({
    id: idCounter++, unit: $unitCounter,
    title: '$safeTitle',
    desc: '$desc',
    type: '$nodeType', icon: '$icon',
    data: {
      text: "$combinedText",
      vocab: $vocabCode,
      quizzes: $questionsCode
    }
  });
"@
    $idCounter++

    if ($idCounter -gt 1 -and ($nodes.Length % 4) -eq 0) {
        $nodes += "  nodes.push({ id: idCounter++, unit: $unitCounter, title: 'مراجعة الوحدة $unitCounter', desc: 'اختبار', type: 'review', icon: '🏆', data: { quizzes: [] } });"
        $idCounter++
        $nodes += "  nodes.push({ id: idCounter++, unit: $unitCounter, title: 'صندوق المكافأة', desc: 'افتح هديتك', type: 'chest', icon: '🎁', data: { badge: 'بطل الوحدة $unitCounter' } });"
        $idCounter++
        $unitCounter++
        $nodes += "  nodes.push({ id: idCounter++, unit: $unitCounter, title: 'الوحدة $unitCounter', desc: 'بداية الوحدة', type: 'unit_start', icon: '📚', data: {} });"
        $idCounter++
    }
}

$nodes += "  nodes.push({ id: idCounter++, unit: $unitCounter, title: 'نهاية المنهج', desc: 'مبارك إتمام المستوى!', type: 'finish', icon: '🎓', data: {} });"
$idCounter++

$functionCode = @"
// Generated automatically from prep3_curriculum.txt
export const generatePrep3ArabicPathway = () => {
  let idCounter = 1;
  const nodes = [];

$($nodes -join "`n")

  return nodes;
};
"@

[System.IO.File]::WriteAllText($outputPath, $functionCode, [System.Text.Encoding]::UTF8)
Write-Host "Generated successfully! Nodes count: $($nodes.Length)"
