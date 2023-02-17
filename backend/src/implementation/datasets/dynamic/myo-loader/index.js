const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../../framework/gestures/stroke-data').Path;
const PointND = require('../../../../framework/gestures/point').PointND;

function bound(a) {
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;
    let a_ = [];

    a.forEach(p => { 
        if (max < Math.max(...p)) max = Math.max(...p); 
        if (min > Math.min(...p)) min = Math.min(...p);
    });

    a.forEach(p => { 
        let aa = []
        p.forEach(pp => {aa.push((pp - min) / (max - min))});
        a_.push(aa);
    });

    return a_;
}

function dist(p1, p2) {
    let n = 0;
    for(let i = 0; i < p1.length; i++) n += (p1[i] - p2[i]) * (p1[i] - p2[i]); 
    return Math.sqrt(n);
}

function normalizeQuaternion(q) {
    let n = Math.sqrt((q[0] * q[0]) + (q[1] * q[1]) + (q[2] * q[2]) + (q[3] * q[3]));

    return [ q[0] / n, q[1] / n, q[2] / n, q[3] / n ];
}

function conjugate(q) {
    return [ -q[0], -q[1], -q[2], q[3] ];
}

function product(a, b) {
    return  [    
                (a[3] * b[3]) - (a[0] * b[0]) - (a[1] * b[1]) - (a[2] * b[2]),
                (a[3] * b[0]) + (a[0] * b[3]) + (a[1] * b[2]) - (a[2] * b[1]),
                (a[3] * b[1]) - (a[0] * b[2]) + (a[1] * b[3]) + (a[2] * b[0]),
                (a[3] * b[2]) + (a[0] * b[1]) - (a[1] * b[0]) + (a[2] * b[3]) 
            ]
}

function rotate(q, v) {
    let quat_vec = [ v[0], v[1], v[2], 0 ];
    let quat_res = product(q, product(quat_vec, conjugate(q)));
    return [ quat_res[0], quat_res[1], quat_res[2]];
}

function exportData(strokeData, name, gestureName, sensorId, userID, userSampleID, t, o, a, r, e) {
    let orientationStroke = new Stroke(0);
    let accelerationStroke = new Stroke(0);
    let rotationStroke = new Stroke(0);
    let emgStroke = new Stroke(0);

    for(let i = 0; i < o.length; i++)
    {
        orientationStroke.addPoint(new PointND(o[i], t[i]));
        accelerationStroke.addPoint(new PointND(a[i], t[i]));
        rotationStroke.addPoint(new PointND(r[i], t[i]));
        emgStroke.addPoint(new PointND(e[i], t[i]));
    }

    let orientationStrokePath = new Path(addIdentifier(name + "Orientation", sensorId));
    let accelerationStrokePath = new Path(addIdentifier(name + "Acceleration", sensorId));
    let rotationStrokePath = new Path(addIdentifier(name + "Rotation", sensorId));
    let emgStrokePath = new Path(addIdentifier(name + "EMG", sensorId));

    orientationStrokePath.addStroke(orientationStroke);
    accelerationStrokePath.addStroke(accelerationStroke);
    rotationStrokePath.addStroke(rotationStroke);
    emgStrokePath.addStroke(emgStroke);

    strokeData.addPath(addIdentifier(name + "Orientation", sensorId), orientationStrokePath);
    strokeData.addPath(addIdentifier(name + "Acceleration", sensorId), accelerationStrokePath);
    strokeData.addPath(addIdentifier(name + "Rotation", sensorId), rotationStrokePath);
    strokeData.addPath(addIdentifier(name + "EMG", sensorId), emgStrokePath);

    let csvContent = "Timestamp, Orientation x, Orientation y, Orientation z, Orientation w, Acceleration x, Acceleration y, Acceleration z, Rotation x, Rotation y, Rotation z, EMG 0, EMG 1, EMG 2, EMG 3, EMG 4, EMG 5, EMG 6, EMG 7\n";

    for(let i = 0; i < t.length; i++) {
        csvContent +=   t[i]
                + "," + o[i][0]
                + "," + o[i][1]
                + "," + o[i][2] 
                + "," + o[i][3]
                + "," + a[i][0]
                + "," + a[i][1]
                + "," + a[i][2] 
                + "," + r[i][0]
                + "," + r[i][1]
                + "," + r[i][2] 
                + "," + e[i][0]
                + "," + e[i][1]
                + "," + e[i][2] 
                + "," + e[i][3] 
                + "," + e[i][4] 
                + "," + e[i][5] 
                + "," + e[i][6] 
                + "," + e[i][7] 
                + "\n";
    }

    fs.writeFileSync("./Export/" + name + "/" + name + "_" + gestureName + "_" + userID + "_" + userSampleID + ".csv", csvContent, (err) => { if (err) console.error(err); });
}

