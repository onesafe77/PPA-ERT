
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'ppaert');

async function analyze() {
    try {
        const files = fs.readdirSync(directoryPath);
        const apar = files.find(f => f.includes('APAR'));

        if (apar) {
            console.log('Reading:', apar);
            const buf = fs.readFileSync(path.join(directoryPath, apar));
            const data = await pdf(buf);
            console.log(data.text);
        }
    } catch (e) {
        console.error(e);
    }
}
analyze();
