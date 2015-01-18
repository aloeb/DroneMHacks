var wifiName = "MHacks";
var distBetweenWifi = 1; //signal strength from 0 to 1

var beagle = require("beaglebone-io");
var board = BeagleBone();

var arDrone = require('ar-drone');
var client  = arDrone.createClient();
//client.createRepl();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var move = true;
var inair= false;

board.on('ready', function() {
  this.digitalRead('A5', function(value) {
    if (!value) {
      client.stop();
      if (inair) {
	client.land();
	inair = false;
      } else {
	client.takeoff();
	inair = true;
      }
    }
  }
  if (!move) {
    this.digitalRead('A0', function(value) {
      if (!value) {
	client.stop();
        client.left(.5);
      }
    }
    this.digitalRead('A1', function(value) {
      if (!value) {
	client.stop();
        client.front(.5);
      }
    }
    this.digitalRead('A2', function(value) {
      if (!value) {
	client.stop();
        client.back(.5);
      }
    }
    this.digitalRead('A3', function(value) {
      if (!value) {
	client.stop();
        client.right(.5);
      }
    }
    this.digitalRead('A4', function(value) {
      if (!value) {
        client.stop();
	move = !move;
      }
    }
    
    this.digitalRead('0', function(value) {
      if (!value) {
        client.stop();
	client.counterClockwise(.1);
      }
    }
    this.digitalRead('1', function(value) {
      if (!value) {
        client.stop();
	client.up(.5);
      }
    }
    this.digitalRead('2', function(value) {
      if (!value) {
        client.stop();
	client.clockwise(.5);
      }
    }
    this.digitalRead('3', function(value) {
      if (!value) {
        client.stop();
	client.down(.5);
      }
    }
  }
}


var wifi = [{}, {}, {}];

app.post('/logData', function(req, res){
  var newWifi = req.body;
  console.log(JSON.stringify(newWifi));
  wifi[parseInt(newWifi["index"])] = newWifi;
  res.send("you win");
});

app.listen(process.env.PORT || 3412);

//actual movement
var sleep = require('sleep');
setInterval(function() {
  if (move) {
    if ("index" in wifi[0] && "index" in wifi[2]) {
      client.stop();
      var a = parseFloat(wifi[0][wifiName]);
      var b = parseFloat(wifi[1][wifiName])
      if (Math.abs(a - b) > .05) {//change this number to make more or less acurate
        var angle = Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - 1.0) / (2.0 * a * b)) - Math.PI;
        if (b < a) {//turn right
          client.clockwise(.1);
        } else { //turn left
          client.counterClockwise(.1);
        }
      } else if (a < .9) {
        client.front(.1);
      } else {
        move = false;
      }
    }
  }
  console.log(wifi);
}, 1000);


//client.takeoff();

//client
//.after(5000, function() {
//  this.clockwise(0.5);
//})
//.after(3000, function() {
//  this.stop();
//  this.land();
//});
