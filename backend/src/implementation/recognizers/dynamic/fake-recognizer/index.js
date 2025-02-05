const AbstractDynamicRecognizer = require('../../../../framework/modules/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;

class Recognizer extends AbstractDynamicRecognizer{

    constructor(options, dataset) {
        super(options);
        this.gestureset=[];
        //TODO need to init gestureset so can't call super(dataset)
        if (dataset!==undefined){
            dataset.getGestureClasses().forEach((gesture) => {
                gesture.getSamples().forEach(sample => {
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

    removeGesture(name) {
        this.gestureset = this.gestureset.filter(gestureName => gestureName !== name);
    }

    recognize(sample){
        //console.log('recognize');
        return { name: this.gestureset[0], score: 0, time: 5 };
    }

}

module.exports = Recognizer;