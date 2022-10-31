const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../../framework/gestures/stroke-data').Path;
const PointND = require('../../../../framework/gestures/point').PointND;

function quat_normalize(quat) {
    let magnitude = Math.sqrt((quat[0] * quat[0]) + (quat[1] * quat[1]) + (quat[2] * quat[2]) + (quat[3] * quat[3]));

    return [ quat[0] / magnitude, quat[1] / magnitude, quat[2] / magnitude, quat[3] / magnitude ];
}

function quat_conjugate(quat) {
    return [ - quat[0], - quat[1], - quat[2], quat[3] ];
}

function quat_product(quat1, quat2) {
    return  [    
                (quat1[3] * quat2[0]) + (quat1[0] * quat2[3]) + (quat1[1] * quat2[2]) - (quat1[2] * quat2[1]),
                (quat1[3] * quat2[1]) - (quat1[0] * quat2[2]) + (quat1[1] * quat2[3]) + (quat1[2] * quat2[0]),
                (quat1[3] * quat2[2]) + (quat1[0] * quat2[1]) - (quat1[1] * quat2[0]) + (quat1[2] * quat2[3]),
                (quat1[3] * quat2[3]) - (quat1[0] * quat2[0]) - (quat1[1] * quat2[1]) - (quat1[2] * quat2[2]) 
            ]
}

function quat_rotate(quat, vec) {
    quat_vec = [ vec[0], vec[1], vec[2], 0 ];
    quat_res = quat_product(quat, quat_product(quat_vec, quat_conjugate(quat)));
    return [ quat_res[0], quat_res[1], quat_res[2], 0];
}

function vec_normalize(vec) {
    let magnitude = Math.sqrt((vec[0] * vec[0]) + (vec[1] * vec[1]) + (vec[2] * vec[2]));

    return [ vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude ];
}

