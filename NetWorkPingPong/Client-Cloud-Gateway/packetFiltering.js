const MAGIC_NUMBER = Buffer.from([0x38, 0x12, 0x12, 0x12, 0x81, 0x28, 0x28, 0x28]);
MAGIC_NUMBER.swap64();

exports.CheckMagicNumber = function(recvBuffer = new Buffer()){

    if(MAGIC_NUMBER.compare(recvBuffer, 0, 8) != 0 ){
        let packet = recvBuffer.readIntLE(0,8);
        console.log('[Packet Error] Magic Number does not match : ' + packet.toString(16));
        return false;
    }

    return true;
}

exports.InsertPortNum = function(recvBuffer = new Buffer, clientPort){
    recvBuffer.writeInt16BE(clientPort ,20);
}

exports.GetPortNum = function(recvBuffer = new Buffer){
    console.log('[PortNum] 0x' + recvBuffer.readInt16BE(20).toString(16) + "");
    return recvBuffer.readInt16BE(20);
}