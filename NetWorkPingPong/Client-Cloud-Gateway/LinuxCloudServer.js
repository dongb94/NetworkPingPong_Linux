let fillter = require('./packetFiltering.js');
let net_server = require('net');
let gateway_server = require('net');

let max_n_of_client = 500;
let max_n_of_gateway = 20;

let clientIndex = 0;
let gatewayIndex = 0;
let clients = new Map();
let gateways = [];

let server = net_server.createServer(function(client) {

    client.id = clientIndex++;

//    console.log('Client connection: ' + client.localAddress  + ":" + client.remotePort);
//    console.log('   local = %s:%s', client.localAddress, client.localPort);
//    console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);

    server.getConnections(function(error,count){
        console.log('increase connection = '+ count);
    });

    client.setTimeout(10000);
    client.setEncoding('utf8');

    clients.set(client.remotePort, client);

    client.on('data', function(data) {

        writeData(client, 'Send: ' + data.toString()  + ' to ' +client.id.toString());

        let gwIndex = client.id % gateways.length;
        console.log(gwIndex + "/" + gateways.length)
        writeData(gateways[gwIndex], data);

        //      let buf = JSON.stringify(data);
        //      console.log(buf);

        //      console.log(data.toString("hex"));
        //      console.log(data.length);

        //      let buf_2 = Buffer.alloc(20, data.toString.toString(), 'base64');
        //      console.log(buf_2.toString("hex"));

        //      console.log('Received data from client on port %d: %s', client.remotePort, data.toString());
        //      console.log(data);

        //      console.log('  Bytes sent: ' + client.bytesWritten);
        //      console.log('  sent : ' + client.id);

    });

    client.on('error', function(err) {

        console.log('Socket Error: '+ client.id + ":", JSON.stringify(err));

    });

    client.on('timeout', function() {

        console.log('Socket Timed out ' + client.id + ':' + client.remotePort);
//        client.end();

    });

    client.on('end', function() {

//      console.log('Client disconnected ' + client.id + ':' + client.remotePort);

    });

    client.on('close', function() {
//      console.log('socket close ' + client.id + ':' + client.remotePort);
        server.getConnections(function(error,count){
                console.log('number of connection = '+ count);
        });
        clients.delete(client.remotePort);
        console.log('clients size : ' + clients.size);
    });
});

server.maxConnections = max_n_of_client;
server.listen(process.argv[2], function() {

    console.log('Server listening: ' + JSON.stringify(server.address()));

    server.on('close', function(){
        console.log('Server Terminated');
    });

    server.on('error', function(err){
        console.log('Server Error: ', JSON.stringify(err));
    });
});


let gServer = gateway_server.createServer(function(gateway){

    gateway.id = gatewayIndex++;

//    console.log('Gateway connection: ' + gateway.localAddress  + ":" + gateway.remotePort);
//    console.log('   local = %s:%s', gateway.localAddress, gateway.localPort);
//    console.log('   remote = %s:%s', gateway.remoteAddress, gateway.remotePort);

    gServer.getConnections(function(error,count){
        console.log('increase G connection = '+ count);
    });

    gateway.setTimeout(10000);
    gateway.setEncoding('utf8');

    gateways.push(gateway);

    gateway.on('data', function(data) {

//      writeData(gateway, 'Send: ' + data.toString()  + ' to ' +gateway.id.toString());

        writeData(clients[0], data);

//      console.log('Received data from gateway on port %d: %s', gateway.remotePort, data.toString());
//      console.log(Uint8Array.from(data).toString());

//      console.log('  Bytes sent: ' + gateway.bytesWritten);

    });

    gateway.on('error', function(err) {

        console.log('Gateway Socket Error: '+ gateway.id + ":", JSON.stringify(err));

    });

    gateway.on('timeout', function() {

      console.log('Gateway Timed out ::  ' + gateway.id + ':' + gateway.remotePort);
//      gateway.end();

    });

    gateway.on('end', function() {

//      console.log('Gateway disconnected :: ' + gateway.id + ':' + gateway.remotePort);

    });

    gateway.on('close', function() {
//      console.log('Gateway close :: ' + gateway.id + ':' + gateway.remotePort);

        gateways.splice(gateways.indexOf(gateway),1);

        gServer.getConnections(function(error,count){
            console.log('number of G connection = '+ count);
        });
    });
});

gServer.maxConnections = max_n_of_gateway;
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

    if(socket == NaN || socket == undefined){
        console.log("Send to undefined socket");
    }

  let success = socket.write(data);

  if (!success){
      console.log("Client Send Fail : "+data);
  }
}
