const AbstractDynamicRecognizer = require('../../../../framework/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const P3DollarRecognizer = require('./p3dollar/p3dollar').P3DollarRecognizer;
const Point = require('./p3dollar/p3dollar').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Recognizer extends AbstractDynamicRecognizer {

	static name = "P3DollarRecognizer";

  constructor(options, dataset) {
		super();
		this.samplingPoints = options.samplingPoints;
		this.points = parsePointsNames(options.points);
		this.recognizer = new P3DollarRecognizer(this.samplingPoints);
		console.log(this.points)
		if (dataset !== undefined){
			console.log(dataset)
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
						this.addGesture(gesture.name, sample);
					}
				);
			});
		}
	}
	
	addGesture(name, sample) {
		let points = convert(sample, this.points);
		this.recognizer.AddGesture(name, points);
	}

  removeGesture(name) {
		this.recognizer.RemoveGesture(name);
	}

  recognize(sample) {
		let points = convert(sample, this.points);
		if (points.length === 0) {
			return { name: "", score: 0.0, time: 0 };
		}
		let result = this.recognizer.Recognize(points);
		return (result.Name === "No match.") ? { name: "", score: result.Score, time: result.Time } : { name: result.Name, score: result.Score, time: result.Time };
	}

	toString() {
    return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, points = ${this.points} ]`;
  }

}

function convert(sample, points) {
	let points = [];
	points.forEach((articulation, articulationID) => {
		sample.paths[articulation].strokes.forEach((stroke, strokeId) => {
			stroke.points.forEach((point) => {
				// If multipoint, one stroke per articulation, otherwise, keep original strokes
				let index = points.length > 1 ? articulationID : strokeId;
				points.push(new Point(point.x, point.y, point.z, index));
			});
		});
	});
	return points;
}

module.exports = Recognizer;