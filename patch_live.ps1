$ErrorActionPreference = 'Stop'
$filepath = "e:\منصة الجنيدي\app\teacher-assistant\live-components\LiveWhiteboardTeacher.js"
$content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)

$old_branch_line = @"
        const lineObj = new fabric.Line([parentNode.left, parentNode.top, node.left, node.top], {
          stroke: '#94a3b8', strokeWidth: 3, selectable: false, evented: false, strokeDashArray: [5, 5],
          isMindMapLine: true, mindMapFromId: activeObj.mindMapId, mindMapToId: child.mindMapId
        });
"@
$new_branch_line = @"
        const lineObj = new fabric.Line([parentNode.left, parentNode.top, node.left, node.top], {
          stroke: '#94a3b8', strokeWidth: 3, selectable: false, evented: false, strokeDashArray: [5, 5],
          isMindMapLine: true, mindMapFromId: parentNode.mindMapId, mindMapToId: node.mindMapId
        });
"@
$content = $content.Replace($old_branch_line, $new_branch_line)
Write-Host "Replaced handleMindMapImport branch line"

[System.IO.File]::WriteAllText($filepath, $content, [System.Text.Encoding]::UTF8)