var net_server = require('net');

var index = 0;

var server = net_server.createServer(function(client) {

    client.id = index++;

//    console.log('-----------------------');

//    console.log('Client connection: ' + client.localAddress  + ":" + client.remotePort);

//    console.log('   local = %s:%s', client.localAddress, client.localPort);

//    console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);


    server.getConnections(function(error,count){
        console.log('increase connection = '+ count);
    });



    client.setTimeout(10000);

    client.setEncoding('utf8');



    client.on('data', function(data) {

//      console.log('Received data from client on port %d: %s', client.remotePort, data.toString());

//      console.log(data);

//      console.log(Uint8Array.from(data).toString());

        writeData(client, 'Send: ' + data.toString()  + ' to ' +client.id.toString());

//      console.log('  Bytes sent: ' + client.bytesWritten);

//      console.log('  sent : ' + client.id);

    });

    client.on('error', function(err) {

        console.log('Socket Error: '+ client.id + ":", JSON.stringify(err));

    });

    client.on('timeout', function() {

//      console.log('Socket Timed out ' + client.id + ':' + client.remotePort);
//      client.destroy();

    });

    client.on('end', function() {

//      console.log('Client disconnected ' + client.id + ':' + client.remotePort);

    });

    client.on('close', function() {
//      console.log('socket close ' + client.id + ':' + client.remotePort);
        server.getConnections(function(error,count){
            console.log('number of connection = '+ count);
        });
    });
});


server.listen(process.argv[2], function() {

    console.log('Server listening: ' + JSON.stringify(server.address()));
    console.log('Server max connections : ' + server.maxConnections);
    server.on('close', function(){

        console.log('Server Terminated');

    });

    server.on('error', function(err){

        console.log('Server Error: ', JSON.stringify(err));

    });
});

function writeData(socket, data){

    var success = socket.write(data);

    if (!success){

        console.log("Client Send Fail");

    }
}