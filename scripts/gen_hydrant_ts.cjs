const XLSX = require('xlsx');
const fs = require('fs');
const filename = 'c:/Users/ayamk/OneDrive/Documents/CNN/PPA-ERT/PPA-ERT/peralatan emergency/DATA SPIP UNTUK KAKA ALE.xlsx';

function generateHydrantData() {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames.find(n => n.toUpperCase().includes('HIDRANT') || n.toUpperCase().includes('HYDRANT'));
    if (!sheetName) return;

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    let content = 'export const HYDRANT_LOCATIONS: HydrantUnit[] = [\n';
    data.forEach(row => {
        if (!row['NO']) return;

        const no = row['NO'];
        const area = (row['AREA'] || '').trim().toUpperCase().replace(/'/g, "\\'");
        const location = (row['LOKASI'] || '').trim().replace(/'/g, "\\'");
        const tagNumber = (row['NO. LAMBUNG'] || '').trim();
        const regNumber = (row['NO. REGISTER'] || '').trim();

        if (!area || !location) return;

        content += `    { no: ${no}, area: '${area}', location: '${location}', tagNumber: '${tagNumber}', regNumber: '${regNumber}' },\n`;
    });
    content += '];\n';

    fs.writeFileSync('c:/Users/ayamk/OneDrive/Documents/CNN/PPA-ERT/PPA-ERT/scripts/hydrant_data_output.ts', content, 'utf8');
}

generateHydrantData();
