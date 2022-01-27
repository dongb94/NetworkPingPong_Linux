const Header_1st_Size = 32;
const MAGIC_NUMBER = Buffer.from([0x38, 0x12, 0x12, 0x12, 0x81, 0x28, 0x28, 0x28]);
MAGIC_NUMBER.swap64();

exports.CheckMagicNumber = function(recvBuffer = new Buffer(), remotePort){

	if(recvBuffer.length < Header_1st_Size){
		console.log(`[Packet Error][${remotePort}] Packet Size too short : ${recvBuffer.length}`);
		return false;
	}

	if(MAGIC_NUMBER.compare(recvBuffer, 0, 8) != 0 ){
		let packet = recvBuffer.readBigInt64LE(0);
		console.log(`[Packet Error][${remotePort}] Magic Number does not match : ` + packet.toString(16));
		return false;
	}

	return true;
}

exports.CheckPacketHeader = function(recvBuffer = new Buffer(), remotePort){
	let value = recvBuffer.readBigInt64LE(16); // session Id
	if(value != 0)
	{
		console.log(`[Packet Error][${remotePort}] Session Id Not 0 : 0x${value.toString(16)}`);
		return false;
	}

	value = recvBuffer.readIntLE(24, 2); // totalLength
	if(value > 20000)
	{
		console.log(`[Packet Error][${remotePort}] total Length too long : ${value.toString()}`);
		return false;
	}

	value = recvBuffer.readIntLE(Header_1st_Size + 2, 2); // Msg ID
	if(value == 0)
	{
		console.log(`[Packet Error][${remotePort}] MsgID is 0 : 0x${value.toString(16)}`);
		return false;
	}

	return true;
}

exports.InsertPortNum = function(recvBuffer = new Buffer, clientPort){
	recvBuffer.writeInt16LE(clientPort ,Header_1st_Size + 20);
}

exports.GetPortNum = function(recvBuffer = new Buffer){
	console.log('[PortNum] 0x' + recvBuffer.readInt16BE(Header_1st_Size + 20).toString(16) + "");
	return recvBuffer.readInt16LE(Header_1st_Size + 20);
}