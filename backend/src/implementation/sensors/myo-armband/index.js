const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;
const WebSocket = require('ws');
// const MyoGestureHandler = require('myo-module')

// MyoGestureHandler.register();

class Sensor extends AbstractSensor {
  constructor(options) {
    super("Myo Armband Interface");

    this.socket = undefined;
    this.lastFrame = undefined;
    // TODO remove
    this.timestamp = 0;
  }

  getPoints(timestamp) {
    let frame = this.lastFrame;

    // TODO remove
    this.timestamp += 1;

    let points = []
    points.push({
      name: "Origin",
      point: new Point(0, 0, 2, this.timestamp)
    });

    points.push({
      name: "Origin2",
      point: new Point(0, 2, 0, this.timestamp)
    });

    points.push({
      name: "Acceleration",
      point: new Point(0, 0, 0, this.timestamp)
    });

    points.push({
      name: "Rotation",
      point: new Point(0, 0, 0, this.timestamp)
    });

    //console.log(points);

    return { hasData: true, points: points, appData: undefined};
    //return { hasData: false, points: [], appData: undefined};
  }

  connect() {
    // Create WebSocket connection.
    this.socket = new WebSocket("ws://localhost:6450");

    // Open Connection
    // this.socket.addEventListener('open', function (event) {
    //     this.socket.send(JSON.stringify({background: true}))
    // });

    // Listen for messages
    this.socket.addEventListener('message', function (event) {
      try 
      { 
        //console.log(event.data)
        let data = JSON.parse(event.data);
        //console.log(data)
        this.lastFrame = data;
      } catch(e) {}     
    });

    // Handle errors
    this.socket.addEventListener('error', function(event) {
      //console.error("WebSocket error observed:", event);
    });
  }

  disconnect() {
    // Disconnect
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
      this.lastFrame = undefined;
    }
  }
}

module.exports = Sensor;