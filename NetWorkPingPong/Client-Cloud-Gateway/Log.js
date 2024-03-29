var fs = require('fs');
var express = require('express');
var exec = require("child_process").exec;

const { timeStamp } = require("console");

exports.Debug = function(string){
	console.log(`[${Date()}]${string}`);
}

exports.Error = function(string){
	var dir = `./LOG`	
	var path = `./LOG/${process.argv[2]}.err`;

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
		exec("sudo chmod 777 ./LOG", function(err, stdout, stderr){ // 읽기, 쓰기 권한 필요

			console.log(stdout);
			console.log(stderr);
		});
	}

	fs.open(path, 'a', function(err, fd)
	{
		if(err) {
			console.log(`${path} Open Err\n`);
			return;
		}
		else
		{
			fs.appendFile(fd, `[${Date()}]${string}\n`, function(err, data){
				console.log(data);
			});
		}
	});
}