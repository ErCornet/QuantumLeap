const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;
const Q3DollarRecognizer = require('./q3dollar/q3dollar').Q3DollarRecognizer;
const Point = require('./q3dollar/q3dollar').Point;

class Recognizer extends AbstractRecognizer {

	static name = "Q3DollarRecognizer";

    constructor(options, dataset) {
		super();
		this.samplingPoints = options.samplingPoints;
        this.pathName = options.pathName;
        this.recognizer = new Q3DollarRecognizer(this.samplingPoints);
		if (dataset !== undefined){
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
						this.addGesture(gesture.name, sample);
					}
				);
			});
		}
	}
	
	addGesture(name, sample) {
		let points = convert(sample, this.pathName);
		this.recognizer.AddGesture(name, points);
	}

    removeGesture(name) {
		this.recognizer.RemoveGesture(name);
	}

    recognize(sample) {
		let points = convert(sample, this.pathName);
		if(points.length === 0) {
            return { name: "", time: 0, score: 0.0 };
        }
        let result = this.recognizer.Recognize(points);
		return (result.Name === "No match.") ? { name: "", time: result.Time, score: result.Score } : { name: result.Name, time: result.Time, score: result.Score };
	}

	toString() {
        return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, pathName = ${this.pathName} ]`;
    }

}

function convert(sample, pathName) {
	let points = [];
	sample.paths[pathName].strokes.forEach((stroke, stroke_id) => {
		stroke.points.forEach((point) => {
			points.push(new Point(point.x, point.y, point.z, stroke_id));
		});
	});
    return points;
}

module.exports = {
	Recognizer
};