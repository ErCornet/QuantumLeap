const path = require('path');
const fs = require('fs');

const fontWhite =  "\x1b[37m";
const fontYellow = "\x1b[33m"

const currentDirectory = process.cwd();
const prepInfoFile = currentDirectory + "\\process-info.json";
const currentDirectoryParts = currentDirectory.split('backend');
const backendDirectory = currentDirectoryParts[currentDirectoryParts.length - 2] + "backend";
const datasetInputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset";

const DELIM = ',';

function exportData(datatype, dataObject) {
	console.log();
	console.log(fontYellow, "Exporting Data ", fontWhite, "(", datatype, ")");

	const datasetOutputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset-" + datatype;
	const analyseOutputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset-analyse";

	let csvHeader = "";

	csvHeader = "Timestamp" + DELIM + 
				"Orientation_W" + DELIM + 
				"Orientation_X" + DELIM + 
				"Orientation_Y" + DELIM + 
				"Orientation_Z" + DELIM + 
				"Acceleration_X" + DELIM + 
				"Acceleration_Y" + DELIM + 
				"Acceleration_Z" + DELIM + 
				"Rotation_X" + DELIM + 
				"Rotation_Y" + DELIM + 
				"Rotation_Z" + DELIM + 
				"EMG_0" + DELIM + 
				"EMG_1" + DELIM + 
				"EMG_2" + DELIM + 
				"EMG_3" + DELIM + 
				"EMG_4" + DELIM + 
				"EMG_5" + DELIM + 
				"EMG_6" + DELIM + 
				"EMG_7\n";

	for(var gestureName in dataObject) {
		const datasetOutputFile = datasetOutputDirectory + "\\" + gestureName + ".json";

		fs.writeFileSync(datasetOutputFile, JSON.stringify(dataObject[gestureName]), (err) => { if (err) console.error(err); });

		const analyseOutputFile = analyseOutputDirectory + "\\" + datatype + "_" + gestureName + ".csv";

		let csvContent = csvHeader;

		for(var idUserSample in dataObject[gestureName])
		{
			const analyseOutputFileUserSample = analyseOutputDirectory + "\\" + datatype + "_" + gestureName + "_" + idUserSample + ".csv";

			let csvContentUserSample = "";
			
			const gesture = dataObject[gestureName][idUserSample]

		    for(let i = 0; i < gesture.length; i++) {
			    csvContentUserSample += gesture[i].timestamp + DELIM + 
			    						gesture[i].orientation[0] + DELIM + 
			    						gesture[i].orientation[1] + DELIM + 
			    						gesture[i].orientation[2] + DELIM + 
			    						gesture[i].orientation[3] + DELIM + 
			    						gesture[i].acceleration[0] + DELIM + 
			    						gesture[i].acceleration[1] + DELIM + 
			    						gesture[i].acceleration[2] + DELIM + 
			    						gesture[i].rotation[0] + DELIM + 
			    						gesture[i].rotation[1] + DELIM + 
			    						gesture[i].rotation[2] + DELIM + 
			    						gesture[i].emg[0] + DELIM + 
			    						gesture[i].emg[1] + DELIM + 
			    						gesture[i].emg[2] + DELIM + 
			    						gesture[i].emg[3] + DELIM + 
			    						gesture[i].emg[4] + DELIM + 
			    						gesture[i].emg[5] + DELIM + 
			    						gesture[i].emg[6] + DELIM + 
			    						gesture[i].emg[7] + "\n";
		    }

		    csvContent += csvContentUserSample + "\n";
		    csvContentUserSample = csvHeader + csvContentUserSample;
		}

		fs.writeFileSync(analyseOutputFile, csvContent, (err) => { if (err) console.error(err); });
	}
}

module.exports = exportData;