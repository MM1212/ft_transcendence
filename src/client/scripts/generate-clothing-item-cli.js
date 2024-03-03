import { generateCloth } from './generate-clothing-item.js';

const arg = process.argv[2];
const backPaper = process.argv[3] === '--back-paper';

if (arg.includes(',')) await Promise.all(arg.split(',').map(generateCloth));
else await generateCloth(arg, backPaper);
