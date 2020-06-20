const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;

class Recognizer extends AbstractRecognizer{

    constructor(options, dataset) {
        super(options);
        this.gestureset=[];
        //TODO need to init gestureset so can't call super(dataset)
        if (dataset!==undefined){
            dataset.getGestureClasses().forEach((gesture) => {
                gesture.getSample().forEach(sample => {
                        this.addGesture(gesture.name, sample);
                    }
                );
            });
        }
    }

    addGesture(name, sample){
        console.log(name + ': ' + sample);
        if(this.gestureset.indexOf(name) === -1)
            this.gestureset.push(name);
    }

    recognize(sample){
        //console.log('recognize');

        return {Name:this.gestureset[0], Time: 5};
    }

}

module.exports = {
    Recognizer
};