var controlh = require("ControlH3");
var express = require('express');
var router = express.Router();
var ipOffice = require("./config/config.json").ipOffice;
var differenceUTM = require("./config/config.json").differenceUTM;

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

/----------------------------------------------------- User managment and basic services  ------------------------------------------------/ 

router.post('/user', function (req, res) {
	var user = {
		name : req.body.name,
		password :req.body.password
	};

	controlh.signUp(user, function(err, usuario){
		if(err)
			res.status(500).jsonp({error: err});
		else
			res.status(200).jsonp(usuario);
	});
});

router.post('/login', function (req, res) {
	if(req.body.name && req.body.password){
		controlh.signIn(req.body.name, req.body.password, new Date(), inOffice(req), function(err,usuario){
			if(err){
				res.status(500).jsonp({error : err});
			}
			else{
				var user = {
					name : req.body.name,
					date : new Date(),
					type : usuario.type
				};
				res.status(200).jsonp(user);
			}
		});
	}
	else{
		res.status(500).jsonp({error: "Enter username and password"});
	}
});

router.post('/logout', function (req, res) {
	if(req.body.name && req.body.password){
		console.log("bodyyyy " + JSON.stringify(req.body));
		controlh.signOut(req.body.name, req.body.password, new Date(), inOffice(req), req.body.labored, function(err,usuario){
			if(err){
				res.status(500).jsonp({error : err});
			}
			else{
				var user = {
					name : req.body.name,
					date : new Date(),
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
				res.status(500).jsonp({error : err});
			}else{				
				res.status(200).jsonp(usuario);
			}
		});
	}else{
		res.status(500).jsonp({error: "The data are not complete"});
	}
});

/--------------------------------------- Schedule managment : (Post, Get by user, Get All, and Patch)  -----------------------------------/ 

router.post('/schedules',function(req,res){
	if(Object.keys(req.body).length==2){		
		var agendaSubmit={
			idUser: req.body.idUser,
			day: req.body.day
		};		
		controlh.addSchedule(agendaSubmit,function(err,agenda){
			if(err)
				res.status(500).jsonp({error : err});
			else{				
				res.status(200).jsonp(agenda);
			}	
		});
	}else{
		res.status(500).jsonp({error: "The form is incomplete"});
	}
});

router.get('/schedules/:idUser',function(req,res){
	controlh.getSchedulesByIdUser(parseInt(req.param("idUser")),function(err,agendas){
		if(err){	
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(agendas);
		}
	});
	
});

router.get('/schedules',function(req,res){
	controlh.getAllSchedules(function(err,agendas){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(agendas);
		}
	});
});

router.patch('/schedules/:idSchedule',function(req,res){
	if(Object.keys(req.body).length>0){
		controlh.patchScheduleById(parseInt(req.param("idSchedule")), req.body.day, function(error,response){
			if(error){
				res.status(500).jsonp({error:error});
			}else{
				res.status(200).jsonp(response);
			}
		});
	}else{
		res.status(500).jsonp({error: "The are not data to update the register"});
	}
});

/--------------------- IP status functions. Its function is to determine whether the usaurio this at home or in the office ---------------/ 

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

/------------------------------------------ Measurement ranges of hour work in different ways ---------------------------------------------/

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

router.get('/rango/:idUser/:fechaInicial/:fechaFinal', function (req, res) {
	var info = {
		idUser : req.param('idUser'),
		initDate: req.param('fechaInicial'),
		finalDate: req.param('fechaFinal'),
		diff : differenceUTM
	}
	controlh.getHoursInDateRange(info, function(err, result){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(result);
		}
	});
});

/------------------------------------------ Project managment : (Post, Get All , Get by id and Patch)  -----------------------------------/ 

router.post('/projects', function(req, res){
	if(Object.keys(req.body).length == 5){
		controlh.addProject(req.body,function(error,response){
			if(error){
				res.status(500).jsonp({error:error});
			}else{
				res.status(200).jsonp(response);
			}
		});	
	}else{
		res.status(500).jsonp({error: "The form is incomplete"});
	}	
});

router.get('/projects', function(req,res){
	controlh.getAllProjects(function(err,response){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(response);
		}
	});
});

