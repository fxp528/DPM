var crc = require('crc');
var ieee754 = require('ieee754');

/**
***register address
**/
const vAvg = [0x0106, 0x0107];
const iAvg = [0x0126, 0x0127];
const pF = [0x0132, 0x0133];
const pT = [0x0144,0x0145];
const eT = [0x015c,0x015d];
const bSetting = 0x050c;
const bData = 0x0600;

var data = new Array().concat(vAvg, iAvg, pF, pT, eT);
var dataName = [ 
	{name: "vAvg", type: BufferTofloat},
	{name: "iAvg", type: BufferTofloat},
	{name: "pF", type: BufferTofloat},
	{name: "pT", type: BufferTofloat},
	{name: "eT", type: BufferToUint}
];

/**
*** multiple registers
*** 0x01  0x10            0x050c     0x0002(n)              0x04(n*2)  0x0106 0x0107...
*** ID(2) FunctionCode(2) Address(4) Registers of Number(4) Size(2)    Set values(4)*n
**/

function Write(id, addr, vArray){
	var buf = Buffer.alloc(7 + 2 * vArray.length);
	buf.writeUInt8(id);
	buf.writeUInt8(0x10, 1);
	buf.writeUInt16BE(addr, 2); 
	buf.writeUInt16BE(vArray.length, 4);
	buf.writeUInt8(vArray.length*2, 6);
	for(var i = 0; i < vArray.length; i++)
		buf.writeUInt16BE(vArray[i] , 7 + 2 * i);
	var bufCRC = Buffer.alloc(2);
	bufCRC.writeUInt16LE(crc.crc16modbus(buf));
	return Buffer.concat([buf, bufCRC]);
}
function Read(id, addr, length){
	var buf = Buffer.alloc(6);
	buf.writeUInt8(id);
	buf.writeUInt8(0x03, 1);
	buf.writeUInt16BE(addr, 2); 
	buf.writeUInt16BE(length, 4);
	var bufCRC = Buffer.alloc(2);
	bufCRC.writeUInt16LE(crc.crc16modbus(buf));
	return Buffer.concat([buf, bufCRC]);
}
function Slave(id){
	this.id = id;
	this.Write = Write(id, bSetting, data);
	this.Read = Read(id, bData, data.length);
}
function BufferTofloat(buf){
	return ieee754.read(buf, 0, false, 23, 4);
}
function BufferToUint(buf){
	return buf.readUInt16BE(0);
}
function CrcCheck(buf){
	var bufCRC = Buffer.alloc(2);
	bufCRC.writeUInt16LE(crc.crc16modbus(buf.slice(0, buf.length-2)));
	return bufCRC.equals(buf.slice(buf.length-2));
}
function DataObj(buf){
	this.id = buf[0].toString();
	for(var i = 0; i < buf[2] / 4; i++)
		this[dataName[i].name] = dataName[i].type===BufferTofloat?dataName[i].type(buf.slice(3 + i * 4, 7 + i * 4).swap16().swap32()).toFixed(3):dataName[i].type(buf.slice(3 + i * 4, 7 + i * 4)).toString();
}
module.exports = {
	Slave: Slave,
	CrcCheck: CrcCheck,
	DataObj: DataObj
}