function loadDataset(name, datasetPath, sensorId, datasetId, sensorsPointsNames) {
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;
    let gestureIndex = 0;
    
    let gestureClasses = [];

    // For each user
    fs.readdirSync(dirPath, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((dir) => {
        let userDirPath = path.join(dirPath, dir);

        var stat = fs.lstatSync(userDirPath);
        if (!stat.isDirectory())
            return;

        let userID = parseInt(dir.split("_")[0]);
        let userSampleID = parseInt(dir.split("_")[1]);

        let referenceOrientation = [];

        // For each gesture class
        fs.readdirSync(userDirPath).forEach((gestureFile) => {
            let gestureClassPath = path.join(userDirPath, gestureFile);
            let gestureName = addIdentifier(gestureFile.split(".")[0], datasetId);

            if(gestureClasses[gestureName] == undefined) gestureClasses[gestureName] = new GestureClass(gestureName, gestureIndex++);

            let strokeData = new StrokeData(userID, userSampleID);

            let lines = fs.readFileSync(gestureClassPath, 'utf-8').split(/\r?\n/);
            lines = lines.slice(1, lines.length - 1); //remove header and last line

            let orientationStrokePath = new Path(addIdentifier("Orientation", sensorId));
            let accelerationStrokePath = new Path(addIdentifier("Acceleration", sensorId));
            let rotationStrokePath = new Path(addIdentifier("Rotation", sensorId));
            let emgStrokePath = new Path(addIdentifier("EMG", sensorId));

            let normOrientationStrokePath = new Path(addIdentifier("NormOrientation", sensorId));
            let normAccelerationStrokePath = new Path(addIdentifier("NormAcceleration", sensorId));
            let normRotationStrokePath = new Path(addIdentifier("NormRotation", sensorId));

            let modOrientationStrokePath = new Path(addIdentifier("ModOrientation", sensorId));
            let modAccelerationStrokePath = new Path(addIdentifier("ModAcceleration", sensorId));
            let modRotationStrokePath = new Path(addIdentifier("ModRotation", sensorId));

            let orientationStroke = new Stroke(0);
            let accelerationStroke = new Stroke(0);
            let rotationStroke = new Stroke(0);
            let emgStroke = new Stroke(0);

            let normOrientationStroke = new Stroke(0);
            let normAccelerationStroke = new Stroke(0);
            let normRotationStroke = new Stroke(0);

            let modOrientationStroke = new Stroke(0);
            let modAccelerationStroke = new Stroke(0);
            let modRotationStroke = new Stroke(0);

            let referenceTimestamp;

            lines.forEach(line => {
                values = line.split(',');

                // Timestamp
                let timestamp = parseInt(values[0]);

                if(referenceTimestamp == undefined)
                    referenceTimestamp = timestamp;

                let t = timestamp - referenceTimestamp;

                // Orientation
                let oriCoord = [ parseInt(values[1]), parseInt(values[2]), parseInt(values[3]), parseInt(values[4]) ];

                orientationStroke.addPoint(new PointND(oriCoord, t));

                // Acceleration
                let accCoord = [ parseInt(values[5]), parseInt(values[6]), parseInt(values[7]) ];
                accelerationStroke.addPoint(new PointND(accCoord, t));

                // Rotation
                let rotCoord = [ parseInt(values[8]), parseInt(values[9]), parseInt(values[10]) ];
                rotationStroke.addPoint(new PointND(rotCoord, t));

                // EMG
                let emgCoord = [ parseInt(values[11]), parseInt(values[12]), parseInt(values[13]), parseInt(values[14]), parseInt(values[15]), parseInt(values[16]), parseInt(values[17]), parseInt(values[18]) ];
                emgStroke.addPoint(new PointND(emgCoord, t));

                //

                // Norm. Orientation
                let normOriCoord = quat_normalize(oriCoord);
                normOrientationStroke.addPoint(new PointND(normOriCoord, t));

                // Norm. Acceleration
                let normAccCoord = vec_normalize(accCoord);
                normAccelerationStroke.addPoint(new PointND(normAccCoord, t));

                // Norm. Rotation
                let normRotCoord = vec_normalize(rotCoord);
                normRotationStroke.addPoint(new PointND(normRotCoord, t));

                //

                // Mod. Orientation
                if(gestureName === "calibration")
                    referenceOrientation = quat_normalize(oriCoord);

                let modOriCoord = quat_product(quat_conjugate(referenceOrientation), normOriCoord);
                modOrientationStroke.addPoint(new PointND(modOriCoord, t));

                // Mod. Acceleration
                let modAccCoord = quat_rotate(referenceOrientation, normAccCoord);
                modAccelerationStroke.addPoint(new PointND(modAccCoord, t));

                // Mod. Rotation
                let modRotCoord = quat_rotate(referenceOrientation, normRotCoord);
                modRotationStroke.addPoint(new PointND(modRotCoord, t));
            })

            orientationStrokePath.addStroke(orientationStroke);
            accelerationStrokePath.addStroke(accelerationStroke);
            rotationStrokePath.addStroke(rotationStroke);
            emgStrokePath.addStroke(emgStroke);

            normOrientationStrokePath.addStroke(normOrientationStroke);
            normAccelerationStrokePath.addStroke(normAccelerationStroke);
            normRotationStrokePath.addStroke(normRotationStroke);
            
            modOrientationStrokePath.addStroke(modOrientationStroke);
            modAccelerationStrokePath.addStroke(modAccelerationStroke);
            modRotationStrokePath.addStroke(modRotationStroke);

            strokeData.addPath(addIdentifier("Orientation", sensorId), orientationStrokePath);
            strokeData.addPath(addIdentifier("Acceleration", sensorId), accelerationStrokePath);
            strokeData.addPath(addIdentifier("Rotation", sensorId), rotationStrokePath);
            strokeData.addPath(addIdentifier("EMG", sensorId), emgStrokePath);

            strokeData.addPath(addIdentifier("NormOrientation", sensorId), normOrientationStrokePath);
            strokeData.addPath(addIdentifier("NormAcceleration", sensorId), normAccelerationStrokePath);
            strokeData.addPath(addIdentifier("NormRotation", sensorId), normRotationStrokePath);

            strokeData.addPath(addIdentifier("ModOrientation", sensorId), modOrientationStrokePath);
            strokeData.addPath(addIdentifier("ModAcceleration", sensorId), modAccelerationStrokePath);
            strokeData.addPath(addIdentifier("ModRotation", sensorId), modRotationStrokePath);

            gestureClasses[gestureName].addSample(strokeData);
        });
    });


    for(var key in gestureClasses) gestureSet.addGestureClass(gestureClasses[key]); 

    console.log(gestureSet.getGestureClasses().get('FistDownOnce').samples[0].paths['Orientation_myo'].strokes[0].points[0]);
    console.log(gestureSet.getGestureClasses().get('FistDownOnce').samples[1].paths['NormOrientation_myo'].strokes[0].points[0]);
    console.log(gestureSet.getGestureClasses().get('FistDownOnce').samples[1].paths['ModOrientation_myo'].strokes[0].points[0]);

    console.log(gestureSet.getGestureClasses().get('FistDownOnce').samples[0].paths['Acceleration_myo'].strokes[0].points[0]);
    console.log(gestureSet.getGestureClasses().get('FistDownOnce').samples[1].paths['NormAcceleration_myo'].strokes[0].points[0]);
    console.log(gestureSet.getGestureClasses().get('FistDownOnce').samples[1].paths['ModAcceleration_myo'].strokes[0].points[0]);

    return gestureSet;
}

function addIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
};