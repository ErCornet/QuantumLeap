const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;
const WebSocket = require('ws');

class Sensor extends AbstractSensor {
  constructor(options) {
    super("Myo Armband Interface");

    this.socket = undefined;
    this.lastFrame = undefined;
  }

  getPoints(timestamp) {
    let frame = this.lastFrame;

    return { hasData: false, points: [], appData: undefined};
  }

  connect() {
    // Create WebSocket connection.
    this.socket = new WebSocket("ws://localhost:6450");

    // Open Connection
    this.socket.addEventListener('open', function (event) {
        this.socket.send(JSON.stringify({background: true}))
    });

    // Listen for messages
    this.socket.addEventListener('message', function (event) {
      let data = JSON.parse(event);

      console.log("New data !")
      console.log(data)

      if (data.hasOwnProperty('timestamp')) {
        // Get frame data
        this.lastFrame = data;
      }
    });

    // Handle errors
    this.socket.addEventListener('error', function(event) {
      console.error("WebSocket error observed:", event);
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