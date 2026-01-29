const XLSX = require('xlsx');
const filename = 'c:/Users/ayamk/OneDrive/Documents/CNN/PPA-ERT/PPA-ERT/peralatan emergency/DATA SPIP UNTUK KAKA ALE.xlsx';

function debugHydrant() {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames.find(n => n.toUpperCase().includes('HIDRANT') || n.toUpperCase().includes('HYDRANT'));
    if (!sheetName) {
        console.log('Hydrant sheet not found. Available:', workbook.SheetNames);
        return;
    }
    console.log(`Reading sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet); // Default header row 0

    if (data.length > 0) {
        console.log('First row keys:', Object.keys(data[0]));
        console.log('First row data:', data[0]);
    } else {
        console.log('No data found');
    }
}

debugHydrant();
