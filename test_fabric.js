const fabric = require('fabric').fabric;
const canvas = new fabric.Canvas(null, {width: 800, height: 600});
const rect = new fabric.Rect({ left: 100, top: 100, width: 50, height: 50 });
canvas.add(rect);
console.log('Before selection left:', rect.left);
const sel = new fabric.ActiveSelection([rect], { canvas: canvas });
console.log('After selection left:', rect.left);