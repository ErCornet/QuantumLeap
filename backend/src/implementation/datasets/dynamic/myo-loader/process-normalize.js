const path = require('path');
const fs = require('fs');

function normalize(dataBounded)
{
	function normalizeQuaternion(q) {
	    let n = Math.sqrt((q[0] * q[0]) + (q[1] * q[1]) + (q[2] * q[2]) + (q[3] * q[3]));

	    return [ q[0] / n, q[1] / n, q[2] / n, q[3] / n ];
	}

	function conjugate(q) {
	    return [ q[0], -q[1], -q[2], -q[3] ];
	}

	function product(a, b) {
	    return  [
	                (a[0] * b[0]) - (a[1] * b[1]) - (a[2] * b[2]) - (a[3] * b[3]),
	                (a[0] * b[1]) + (a[1] * b[0]) + (a[2] * b[3]) - (a[3] * b[2]),
	                (a[0] * b[2]) - (a[1] * b[3]) + (a[2] * b[0]) + (a[3] * b[1]),
	                (a[0] * b[3]) + (a[1] * b[2]) - (a[2] * b[1]) + (a[3] * b[0])
	            ]
	}

	function rotate(q, v) {
	    let quat_vec = [ 0, v[0], v[1], v[2]];
	    let quat_res = product(product(q, quat_vec), conjugate(q));
	    return [ quat_res[1], quat_res[2], quat_res[3]];
	}

	function quaternion(v1, v2)
	{
		function norm(v)
		{
			return Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));
		}

		function dotProduct(v1, v2)
		{
			return (v1[0] * v2[0]) + (v1[1] * v2[1]) + (v1[2] * v2[2]);
		}

		const n1 = norm(v1);
		const n2 = norm(v2);
		return normalizeQuaternion([ Math.sqrt((n1 * n1) * (n2 * n2)) + dotProduct(v1, v2), 
									(v1[1] * v2[2]) - (v1[2] * v2[1]),
									(v1[2] * v2[0]) - (v1[0] * v2[2]),
									(v1[0] * v2[1]) - (v1[1] * v2[0])]);
	}

	let dataNormalized = new Object();

	// for(var idUserSample in dataBounded[gestureName]) {

	// }

	for(var gestureName in dataBounded) {
		dataNormalized[gestureName] = new Object();

		for(var idUserSample in dataBounded[gestureName]) {
			dataNormalized[gestureName][idUserSample] = [];

			// let rotationX = product(conjugate(dataBounded["calibration"]["1_1"][0].orientation), dataBounded["calibration"][idUserSample][0].orientation);
			// rotationX = normalizeQuaternion([rotationX[0], rotationX[1], 0, 0]);		
			let acc1 = dataBounded["calibration"]["1_1"][0].acceleration;
			acc1[0] = 0;
			let acc2 = dataBounded["calibration"][idUserSample][0].acceleration;
			acc2[0] = 0;
			let rotationX = quaternion(acc1, acc2);
			rotationX = normalizeQuaternion([rotationX[0], rotationX[1], 0, 0]);																			// Keep w & x components

			const referenceOrientation = product(conjugate(rotationX), dataBounded["calibration"][idUserSample][0].orientation);

			for(var i = 0; i < dataBounded[gestureName][idUserSample].length; i++) {
				const point_i = dataBounded[gestureName][idUserSample][i];
				
				const relativeOrientation = product(conjugate(referenceOrientation), product(conjugate(rotationX), point_i.orientation));
				const relativeAcceleration = rotate(conjugate(rotationX), point_i.acceleration);
				const relativeRotation = rotate(conjugate(rotationX), point_i.rotation);

				const newPoint_i = {
		        	timestamp : point_i.timestamp,
		        	orientation : relativeOrientation,
		        	acceleration : relativeAcceleration,
		        	rotation : relativeRotation,
		        	emg : point_i.emg,
		        	direction : rotate(relativeOrientation, [1, 0, 0])
		        };

				dataNormalized[gestureName][idUserSample].push(newPoint_i);
			}
		}
	}

	// Tests

	// const v1 = [10, 0, 0];
	// const v2 = [0, 1, 0];
	// const q12 = quaternion(v1, v2);

	// const q1 = normalizeQuaternion([0, 0.5, 0, 0.5]);
	// const q2 = normalizeQuaternion([0, 0, 0.5, 0.5]);

	// const q1 = normalizeQuaternion([8800, 1500, -13700, 100]);
	// const q2 = normalizeQuaternion([-8800, -1200, 13700, 100]);

	// console.log(rotate(q1, [1,0,0]))
	// console.log(rotate(q2, [1,0,0]))
	// console.log(product(conjugate(q1), q2))
	// console.log(rotate(product(conjugate(q1), q2), [1,0,0]))

	return dataNormalized;
}

module.exports = normalize;