let fillter = require('./packetFiltering.js');
let header = require('./packetHeader.js');
let log = require('./Log.js');

let net_server = require('net');
let gateway_server = require('net');
const { Buffer } = require('buffer');

let max_n_of_client = 500;
let max_n_of_gateway = 20;

let clientIndex = 0;
let gatewayIndex = 0;
let clients = new Map();
let gateways = [];

// 패킷 잘림 방지 저장 버퍼
let tempBuffers = [];
let tempPorts = [];

let server = net_server.createServer(function(client) {

	client.id = clientIndex++;

//	log.Debug(`Client connection: ` + client.localAddress  + ":" + client.remotePort);
//	log.Debug('   local = %s:%s', client.localAddress, client.localPort);
//	log.Debug('   remote = %s:%s', client.remoteAddress, client.remotePort);

	server.getConnections(function(error,count){
		log.Debug(`C conn [${client.id}][rport : ${client.remotePort}][nofc : ${count}]\n   [LocalAddress : ${client.localAddress}][RemoteAddress : ${client.remoteAddress}]`);
	});

	client.setTimeout(10000);

	clients.set(client.remotePort, client);

	client.on('data', function(recvBuffer) {

		log.Debug(`[Client] rport : ${client.remotePort} // data.length : ` + recvBuffer.length);
		log.Debug(`[C] : ${recvBuffer.toString('hex')}`);

		if(!fillter.CheckMagicNumber(recvBuffer, client.remotePort)){
			return;
		}
		else
		{
			recvBuffer = header.Create0Header(recvBuffer, client.remotePort);
		}

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
		log.Debug(`\n\t[SOCKET ERROR] Client id: `+ client.id + "\n   >> msg >> "+ JSON.stringify(err));
	});

	client.on('timeout', function() {
//		log.Debug('Socket Timed out ' + client.id + ':' + client.remotePort);
//		client.end();
	});

	client.on('end', function() {
//		log.Debug('Client disconnected ' + client.id + ':' + client.remotePort);
	});

	client.on('close', function() {
//		log.Debug('socket close ' + client.id + ':' + client.remotePort);
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

//	log.Debug('Gateway connection: ' + gateway.localAddress  + ":" + gateway.remotePort);
//	log.Debug('   local = %s:%s', gateway.localAddress, gateway.localPort);
//	log.Debug('   remote = %s:%s', gateway.remoteAddress, gateway.remotePort);

	gServer.getConnections(function(error,count){
		log.Debug(`G conn [rport : ${gateway.remotePort}][nofc : ${count}]`);
	});

	gateway.setTimeout(10000);

	gateways.push(gateway);

	gateway.on('data', function(recvBuffer) {

		let clientPort;

		if(tempBuffers[gateway.id] != null) {
			let tempBuffer = tempBuffers[gateway.id];

			recvBuffer = Buffer.concat([tempBuffer, recvBuffer], tempBuffer.length+ recvBuffer.length);

			clientPort = tempPorts[gateway.id];

			log.Debug(`[Server] Target Client: ${clientPort} // com data length : ${recvBuffer.length}`);
			log.Debug(`[S] : ${recvBuffer.toString('hex')}`);

			tempBuffers[gateway.id] = null;
		}
		else {
			clientPort = header.GetClientPort(recvBuffer);

			log.Debug(`[Server] Target Client: ${clientPort} // data length : ${recvBuffer.length}`);
			log.Debug(`[S] : ${recvBuffer.toString('hex')}`);

			recvBuffer = header.Remove0Header(recvBuffer);
		}

		let packetSize = header.GetPacketSize(recvBuffer);
		if(packetSize > recvBuffer.length){ // 패킷이 잘려서 전송된 경우. (separate packet)
			log.Debug(`msg origin length : ${packetSize}, recv msg length : ${recvBuffer.length}`);
			tempBuffers[gateway.id] = recvBuffer;
			tempPorts[gateway.id] = clientPort;
			return;
		}

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
//		log.Debug('Gateway Timed out ::  ' + gateway.id + ':' + gateway.remotePort);
//		gateway.end();
	});

	gateway.on('end', function() {
//		log.Debug('Gateway disconnected :: ' + gateway.id + ':' + gateway.remotePort);
	});

	gateway.on('close', function() {
//		log.Debug('Gateway close :: ' + gateway.id + ':' + gateway.remotePort);
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
		log.Debug(`[SOCKET ERROR] Client Send Fail : \n	>> msg >> `+data);
	}
}