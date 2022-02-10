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

    let oriArticulation = new Articulation(makeIdentifier(`Origin`, identifier), new Point3D(0, 0, -1, undefined));
    parsedFrame.addArticulation(oriArticulation);
    let oriArticulation2 = new Articulation(makeIdentifier(`Origin2`, identifier), new Point3D(0, 0, 1, undefined));
    parsedFrame.addArticulation(oriArticulation2);

    let Acceleration = new Articulation(makeIdentifier(`Acceleration`, identifier), new Point3D(0, 0, 0, undefined));
    parsedFrame.addArticulation(Acceleration);

    let Rotation = new Articulation(makeIdentifier(`Rotation`, identifier), new Point3D(0, 0, 0, undefined));
    parsedFrame.addArticulation(Rotation);

    for(let i = 0; i < 8; i++)
    {
        let a = 2 * Math.PI * (i / 8);
        let m = 1 + (frame.EMG_smth[i] / 128);
        let EMG_i = new Articulation(makeIdentifier(`EMG` + i, identifier), new Point3D(m * Math.sin(a), m * Math.cos(a), 0, undefined));

        parsedFrame.addArticulation(EMG_i);
    }

    //console.log(parsedFrame);
    //console.log(frame);
    //while(true) {}

    return parsedFrame;
}

function makeIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
}