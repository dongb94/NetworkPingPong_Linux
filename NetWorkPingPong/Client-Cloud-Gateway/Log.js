

let time = new Date();

exports.Debug = function(string){
    console.log(`[${time.toTimeString}]${string}`);
}