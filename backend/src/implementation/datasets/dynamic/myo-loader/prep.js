const path = require('path');
const fs = require('fs');

const fontWhite =  "\x1b[37m";
const fontYellow = "\x1b[33m"

const currentDirectory = process.cwd();
const prepInfoFile = currentDirectory + "\\prep-info.txt";
const currentDirectoryParts = currentDirectory.split('backend');
const backendDirectory = currentDirectoryParts[currentDirectoryParts.length - 2] + "backend";
const datasetInputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset";

const prepInfo = JSON.parse(fs.readFileSync(prepInfoFile, 'utf-8'));
const righthandedParticipants = prepInfo['righthandedParticipants'];
const lefthandedParticipants = prepInfo['lefthandedParticipants'];
const usbFacingWrist = prepInfo['usbFacingWrist'];
const usbFacingElbow = prepInfo['usbFacingElbow'];

let numberOfGestureClasses = 0;
let gestureClassesIndex = [];

let dataRaw = new Object();
let dataFiltered = new Object();
let dataBounded = new Object();
let dataNormalized = new Object();

console.clear();
console.log(fontYellow, "Importing Data...", fontWhite);

// For each user
fs.readdirSync(datasetInputDirectory, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((dir) => {
    const userDirPath = path.join(datasetInputDirectory, dir);
    const stat = fs.lstatSync(userDirPath);
    if (!stat.isDirectory()) return;

    const idUser = parseInt(dir.split("_")[0]);
	const idSample = parseInt(dir.split("_")[1]);
	const idUserSample = idUser + "_" + idSample;

	// Only keep data from participants with known infos
	if(!(righthandedParticipants.includes(idUser) || lefthandedParticipants.includes(idUser))) return;

    // Don't include left handed participants for now
    if (lefthandedParticipants.includes(idUser)) return;

    // Malformed otherwise
    if(dataRaw[idUserSample] != undefined) return;

    // For each gesture class
    fs.readdirSync(userDirPath).forEach((gestureFile) => {
        const gestureClassPath = path.join(userDirPath, gestureFile);
        const gestureName = gestureFile.split(".")[0];

        if(dataRaw[gestureName] == undefined) dataRaw[gestureName] = new Object();
        if(gestureClassesIndex[gestureName] == undefined) gestureClassesIndex[gestureName] = numberOfGestureClasses++;

        if(dataRaw[gestureName][idUserSample] == undefined) dataRaw[gestureName][idUserSample] = [];

        let lines = fs.readFileSync(gestureClassPath, 'utf-8').split(/\r?\n/);
        lines = lines.slice(1, lines.length - 1); //remove header and last line

	    lines.forEach(line => {
	        values = line.split(',');

	        const timestamp = parseInt(values[0]);
	        const orientation = [ parseInt(values[1]), parseInt(values[2]), parseInt(values[3]), parseInt(values[4]) ];
	        const acceleration = [ parseInt(values[5]), parseInt(values[6]) + 1800, parseInt(values[7]) + 4000 ];
	        const rotation = [ parseInt(values[8]), parseInt(values[9]), parseInt(values[10]) ];
	        const emg = [ parseInt(values[11]), parseInt(values[12]), parseInt(values[13]), parseInt(values[14]), parseInt(values[15]), parseInt(values[16]), parseInt(values[17]), parseInt(values[18]) ];
        
	        dataRaw[gestureName][idUserSample].push(
	        {
	        	timestamp : timestamp,
	        	orientation : orientation,
	        	acceleration : acceleration,
	        	rotation : rotation,
	        	emg : emg
	        });
        });
    });
});

console.log();
console.log(fontYellow, "id".padEnd(8), fontWhite, "Name".padEnd(24), "\t", "#user-samples".padEnd(16));

for(var gestureName in dataRaw) {
	console.log(fontYellow, gestureClassesIndex[gestureName].toString().padEnd(8), fontWhite, gestureName.padEnd(24), "\t", Object.keys(dataRaw[gestureName]).length.toString().padEnd(16));
}

function exportData(datatype, dataObject) {
	console.log();
	console.log(fontYellow, "Exporting Data ", fontWhite, "(", datatype, ")");

	const datasetOutputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset-" + datatype;
	const analyseOutputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset-analyse";

	for(var gestureName in dataObject) {
		const datasetOutputFile = datasetOutputDirectory + "\\" + gestureName + ".json";

		fs.writeFileSync(datasetOutputFile, JSON.stringify(dataObject[gestureName]), (err) => { if (err) console.error(err); });

		const analyseOutputFile = analyseOutputDirectory + "\\" + datatype + "_" + gestureName + ".csv";

		let csvContent = "Timestamp;Orientation x;Orientation y;Orientation z;Orientation w;Acceleration x;Acceleration y;Acceleration z;Rotation x;Rotation y;Rotation z;EMG 0;EMG 1;EMG 2;EMG 3;EMG 4;EMG 5;EMG 6;EMG 7\n";

		for(var idUserSample in dataObject[gestureName])
		{
			const analyseOutputFileUserSample = analyseOutputDirectory + "\\" + datatype + "_" + gestureName + "_" + idUserSample + ".csv";

			let csvContentUserSample = "Timestamp, Orientation x, Orientation y, Orientation z, Orientation w, Acceleration x, Acceleration y, Acceleration z, Rotation x, Rotation y, Rotation z, EMG 0, EMG 1, EMG 2, EMG 3, EMG 4, EMG 5, EMG 6, EMG 7\n";

			const gesture = dataObject[gestureName][idUserSample]

		    for(let i = 0; i < gesture.length; i++) {
		        csvContentUserSample +=   gesture[i].timestamp
					                + "," + gesture[i].orientation[0] + "," + gesture[i].orientation[1] + "," + gesture[i].orientation[2] + "," + gesture[i].orientation[3]
					                + "," + gesture[i].acceleration[0] + "," + gesture[i].acceleration[1] + "," + gesture[i].acceleration[2] 
					                + "," + gesture[i].rotation[0] + "," + gesture[i].rotation[1] + "," + gesture[i].rotation[2] 
					                + "," + gesture[i].emg[0] + "," + gesture[i].emg[1] + "," + gesture[i].emg[2] + "," + gesture[i].emg[3] 
					                + "," + gesture[i].emg[4] + "," + gesture[i].emg[5] + "," + gesture[i].emg[6] + "," + gesture[i].emg[7] 
					                + "\n";

				csvContent +=   gesture[i].timestamp
					                + ";" + gesture[i].orientation[0] + ";" + gesture[i].orientation[1] + ";" + gesture[i].orientation[2] + ";" + gesture[i].orientation[3]
					                + ";" + gesture[i].acceleration[0] + ";" + gesture[i].acceleration[1] + ";" + gesture[i].acceleration[2] 
					                + ";" + gesture[i].rotation[0] + ";" + gesture[i].rotation[1] + ";" + gesture[i].rotation[2] 
					                + ";" + gesture[i].emg[0] + ";" + gesture[i].emg[1] + ";" + gesture[i].emg[2] + ";" + gesture[i].emg[3] 
					                + ";" + gesture[i].emg[4] + ";" + gesture[i].emg[5] + ";" + gesture[i].emg[6] + ";" + gesture[i].emg[7] 
					                + "\n";
		    }

		    fs.writeFileSync(analyseOutputFileUserSample, csvContentUserSample, (err) => { if (err) console.error(err); });

		    csvContent += "\n";
		}

		fs.writeFileSync(analyseOutputFile, csvContent, (err) => { if (err) console.error(err); });
	}
}

exportData("raw", dataRaw);

// Filtered

console.log();
console.log(fontYellow, "Filtering...", fontWhite);

function dist(p1, p2) {
    let n = 0;
    for(let i = 0; i < p1.length; i++) n += (p1[i] - p2[i]) * (p1[i] - p2[i]); 
    return Math.sqrt(n);
}

for(var gestureName in dataRaw) {
	dataFiltered[gestureName] = new Object();

	for(var idUserSample in dataRaw[gestureName]) {
		dataFiltered[gestureName][idUserSample] = [];

		const gesture = dataRaw[gestureName][idUserSample];

		let previousPoint = gesture[0]

		for(let i = 1; i < gesture.length; i++) {
			const point_i = gesture[i];

 			if ((dist(point_i.orientation, previousPoint.orientation) + dist(point_i.acceleration, previousPoint.acceleration) +
 					dist(point_i.rotation, previousPoint.rotation) + dist(point_i.emg, previousPoint.emg)) >= 0.1) {

                dataFiltered[gestureName][idUserSample].push(point_i);
                previousPoint = point_i;
            }
		}
	}
}

exportData("filtered", dataFiltered);

// Bounded
console.log();
console.log(fontYellow, "Bounding...", fontWhite);

// O* -> [-1, +1]
// A* -> [-1, +1]
// R* -> [-1, +1]
// E* -> [ 0, +1]

let minO = Number.MAX_VALUE;
let maxO = Number.MIN_VALUE;

let minA = Number.MAX_VALUE;
let maxA = Number.MIN_VALUE;

let minR = Number.MAX_VALUE;
let maxR = Number.MIN_VALUE;

let minE = Number.MAX_VALUE;
let maxE = Number.MIN_VALUE;

for(var gestureName in dataFiltered) {
	for(var idUserSample in dataFiltered[gestureName]) {
		const gesture = dataFiltered[gestureName][idUserSample];

		for(let i = 0; i < gesture.length; i++) {
			const point_i = gesture[i];

			const minO_ = Math.min(...(point_i.orientation));
			const maxO_ = Math.max(...(point_i.orientation));
			const minA_ = Math.min(...(point_i.acceleration));
			const maxA_ = Math.max(...(point_i.acceleration));
			const minR_ = Math.min(...(point_i.rotation));
			const maxR_ = Math.max(...(point_i.rotation));
			const minE_ = Math.min(...(point_i.emg));
			const maxE_ = Math.max(...(point_i.emg));

			if(minO_ < minO) minO = minO_;
			if(maxO_ > maxO) maxO = maxO_;

			if(minA_ < minA) minA = minA_;
			if(maxA_ > maxA) maxA = maxA_;

			if(minR_ < minR) minR = minR_;
			if(maxR_ > maxR) maxR = maxR_;

			if(minE_ < minE) minE = minE_;
			if(maxE_ > maxE) maxE = maxE_;
		}
	}
}

const diffO = maxO - minO;
const diffA = maxA - minA;
const diffR = maxR - minR;
const diffE = maxE - minE;

for(var gestureName in dataFiltered) {
	dataBounded[gestureName] = new Object();

	for(var idUserSample in dataFiltered[gestureName]) {
		dataBounded[gestureName][idUserSample] = [];		

		const gesture = dataFiltered[gestureName][idUserSample];

		const timestampReference = gesture[0].timestamp;

		for(let i = 0; i < gesture.length; i++) {
			const point_i = gesture[i];

			const newPoint_i = {
	        	timestamp : point_i.timestamp - timestampReference,
	        	orientation : [ (point_i.orientation[0] - minO) / diffO, (point_i.orientation[1] - minO) / diffO, (point_i.orientation[2] - minO) / diffO, (point_i.orientation[3] - minO) / diffO ],
	        	acceleration : [ (point_i.acceleration[0] - minA) / diffA, (point_i.acceleration[1] - minA) / diffA, (point_i.acceleration[2] - minA) / diffA ],
	        	rotation : [ (point_i.rotation[0] - minR) / diffR, (point_i.rotation[1] - minR) / diffR, (point_i.rotation[2] - minR) / diffR ],
	        	emg : [ (point_i.emg[0] - minE) / diffE, (point_i.emg[1] - minE) / diffE, (point_i.emg[2] - minE) / diffE, (point_i.emg[3] - minE) / diffE,
	        			(point_i.emg[4] - minE) / diffE, (point_i.emg[5] - minE) / diffE, (point_i.emg[6] - minE) / diffE, (point_i.emg[7] - minE) / diffE]
	        }

	        for(dimension in newPoint_i)
	        	for(var j = 0; j < newPoint_i[dimension].length; j++)
	        		newPoint_i[dimension][j] = (2 * newPoint_i[dimension][j]) - 1;

			dataBounded[gestureName][idUserSample].push(newPoint_i);
		}
	}
}

exportData("bounded", dataBounded);

// Normalized
console.log();
console.log(fontYellow, "Normalizing...", fontWhite);

// function normalizeQuaternion(q) {
//     let n = Math.sqrt((q[0] * q[0]) + (q[1] * q[1]) + (q[2] * q[2]) + (q[3] * q[3]));

//     return [ q[0] / n, q[1] / n, q[2] / n, q[3] / n ];
// }

// function conjugate(q) {
//     return [ -q[0], -q[1], -q[2], q[3] ];
// }

// function product(a, b) {
//     return  [    
//                 (a[3] * b[3]) - (a[0] * b[0]) - (a[1] * b[1]) - (a[2] * b[2]),
//                 (a[3] * b[0]) + (a[0] * b[3]) + (a[1] * b[2]) - (a[2] * b[1]),
//                 (a[3] * b[1]) - (a[0] * b[2]) + (a[1] * b[3]) + (a[2] * b[0]),
//                 (a[3] * b[2]) + (a[0] * b[1]) - (a[1] * b[0]) + (a[2] * b[3]) 
//             ]
// }

// function rotate(q, v) {
//     let quat_vec = [ v[0], v[1], v[2], 0 ];
//     let quat_res = product(q, product(quat_vec, conjugate(q)));
//     return [ quat_res[0], quat_res[1], quat_res[2]];
// }

// // Normalized
// let normalizedOrientation = [];
// let normalizedAcceleration = [];
// let normalizedRotation = [];
// let normalizedEmg = boundedEmg;

// for(let i = 0; i < filteredTimestamp.length; i++)
// {
//     if(referenceOrientationInverse == undefined)
//         referenceOrientationInverse = conjugate(boundedOrientation[i]);

//     normalizedOrientation.push(product(boundedOrientation[i], referenceOrientationInverse));
//     normalizedAcceleration.push(rotate(referenceOrientationInverse, boundedAcceleration[i]));
//     //normalizedAcceleration.push(rotate(normalizedOrientation[i], [1, 0, 0]));
//     normalizedRotation.push(rotate(referenceOrientationInverse, boundedRotation[i]));
// }

exportData("normalized", dataNormalized);