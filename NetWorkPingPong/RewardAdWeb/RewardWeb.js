let http = require('http');
let net  = require('net');
let url = require('url');

// const port = process.env.port || 3080;

let app = http.createServer(function(request,response){
    let _url = request.url;
    let queryData = url.parse(_url, true).query;
    console.log(queryData);

    if(_url == '/'){
      _url = '/index.html';
    }
    if(_url == '/favicon.ico'){
        response.writeHead(404); 
        response.end();
        return;
    }
    response.writeHead(200);
    response.end();
});
app.listen(3080, () =>{
    console.log('listening on 3080');
});
