var cmd = require('./command.js');
var SerialPort = require('serialport');
var port = new SerialPort(process.argv[2]);
var interval = 1000;
var stack = [	
	{type: "voltageAvg", fn: cmd.readVoltageAvg(Buffer.from([0x01]))},
	{type: "currentAvg", fn: cmd.readCurrentAvg(Buffer.from([0x01]))},
	{type: "powerFactor", fn: cmd.readPowerFactor(Buffer.from([0x01]))},
	{type: "powerTotal", fn: cmd.readPowerTotal(Buffer.from([0x01]))}
];
var state;
port.on('open', function() {
	setInterval(function() {
		stack.forEach(function(s, i){
			setTimeout(function(){
				port.write(s.fn, function(){
					port.drain(function(){
						state = s.type;
					});
				});
			}, interval / stack.length * i);
		});
	}, interval);
});

port.on('data', function(data) {
	if(cmd.crcCheck(data)){
		if(data.length>8){
			var buf = data.slice(3, 7).swap32().swap16();
			console.log(new Date().toGMTString(), state, cmd.bufferTofloat(buf));
		}else{
			console.log(data);
		}
	}
});