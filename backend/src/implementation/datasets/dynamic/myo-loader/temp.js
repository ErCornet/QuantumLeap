function normalizeQuaternion(q) {
    let n = Math.sqrt((q[0] * q[0]) + (q[1] * q[1]) + (q[2] * q[2]) + (q[3] * q[3]));

    return [ q[0] / n, q[1] / n, q[2] / n, q[3] / n ];
}

function normalizeVector(v) {
    let n = Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));

    return [ v[0] / n, v[1] / n, v[2] / n];
}

function norm(v) {
    return Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));
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

function dotProduct(v1, v2)
{
	return (v1[0] * v2[0]) + (v1[1] * v2[1]) + (v1[2] * v2[2]);
}

function crossProduct(v1, v2)
{
	return [ 	(v1[1] * v2[2]) - (v1[2] * v2[1]),
				(v1[2] * v2[0]) - (v1[0] * v2[2]),
				(v1[0] * v2[1]) - (v1[1] * v2[0])];
}

function quaternion(v1, v2)
{
	const n1 = norm(v1);
	const n2 = norm(v2);
	const c = crossProduct(v1, v2);
	return normalizeQuaternion([ Math.sqrt((n1 * n1) * (n2 * n2)) + dotProduct(v1, v2), c[0], c[1], c[2]] );
}

// -----------

function axisRotationToQuaternion(v, a)
{
    return [ Math.cos(a / 2.0), v[0] * Math.sin(a / 2.0), v[1] * Math.sin(a / 2.0), v[2] * Math.sin(a / 2.0) ];
}

function stringQ(Q)
{
    return "[ " + Number(Q[0]).toFixed(2) + " , " + Number(Q[1]).toFixed(2) + " , " + Number(Q[2]).toFixed(2) + " , " + Number(Q[3]).toFixed(2) + " ]";
}

function stringV(V)
{
    return "[ " + Number(V[0]).toFixed(2) + " , " + Number(V[1]).toFixed(2) + " , " + Number(V[2]).toFixed(2) + " ]";
}

console.clear();

const armbandOrientation1 = axisRotationToQuaternion([1, 0, 0], (50 / 180) * Math.PI)       // Rot. x : 50°
const armbandOrientation2 = axisRotationToQuaternion([1, 0, 0], (-100 / 180) * Math.PI)     // Rot. x : -100°
const userOrientation1 = axisRotationToQuaternion([0, 0, 1], (70 / 180) * Math.PI)          // Rot. z : 70°
const userOrientation2 = axisRotationToQuaternion([0, 0, 1], (200 / 180) * Math.PI)         // Rot. x : 50°
const orientation1 = product(userOrientation1, armbandOrientation1);                        // Rot. x : 50° -> Rot. Z : 70°
const orientation2 = product(userOrientation2, armbandOrientation2);                        // Rot. x : -100° -> Rot. Z : 200°
const direction1 = rotate(orientation1, [1, 0, 0]);
const direction2 = rotate(orientation2, [1, 0, 0]);

console.log("Armband Orientation 1 : ", stringQ(armbandOrientation1));
console.log("Armband Orientation 2 : ", stringQ(armbandOrientation2));
console.log("User Orientation 1 : ", stringQ(userOrientation1));
console.log("User Orientation 2 : ", stringQ(userOrientation2));

console.log("Orientation 1 : ", stringQ(orientation1));
console.log("Orientation 2 : ", stringQ(orientation2));
console.log("Direction 1 : ", stringV(direction1));
console.log("Direction 2 : ", stringV(direction2));
console.log();

const referenceOrientation = orientation1;
const diffOrientation1 = product(conjugate(referenceOrientation), orientation1);
const diffOrientation2 = product(conjugate(referenceOrientation), orientation2);
const normalizedOrientation1 = product(orientation1, conjugate(diffOrientation1));
const normalizedOrientation2 = product(orientation2, conjugate(diffOrientation2));
const normalizedDirection1 = rotate(normalizedOrientation1, [1, 0, 0]);
const normalizedDirection2 = rotate(normalizedOrientation2, [1, 0, 0]);

console.log("Diff. Orientation 1 : ", stringQ(diffOrientation1));
console.log("Diff. Orientation 2 : ", stringQ(diffOrientation2));
console.log("Normalized Orientation 1 : ", stringQ(normalizedOrientation1));
console.log("Normalized Orientation 2 : ", stringQ(normalizedOrientation2));
console.log("Normalized Direction 1 : ", stringV(normalizedDirection1));
console.log("Normalized Direction 2 : ", stringV(normalizedDirection2));
console.log();

console.log(stringQ(product(orientation1, product(conjugate(orientation1), orientation1))));
console.log(stringQ(product(orientation1, product(conjugate(orientation2), orientation2))));

// -----------

const Gravity = [0, 0, -1];
const Acceleration1 = rotate(orientation1, Gravity);
const Acceleration2 = rotate(orientation2, Gravity);

console.log("Acceleration 1 : ", Acceleration1);
console.log("Acceleration 2 : ", Acceleration2);
console.log();

const normalizedGravity1 = rotate(conjugate(orientation1), Acceleration1);
const normalizedGravity2 = rotate(conjugate(orientation2), Acceleration2);

console.log("Normalized Gravity 1 : ", normalizedGravity1);
console.log("Normalized Gravity 2 : ", normalizedGravity2);
console.log();

// Q = normalizeQuaternion([ 1, 10, 0.7, 0.94]);
// console.log(Q);

// Vx = rotate(Q, [1, 0, 0]);
// console.log(Vx);

// Qyz = quaternion([1, 0, 0], Vx);
//  console.log(Qyz)

return;