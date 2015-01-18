var wifiName = "MHacks";
var distBetweenWifi = 1; //signal strength from 0 to 1

var arDrone = require('ar-drone');
var client  = arDrone.createClient();
//client.createRepl();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var keypress = require('keypress');
var move = true;

var wifi = [{}, {}, {}];

app.post('/logData', function(req, res){
  var newWifi = req.body;
  console.log(JSON.stringify(newWifi));
  wifi[parseInt(newWifi["index"])] = newWifi;
  res.send("you win");
});

app.listen(process.env.PORT || 3412);

//emergency key press events

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress"', key);
  if (key && /*key.ctrl &&*/ key.name == 's') {
    if (move) {
      client.stop();
      move = false;
    } else {
      move = true;
    }
    //process.stdin.pause();
  } else if (key && /*key.ctrl &&*/ key.name == 't') {
    client.takeoff();
  } else if (key && key.name == 'l') {
    client.land();
  } //else if (key && key.name == 'w') {
  //  client.front(0.2);
  //  client.after(1000, function() {
  //    this.front(0);
  //  });
  //}
});

//process.stdin.setRawMode(true);
//process.stdin.resume();


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
