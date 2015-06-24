var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var server;

function expressServer () {
	server = express();
	server.use(bodyParser.urlencoded({extended: false}));
	server.use(bodyParser.json());
	server.use(methodOverride());

	server.use(function(req, res, next) {
  		res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
	});
};

expressServer.prototype.useRouter = function(url, router) {
	server.use(url, router);
	console.log('add use');
};

expressServer.prototype.getServerExpress= function(){
	return server;
};

module.exports = expressServer;