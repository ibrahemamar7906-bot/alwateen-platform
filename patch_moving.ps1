$ErrorActionPreference = 'Stop'
$filepath = "e:\منصة الجنيدي\app\teacher-assistant\whiteboard\WhiteboardComponent.js"
$content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)

$old_moving = @"
    initCanvas.on('object:moving', (e) => {
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

      if (e.target.type === 'activeSelection' || e.target.type === 'group') {
        if (e.target._objects) {
          e.target._objects.forEach(obj => updateLines(obj));
        }
      } else {
        updateLines(e.target);
      }
      initCanvas.renderAll();
    });
"@

$new_moving = @"
    const handleObjectChanging = (e) => {
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

      if (e.target.type === 'activeSelection' || e.target.type === 'group') {
        if (e.target._objects) {
          e.target._objects.forEach(obj => updateLines(obj));
        }
      } else {
        updateLines(e.target);
      }
      initCanvas.renderAll();
    };

    initCanvas.on('object:moving', handleObjectChanging);
    initCanvas.on('object:scaling', handleObjectChanging);
    initCanvas.on('object:rotating', handleObjectChanging);
"@

$content = $content.Replace($old_moving, $new_moving)
Write-Host "Replaced object:moving in WhiteboardComponent.js"

[System.IO.File]::WriteAllText($filepath, $content, [System.Text.Encoding]::UTF8)