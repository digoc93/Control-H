var server;
var expressServer;

var fs = require('fs');
var https = require('https');
var mongoose = require("mongoose");
var methods = require('./methods.js');
var ExpressServer = require('./ExpressServer.js');

var key = fs.readFileSync('./Certificate/controlH-key.pem');
var cert = fs.readFileSync('./Certificate/controlH-cert.pem')

var https_options = {
    key: key,
    cert: cert
};

var PORT = 3000;
var HOST = 'localhost';

mongoose.connect("mongodb://localhost/ControlH3", function(err, res){
	if(err) throw err;
	console.log("Connected to database"); 
});

expressServer = new ExpressServer(); 
expressServer.useRouter('/horario',methods);
server = https.createServer(https_options, expressServer.getServerExpress()).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);