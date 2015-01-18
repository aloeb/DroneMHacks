var wifiName = "MHacks";
var distBetweenWifi = 1; //signal strength from 0 to 1

//var beagle = require("beaglebone-io");
//var board = BeagleBone();

var arDrone = require('ar-drone');
var client  = arDrone.createClient();
//client.createRepl();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var SerialPort = require('serialport').SerialPort;
var prompt = require("prompt");
app.use(bodyParser.json());

var move = true;
var inair= false;

var button_data = new Array(8);
var button_9_pressed = false;
var button_10_pressed = false;

//baudrate: 9600

var sPort = new SerialPort("/devttyO2", {baudrate:9600}, true); //for one of the esp's
sPort.on("open", function() {
	sPort.on('data', function(data) {
		var i = 0;
		wifi[0]["index"] = 0;
		while (i < data.length) {
			while (i < data.length && data.charAt(i) != '"') { i++ };
			i++;//take care of quotes
			var temp = "";
			while (i < data.length && data.charAt(i) != '"') { temp+=data.charAt(i++);}
			i++;i++;//get rid of " and ,
			var num = 0.0;
			if (temp == wifiName) {
				var temp2 = "";
				while (i < data.length && data.charAt(i) != ',') { temp2 += data.charAt(i++);}
				num = parseFloat(temp2)/ (-100.0);
			}
			while (i < data.length && data.charAt(i) != '\n') { i++; }
			wifi[0][temp] = num;
			i++;
		}
	});
});

var sPortw = new SerialPort("/dev/ttyO5", {baudrate:9600}, true); //for second of the esp's
sPortw.on("open", function() {
	sPortw.on('data', function(data) {
		var i = 0;
		wifi[1]["index"] = 1;
		while (i < data.length) {
			while (i < data.length && data.charAt(i) != '"') { i++ }
			i++;//take care of quotes
			var temp = "";
			while (i < data.length && data.charAt(i) != '"') { temp+=data.charAt(i++);}
			i++;i++;//get rid of " and ,
			var num = 0.0;
			if (temp == wifiName) {
				var temp2 = "";
				while (i < data.length && data.charAt(i) != ',') { temp2 += data.charAt(i++);}
				num = parseFloat(temp2)/ (-100.0);
			}
			while (i < data.length && data.charAt(i) != '\n') { i++; }
			wifi[1][temp] = num;
			i++;
		}
	});
});

prompt.start();
prompt.get(['serial_port_name'], function(err, result){
	if (err) { console.log(err); return 1;}

	var serialport = new SerialPort(result.serial_port_name, {
		baudrate: 115200
	}, true);

	serialport.on("open", function() {
		console.log("open");
		serialport.on('data', function(data) {
			for (var i = 0; i < data.length; i++) {
				var dataString = data.toString();
				if (dataString.charAt(i) != '~') {
					var button = parseInt(dataString.charAt(i));
					if (button < 9) button_data[button]  = dataString.charAt(0) != '~';
					else if (button == 9) {
						if (dataString.charAt(0) != '~') {
							if (!button_9_pressed) move = !move;
							button_9_pressed = true;
						} else {
							button_9_pressed = false;
						}
					}
					else if (button == 10) {
						if (dataString.charAt(0) != '~') {
							if (!button_10_pressed) {
								client.stop();
								if (inair) {
									client.land();
									inair = false;
								} else {
									client.takeoff();
									inair = true;
								}
							}
							button_10_pressed = true;
						} else {
							button_10_pressed = false;
						}
					}
				}
			}
		});
	});


	var wifi = [{}, {}, {}];

	app.post('/logData', function(req, res){
		var newWifi = req.body;
		console.log(JSON.stringify(newWifi));
		wifi[parseInt(newWifi["index"])] = newWifi;
		res.send("you win");
	});

	app.listen(process.env.PORT || 3412);

	//actual movement
	setInterval(function() {
		if (move) {
			if ("index" in wifi[0] && "index" in wifi[1]) {
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
		} else {
			client.back(button_data[0] ? 0.5 : 0);
			client.left(button_data[1] ? 0.5 : 0);
			client.front(button_data[2] ? 0.5 : 0);
			client.right(button_data[3] ? 0.5 : 0);
			client.counterClockwise(button_data[4] ? 0.5 : 0);
			client.clockwise(button_data[5] ? 0.5 : 0);
			client.up(button_data[6] ? 0.5 : 0);
			client.down(button_data[7] ? 0.5 : 0);
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
	//})

});


/*board.on('ready', function() {
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
}*/
