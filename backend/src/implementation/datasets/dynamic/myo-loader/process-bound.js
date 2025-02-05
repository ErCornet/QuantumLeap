const path = require('path');
const fs = require('fs');

// O* -> [-1, +1]
// A* -> [-1, +1]
// R* -> [-1, +1]
// E* -> [ 0, +1]

function bound(dataFiltered)
{
	let dataBounded = new Object();

	// Offset Acceleration.x, Acceleration.y, Acceleration.z Separately
	let minAx = Number.MAX_VALUE;
	let maxAx = Number.MIN_VALUE;
	let minAy = Number.MAX_VALUE;
	let maxAy = Number.MIN_VALUE;
	let minAz = Number.MAX_VALUE;
	let maxAz = Number.MIN_VALUE;

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

				minO = Math.min(minO, minO_);
				minA = Math.min(minA, minA_);
				minR = Math.min(minR, minR_);
				minE = Math.min(minE, minE_);

				maxO = Math.max(maxO, maxO_);
				maxA = Math.max(maxA, maxA_);
				maxR = Math.max(maxR, maxR_);
				maxE = Math.max(maxE, maxE_);

				minAx = Math.min(minAx, point_i.acceleration[0]);
				maxAx = Math.max(maxAx, point_i.acceleration[0]);

				minAy = Math.min(minAy, point_i.acceleration[1]);
				maxAy = Math.max(maxAy, point_i.acceleration[1]);

				minAz = Math.min(minAz, point_i.acceleration[2]);
				maxAz = Math.max(maxAz, point_i.acceleration[2]);
			}
		}
	}

	console.log("Min O : ", minO);
	console.log("Max O : ", maxO);
	console.log("Min A : ", minA);
	console.log("Max A : ", maxA);
	console.log("Min R : ", minR);
	console.log("Max R : ", maxR);
	console.log("Min E : ", minE);
	console.log("Max E : ", maxE);

	console.log("Min Ax : ", minAx);
	console.log("Max Ax : ", maxAx);
	console.log("Min Ay : ", minAy);
	console.log("Max Ay : ", maxAy);
	console.log("Min Az : ", minAz);
	console.log("Max Az : ", maxAz);

	const diffAx = maxAx - minAx;
	const diffAy = maxAy - minAy;
	const diffAz = maxAz - minAz;

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
		        	orientation : [ (point_i.orientation[0] - minO) / diffO, 
		        					(point_i.orientation[1] - minO) / diffO, 
		        					(point_i.orientation[2] - minO) / diffO, 
		        					(point_i.orientation[3] - minO) / diffO ],
		        	acceleration : [((point_i.acceleration[0] - minAx) - (diffAx / 2) - minA) / diffA, 
		        					((point_i.acceleration[1] - minAy) - (diffAy / 2) - minA) / diffA, 
		        					((point_i.acceleration[2] - minAz) - (diffAz / 2) - minA) / diffA ],
		        	rotation : [ 	(point_i.rotation[0] - minR) / diffR, 
		        					(point_i.rotation[1] - minR) / diffR, 
		        					(point_i.rotation[2] - minR) / diffR ],
		        	emg : [ (point_i.emg[0] - minE) / diffE, 
		        			(point_i.emg[1] - minE) / diffE, 
		        			(point_i.emg[2] - minE) / diffE, 
		        			(point_i.emg[3] - minE) / diffE,
		        			(point_i.emg[4] - minE) / diffE, 
		        			(point_i.emg[5] - minE) / diffE, 
		        			(point_i.emg[6] - minE) / diffE, 
		        			(point_i.emg[7] - minE) / diffE]
		        }

		       	for(var j = 0; j < newPoint_i.orientation.length; j++)
		        	newPoint_i.orientation[j] = (2 * newPoint_i.orientation[j]) - 1;

		       	for(var j = 0; j < newPoint_i.acceleration.length; j++)
		        	newPoint_i.acceleration[j] = (2 * newPoint_i.acceleration[j]) - 1;

		        for(var j = 0; j < newPoint_i.rotation.length; j++)
		        	newPoint_i.rotation[j] = (2 * newPoint_i.rotation[j]) - 1;

				dataBounded[gestureName][idUserSample].push(newPoint_i);
			}
		}
	}

	return dataBounded;
}

module.exports = bound;