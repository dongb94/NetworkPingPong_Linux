const { timeStamp } = require("console");

exports.Debug = function(string){
    console.log(`[${Date()}]${string}`);
}