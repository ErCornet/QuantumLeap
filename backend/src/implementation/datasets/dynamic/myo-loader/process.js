const path = require('path');
const fs = require('fs');

const importData = require('./process-import.js')
const exportData = require('./process-export.js')
const filter = require('./process-filter.js')
const bound = require('./process-bound.js')
const normalize = require('./process-normalize.js')

const fontWhite =  "\x1b[37m";
const fontYellow = "\x1b[33m"

console.clear();
console.log(fontYellow, "Importing Data...", fontWhite);
let dataRaw = importData(true);

// Filtered
console.log();
console.log(fontYellow, "Filtering...", fontWhite);

let dataFiltered = filter(dataRaw);

// Bounded
console.log();
console.log(fontYellow, "Bounding...", fontWhite);
let dataBounded = bound(dataFiltered)

// Normalized
console.log();
console.log(fontYellow, "Normalizing...", fontWhite);
let dataNormalized = normalize(dataBounded);

// exportData("raw", dataRaw);
// exportData("filtered", dataFiltered);
exportData("bounded", dataBounded);
exportData("normalized", dataNormalized);