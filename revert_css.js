const fs = require('fs');
let teacher = fs.readFileSync('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js', 'utf8');
teacher = teacher.replace("import styles from './live-whiteboard.module.css'", "import styles from '../../teacher-assistant/whiteboard/page.module.css'");
fs.writeFileSync('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js', teacher, 'utf8');

let student = fs.readFileSync('e:\\منصة الوتين\\app\\live\\LiveWhiteboardStudent.js', 'utf8');
student = student.replace("import styles from '../teacher-assistant/live-components/live-whiteboard.module.css'", "import styles from '../teacher-assistant/whiteboard/page.module.css'");
fs.writeFileSync('e:\\منصة الوتين\\app\\live\\LiveWhiteboardStudent.js', student, 'utf8');
console.log('Reverted');
