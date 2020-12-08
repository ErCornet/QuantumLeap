const AbstractDynamicRecognizer = require('../../../../framework/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const QDollarRecognizer = require('./qdollar/qdollar').QDollarRecognizer;
const Point = require('./qdollar/qdollar').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Recognizer extends AbstractDynamicRecognizer {

	static name = "QDollarRecognizer";

	constructor(options, dataset) {
		super();
		this.samplingPoints = options.samplingPoints;
		this.paths = parsePointsNames(options.articulations);
		this.recognizer = new QDollarRecognizer(this.samplingPoints);
		if (dataset !== undefined) {
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
					this.addGesture(gesture.name, sample);
				}
				);
			});
		}
	}

	addGesture(name, sample) {
		let points = convert(sample, this.paths);
		this.recognizer.AddGesture(name, points);
	}

	removeGesture(name) {
		this.recognizer.RemoveGesture(name);
	}

	recognize(sample) {
		let points = convert(sample, this.paths);
		if (points.length === 0) {
			return { name: "", score: 0.0, time: 0 };
		}
		let result = this.recognizer.Recognize(points);
		return (result.Name === "No match.") ? { name: "", score: result.Score, time: result.Time } : { name: result.Name, score: result.Score, time: result.Time };
	}

	toString() {
		return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, paths = ${this.paths} ]`;
	}

}

function convert(sample, paths) {
	let points = [];
	paths.forEach((path, pathID) => {
		sample.paths[path].strokes.forEach((stroke, strokeId) => {
			stroke.points.forEach((point) => {
				// If multipoint, one stroke per path, otherwise, keep original strokes
				let index = paths.length > 1 ? pathID : strokeId;
				points.push(new Point(point.x, point.y, index));
			});
		});
	});
	return points;
}

module.exports = Recognizer;