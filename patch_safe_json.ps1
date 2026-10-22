$ErrorActionPreference = 'Stop'
$filepath = "e:\منصة الجنيدي\app\teacher-assistant\whiteboard\WhiteboardComponent.js"
$content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)

$safeJsonFn = @"
    const getSafeJson = (c) => {
      const activeObj = c.getActiveObject();
      if (activeObj && activeObj.type === 'activeSelection') {
        c.discardActiveObject();
        const json = c.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor', 'theme', 'mindMapId', 'isMindMapLine', 'mindMapFromId', 'mindMapToId']);
        c.setActiveObject(activeObj);
        return json;
      }
      return c.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor', 'theme', 'mindMapId', 'isMindMapLine', 'mindMapFromId', 'mindMapToId']);
    };
"@

$content = [System.Text.RegularExpressions.Regex]::Replace($content, "const saveHistory = \(currentCanvas\) => \{", "$safeJsonFn`n`n    const saveHistory = (currentCanvas) => {", [System.Text.RegularExpressions.RegexOptions]::Singleline)

$content = [System.Text.RegularExpressions.Regex]::Replace($content, "currentCanvas\.toJSON\(\['lockMovementX'.*?'mindMapToId'\]\)", "getSafeJson(currentCanvas)", [System.Text.RegularExpressions.RegexOptions]::Singleline)

$content = [System.Text.RegularExpressions.Regex]::Replace($content, "canvas\.toJSON\(\['lockMovementX'.*?'mindMapToId'\]\)", "getSafeJson(canvas)", [System.Text.RegularExpressions.RegexOptions]::Singleline)

[System.IO.File]::WriteAllText($filepath, $content, [System.Text.Encoding]::UTF8)