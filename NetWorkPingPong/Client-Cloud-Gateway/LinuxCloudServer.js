var fillter = require('./packetFiltering.js');
var net_server = require('net');
var gateway_server = require('net');

var index = 0;
var gatewayIndex = 0;
var clients = new Set();
var gateways = new Set();

var server = net_server.createServer(function(client) {

    client.id = index++;

//    console.log('Client connection: ' + client.localAddress  + ":" + client.remotePort);
//    console.log('   local = %s:%s', client.localAddress, client.localPort);
//    console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);

    server.getConnections(function(error,count){
        console.log('increase connection = '+ count);
    });

    client.setTimeout(10000);
    client.setEncoding('utf8');

    clients.add(client);

    client.on('data', function(data) {

        writeData(client, 'Send: ' + data.toString()  + ' to ' +client.id.toString());

//      console.log('Received data from client on port %d: %s', client.remotePort, data.toString());
//      console.log(data);
//      console.log(Uint8Array.from(data).toString());

//      console.log('  Bytes sent: ' + client.bytesWritten);
//      console.log('  sent : ' + client.id);

    });

    client.on('error', function(err) {

        console.log('Socket Error: '+ client.id + ":", JSON.stringify(err));

    });

    client.on('timeout', function() {

        console.log('Socket Timed out ' + client.id + ':' + client.remotePort);
        client.destroy();

    });

    client.on('end', function() {

//      console.log('Client disconnected ' + client.id + ':' + client.remotePort);

    });

    client.on('close', function() {
//      console.log('socket close ' + client.id + ':' + client.remotePort);
        server.getConnections(function(error,count){
                console.log('number of connection = '+ count);
        });
        clients.delete(client);
        console.log('clients size : ' + clients.size);
    });
});

server.listen(process.argv[2], function() {

    console.log('Server listening: ' + JSON.stringify(server.address()));

    server.on('close', function(){
        console.log('Server Terminated');
    });

    server.on('error', function(err){
        console.log('Server Error: ', JSON.stringify(err));
    });
});


var gServer = gateway_server.createServer(function(client){

    client.id = gatewayIndex++;

//    console.log('Gateway connection: ' + client.localAddress  + ":" + client.remotePort);
//    console.log('   local = %s:%s', client.localAddress, client.localPort);
//    console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);

    server.getConnections(function(error,count){
        console.log('increase G connection = '+ count);
    });

    client.setTimeout(10000);
    client.setEncoding('utf8');

    gateways.add(client);

    client.on('data', function(data) {

        writeData(client, 'Send: ' + data.toString()  + ' to ' +client.id.toString());

//      console.log('Received data from gateway on port %d: %s', client.remotePort, data.toString());
//      console.log(Uint8Array.from(data).toString());

//      console.log('  Bytes sent: ' + client.bytesWritten);

    });

    client.on('error', function(err) {

        console.log('Gateway Socket Error: '+ client.id + ":", JSON.stringify(err));

    });

    client.on('timeout', function() {

      console.log('Gateway Timed out ::  ' + client.id + ':' + client.remotePort);
//      client.destroy();

    });

    client.on('end', function() {

//      console.log('Gateway disconnected :: ' + client.id + ':' + client.remotePort);

    });

    client.on('close', function() {
//      console.log('Gateway close :: ' + client.id + ':' + client.remotePort);
        gServer.getConnections(function(error,count){
                console.log('number of G connection = '+ count);
        });
    });
});

gServer.listen(process.argv[3], function() {

    console.log('gServer listening: ' + JSON.stringify(gServer.address()));

    gServer.on('close', function(){
        console.log('gServer Terminated');
    });

    gServer.on('error', function(err){
        console.log('gServer Error: ', JSON.stringify(err));
    });
});

function writeData(socket, data){

  var success = socket.write(data);

  if (!success){
//      console.log("Client Send Fail : "+data);
  }
}
