const fs = require('fs');

const css = `
/* List view specific styles */
.listGrid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.listCard {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  padding: 20px 25px !important;
  border-radius: 24px !important;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03), inset 0 2px 10px rgba(255,255,255,0.8) !important;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.listCard:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08), inset 0 2px 10px rgba(255,255,255,1) !important;
  border-color: rgba(16, 185, 129, 0.4) !important;
  background: rgba(255, 255, 255, 0.95) !important;
}

.listCardLeft {
  display: flex;
  align-items: center;
  gap: 20px;
}

.listIconBox {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  color: #059669;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.listCard:hover .listIconBox {
  transform: scale(1.1) rotate(5deg);
}

.lockedCard .listIconBox {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #64748b;
}

.lockedCard:hover .listIconBox {
  transform: none;
}

.listCardContent {
  display: flex;
  flex-direction: column;
}

.listCardTitle {
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0 0 5px;
  transition: color 0.3s ease;
}

.listCard:hover .listCardTitle {
  color: #059669;
}

.lockedCard:hover .listCardTitle {
  color: #1e293b;
}

.listCardDesc {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

.listCardRight {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

@media (max-width: 600px) {
  .listCard {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  .listCardRight {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(0,0,0,0.05);
    padding-top: 15px;
  }
}
`;

const file = 'e:/ملفات المنصة/-/app/sec-2/page.module.css';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('.listGrid')) {
    fs.appendFileSync(file, css);
}
console.log('done');
