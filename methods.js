var controlh = require("ControlH3");
var express = require('express');
var router = express.Router();

router.get('/test1', function (req, res, next) {
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

router.post('/user', function (req, res) {
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

router.post('/login', function (req, res) {
	if(req.body.name && req.body.pass){
		controlh.signIn(req.body.name, req.body.pass, inOffice, function(err,usuario){
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

router.post('/logout', function (req, res) {
	if(req.body.name && req.body.pass){
		controlh.signOut(req.body.name, req.body.pass, inOffice, req.body.labored, function(err,usuario){
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

router.get('/workingNow',function (req, res) {
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

var inOffice =function(){
	var office = false; 	
	if(getClientIp == "181.142.202.23"){
		office = true;
	}
	return office;
}

var getClientIp = function(req) {
  var ipAddress = null;
  var forwardedIpsStr = req.headers['x-forwarded-for'];
  if (forwardedIpsStr) {
    ipAddress = forwardedIpsStr[0];
    console.log(1);
  }
  if (!ipAddress) {
  	console.log(2);
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

module.exports = router;