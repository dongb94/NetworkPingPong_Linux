let header = require('./packetHeader');
let http = require('http');
let net  = require('net');
let url = require('url');

let responses = new Map();
let gateways = [];

// const port = process.env.port || 3080;

let app = http.createServer(function(request,response){
    let _url = request.url;
    let queryData = url.parse(_url, true).query;
    console.log(queryData);

    responses.set(queryData.mac_address, response);

    let buffer = Buffer.alloc(512);
    let offset = header.MakeHeader().copy(buffer, 0, 0, header.HeaderSize);

    buffer.write(queryData.snuid, offset, 'utf-8');
    offset += 64;
    buffer.write(queryData.currency, offset, 'utf-8');
    offset += 32;
    buffer.write(queryData.mac_address, offset, 'utf-8');
    offset += 128;
    buffer.write(queryData.display_multiplier, offset, 'utf-8');
    offset += 32;
    // console.log(`len = ${offset}`);
    console.log(buffer.toString('hex'));

    if(gateways.length == 0){
        console.log('[ERROR] no gateway connected');
    }
    else{
        let gwIndex = request.remotePort % gateways.length;
        console.log(gwIndex + "/" + gateways.length);
        writeData(gateways[gwIndex], buffer);
    }

    if(_url == '/'){
        _url = '/index.html';
    }
    if(_url == '/favicon.ico'){ // 실패했을 경우 403을 보낸다.
        response.writeHead(403); 
        response.end();
        return;
    }
    response.writeHead(200); // 성공했다면 200을 보낸다.
    response.end();
});
app.listen(process.argv[2], () =>{
    console.log('listening on 3080');
});

let server = net.createServer(function(gateway){
    gateway.setTimeout(10000);
    gateways.push(gateway);

    gateway.on('data', function(recvBuffer) {

        let res = header.RemoveHeader(recvBuffer);
        let result = res.slice(0,2);
        let key = res.slice(2);

        if(responses.has(key.toString)){
            responses.get(key.toString).writeHead(result.toString);
            responses.end();
        }
        else{
            console.log(`< client key not found expection > || [key : ${key.toString}]`);
        }
        
        console.log(recvBuffer.readInt16BE(0).toString());
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

        server.getConnections(function(error,count){
            console.log('number of G connection = '+ count);
        });
    });
});

server.maxConnections = 10;
server.listen(process.argv[3], function() {

    console.log('gServer listening: ' + JSON.stringify(server.address()));

    server.on('close', function(){
        console.log('gServer Terminated');
    });

    server.on('error', function(err){
        console.log('gServer Error: ', JSON.stringify(err));
    });
});