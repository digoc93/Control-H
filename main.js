var server;
var expressServer;

var https = require('http');
var mongoose = require("mongoose");
var methods = require('./methods.js');
var ExpressServer = require('./ExpressServer.js');

var PORT = 3003;
var HOST = 'localhost';

mongoose.connect("mongodb://localhost/ControlH3", function(err, res){
	if(err) throw err;
	console.log("Connected to database"); 
});

expressServer = new ExpressServer(); 
expressServer.oauthConfig();
expressServer.useRouter('/horario',methods);
server = https.createServer(expressServer.getServerExpress()).listen(PORT, HOST);
console.log('HTTP Server listening on %s:%s', HOST, PORT);