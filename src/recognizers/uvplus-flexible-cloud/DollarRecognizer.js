const recognizer = require('../../framework/recognizers/Recognizer');
const dollar = require('./dollar');

class DollarRecognizer extends recognizer.Recognizer{

    static name = "DollarRecognizer";

    constructor(numberOfPoints, articulations,dataset) {
        super();
        this.N = numberOfPoints;
        this.articulations = articulations;
        this.recognizer = new dollar.UVPRecognizer(articulations.length, numberOfPoints);
        if (dataset!==undefined){
            dataset.getGestureClass().forEach((gesture, key, self) => {
                gesture.getSample().forEach(sample => {
                        this.addGesture(gesture.name, sample);
                    }
                );
            });
        }
    }

    addGesture(name, sample){
        this.recognizer.storeTemplate(this.convert(sample), name);
    }

    recognize(sample){
        let result = this.recognizer.recognize(this.convert(sample));
        return {Name:result[0], Time: result[1]};
    }

    convert(sample){
        let points =[];
        sample.strokes.forEach((stroke,stroke_id) =>{
            this.articulations.forEach(articulation =>{
                points.push(stroke.paths[articulation].points);
            });
        });
        return points;
    }

}



module.exports = {
    DollarRecognizer
};