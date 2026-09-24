
import { questionBank } from './src/lib/questions';

const ids = questionBank.map((q) => q.id);
const counts = ids.reduce((acc, id) => {
  acc[id] = (acc[id] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const duplicates = Object.entries(counts).filter(([id, count]) => count > 1);
console.log('Duplicates:', duplicates);
