const path = require('path');
const fs = require('fs');

// Disclaimer : This code only works on datasets with number of samples per user = 0, 1 or 2

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

	const discardRight = prepInfo['discardRight'];
	const discardLeft = prepInfo['discardLeft'];
	const discardWrist = prepInfo['discardWrist'];
	const discardElbow = prepInfo['discardElbow'];
	const discardDifferentConfiguration = prepInfo['discardDifferentConfiguration'];
	const discardSingleSample = prepInfo['discardSingleSample'];

	let users = [];
	let samples = [];

	let numberOfGestureClasses = 0;
	let gestureClassesIndex = [];

	let dataRaw = new Object();

	// For each participant + shot
	fs.readdirSync(datasetInputDirectory, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((dir) => {
	    const userDirPath = path.join(datasetInputDirectory, dir);
	    const stat = fs.lstatSync(userDirPath);
	    if (!stat.isDirectory()) return;

	    const idUser = parseInt(dir.split("_")[0]);    	
		const idBurst = parseInt(dir.split("_")[1]);
		const idSample = idUser + "_" + idBurst;

	    // Don't include participants in the blacklist
	    if(discardParticipants.includes(idUser)) return;

	    // Don't include samples in the blacklist
	    if(discardSamples.includes(idSample)) return;

	    // Don't include samples based on handedness
		if (discardRight && righthandedUsers.includes(idUser)) return;
	    if (discardLeft && lefthandedUsers.includes(idUser)) return;

	    // Don't include samples based on facing
	   	if (discardWrist && usbFacingWrist.includes(idSample)) return;
	    if (discardElbow && usbFacingElbow.includes(idSample)) return;

		// Don't include samples with different usb configuration
		if(discardDifferentConfiguration)
		{
			let sample1FacingWrist = usbFacingWrist.includes(idUser + "_" + 1);
			let sample2FacingWrist = usbFacingWrist.includes(idUser + "_" + 2);
			let sample1FacingElbow = usbFacingElbow.includes(idUser + "_" + 1);
			let sample2FacingElbow = usbFacingElbow.includes(idUser + "_" + 2);

		    if(sample1FacingWrist != sample2FacingWrist) return;
		    if(sample1FacingElbow != sample2FacingElbow) return;
		}
		
		// Don't include participants with single sample
		if(discardSingleSample)
		{
			let sample1FacingWrist = usbFacingWrist.includes(idUser + "_" + 1);
			let sample2FacingWrist = usbFacingWrist.includes(idUser + "_" + 2);
			let sample1FacingElbow = usbFacingElbow.includes(idUser + "_" + 1);
			let sample2FacingElbow = usbFacingElbow.includes(idUser + "_" + 2);

		    if(! ((sample1FacingWrist || sample1FacingElbow) && (sample2FacingWrist || sample2FacingElbow))) return;
		}

		if(!(users.includes(idUser))) users.push(idUser);
		samples.push(idSample);

	    // For each gesture class
	    fs.readdirSync(userDirPath).forEach((gestureFile) => {
	        const gestureClassPath = path.join(userDirPath, gestureFile);
	        const gestureName = gestureFile.split(".")[0];

	        if(dataRaw[gestureName] == undefined) dataRaw[gestureName] = new Object();
	        if(gestureClassesIndex[gestureName] == undefined) gestureClassesIndex[gestureName] = numberOfGestureClasses++;

	        if(dataRaw[gestureName][idSample] == undefined) dataRaw[gestureName][idSample] = [];

	        let lines = fs.readFileSync(gestureClassPath, 'utf-8').split(/\r?\n/);
	        lines = lines.slice(1, lines.length - 1); //remove header and last line

		    lines.forEach(line => {
		        values = line.split(',');

		        const timestamp = parseInt(values[0]);
		        const orientation = [ parseInt(values[4]), parseInt(values[1]), parseInt(values[2]), parseInt(values[3]) ];		// (w, x, y, z)
		        const acceleration = [ parseInt(values[5]), parseInt(values[6]), parseInt(values[7])];
		        const rotation = [ parseInt(values[8]), parseInt(values[9]), parseInt(values[10]) ];
		        const emg = [ parseInt(values[11]), parseInt(values[12]), parseInt(values[13]), parseInt(values[14]), parseInt(values[15]), parseInt(values[16]), parseInt(values[17]), parseInt(values[18]) ];
	
		        // All values except timestamp are completely random
		        // const timestamp = parseInt(values[0]);
		        // const orientation = [ Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100 ];		// (w, x, y, z)
		        // const acceleration = [ Math.random() * 100, Math.random() * 100, Math.random() * 100];
		        // const rotation = [ Math.random() * 100, Math.random() * 100, Math.random() * 100 ];
		        // const emg = [ Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100 ];
	        
		        dataRaw[gestureName][idSample].push(
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

	if(verbose)
	{
		var nUsers = users.length;
		var nSamples = 0;

		console.log();
		console.log(fontYellow, "User".padEnd(8), fontWhite, "Handedness".padEnd(16));

		for(var i in users) {
			const u = users[i];
			if(righthandedUsers.includes(u)) console.log(fontYellow, u.toString().padEnd(8), fontWhite, "Right".padEnd(16), "".padEnd(16));
			if(lefthandedUsers.includes(u)) console.log(fontYellow, u.toString().padEnd(8), fontWhite, "".padEnd(16), "Left".padEnd(16));
		}

		console.log();
		console.log(fontYellow, "Sample".padEnd(8), fontWhite, "Configuration".padEnd(16));

		for(var i in samples) {
			const s = samples[i];

			if(usbFacingWrist.includes(s)) console.log(fontYellow, s.padEnd(8), fontWhite, "Wrist".padEnd(16), "".padEnd(16));
			if(usbFacingElbow.includes(s)) console.log(fontYellow, s.padEnd(8), fontWhite, "".padEnd(16), "Elbow".padEnd(16));
		}

		console.log();
		console.log(fontYellow, "id".padEnd(8), fontWhite, "Name".padEnd(24), "\t", "Samples".padEnd(16));

		for(var gestureName in dataRaw) {
			nSamples += Object.keys(dataRaw[gestureName]).length;
			console.log(fontYellow, gestureClassesIndex[gestureName].toString().padEnd(8), fontWhite, gestureName.padEnd(24), "\t", Object.keys(dataRaw[gestureName]).length.toString().padEnd(16));
		}

		console.log();
		console.log(fontYellow, "Missing Samples:");

		for(var gestureName in dataRaw) {
			for(var i in samples) {
				const s = samples[i];
				if(dataRaw[gestureName][s] == undefined) console.log(fontWhite, gestureName + " - " + s);
			}
		}

		console.log();
		console.log(fontYellow, "Number of Users :", fontWhite, nUsers);

		console.log();
		console.log(fontYellow, "Number of Samples :", fontWhite, nSamples);
	}

	return dataRaw;
}

module.exports = importData;