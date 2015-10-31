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
				return res.render('admin/leagues/index', {data: {results: JSON.stringify({"errors":workflow.outcome.errors})}});
			}
		}

		if (req.xhr) {
    	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    	res.send(body);
  	} else {
			res.render('admin/leagues/index', {data: {results: body}});
		}
	});
};

exports.getTeams = function(req,res,next) {
	var workflow = req.app.util.workflow(req, res, next);

	if (req.params.id.length < 24) { // make sure it's a valid objectid string of 24 hex chars
		workflow.response.code = 'INVALID_LEAGUE_ID';
		workflow.response.message = 'The requested league ID is not valid';
		workflow.emit('bad_request');
	}

	request('http://api.punditly.com/v1/leagues/' + req.params.id +'/teams?token=' + req.cookies.AUTH_TOKEN || '', function(error, response, body){

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
				return res.render('admin/leagues/index', {data: {results: JSON.stringify({"errors":workflow.outcome.errors})}});
			}
		}

		if (req.xhr) {
    	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    	res.send(body);
  	} else {
			res.render('admin/leagues/index', {data: {results: body}});
		}
	});
};

exports.read = function(req, res, next) {
	req.app.db.models.League.findById(req.params.id, function(err, league){
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.send(league);
		} else {
			res.render('admin/leagues/edit', { data: { record: escape(JSON.stringify(league)) } });
		}
	});
};

exports.create = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res, next);

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
		req.app.db.models.League.findOne({name:req.body.name.toLowerCase()}, function(err, league){
			if (err) {
				return workflow.emit('exception', err);
			}

			if (league) {
				workflow.outcome.errors.push('That league already exists.');
				return workflow.emit('response');
			}

			workflow.emit('createLeague');
		});
	});

	workflow.on('createLeague', function(){
		var fieldsToSet = {
			name: req.body.name.toLowerCase(),
		};
		req.app.db.models.League.create(fieldsToSet, function(err, league){
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.record = league;
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
		req.app.db.models.League.findOne({name: req.body.name.toLowerCase(), _id: { $ne: req.params.id }}, function(err, league) {
			if (err) {
				return workflow.emit('exception', err);
			}

			if (league) {
				workflow.outcome.errfor.name = 'That league name already exists';
				return workflow.emit('response');
			}

			workflow.emit('updateLeague');

		});
	});

	workflow.on('updateLeague', function(){
		var fieldsToSet = {
			league: req.body.league,
			name: req.body.name.toLowerCase(),
			country: req.body.country
		};

		req.app.db.models.League.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, league) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.league = league;
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

		workflow.emit('deleteLeague');
	});

	workflow.on('deleteLeague', function(err) {
		req.app.db.models.League.findByIdAndRemove(req.params.id, function(err, team) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.emit('response');
		});
	});

	workflow.emit('validate');
};