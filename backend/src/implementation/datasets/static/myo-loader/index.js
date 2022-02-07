const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const PoseData = require('../../../../framework/gestures/pose-data').PoseData;
const { Frame, Articulation } = require('../../../../framework/frames/frame');
const Point3D = require('../../../../framework/gestures/point').Point3D;

function loadDataset(name, datasetPath, identifier, sensorPointsNames) {
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;
    let gestureIndex = 0;
    fs.readdirSync(dirPath, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((gesture) => {
        let gestureDirPath = path.join(dirPath, gesture);
        let gestureClass = new GestureClass(gesture, gestureIndex);
        gestureSet.addGestureClass(gestureClass);
        fs.readdirSync(gestureDirPath).forEach((user) => {
            let userDirPath = path.join(gestureDirPath, user);
            fs.readdirSync(userDirPath).forEach((file) => {
                let rawGesturePath = path.join(userDirPath, file);
                let parsedFile = JSON.parse(fs.readFileSync(rawGesturePath));
                let id = 0;
                for (const frame of parsedFile.data) {
                    let parsedFrame = parseFrame(frame, identifier);
                    let poseData = new PoseData(parseInt(user), id, parsedFrame, undefined);
                    gestureClass.addSample(poseData);
                    id++;
                }
            });
        });
        gestureIndex += 1;
    });

    return gestureSet;
}

function parseFrame(frame, identifier) {
    let parsedFrame = new Frame(frame.id);
    //parsedFrame.hasData = true;

    let oriArticulation = new Articulation(makeIdentifier(`Origin`, identifier), new Point3D(0, 0, 2, undefined));
    parsedFrame.addArticulation(oriArticulation);
    let oriArticulation2 = new Articulation(makeIdentifier(`Origin2`, identifier), new Point3D(0, 2, 0, undefined));
    parsedFrame.addArticulation(oriArticulation2);

    let accArticulation = new Articulation(makeIdentifier(`Acceleration`, identifier), new Point3D(frame.acceleration[0], frame.acceleration[1], frame.acceleration[2], undefined));
    parsedFrame.addArticulation(accArticulation);

    //
    let rotArticulation = new Articulation(makeIdentifier(`Rotation`, identifier), new Point3D(0, 0, 0, undefined));
    parsedFrame.addArticulation(rotArticulation);

    return parsedFrame;
}

function makeIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
}