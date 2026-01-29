const XLSX = require('xlsx');
const filename = 'c:/Users/ayamk/OneDrive/Documents/CNN/PPA-ERT/PPA-ERT/peralatan emergency/DATA SPIP UNTUK KAKA ALE.xlsx';
const workbook = XLSX.readFile(filename);
const sheetName = workbook.SheetNames.find(n => n.includes('APAR'));

if (sheetName) {
    console.log(`Reading sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays
    console.log(JSON.stringify(json.slice(0, 5), null, 2)); // Print first 5 rows
} else {
    console.log('APAR sheet not found in:', workbook.SheetNames);
}
