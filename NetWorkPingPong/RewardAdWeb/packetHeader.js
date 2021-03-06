const HeaderSize = 56;
exports.HeaderSize = HeaderSize;
const MAGIC_NUMBER = Buffer.from([0x38, 0x12, 0x12, 0x12, 0x81, 0x28, 0x28, 0x28]);
MAGIC_NUMBER.swap64(); // make Magic number to Little Endian

exports.CreateHeader = function(){

    let header = Buffer.alloc(HeaderSize);


    //1st header
    let offset = MAGIC_NUMBER.copy(header, 0, 0, 8); // magic number        offset = 8
    offset = header.writeIntLE(0x00, offset, 8);    // time                 offset = 16
    offset = header.writeIntLE(0x00, offset, 8);    // sessid               offset = 24
    offset = header.writeInt16LE(0x00, offset);     // size                 offset = 26
    offset = header.writeInt8(0x00, offset);        // enc flag             offset = 27
    offset = header.writeInt8(0x00, offset);        // enc type             offset = 28
    offset = header.writeInt16LE(0x10, offset);     // pkt ver              offset = 30
    offset = header.writeInt16LE(0x00, offset);     // make total size 32   offset = 32 (byte)
    // console.log(`offset : ${offset}`);
    // console.log(header);

    //2nd header
    offset = header.writeInt16LE(0x00, offset); // Svc ID           offset = 34
    offset = header.writeInt16LE(0x900, offset);// Msg ID           offset = 36
    offset = header.writeInt16LE(0x00, offset); // Serial           offset = 38
    offset = header.writeInt16LE(0x00, offset); // Result           offset = 40
    offset = header.writeInt32LE(0x00, offset); // CRC              offset = 44
    offset = header.writeInt32LE(0x00, offset); // client IP Addr   offset = 48
    offset = header.writeInt32LE(0x00, offset); // server IP Addr   offset = 52
    offset = header.writeInt16LE(0x00, offset); // client port      offset = 54
    offset = header.writeInt16LE(0x00, offset); // server port      offset = 56 (byte)

    return header;
}

exports.RemoveHeader = function(buffer = Buffer){
    return buffer.slice(HeaderSize);
}