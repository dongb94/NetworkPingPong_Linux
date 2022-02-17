var fs = require('fs');

const { timeStamp } = require("console");

exports.Debug = function(string){
	console.log(`[${Date()}]${string}`);
}

exports.Error = function(string){
	var dir = `./LOG`	
	var path = `./LOG/${process.argv[2]}.err`;

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
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