router.get('/projects/:idProject', function(req,res){
	controlh.getProjectById(parseInt(req.param("idProject")),function(err,response){
		if(err){
			res.status(500).jsonp({error:err});
		}else{
			res.status(200).jsonp(response);
		}
	});
});

router.patch('/projects/:idProject',function(req,res){
	if(Object.keys(req.body).length>0){
		controlh.patchProjectById(parseInt(req.param("idProject")),req.body, function(error,response){
			if(error){
				res.status(500).jsonp({error:error});
			}else{
				res.status(200).jsonp(response);
			}
	});
	}else{
		res.status(500).jsonp({error: "The are not data to update the register"});
	}
});

/------------------------------------------ Backlog managment : (Post, Get All , Get by id and Patch)  -----------------------------------/ 
router.post('/projects/:idProject/backlogs/:type', function(req, res){
	if(req.param('type') == 'release' || req.param('type') == 'sprint' || req.param('type') == 'product'){
		if(Object.keys(req.body).length == 1){
			controlh.addBacklog(req.param('idProject'), req.param('type'), req.body, function(error, response){
				if(error){
					res.status(500).jsonp({error:error});
				}else{
					res.status(200).jsonp(response);
				}
			});
		}
		else{
			res.status(500).jsonp({error: "The form is incomplete"});
		}		
	}
	else{
		res.status(400).jsonp({error : "Malformed URL"});		
	}			
});

router.get('/projects/:idProject/backlogs/:type', function(req, res){
	controlh.getBacklogs(parseInt(req.param('idProject')),req.param('type'), function(error, response){
		if(error){
			res.status(500).jsonp({error:error});
		}else{
			res.status(200).jsonp(response);
		}
	});		
});

router.get('/projects/:idProject/backlogs/:type/:id', function(req, res){
	controlh.getBacklog(parseInt(req.param('id')), parseInt(req.param('idProject')), req.param('type'), function(error, response){
		if(error){
			res.status(500).jsonp({error:error});
		}else{
			res.status(200).jsonp(response);
		}
	});	
});

router.patch('/projects/:idProject/backlogs/:type/:id', function(req,res){	
	if(Object.keys(req.body).length ==1){
		controlh.patchBacklog(parseInt(req.param('id')), parseInt(req.param('idProject')), req.param('type'), req.body, function(error, response){
			if(error){
				res.status(500).jsonp({error: error});
			}else{
				res.status(200).jsonp(response);
			}
		});
	}else{
		res.status(500).jsonp({error: "There are not enough data to update the register"});
	}
	
});

/------------------------------------------ Requirement managment : (Post, Get All , Get by id and Patch)  -----------------------------------/

router.post('/projects/:idProject/backlogs/:type/:idBacklog/requirements', function(req, res){	
	if(req.param('type') == 'release' || req.param('type') == 'sprint'){
		if(Object.keys(req.body).length >= 5){
			controlh.addRequirement(parseInt(req.param('idProject')), req.param('type'), parseInt(req.param('idBacklog')), req.body, function(error, response){
				if(error){
					res.status(500).jsonp({error : error});
				}else{
					res.status(200).jsonp(response);
				}
			}); 
		}else{
			res.status(500).jsonp({error: "The form is incomplete"});
		}			
	}else{
		res.status(400).jsonp({error : "Malformed URL"});
	}
});

router.get('/projects/:idProject/backlogs/:type/:idBacklog/requirements', function(req, res){
	if(req.param('type') == 'release' || req.param('type') == 'sprint'){
		controlh.getRequirements(parseInt(req.param('idProject')), req.param('type'), parseInt(req.param('idBacklog')), function(error, response){
			if(error){
				res.status(500).jsonp({error: error});
			}else{
				res.status(200).jsonp(response);
			}
		});		
	}else{
		res.status(400).jsonp({error : "Malformed URL"}); 		
	}
});

router.get('/projects/:idProject/backlogs/:type/:idBacklog/requirements/:id', function(req, res){
	if(req.param('type') == 'release' || req.param('type') == 'sprint'){
		controlh.getRequirement(parseInt(req.param('id')),parseInt(req.param('idProject')), req.param('type'), parseInt(req.param('idBacklog')), function(error, response){
			if(error){
				res.status(500).jsonp({error: error});
			}else{
				res.status(200).jsonp(response);
			}
		}); 		
	}else{
		res.status(400).jsonp({error : "Malformed URL"});		
	}
});

