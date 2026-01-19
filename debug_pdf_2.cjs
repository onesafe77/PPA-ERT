
const pdfLib = require('pdf-parse');
console.log('Is PDFParse a function?', typeof pdfLib.PDFParse);
if (typeof pdfLib.default === 'function') console.log('Found default function');

// Try to find the main function
const keys = Object.keys(pdfLib);
keys.forEach(key => {
    if (typeof pdfLib[key] === 'function') {
        console.log(`Key ${key} is a function`);
    }
});
