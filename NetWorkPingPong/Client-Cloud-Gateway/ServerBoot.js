var fs = require('fs');
var express = require('express');
var exec = require("child_process").exec;

function zeroPad(nr,base){
	var  len = (String(base).length - String(nr).length)+1;
	return len > 0? new Array(len).join('0')+nr : nr;
}

for(let i=parseInt(process.argv[2]); i<parseInt(process.argv[3]); i++){
	exec(`nohup node LinuxCloudServer.js 4${zeroPad(i,100)} 4${zeroPad(300+i,100)} &`, function(err, stdout, stderr){
		console.log(stdout);
		console.log(stderr);
	});
};
