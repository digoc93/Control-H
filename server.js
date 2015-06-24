var fs = require('fs');
var https = require('https');
var express = require('express');
var mongoose = require("mongoose");
var controlh = require("controlh3");
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var multer = require('multer');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());


var contador; 


mongoose.connect("mongodb://localhost/ControlH3", function(err, res){
	if(err) throw err;
	console.log("Connected to database"); 
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/test1', function (req, res, next) {
 	var hora;
 	var a;
 	var b 
 	controlh.hi(function(result){
 		result = JSON.parse(result);
 		var fecha= new Date();
 		fecha.getSeconds(result.timestamp + 1000 * 3600);
 		a = new Date("February 13, 2014 04:29:00");
		b = new Date("February 12, 2014 03:00:00");
		//La diferencia se da en milisegundos así que debes dividir entre 1000
		var c = ((a-b)/3600000);
	  console.log(result.timestamp + 1000 *3600);
		
		res.send('Hora fecha	: ' + fecha);
 	});

});

app.post('/user', function (req, res) {
	var user = {
		name : req.body.name,
		password :req.body.pass
	};

	controlh.signUp(user, function(err, usuario){
		if(err)
			res.send(err);
		else
			res.send(usuario);
	});
});



app.post('/login', function (req, res) {
	if(req.body.name && req.body.pass){
		controlh.signIn(req.body.name, req.body.pass, null, function(err,usuario){
			if(err){
				res.status(200).jsonp({error : err});
			}
			else{
				var user = {
					name : req.body.name,
					date : new Date(usuario.input),
					type : usuario.type
				};
				res.status(200).jsonp(user);
			}
		});
	}
	else
	{
		res.status(200).jsonp({error: "Ingrese nombre y password"});
	}
});

app.post('/logout', function (req, res) {
	if(req.body.name && req.body.pass){
		controlh.signOut(req.body.name, req.body.pass, null, req.body.labored, function(err,usuario){
			if(err)
			{
				res.status(200).jsonp({error : err});
			}
			else{
				var user = {
					name : req.body.name,
					date : new Date(usuario.input),
					type : usuario.type
				};
				res.status(200).jsonp(user);
			}
		});
	}
});

app.get('/workingNow',function (req, res) {
	controlh.workingNow(function(err,usuarios){
		if(err)
			res.status(500);
		else{
			var usersResult = [];
			for (var i = usuarios.length - 1; i >= 0; i--) {
				var usuario = {
					name : usuarios[i].name,
					state : usuarios[i].state	
				} 
				usersResult.push(usuario);
			};
			res.status(200).jsonp(usersResult);
		}
	});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

});

server.listen(300, function(){
  console.log("Node server running on http://localhost:3000");
});


