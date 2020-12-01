const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;
const PDollarPlusRecognizer = require('./pdollarplus/pdollarplus').PDollarPlusRecognizer;
const Point = require('./pdollar/pdollar').Point;

class Recognizer extends AbstractRecognizer {

  static name = "PDollarPlusRecognizer";

  constructor(options, dataset) {
    super();
    this.samplingPoints = options.samplingPoints;
    this.paths = options.articulations;
    this.recognizer = new PDollarPlusRecognizer(this.samplingPoints);
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
      return { name: "", time: 0, score: 0.0 };
    }
    let result = this.recognizer.Recognize(points);
    return (result.Name === "No match.") ? { name: "", time: result.Time, score: result.Score } : { name: result.Name, time: result.Time, score: result.Score };
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