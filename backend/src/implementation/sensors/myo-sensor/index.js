const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point3D = require('../../../framework/gestures/point').Point3D;
const WebSocket = require('ws');

class Sensor extends AbstractSensor 
{
  constructor(options) 
  {
    super("Myo Armband Interface");

    this.socket = undefined;
    this.lastPoints = [];
    this.hasData = false;
  }

  getPoints(timestamp) 
  {
    return { hasData: this.hasData, points: this.lastPoints, appData: undefined};
  }

  parseFrame(frame)
  {
    console.log(frame);

/*    let points = []

    points.push({
      name: "Origin",
      point: new Point3D(0, 0, -1, undefined)
    });

    points.push({
      name: "Origin2",
      point: new Point3D(0, 0, 1, undefined)
    });

    // TODO
    points.push({
      name: "Acceleration",
      point: new Point3D(0, 0, 0, undefined)
    });

    // TODO
    points.push({
      name: "Rotation",
      point: new Point3D(0, 0, 0, undefined)
    });

    for(let i = 0; i < 8; i++)
    {
        let a = 2 * Math.PI * (i / 8);
        let m = 1 + (frame.EMG_smth[i] / 128);

        points.push({
          name: "EMG" + i,
          point: new Point3D(m * Math.sin(a), m * Math.cos(a), 0, undefined)
        });
    }*/

    //console.log(points);

    this.lastPoints = points;
    this.hasData = false;  
  }

  connect() 
  {
    // Create WebSocket connection.
    this.socket = new WebSocket("ws://localhost:6450");

    // Open Connection
    this.socket.addEventListener('open', function (event) {
        //this.socket.send(JSON.stringify({background: true}))
    });

    // Listen for messages
    this.socket.addEventListener('message', (event) => this.parseFrame(JSON.parse(event.data)));

    // Handle errors
    this.socket.addEventListener('error', function(event) {
      console.error("WebSocket error observed:", event);
    });
  }

  disconnect() 
  {
    // Disconnect
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
      this.lastPoints = [];
      this.hasData = false;
    }
  }
}

module.exports = Sensor;