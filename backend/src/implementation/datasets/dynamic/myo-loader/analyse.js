const path = require('path');
const fs = require('fs');
const PImage = require('pureimage');

const fontWhite =  "\x1b[37m";
const fontYellow = "\x1b[33m"
const fontRed = "\x1b[31m"

console.clear();
console.log(fontYellow, "Importing Data...", fontWhite);

const currentDirectory = process.cwd();
const currentDirectoryParts = currentDirectory.split('backend');
const backendDirectory = currentDirectoryParts[currentDirectoryParts.length - 2] + "backend";
const datasetInputDirectory = backendDirectory + "\\src\\datasets\\dynamic";

let dataRaw = new Object();
let dataFiltered = new Object();

function load(datasetPath, dataObject)
{
	fs.readdirSync(datasetPath).forEach((gestureFile) => {
	    let gestureClassDirPath = path.join(datasetPath, gestureFile);

	    const stat = fs.lstatSync(gestureClassDirPath);
	    if (!stat.isFile()) return;

	    if(gestureFile === "info.json") return;

	    const gestureName = gestureFile.split(".")[0];

	    dataObject[gestureName] = JSON.parse(fs.readFileSync(gestureClassDirPath, 'utf-8'));
	});
}

load(datasetInputDirectory + "\\myo-dataset-raw", dataRaw);
load(datasetInputDirectory + "\\myo-dataset-filtered", dataFiltered);

// Frequency Analysis

const colorWhite = "#ffffff";
const colorGray = "#dddddd";
const colorBlack = "#000000";
const colorBlue = "#000069";

const height = 500;
const width = 500;

function plotLines(name, x, y, c)
{
	const image = PImage.make(width, height);
	const context = image.getContext('2d');

	const fileName = name + ".png";

	context.fillStyle = colorWhite;
	context.fillRect(0, 0, width, height);

	context.fillStyle = colorGray;
	context.fillRect(width / 2, 0, 1, height);
	context.fillRect(0, height / 2, width, 1);

	const minX = Math.min(...x);
	const maxX = Math.max(...x);

	const minY = Math.min(...y);
	const maxY = Math.max(...y);

	for(var i = 1; i < x.length; i++)
	{
		const x__ = (x[i - 1] - minX) / (maxX - minX);
		const y__ = (y[i - 1] - minY) / (maxY - minY);

		const x_ = (x[i] - minX) / (maxX - minX);
		const y_ = (y[i] - minY) / (maxY - minY);

		context.lineWidth = 2;
		context.strokeStyle = c[i];

		context.beginPath();
		context.moveTo(width * x__, height - (height * y__));
		context.lineTo(width * x_, height - (height * y_));
		context.stroke();
	}


	PImage.encodePNGToStream(image, fs.createWriteStream(fileName)).then(() => { console.log(fontYellow, "Exported ", fontWhite, fileName); }).catch((e)=>{ console.log(fontRed, "Error while exporting", fontWhite, fileName); });
}

let frequencyAccelerationX = [];
let frequencyAccelerationY = [];
let frequencyAccelerationC = [];

for(var i = 0; i < 20; i++) 
{
	frequencyAccelerationX.push(i);
	frequencyAccelerationX.push(0);
	frequencyAccelerationX.push(colorBlack);
}

for(var gestureName in dataRaw) {
	for(var idUserSample in dataRaw[gestureName]) {
		const gesture = dataRaw[gestureName][idUserSample];
		for(let i = 1; i < gesture.length; i++) {
			const diffX = (gesture[i].timestamp - gesture[i - 1].timestamp) / 1000000;
			let diffY = Number.MIN_VALUE;
			for(var j = 0; j < gesture[i].acceleration.length; j++)
				diffY = Math.max(diffY, Math.abs(gesture[i].acceleration[j] - gesture[i - 1].acceleration[j]));

			//console.log(diffX, diffY);
			const frequencyLog = parseInt(Math.log(1 + (diffY / diffX)));
			// console.log(gesture[i].acceleration);
			// console.log(diffX, diffY);
			// console.log(frequencyLog);
			frequencyAccelerationY[frequencyLog]++;
		}
	}
}

console.log(frequencyAccelerationY);

plotLines("FrequencyAcceleration", frequencyAccelerationX, frequencyAccelerationY, frequencyAccelerationC);