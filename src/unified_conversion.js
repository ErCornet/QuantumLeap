const fs = require('fs');
const path = require('path');

const StrokeData = require('./framework/gestures/StrokeData').StrokeData;
const Stroke = require('./framework/gestures/StrokeData').Stroke;
const Path = require('./framework/gestures/StrokeData').Path;
const Point = require('./framework/gestures/Point').Point3D;

const dirPath = path.join(__dirname, 'datasets', 'guinevere');
//const convertedPath = path.join(__dirname, 'datasets', 'guinevere_unified');
const convertedPath = path.join(__dirname, 'datasets', 'guinevere_unified2');

const fingers = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition"];

const device = {
    'osBrowserInfo': 'Leap Motion Controller', 'resolutionHeight': null,
    'resolutionWidth': null, 'windowHeight': null, 'windowWidth': null,
    'pixelRatio': null, 'mouse': false, 'pen': false, 'finger': false,
    'acceleration': false, 'webcam': true
};

if (!fs.existsSync(convertedPath)) {
    fs.mkdirSync(convertedPath);
}

fs.readdirSync(dirPath).forEach((user_dir) => {
    let newUserDirPath = path.join(convertedPath, user_dir);
    if (!fs.existsSync(newUserDirPath)) {
        fs.mkdirSync(newUserDirPath);
    }
    let gestureSampleDirPath = path.join(dirPath, user_dir);
    fs.readdirSync(gestureSampleDirPath).forEach((sample) => {
        let rawGesturePath = path.join(gestureSampleDirPath, sample);
        let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
        let gestureData = new StrokeData();
        let stroke = new Stroke();


        fingers.forEach((fingerName) => {
            let strokePath = new Path(fingerName);
            stroke.addPath(fingerName, strokePath);
        });

        let strokePath = new Path("rigthPalmPosition");
        stroke.addPath("rigthPalmPosition", strokePath);
        strokePath = new Path("leftPalmPosition");
        stroke.addPath("leftPalmPosition", strokePath);

        for (let i = 0; i < rawGestureData['data'].length; i++) {
            let frame = rawGestureData['data'][i];
            let rightHandId = -1;
            let leftHandId = -1;
            for (const hand of frame['hands']) {
                let strokePath;
                if (hand['type'] === 'right') {
                    rightHandId = hand['id'];
                    strokePath = stroke.paths["rigthPalmPosition"];
                }
                else{
                    leftHandId = hand['id'];
                    strokePath = stroke.paths["leftPalmPosition"];
                }
                let palmPosition = hand['palmPosition'];
                let x = palmPosition[0];
                let y = palmPosition[1];
                let z = palmPosition[2];
                let t = frame['timestamp'];
                strokePath.addPoint(new Point(x, y, z, t));
            }

            for (const pointable of frame['pointables']) {
                if (!pointable.tool) {
                    // Get the name of the finger from handId and type
                    let fingerName;
                    if (pointable.handId == rightHandId) {
                        fingerName = getFingerName("right", pointable.type);
                    } else if (pointable.handId == leftHandId) {
                        fingerName = getFingerName("left", pointable.type);
                    }
                    let strokePath = stroke.paths[fingerName];
                    let tipPosition = pointable['tipPosition'];   
                    strokePath.addPoint(new Point(tipPosition[0], tipPosition[1], tipPosition[2], frame['timestamp']))           
                }
            }
        }
        gestureData.addStroke(stroke);

        const newFilename = path.join(convertedPath, user_dir, sample);
        fs.writeFileSync(newFilename, JSON.stringify(gestureData, null, 2), function (err) {
            if (err) throw err;
            //console.log('Saved!');
        });
    });
});

function getFingerName(hand, type) {
    if (hand == "right") {
        return fingers[type];
    } else {
        return fingers[5 + type];
    }
}