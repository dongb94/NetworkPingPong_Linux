let fillter = require('./packetFiltering.js');
let header = require('./packetHeader.js');
let log = require('./Log.js');

let net_server = require('net');
let gateway_server = require('net');


let max_n_of_client = 500;
let max_n_of_gateway = 20;

let clientIndex = 0;
let gatewayIndex = 0;
let clients = new Map();
let gateways = [];

let temp = 0;

let server = net_server.createServer(function(client) {

    client.id = clientIndex++;
    temp = client.remotePort;

//    log.Debug(`Client connection: ` + client.localAddress  + ":" + client.remotePort);
//    log.Debug('   local = %s:%s', client.localAddress, client.localPort);
//    log.Debug('   remote = %s:%s', client.remoteAddress, client.remotePort);

    server.getConnections(function(error,count){
        log.Debug(`C conn [rport : ${client.remotePort}][nofc : ${count}]`);
    });

    client.setTimeout(10000);

    clients.set(client.remotePort, client);

    client.on('data', function(recvBuffer) {

        if(!fillter.CheckMagicNumber(recvBuffer, client.remotePort)){
            return;
        }
        else
        {
            recvBuffer = header.Create0Header(recvBuffer, client.remotePort);
        }

		log.Debug(`[Client] data.length : ` + recvBuffer.length);
		log.Debug(`[C] : ${recvBuffer.toString('hex')}`);

        if(gateways.length == 0){
            log.Debug(`[ERROR] no gateway connected`);
        }
        else{
            let gwIndex = client.id % gateways.length;
            log.Debug(gwIndex + "/" + gateways.length);
            writeData(gateways[gwIndex], recvBuffer);
        }
    });

    client.on('error', function(err) {

        log.Debug(`[SOCKET ERROR] Client id: `+ client.id + "\n   >> msg >> "+ JSON.stringify(err));

    });

    client.on('timeout', function() {

//        log.Debug('Socket Timed out ' + client.id + ':' + client.remotePort);
//        client.end();

    });

    client.on('end', function() {

//      log.Debug('Client disconnected ' + client.id + ':' + client.remotePort);

    });

    client.on('close', function() {
//      log.Debug('socket close ' + client.id + ':' + client.remotePort);
		clients.delete(client.remotePort);
		log.Debug(`clients size : ${clients.size}`);
        server.getConnections(function(error,count){
			log.Debug(`number of connection = `+ count);
			if(count != clients.size) console.error(`Client map size error`)
        });
    });
});

server.maxConnections = max_n_of_client;
server.listen(process.argv[2], function() {

    log.Debug(`Server listening: ` + JSON.stringify(server.address()));

    server.on('close', function(){
        log.Debug(`Server Terminated`);
    });

    server.on('error', function(err){
        log.Debug(`[C SERVER ERROR] ${JSON.stringify(err)}`);
    });
});

let gServer = gateway_server.createServer(function(gateway){

    gateway.id = gatewayIndex++;

//    log.Debug('Gateway connection: ' + gateway.localAddress  + ":" + gateway.remotePort);
//    log.Debug('   local = %s:%s', gateway.localAddress, gateway.localPort);
//    log.Debug('   remote = %s:%s', gateway.remoteAddress, gateway.remotePort);

    gServer.getConnections(function(error,count){
		log.Debug(`G conn [rport : ${gateway.remotePort}][nofc : ${count}]`);
    });

    gateway.setTimeout(10000);

    gateways.push(gateway);

    gateway.on('data', function(recvBuffer) {

        let clientPort = header.GetClientPort(recvBuffer);

		recvBuffer = header.Remove0Header(recvBuffer);

		log.Debug(`[Server] Target Client: ${clientPort} // data length : ${recvBuffer.length}`);
		log.Debug(`[S] : ${recvBuffer.toString('hex')}`);

		let target = clients.get(clientPort);
		if(target == undefined) {
			log.Debug('target client was disconnected');
			return;
		}

        writeData(clients.get(clientPort), recvBuffer);
    });

    gateway.on('error', function(err) {

        log.Debug(`[SOCKET ERROR] Gateway id : `+ gateway.id + "\n   >> msg >> "+ JSON.stringify(err));

    });

    gateway.on('timeout', function() {

//      log.Debug('Gateway Timed out ::  ' + gateway.id + ':' + gateway.remotePort);
//      gateway.end();

    });

    gateway.on('end', function() {

//      log.Debug('Gateway disconnected :: ' + gateway.id + ':' + gateway.remotePort);

    });

    gateway.on('close', function() {
//      log.Debug('Gateway close :: ' + gateway.id + ':' + gateway.remotePort);

        gateways.splice(gateways.indexOf(gateway),1);

        gServer.getConnections(function(error,count){
            log.Debug(`number of G connection = ${count}`);
        });
    });
});

gServer.maxConnections = max_n_of_gateway;
gServer.listen(process.argv[3], function() {

    log.Debug('gServer listening: ' + JSON.stringify(gServer.address()));

    gServer.on('close', function(){
        log.Debug(`gServer Terminated`);
    });

    gServer.on('error', function(err){
        log.Debug(`[G SERVER ERROR] ${JSON.stringify(err)}`);
    });
});

function writeData(socket, data){

    if(socket == NaN || socket == undefined){
		log.Debug(`[SOCKET ERROR] Send to undefined socket`);
		return;
    }

    let success = socket.write(data);

    if (!success){
        log.Debug(`[SOCKET ERROR] Client Send Fail : \n    >> msg >> `+data);
    }
}