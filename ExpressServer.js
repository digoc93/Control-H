var server;
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var oauthServer = require('oauth2-server');

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

expressServer.prototype.oauthConfig = function(model) {
	server.oauth = oauthServer({
	  model: require('./models/oauthModels/models.js'),
	  grants: ['authorization_code'],
	  debug: true
	});

	server.all('/oauth/token', server.oauth.grant());

	server.get('/', server.oauth.authorise(), function (req, res) {
	  res.send('Secret area');
	});


	server.use(server.oauth.errorHandler());

};

expressServer.prototype.useRouter = function(url, router) {
	server.use(url, router);
	console.log('add use' + url);
};

expressServer.prototype.getServerExpress= function(){
	return server;
};

module.exports = expressServer;