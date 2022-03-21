var cmd = require('./command.js'),
	Slave = cmd.Slave,
	BufferTofloat = cmd.BufferTofloat,
	CrcCheck = cmd.CrcCheck,
	DataObj = cmd.DataObj;
var { SerialPort } = require('serialport');
var port = new SerialPort({ path: process.argv[2], baudRate: +process.argv[3] });
var interval = 1000;
var slaves = [ new Slave(0x01) ];

function init(){
	slaves.forEach(function(s, i){
		setTimeout(function(){
			port.write(s.Write);
		}, interval / slaves.length * i);
	});
}
function loop(){
	setInterval(function(){
		slaves.forEach(function(s, i){
			setTimeout(function(){
				port.write(s.Read);
			}, interval / slaves.length * i);
		});
	}, interval);
}
port.on('open', function(){
	init();
	loop();
});
port.on('data', function(data){
	if(CrcCheck(data)&& data[1] == 0x03){
		console.log(new DataObj(data));
	}
});
port.on('error', function(err){
	console.log(err);
});