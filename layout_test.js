const calculateTreeLayout = () => {
  const text = الجذر
\tفرع 1
\t\tابن 1
\t\tابن 2
\tفرع 2;
  const lines = text.split('\n').filter(l => l.trim() !== '');
  const root = { level: -1, children: [], yOffset: 0 };
  const stack = [root];
  
  lines.forEach((line) => {
    const rawIndentation = line.match(/^[\t ]*/)[0];
    let level = 0;
    if (rawIndentation.includes('\t')) level = rawIndentation.split('\t').length;
    else level = Math.floor(rawIndentation.length / 4) + 1;
    
    const content = line.trim();
    if (!content) return;
    
    const node = { level, content, children: [] };
    
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    
    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  });

  const nodeHeight = 60;
  const verticalSpacing = 40;
  
  // Calculate heights
  const calcHeight = (node) => {
    if (node.children.length === 0) {
      node.subtreeHeight = nodeHeight;
      return nodeHeight;
    }
    let h = 0;
    node.children.forEach(c => {
      h += calcHeight(c) + verticalSpacing;
    });
    h -= verticalSpacing;
    node.subtreeHeight = Math.max(nodeHeight, h);
    return node.subtreeHeight;
  };
  
  calcHeight(root);
  
  // Assign positions
  const assignPos = (node, x, y) => {
    node.x = x;
    node.y = y;
    let currentY = y - node.subtreeHeight / 2;
    node.children.forEach(c => {
      currentY += c.subtreeHeight / 2;
      assignPos(c, x - 250, currentY);
      currentY += c.subtreeHeight / 2 + verticalSpacing;
    });
  };
  
  const startX = 600;
  const startY = 300;
  // Root children
  let currentY = startY - root.subtreeHeight / 2;
  root.children.forEach(c => {
    currentY += c.subtreeHeight / 2;
    assignPos(c, startX, currentY);
    currentY += c.subtreeHeight / 2 + verticalSpacing;
  });

  return root;
};
console.log(JSON.stringify(calculateTreeLayout(), null, 2));