const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../../framework/gestures/stroke-data').Path;
const PointND = require('../../../../framework/gestures/point').PointND;

function loadDataset(name, datasetPath, sensorId, datasetId, sensorsPointsNames) {
    let data = new Object();

    fs.readdirSync(datasetPath).forEach((gestureFile) => {
        let gestureClassDirPath = path.join(datasetPath, gestureFile);

        const stat = fs.lstatSync(gestureClassDirPath);
        if (!stat.isFile()) return;

        if(gestureFile === "info.json") return;

        const gestureName = gestureFile.split(".")[0];

        data[gestureName] = JSON.parse(fs.readFileSync(gestureClassDirPath, 'utf-8'));
    });

    let gestureSet = new GestureSet(name);
    let gestureIndex = 0;

    // For each Gesture Class
    for(var gestureName in data) {
        let newGestureClass = new GestureClass(gestureName, gestureIndex++);

        // For each Sample
        for(var idUserSample in data[gestureName]) {
            userID = parseInt(idUserSample.split("_")[0]);
            sampleID = parseInt(idUserSample.split("_")[1]);

            // if(! (Object.keys(data[gestureName]).includes(userID + "_" + 1) && Object.keys(data[gestureName]).includes(userID + "_" + 2))) continue;

            console.log(gestureName + " " + idUserSample);

            let strokeData = new StrokeData(userID, sampleID);

            let orientationStroke = new Stroke(0);
            let accelerationStroke = new Stroke(0);
            let rotationStroke = new Stroke(0);
            let emgStroke = new Stroke(0);

            const gesture = data[gestureName][idUserSample];

            // For each Point
            for(let i = 0; i < gesture.length; i++) {
                const point_i = gesture[i];

                orientationStroke.addPoint(new PointND(point_i.orientation, point_i.timestamp));
                accelerationStroke.addPoint(new PointND(point_i.acceleration, point_i.timestamp));
                rotationStroke.addPoint(new PointND(point_i.rotation, point_i.timestamp));
                emgStroke.addPoint(new PointND(point_i.emg, point_i.timestamp));
            }

            let orientationStrokePath = new Path(addIdentifier("orientation", sensorId));
            let accelerationStrokePath = new Path(addIdentifier("acceleration", sensorId));
            let rotationStrokePath = new Path(addIdentifier("rotation", sensorId));
            let emgStrokePath = new Path(addIdentifier("emg", sensorId));

            orientationStrokePath.addStroke(orientationStroke);
            accelerationStrokePath.addStroke(accelerationStroke);
            rotationStrokePath.addStroke(rotationStroke);
            emgStrokePath.addStroke(emgStroke);

            strokeData.addPath(addIdentifier("orientation", sensorId), orientationStrokePath);
            strokeData.addPath(addIdentifier("acceleration", sensorId), accelerationStrokePath);
            strokeData.addPath(addIdentifier("rotation", sensorId), rotationStrokePath);
            strokeData.addPath(addIdentifier("emg", sensorId), emgStrokePath);

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