const path = require('path');
const fs = require('fs');

function importData(verbose)
{
	const fontWhite =  "\x1b[37m";
	const fontYellow = "\x1b[33m"

	const currentDirectory = process.cwd();
	const prepInfoFile = currentDirectory + "\\process-info.json";
	const currentDirectoryParts = currentDirectory.split('backend');
	const backendDirectory = currentDirectoryParts[currentDirectoryParts.length - 2] + "backend";
	const datasetInputDirectory = backendDirectory + "\\src\\datasets\\dynamic\\myo-dataset";

	const prepInfo = JSON.parse(fs.readFileSync(prepInfoFile, 'utf-8'));
	const discardParticipants = prepInfo['discardParticipants'];
	const discardSamples = prepInfo['discardSamples'];
	const righthandedUsers = prepInfo['righthandedParticipants'];
	const lefthandedUsers = prepInfo['lefthandedParticipants'];
	const usbFacingWrist = prepInfo['usbFacingWrist'];
	const usbFacingElbow = prepInfo['usbFacingElbow'];

	let users = [];

	let numberOfGestureClasses = 0;
	let gestureClassesIndex = [];

	let dataRaw = new Object();

	// For each user
	fs.readdirSync(datasetInputDirectory, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((dir) => {
	    const userDirPath = path.join(datasetInputDirectory, dir);
	    const stat = fs.lstatSync(userDirPath);
	    if (!stat.isDirectory()) return;

	    const idUser = parseInt(dir.split("_")[0]);    	
		const idSample = parseInt(dir.split("_")[1]);
		const idUserSample = idUser + "_" + idSample;

	    // Don't include left handed participants for now
	    // if (lefthandedUsers.includes(idUser)) return;

	    // Don't include participants with usb facing elbow for now
	    // if(usbFacingElbow.includes(idUserSample)) return;

		// Don't include samples with different usb configuration
		let sample1FacingWrist = usbFacingWrist.includes(idUser + "_" + 1);
		let sample2FacingWrist = usbFacingWrist.includes(idUser + "_" + 2);
		let sample1FacingElbow = usbFacingElbow.includes(idUser + "_" + 1);
		let sample2FacingElbow = usbFacingElbow.includes(idUser + "_" + 2);

	    // if(sample1FacingWrist != sample2FacingWrist) return;
	    // if(sample1FacingElbow != sample2FacingElbow) return;

	    // Don't include participants in the blacklist
	    if(discardParticipants.includes(idUser)) return;

	    // Don't include samples in the blacklist
	    if(discardSamples.includes(idUserSample)) return;

	    if(!(users.includes(idUser))) users.push(idUser);

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
		        // const orientation = [ parseInt(values[1]), parseInt(values[2]), parseInt(values[3]), parseInt(values[4]) ];	// (x, y, z, w)
		        const orientation = [ parseInt(values[4]), parseInt(values[1]), parseInt(values[2]), parseInt(values[3]) ];		// (w, x, y, z)
		        const acceleration = [ parseInt(values[5]), parseInt(values[6]), parseInt(values[7])];
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

	// Only keep samples for a gesture if the user performed the same gesture more than once
	// for(var gestureName in dataRaw) {
	// 	let newGestureData = []

	// 	for(var idUserSample in dataRaw[gestureName]) {
	// 	    const idUser = parseInt(idUserSample.split("_")[0]);
	// 	    if((dataRaw[gestureName][idUser + "_" + 1] != undefined) && (dataRaw[gestureName][idUser + "_" + 2] != undefined))
	// 	    {
	// 	    	newGestureData[idUser + "_" + 1] = dataRaw[gestureName][idUser + "_" + 1];
	// 	    	newGestureData[idUser + "_" + 2] = dataRaw[gestureName][idUser + "_" + 2];
	// 	    }
	// 	}
	// 	dataRaw[gestureName] = newGestureData;
	// }

	if(verbose)
	{
		console.log();
		console.log(fontYellow, "User".padEnd(8), fontWhite, "Handedness".padEnd(16));

		for(var i in users) {
			const u = users[i];
			if(righthandedUsers.includes(u)) console.log(fontYellow, u.toString().padEnd(8), fontWhite, "Right".padEnd(16), "".padEnd(16));
			if(lefthandedUsers.includes(u)) console.log(fontYellow, u.toString().padEnd(8), fontWhite, "".padEnd(16), "Left".padEnd(16));
		}

		console.log();
		console.log(fontYellow, "Sample".padEnd(8), fontWhite, "Configuration".padEnd(16));

		for(var i in users) {
			const u = users[i];

			if(usbFacingWrist.includes(u + "_" + 1)) console.log(fontYellow, (u + "_" + 1).padEnd(8), fontWhite, "Wrist".padEnd(16), "".padEnd(16));
			if(usbFacingWrist.includes(u + "_" + 2)) console.log(fontYellow, (u + "_" + 2).padEnd(8), fontWhite, "Wrist".padEnd(16), "".padEnd(16));
			if(usbFacingElbow.includes(u + "_" + 1)) console.log(fontYellow, (u + "_" + 1).padEnd(8), fontWhite, "".padEnd(16), "Elbow".padEnd(16));
			if(usbFacingElbow.includes(u + "_" + 2)) console.log(fontYellow, (u + "_" + 2).padEnd(8), fontWhite, "".padEnd(16), "Elbow".padEnd(16));
		}

		console.log();
		console.log(fontYellow, "id".padEnd(8), fontWhite, "Name".padEnd(24), "\t", "Samples".padEnd(16));

		for(var gestureName in dataRaw) {
			console.log(fontYellow, gestureClassesIndex[gestureName].toString().padEnd(8), fontWhite, gestureName.padEnd(24), "\t", Object.keys(dataRaw[gestureName]).length.toString().padEnd(16));
		}
	}

	return dataRaw;
}

module.exports = importData;