router.patch('/projects/:idProject/backlogs/:type/:idBacklog/requirements/:id', function(req, res){
	if(req.param('type') == 'release' || req.param('type') == 'sprint'){
		if(Object.keys(req.body).length > 0){
			controlh.patchRequirement(parseInt(req.param('id')), parseInt(req.param('idProject')), req.param('type'), parseInt(req.param('idBacklog')), req.body, function(error, response){
				if(error){					
					res.status(500).jsonp({error : error});
				}else{
					res.status(200).jsonp(response);
				}
			}); 
		}else{
			res.status(500).jsonp({error: "There are not enough data to update the register"});
		}			
	}else{
		res.status(400).jsonp({error : "Malformed URL"});
	}
});

/------------------------------------------ History managment : (Post, Get All , Get by id and Patch)  -----------------------------------/

router.post('/projects/:idProject/backlogs/product/:idBacklog/histories', function(req, res){	
	if(Object.keys(req.body).length >= 5){
		controlh.addHistory(parseInt(req.param('idProject')), parseInt(req.param('idBacklog')), req.body, function(error, response){
			if(error){
				res.status(500).jsonp({error : error});
			}else{
				res.status(200).jsonp(response);
			}
		}); 
	}else{
		res.status(500).jsonp({error: "The form is incomplete"});
	}			
});

router.get('/projects/:idProject/backlogs/product/:idBacklog/histories', function(req, res){
	controlh.getHistories(parseInt(req.param('idProject')), parseInt(req.param('idBacklog')), function(error, response){
		if(error){
			res.status(500).jsonp({error: error});
		}else{
			res.status(200).jsonp(response);
		}
	});			
});

router.get('/projects/:idProject/backlogs/product/:idBacklog/histories/:id', function(req, res){
	controlh.getHistory(parseInt(req.param('id')), parseInt(req.param('idProject')), parseInt(req.param('idBacklog')), function(error, response){
		if(error){
			res.status(500).jsonp({error: error});
		}else{
			res.status(200).jsonp(response);
		}
	}); 		
});

router.patch('/projects/:idProject/backlogs/product/:idBacklog/histories/:id', function(req, res){
	if(Object.keys(req.body).length > 0){
		controlh.patchHistory(parseInt(req.param('id')), parseInt(req.param('idProject')), parseInt(req.param('idBacklog')), req.body, function(error, response){
			if(error){					
				res.status(500).jsonp({error : error});
			}else{
				res.status(200).jsonp(response);
			}
		}); 
	}else{
		res.status(500).jsonp({error: "There are not enough data to update the register"});
	}		
});

router.post('/testCreate',function(req, res){
	res.status(200).jsonp(validateCreateRequestIntegrity(req.body.solicitud, req.body.modelo, false));
});

router.post('/testEdit',function(req, res){
	res.status(200).jsonp(validateCreateRequestIntegrity(req.body.solicitud, req.body.modelo, true));
});

var validateCreateRequestIntegrity = function(req, structure, editing){
	var requiredNotPresent= [];
	var requiredFields= 0;
	var valid = 0;
	if(Object.keys(req).length == 0){
		return ({error: true, message: "The form is incomplete"});
	}
	for(field in structure){
		if(structure[field].required == true){
			requiredFields++;
		}
		if(req[field] == undefined || req[field].length == 0){
			if(structure[field].required == true){
				requiredNotPresent.push(field);
			}
		}else{
			valid++;
		}
	}	
	if(editing){
		if(valid == 0){			
			return ({error: true, message: "No field will modify the register"});			
		}else{
			return ({error: false, message: "It's ok"});
		}return ({error: false, message: "It's ok"});
	}else{
		if(requiredNotPresent.length >0){
			var str ="";
			for(field in requiredNotPresent){
				str += requiredNotPresent[field] + ", ";
			}
			return ({error : true, message: "The form is incomplete, missing or empty fields: "+ str});		
		}else if(Object.keys(req).length > requiredFields){
			return ({error : true, message: "There are extra fields"});
		}else{
			return ({error : false, message: "It's ok"});
		}
	}
	
}

module.exports = router;