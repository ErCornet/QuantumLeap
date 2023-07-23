const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../../framework/gestures/stroke-data').Path;
const PointND = require('../../../../framework/gestures/point').PointND;

let gestures = [];

function loadDataset(name, datasetPath, sensorId, datasetId, sensorsPointsNames) {
    let data = new Object();

    fs.readdirSync(datasetPath).forEach((gestureFile) => {
        let gestureClassDirPath = path.join(datasetPath, gestureFile);

        const stat = fs.lstatSync(gestureClassDirPath);
        if (!stat.isFile()) return;

        if(gestureFile === "info.json")
        {
            gestures = JSON.parse(fs.readFileSync(path.join(datasetPath, gestureFile), 'utf-8'))["gestures"];
            return;
        } 

        const gestureName = gestureFile.split(".")[0];

        data[gestureName] = JSON.parse(fs.readFileSync(gestureClassDirPath, 'utf-8'));
    });

    let gestureSet = new GestureSet(name);
    let gestureIndex = 0;

    // For each Gesture Class
    for(var gestureName in data) {
        if(!gestures.includes(gestureName)) continue;

        let newGestureClass = new GestureClass(gestureName, gestureIndex++);

        // For each Sample
        for(var idUserSample in data[gestureName]) {
            userID = parseInt(idUserSample.split("_")[0]);
            sampleID = parseInt(idUserSample.split("_")[1]);

            let strokeData = new StrokeData(userID, sampleID);

            let orientationStroke = new Stroke(0);
            let accelerationStroke = new Stroke(0);
            let rotationStroke = new Stroke(0);
            let emgStroke = new Stroke(0);
            let directionStroke = new Stroke(0);

            const gesture = data[gestureName][idUserSample];

            // For each Point
            for(let i = 0; i < gesture.length; i++) {
                const point_i = gesture[i];

                orientationStroke.addPoint(new PointND(point_i.orientation, point_i.timestamp));
                accelerationStroke.addPoint(new PointND(point_i.acceleration, point_i.timestamp));
                rotationStroke.addPoint(new PointND(point_i.rotation, point_i.timestamp));
                emgStroke.addPoint(new PointND(point_i.emg, point_i.timestamp));
                directionStroke.addPoint(new PointND(point_i.direction, point_i.timestamp));
            }

            let orientationStrokePath = new Path(addIdentifier("orientation", sensorId));
            let accelerationStrokePath = new Path(addIdentifier("acceleration", sensorId));
            let rotationStrokePath = new Path(addIdentifier("rotation", sensorId));
            let emgStrokePath = new Path(addIdentifier("emg", sensorId));
            let directionStrokePath = new Path(addIdentifier("direction", sensorId));

            orientationStrokePath.addStroke(orientationStroke);
            accelerationStrokePath.addStroke(accelerationStroke);
            rotationStrokePath.addStroke(rotationStroke);
            emgStrokePath.addStroke(emgStroke);
            directionStrokePath.addStroke(directionStroke);

            strokeData.addPath(addIdentifier("orientation", sensorId), orientationStrokePath);
            strokeData.addPath(addIdentifier("acceleration", sensorId), accelerationStrokePath);
            strokeData.addPath(addIdentifier("rotation", sensorId), rotationStrokePath);
            strokeData.addPath(addIdentifier("emg", sensorId), emgStrokePath);
            strokeData.addPath(addIdentifier("direction", sensorId), directionStrokePath);

            newGestureClass.addSample(strokeData);
        }

        gestureSet.addGestureClass(newGestureClass);
    }

    return gestureSet;
}

function addIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
};