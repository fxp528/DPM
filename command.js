var crc = require('crc');
var ieee754 = require('ieee754');

/*command*/
const readRegister = Buffer.from([0x03]);
/*register address and number point*/
const voltageAvg = Buffer.from([0x01,0x06,0x00,0x02]);
const currentAvg = Buffer.from([0x01,0x26,0x00,0x02]);
const powerFactor = Buffer.from([0x01,0x32,0x00,0x02]);
const powerTotal = Buffer.from([0x01,0x44,0x00,0x02]);

function createCommand(slave, command, addr_num){
	var temp = Buffer.concat([slave, command, addr_num]);
	var c = Buffer.from(crc.crc16modbus(temp).toString(16), 'hex').swap16();
	return Buffer.concat([temp, c]);
}
module.exports = {
	readVoltageAvg: function(slave){
		return createCommand(slave, readRegister, voltageAvg);
	},
	readCurrentAvg: function(slave){
		return createCommand(slave, readRegister, currentAvg);
	},
	readPowerFactor: function(slave){
		return createCommand(slave, readRegister, powerFactor);
	},
	readPowerTotal: function(slave){
		return createCommand(slave, readRegister, powerTotal);
	},
	bufferTofloat: function(buf){
		return ieee754.read(buf, 0, false, 23, 4);
	},
	crcCheck: function(data){
		var t = data.slice(0, data.length-2);
		if(t.length % 2 != 0){
			var m = crc.crc16modbus(t).toString(16);
			var c = data.slice(data.length-2).swap16();
			m = m.length<4?'0'.repeat(4-m.length)+m:m;
			return Buffer.from(m, 'hex').equals(c);
		}else{
			return false;
		}
	}
}