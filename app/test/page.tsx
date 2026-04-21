import fs from 'fs';
import path from 'path';

export default function Test() {
  const filePath = path.join(process.cwd(), 'data', 'bible', 'rest-of-esther.json');
  const exists = fs.existsSync(filePath);
  return <div>File exists: {exists ? 'YES' : 'NO'} — Path: {filePath}</div>;
}
