var controlh = require("ControlH3");
var express = require('express');
var router = express.Router();
var ipOffice = require("./config/config.json").ipOffice;

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
		password :req.body.password
	};

	controlh.signUp(user, function(err, usuario){
		if(err)
			res.send(err);
		else
			res.send(usuario);
	});
});

router.post('/login', function (req, res) {
	if(req.body.name && req.body.password){
		controlh.signIn(req.body.name, req.body.password, inOffice(req), function(err,usuario){
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
	else{
		res.status(200).jsonp({error: "Ingrese nombre y password"});
	}
});

router.post('/logout', function (req, res) {
	if(req.body.name && req.body.password){
		controlh.signOut(req.body.name, req.body.password, inOffice(req), req.body.labored, function(err,usuario){
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

router.post('/passwordChange',function(req,res){
	if(req.body.name && req.body.password && req.body.newPassword){
		var user = {
		name : req.body.name,
		password:req.body.password,
		newPassword: req.body.newPassword
		};
		controlh.passwordChange(user,function(err,usuario){
			if(err){
				res.status(200).jsonp({error : err});
			}else{			
				res.status(200).jsonp({mensaje : "Contraseña cambiada satisfactoriamente"});				
			}
		});
	}else{
		res.status(200).jsonp({error: "Los datos nos estan completos"});
	}
});

router.post('/newSchedule',function(req,res){		
	if(Object.keys(req.body).length==8){
		var user= req.body.idUser;
		var agendaSubmit={
			idUser: req.body.idUser,
			lunes: req.body.lunes,
			martes: req.body.martes,
			miercoles: req.body.miercoles,
			jueves: req.body.jueves,
			viernes: req.body.viernes,
			sabado: req.body.sabado,
			domingo: req.body.domingo
		};		
		controlh.addSchedule(user,agendaSubmit,function(err,agenda){
			if(err)
				res.status(500).jsonp({error : err});
			else{				
				res.status(200).jsonp(agenda);
			}	
		});
	}else{
		res.status(200).jsonp({error: "El formulario esta incompleto"});
	}
});

router.get('/mySchedules',function(req,res){
	if(req.body.idUser){
		controlh.getSchedulesByUser(req.body.user,function(err,agendas){
			if(err){
				res.status(500).jsonp({error:err});
			}else{
				res.status(200).jsonp(agendas);
			}
		});
	}
});

router.get('allSchedules',function(req,res){
	controlh.getAllSchedules(function(err,agendas){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(agendas);
		}
	});
});

var inOffice =function(req){
	var office = false;
	var ipClient = getClientIp(req);
	for (var i = 0; i < ipOffice.length; i++) {
		if(ipClient == 	ipOffice[i].ip){
			office = true;
			i = ipOffice.length; 
		}
	};	
	return office;
}

var getClientIp = function(req) {
  var ipAddress = null;
  var forwardedIpsStr = req.headers['x-forwarded-for'];
  if (forwardedIpsStr) {
    ipAddress = forwardedIpsStr[0];
  }
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

router.get('/horas/:idUser/:year/:month/:day', function (req, res) {
	var info = {
		idUser  : parseInt(req.param("idUser")),
		year  : parseInt(req.param("year")),
		month  : parseInt(req.param("month")),
		day  : parseInt(req.param("day"))
	}
	controlh.getTotalHours(info, function(err, result){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(result);
		}
	});
});

router.get('/horas/:idUser/:year/:month', function (req, res) {
	var info = {
		idUser  : parseInt(req.param("idUser")),
		year  : parseInt(req.param("year")),
		month  : parseInt(req.param("month")),
	}
	controlh.getTotalHours(info, function(err, result){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(result);
		}
	});
});

module.exports = router;