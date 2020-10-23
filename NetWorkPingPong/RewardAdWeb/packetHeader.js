const HeaderSize = 56;
exports.HeaderSize = HeaderSize;
const MAGIC_NUMBER = Buffer.from([0x38, 0x12, 0x12, 0x12, 0x81, 0x28, 0x28, 0x28]);

exports.MakeHeader = function(){

    let header = Buffer.alloc(HeaderSize);

    let offset = 0;

    //1st header
    offset += header.writeBigInt64BE(MAGIC_NUMBER, offset); // magic number
    offset += header.writeBigInt64BE(MAGIC_NUMBER, offset); // time
    offset += header.writeBigInt64BE(0x00, offset); // sessid
    offset += header.writeInt16BE(0x00, offset); // size
    offset += header.writeInt8BE(0x00, offset); // enc flag
    offset += header.writeInt8BE(0x00, offset); // enc type
    offset += header.writeInt16BE(0x10, offset); // pkt ver
    offset += header.writeInt16BE(0x00, offset); // make total size 32

    //2nd header
    offset += header.writeInt16BE(0x00, offset); // Svc ID
    offset += header.writeInt16BE(0x00, offset); // Msg ID
    offset += header.writeInt16BE(0x00, offset); // Serial
    offset += header.writeInt16BE(0x00, offset); // Result
    offset += header.writeInt32BE(0x00, offset); // CRC
    offset += header.writeInt32BE(0x00, offset); // client IP Addr
    offset += header.writeInt32BE(0x00, offset); // server IP Addr
    offset += header.writeInt16BE(0x00, offset); // client port
    offset += header.writeInt16BE(0x00, offset); // server port

    return header;
}