const path = require('path');
const fs = require('fs');

function filter(dataRaw)
{
	let dataFiltered = new Object();

	function dist(p1, p2) {
	    let n = 0;
	    for(let i = 0; i < p1.length; i++) n += (p1[i] - p2[i]) * (p1[i] - p2[i]); 
	    return Math.sqrt(n);
	}

	// High-pass Filter
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

	// Low-pass Filter
	// for(var gestureName in dataFiltered) {
	// 	for(var idUserSample in dataFiltered[gestureName]) {
	// 		for(var i = 0; i < dataFiltered[gestureName][idUserSample].length; i++) {
	// 			const point_i = gesture[i];

	// 			for(var j = 0; j < Object.keys(dataFiltered[gestureName][idUserSample][i]).length; j++) {
	// 				for(var k = 0; k < dataFiltered[gestureName][idUserSample][i][j].length; k++)
	// 				{
	// 					let average = 0;

	// 					for(var l = 0; (0 <= (i - l)) && (l < 10); l++)
	// 						average += dataFiltered[gestureName][idUserSample][i - l][j][k];

	// 					console.log("111");
	// 					dataFiltered[gestureName][idUserSample][i][j][k] = average / 10;
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	return dataFiltered;
}

module.exports = filter;