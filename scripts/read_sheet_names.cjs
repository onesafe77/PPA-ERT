const XLSX = require('xlsx');
const filename = 'c:/Users/ayamk/OneDrive/Documents/CNN/PPA-ERT/PPA-ERT/peralatan emergency/DATA SPIP UNTUK KAKA ALE.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    console.log('Sheet Names:', workbook.SheetNames);

    // Check for 'APAR' sheet
    // Based on previous files, names like "FORM APAR", "APAR", "MASTER DATA" are common.
    // I'll print the content of the sheet that looks like APAR data.

    // For now, let's just list the sheets to allow me to decide.
} catch (e) {
    console.error('Error reading file:', e);
}
