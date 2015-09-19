'use strict';
var http = require('http');

exports.find = function(req, res, next) {

	var workflow = req.app.util.workflow(req, res, next);

	var reqst = http.get('http://api.punditly.com' + req.url.replace('admin/teams', 'v1/teams'), function(response){
		if (('' + response.statusCode).match(/^5\d\d$/)) {
			workflow.outcome.errors.push({message: 'service error', code: response.statusCode});
			return workflow.emit('response');
		}

		// explicitly treat incoming data as utf8 (avoids issues with multi-byte chars)
		response.setEncoding('utf8');

		// incrementally capture the incoming response body
		var body = [];
		response.on('data', function(chunk){
			body.push(chunk);
		});

		response.on('end', function(){
			try {
				var parsed = JSON.parse(body.join(''));
			} catch(err) {
				next({message: 'Unable to parse response as JSON'});
			}

			// get leagues
			req.app.db.models.League.find().lean().exec(function(err, leagues){
				if (err) {
					return next(err);
				}

				parsed.leagues = leagues;
				if (req.xhr) {
	      	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	      	res.send(parsed);
	    	} else {
					res.render('admin/teams/index', {data: {results: JSON.stringify(parsed)}});
				}
			});
		});

		response.on('error', function(err){
			console.log(JSON.stringify(err));
		});
	});

	reqst.on('error', function(e){
		console.log('problem with request: ' + e.message);
		res.send(JSON.stringify(e));
	});
};

exports.read = function(req, res, next) {
	req.app.db.models.Team.findById(req.params.id, function(err, team){
		if (err) {
			return next(err);
		}

		// get leagues
		req.app.db.models.League.find().lean().exec(function(err, leagues){
			if (err) {
				return next(err);
			}

			if (req.xhr) {
      	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      	res.send({leagues:leagues, team:team});
    	} else {
				res.render('admin/teams/edit', {data: {record: JSON.stringify({leagues:leagues, team:team})}});
			}
		});

		/*if (req.xhr) {
			res.send(team);
		} else {
			res.render('admin/teams/edit', { data: { record: escape(JSON.stringify(team)) } });
		}*/
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