function loadDataset(name, datasetPath, sensorId, datasetId, sensorsPointsNames) {
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;
    let gestureIndex = 0;
    
    let gestureClasses = [];

    let lefthanded = [];
    fs.readFileSync(dirPath + "\\lefthanded.txt", 'utf-8').split(",").forEach(n => { lefthanded.push(parseInt(n)); });

    // For each user
    fs.readdirSync(dirPath, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((dir) => {
        let userDirPath = path.join(dirPath, dir);

        var stat = fs.lstatSync(userDirPath);
        if (!stat.isDirectory())
            return;

        let userID = parseInt(dir.split("_")[0]);

        // Don't include left handed participants for now
        if (lefthanded.includes(userID))
            return;
        
        let userSampleID = parseInt(dir.split("_")[1]);

        let referenceOrientationInverse = undefined;

        // For each gesture class
        fs.readdirSync(userDirPath).forEach((gestureFile) => {
            let gestureClassPath = path.join(userDirPath, gestureFile);
            let gestureName = addIdentifier(gestureFile.split(".")[0], datasetId);

            if(gestureClasses[gestureName] == undefined) gestureClasses[gestureName] = new GestureClass(gestureName, gestureIndex++);

            let strokeData = new StrokeData(userID, userSampleID);

            let lines = fs.readFileSync(gestureClassPath, 'utf-8').split(/\r?\n/);
            lines = lines.slice(1, lines.length - 1); //remove header and last line

            let referenceTimestamp = undefined;
            let timestamp = [];
            let orientation = [];
            let acceleration = [];
            let rotation = [];
            let emg = [];

            lines.forEach(line => {
                values = line.split(',');

                if(referenceTimestamp == undefined)
                    referenceTimestamp = parseInt(values[0]);

                let t = parseInt(values[0]) - referenceTimestamp;

                timestamp.push(t);
                orientation.push([ parseInt(values[1]), parseInt(values[2]), parseInt(values[3]), parseInt(values[4]) ]);
                acceleration.push([ parseInt(values[5]), parseInt(values[6]) + 4000, parseInt(values[7]) + 1700 ]);
                rotation.push([ parseInt(values[8]), parseInt(values[9]), parseInt(values[10]) ]);
                emg.push([ parseInt(values[11]), parseInt(values[12]), parseInt(values[13]), parseInt(values[14]), parseInt(values[15]), parseInt(values[16]), parseInt(values[17]), parseInt(values[18]) ]);
            })

            // Raw
            exportData(strokeData, "Raw", gestureName, sensorId, userID, userSampleID, timestamp, orientation, acceleration, rotation, emg);

            // Filtered
            let filteredTimestamp = [];
            let filteredOrientation = [];
            let filteredAcceleration = [];
            let filteredRotation = [];
            let filteredEmg = [];

            let previousTimestamp = timestamp[0];
            let previousOrientation = orientation[0];
            let previousAcceleration = acceleration[0];
            let previousRotation = rotation[0];
            let previousEmg = emg[0];

            filteredTimestamp.push(previousTimestamp);
            filteredOrientation.push(previousOrientation);
            filteredAcceleration.push(previousAcceleration);
            filteredRotation.push(previousRotation);
            filteredEmg.push(previousEmg);

            for(let i = 1; i < timestamp.length; i++) {
                if ((dist(orientation[i], previousOrientation) >= 0.1) || (dist(acceleration[i], previousAcceleration) >= 0.1) || (dist(rotation[i], previousRotation) >= 0.1) || (dist(emg[i], previousEmg) >= 0.1)) {
                    previousTimestamp = timestamp[i];
                    previousOrientation = orientation[i];
                    previousAcceleration = acceleration[i];
                    previousRotation = rotation[i];
                    previousEmg = emg[i];

                    filteredTimestamp.push(previousTimestamp);
                    filteredOrientation.push(previousOrientation);
                    filteredAcceleration.push(previousAcceleration);
                    filteredRotation.push(previousRotation);
                    filteredEmg.push(previousEmg);
                }
            }

            exportData(strokeData, "Filtered", gestureName, sensorId, userID, userSampleID, filteredTimestamp, filteredOrientation, filteredAcceleration, filteredRotation, filteredEmg);

            // Bounded
            boundedOrientation = [];
            filteredOrientation.forEach(p => { boundedOrientation.push(normalizeQuaternion(p)); });
            boundedAcceleration = bound(filteredAcceleration);
            boundedRotation = bound(filteredRotation);
            boundedEmg = bound(filteredEmg);

            exportData(strokeData, "Bounded", gestureName, sensorId, userID, userSampleID, filteredTimestamp, boundedOrientation, boundedAcceleration, boundedRotation, boundedEmg);

            // Normalized
            let normalizedOrientation = [];
            let normalizedAcceleration = [];
            let normalizedRotation = [];
            let normalizedEmg = boundedEmg;

            for(let i = 0; i < filteredTimestamp.length; i++)
            {
                if(referenceOrientationInverse == undefined)
                    referenceOrientationInverse = conjugate(boundedOrientation[i]);

                normalizedOrientation.push(product(boundedOrientation[i], referenceOrientationInverse));
                normalizedAcceleration.push(rotate(referenceOrientationInverse, boundedAcceleration[i]));
                //normalizedAcceleration.push(rotate(normalizedOrientation[i], [1, 0, 0]));
                normalizedRotation.push(rotate(referenceOrientationInverse, boundedRotation[i]));
            }

            exportData(strokeData, "Normalized", gestureName, sensorId, userID, userSampleID, filteredTimestamp, normalizedOrientation, normalizedAcceleration, normalizedRotation, normalizedEmg);

            gestureClasses[gestureName].addSample(strokeData);
        });
    });

    for(var key in gestureClasses) gestureSet.addGestureClass(gestureClasses[key]); 

    return gestureSet;
}

function addIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
};