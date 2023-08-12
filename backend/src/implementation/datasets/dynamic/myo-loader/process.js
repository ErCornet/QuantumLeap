const path = require('path');
const fs = require('fs');

const importData = require('./process-import.js')
const exportData = require('./process-export.js')
const exportDataExtended = require('./process-exportExtended.js')
const filter = require('./process-filter.js')
const bound = require('./process-bound.js')
const normalize = require('./process-normalize.js')

const fontWhite =  "\x1b[37m";
const fontYellow = "\x1b[33m"

// Import
console.clear();
console.log(fontYellow, "Importing Data...", fontWhite);
let dataRaw = importData(true);
// exportData("raw", dataRaw);

// Filter
console.log();
console.log(fontYellow, "Filtering...", fontWhite);
let dataFiltered = filter(dataRaw);
// exportData("filtered", dataFiltered);

// Bound
console.log();
console.log(fontYellow, "Bounding...", fontWhite);
let dataBounded = bound(dataFiltered)
// exportData("bounded", dataBounded);

// Normalize
console.log();
console.log(fontYellow, "Normalizing...", fontWhite);
let dataNormalized = normalize(dataBounded);
exportDataExtended("normalized", dataNormalized);