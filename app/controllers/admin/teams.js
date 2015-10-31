'use strict';
var request = require('request');

exports.find = function(req,res,next) {
	var workflow = req.app.util.workflow(req, res, next);

	request(req.protocol + '://api.punditly.com/v1' + req.originalUrl.replace('/admin', '') + (Object.keys(req.query).length ? '&' : '?') + 'token=' + req.cookies.AUTH_TOKEN || '', function(error, response, body){

		if (error) {
			console.log('problem with request: ' + e.message);
			res.send(JSON.stringify(error));
		}

		if (('' + response.statusCode).match(/^502$/)) {
			
			var err = {
				message: 'Gateway error. Service unavailable', 
				code: response.statusCode
			};

			workflow.outcome.errors.push(err);
			if (req.xhr) {
				return workflow.emit('response');
			} else {
				return res.render('admin/teams/index', {data: {results: JSON.stringify({"errors":workflow.outcome.errors})}});
			}
		}

		if (req.xhr) {
    	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    	res.send(body);
  	} else {
			res.render('admin/teams/index', {data: {results: body}});
		}
	});
};

exports.read = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res, next);
	
	request(req.protocol + '://api.punditly.com/v1' + req.originalUrl.replace('/admin', '') + (Object.keys(req.query).length ? '&' : '?') + 'token=' + req.cookies.AUTH_TOKEN || '', function(error, response, body){

		if (error) {
			console.log('problem with request: ' + e.message);
			res.send(JSON.stringify(error));
		}

		if (('' + response.statusCode).match(/^502$/)) {
			
			var err = {
				message: 'Gateway error. Service unavailable', 
				code: response.statusCode
			};

			workflow.outcome.errors.push(err);
			if (req.xhr) {
				return workflow.emit('response');
			} else {
				return res.render('admin/teams/edit', {data: {record: JSON.stringify({"errors":workflow.outcome.errors})}});
			}
		}

		if (req.xhr) {
    	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    	res.send(body);
  	} else {
			res.render('admin/teams/edit', {data: {record: body}});
		}
	});
};

exports.create = function(req, res, next){
	var workflow = req.app.util.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.body.name) {
			workflow.outcome.errors.push('Please enter a name.');
			return workflow.emit('response');
		}

		if (!/^[a-zA-Z0-9 ]+$/.test(req.body.name)){
			workflow.outcome.errors.push('Only use letters, numbers');
			return workflow.emit('response');
		}

		workflow.emit('duplicateNameCheck');
	});

	workflow.on('duplicateNameCheck', function(){
		req.app.db.models.Team.findOne({name:req.body.name}, function(err, team){
			if (err) {
				return workflow.emit('exception', err);
			}

			if (team) {
				workflow.outcome.errors.push('That name already exists.');
				return workflow.emit('response');
			}

			workflow.emit('createTeam');
		});
	});

	workflow.on('createTeam', function(){
		var fieldsToSet = {
			name: req.body.name,
		};
		req.app.db.models.Team.create(fieldsToSet, function(err, team){
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.record = team;
			return workflow.emit('response');
		});
	});

	workflow.emit('validate');
};

exports.update = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res);

	workflow.on('validate', function(){
		if (!req.body.name) {
			workflow.outcome.errfor.name = 'required';
		} else if (!/^[a-zA-Z0-9 ]+$/.test(req.body.name)) {
			workflow.outcome.errfor.name = 'only use letters and numbers';
		}

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}

		workflow.emit('duplicateNameCheck');
	});

	workflow.on('duplicateNameCheck', function() {
		req.app.db.models.Team.findOne({name: req.body.name, _id: { $ne: req.params.id }}, function(err, team) {
			if (err) {
				return workflow.emit('exception', err);
			}

			if (team) {
				workflow.outcome.errfor.name = 'That team name already exists';
				return workflow.emit('response');
			}

			workflow.emit('updateTeam');

		});
	});

	workflow.on('updateTeam', function(){
		var fieldsToSet = {
			league: req.body.league,
			name: req.body.name,
			park: req.body.park
		};

		req.app.db.models.Team.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, team) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.team = team;
			workflow.emit('response');
		});
	});

	workflow.emit('validate');
};

exports.delete = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.user.is('admin')) {
			workflow.outcome.errors.push('Unauthorized');
			return workflow.emit('response');
		}

		workflow.emit('deleteTeam');
	});

	workflow.on('deleteTeam', function(err) {
		req.app.db.models.Team.findByIdAndRemove(req.params.id, function(err, team) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.emit('response');
		});
	});

	workflow.emit('validate');
};