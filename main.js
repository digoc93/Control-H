var server;
var expressServer;

var http = require('http');
var mongoose = require("mongoose");
var methods = require('./methods.js');
var config = require('./config/config.json');
var ExpressServer = require('./ExpressServer.js');

var port = config.port;
var host = config.host;

mongoose.connect("mongodb://" + config.host + "/" + config.namedb, function(err, res){
	if(err) throw err;
	console.log("Connected to database"); 
});

expressServer = new ExpressServer(); 
//expressServer.oauthConfig();
expressServer.useRouter('/horario',methods);
server = http.createServer(expressServer.getServerExpress()).listen(port);
console.log('HTTP Server listening on %s:%s', host, port);