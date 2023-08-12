const path = require('path');
const fs = require('fs');

function filter(dataRaw)
{
	let dataFiltered_ = new Object();

	function dist(p1, p2) {
	    let n = 0;
	    for(let i = 0; i < p1.length; i++) n += (p1[i] - p2[i]) * (p1[i] - p2[i]); 
	    return Math.sqrt(n);
	}

	// High-pass Filter
	for(var gestureName in dataRaw) {
		dataFiltered_[gestureName] = new Object();

		for(var idUserSample in dataRaw[gestureName]) {
			dataFiltered_[gestureName][idUserSample] = [];

			const gesture = dataRaw[gestureName][idUserSample];

			let previousPoint = gesture[0]

			for(let i = 1; i < gesture.length; i++) {
				const point_i = gesture[i];

	 			if ((dist(point_i.orientation, previousPoint.orientation) + dist(point_i.acceleration, previousPoint.acceleration) +
	 					dist(point_i.rotation, previousPoint.rotation) + dist(point_i.emg, previousPoint.emg)) >= 0.1) {

	                dataFiltered_[gestureName][idUserSample].push(point_i);
	                previousPoint = point_i;
	            }
			}
		}
	}

	let dataFiltered = dataFiltered_;

	// Low-pass Filter
	for(var gestureName in dataFiltered_) {
		for(var idUserSample in dataFiltered_[gestureName]) {
			for(var i = 0; i < dataFiltered_[gestureName][idUserSample].length; i++) {
				for(var j = 0; j < Object.keys(dataFiltered_[gestureName][idUserSample][i]).length; j++) {
					for(var k = 0; k < dataFiltered_[gestureName][idUserSample][i][Object.keys(dataFiltered_[gestureName][idUserSample][i])[j]].length; k++)
					{
						let average = 0;
						const nAverage = Math.min(i + 1, 3);

						for(var l = 0; l < nAverage; l++)
							average += dataFiltered_[gestureName][idUserSample][i - l][Object.keys(dataFiltered_[gestureName][idUserSample][i - l])[j]][k];

						dataFiltered[gestureName][idUserSample][i][Object.keys(dataFiltered[gestureName][idUserSample][i])[j]][k] = average / nAverage;
					}
				}
			}
		}
	}

	return dataFiltered;
}

module.exports = filter;