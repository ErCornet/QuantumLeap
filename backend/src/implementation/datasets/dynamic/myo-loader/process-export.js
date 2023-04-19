const path = require('path');
const fs = require('fs');

const fontWhite =  "\x1b[37m";
const fontYellow = "\x1b[33m"

const currentDirectory = process.cwd();
const prepInfoFile = currentDirectory + "\\process-info.json";
const currentDirectoryParts = currentDirectory.split('backend');
const backendDirectory = currentDirectoryParts[currentDirectoryParts.length - 2] + "backend";
const datasetInputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset";

function exportData(datatype, dataObject) {
	console.log();
	console.log(fontYellow, "Exporting Data ", fontWhite, "(", datatype, ")");

	const datasetOutputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset-" + datatype;
	const analyseOutputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset-analyse";

	let csvHeader = "";

	if(dataObject["calibration"]["1_1"][0].direction != undefined)
		csvHeader = "Timestamp;Orientation_W;Orientation_X;Orientation_Y;Orientation_Z;Acceleration_X;Acceleration_Y;Acceleration_Z;Rotation_X;Rotation_Y;Rotation_Z;EMG_0;EMG_1;EMG_2;EMG_3;EMG_4;EMG_5;EMG_6;EMG_7;Direction_X;Direction_Y;Direction_Z\n";
	else
		csvHeader = "Timestamp;Orientation_W;Orientation_X;Orientation_Y;Orientation_Z;Acceleration_X;Acceleration_Y;Acceleration_Z;Rotation_X;Rotation_Y;Rotation_Z;EMG_0;EMG_1;EMG_2;EMG_3;EMG_4;EMG_5;EMG_6;EMG_7\n";

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
		    	if(gesture[i].direction != undefined)
		    	{
		    		csvContentUserSample += gesture[i].timestamp
						                + ";" + gesture[i].orientation[0] + ";" + gesture[i].orientation[1] + ";" + gesture[i].orientation[2] + ";" + gesture[i].orientation[3]
						                + ";" + gesture[i].acceleration[0] + ";" + gesture[i].acceleration[1] + ";" + gesture[i].acceleration[2] 
						                + ";" + gesture[i].rotation[0] + ";" + gesture[i].rotation[1] + ";" + gesture[i].rotation[2] 
						                + ";" + gesture[i].emg[0] + ";" + gesture[i].emg[1] + ";" + gesture[i].emg[2] + ";" + gesture[i].emg[3] 
						                + ";" + gesture[i].emg[4] + ";" + gesture[i].emg[5] + ";" + gesture[i].emg[6] + ";" + gesture[i].emg[7] 
						                + ";" + gesture[i].direction[0] + ";" + gesture[i].direction[1] + ";" + gesture[i].direction[2] 
						                + "\n";
		    	}
				else
				{
			    	csvContentUserSample += gesture[i].timestamp
						                + ";" + gesture[i].orientation[0] + ";" + gesture[i].orientation[1] + ";" + gesture[i].orientation[2] + ";" + gesture[i].orientation[3]
						                + ";" + gesture[i].acceleration[0] + ";" + gesture[i].acceleration[1] + ";" + gesture[i].acceleration[2] 
						                + ";" + gesture[i].rotation[0] + ";" + gesture[i].rotation[1] + ";" + gesture[i].rotation[2] 
						                + ";" + gesture[i].emg[0] + ";" + gesture[i].emg[1] + ";" + gesture[i].emg[2] + ";" + gesture[i].emg[3] 
						                + ";" + gesture[i].emg[4] + ";" + gesture[i].emg[5] + ";" + gesture[i].emg[6] + ";" + gesture[i].emg[7] 
						                + "\n";
				}
		    }

		    csvContentUserSample = csvContentUserSample.replace(/["."]/g, ",");
		    csvContent += csvContentUserSample + "\n";
		    csvContentUserSample = csvHeader + csvContentUserSample;

		    //fs.writeFileSync(analyseOutputFileUserSample, csvContentUserSample, (err) => { if (err) console.error(err); });
		}

		fs.writeFileSync(analyseOutputFile, csvContent, (err) => { if (err) console.error(err); });
	}
}

module.exports = exportData;