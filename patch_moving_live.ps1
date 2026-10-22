$ErrorActionPreference = 'Stop'
$filepath = "e:\منصة الجنيدي\app\teacher-assistant\live-components\LiveWhiteboardTeacher.js"
$content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)

$old_update_lines = @"
        const updateLines = (node) => {
          if (node && node.isMindMapNode && node.mindMapId) {
            const matrix = node.calcTransformMatrix();
            const abs = window.fabric.util.qrDecompose(matrix);
            initCanvas.getObjects('line').forEach(line => {
              if (line.isMindMapLine) {
                if (line.mindMapFromId === node.mindMapId) {
                  line.set({ x1: abs.translateX, y1: abs.translateY });
                }
                if (line.mindMapToId === node.mindMapId) {
                  line.set({ x2: abs.translateX, y2: abs.translateY });
                }
              }
            });
          }
        };
"@

$new_update_lines = @"
        const updateLines = (node) => {
          if (node && node.isMindMapNode && node.mindMapId) {
            let matrix;
            if (node.group) {
              matrix = window.fabric.util.multiplyTransformMatrices(
                node.group.calcTransformMatrix(),
                node.calcOwnMatrix()
              );
            } else {
              matrix = node.calcTransformMatrix();
            }
            const abs = window.fabric.util.qrDecompose(matrix);
            initCanvas.getObjects('line').forEach(line => {
              if (line.isMindMapLine) {
                if (line.mindMapFromId === node.mindMapId) {
                  line.set({ x1: abs.translateX, y1: abs.translateY });
                }
                if (line.mindMapToId === node.mindMapId) {
                  line.set({ x2: abs.translateX, y2: abs.translateY });
                }
              }
            });
          }
        };
"@

$content = $content.Replace($old_update_lines, $new_update_lines)
Write-Host "Replaced updateLines in LiveWhiteboardTeacher.js"

[System.IO.File]::WriteAllText($filepath, $content, [System.Text.Encoding]::UTF8)