'use strict';
var request = require('request');

exports.new = function(req,res,next) {
	var async = require('async');

	// get league and teams records. There isn't a lot of data, so we can cache on client side
	async.parallel({
		leagues: function(cb){
			req.app.db.models.League.find().lean().exec(function(err, results){
				cb(err,results);
			});
		},
		teams: function(cb){
			req.app.db.models.Team.find().lean().exec(function(err, results){
				cb(err,results);
			});
		}
	},function(err, results){
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.header("Cache-Control", "no-cache, no-store, must-revalidate");
		} else {
			res.render('admin/fixtures/create', { data: { results: JSON.stringify(results) } });
		}
	});
};

exports.find = function(req,res,next) {
	var workflow = req.app.util.workflow(req, res, next);

	request(req.protocol + '://api.punditly.com/v1' + req.originalUrl.replace('/admin', '') + (Object.keys(req.query).length ? '&' : '?') + 'token=' + req.cookies.AUTH_TOKEN || '', function(error, response, body){

		if (error) {
			console.log('problem with request: ' + e.message);
			return res.send(JSON.stringify(error));
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
				return res.render('admin/fixtures/index', {data: {results: JSON.stringify({"errors":workflow.outcome.errors})}});
			}
		}

		if (req.xhr) {
    	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    	res.send(body);
  	} else {
			res.render('admin/fixtures/index', {data: {results: body}});
		}
	});
};


exports.create = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.body.homeTeam) {
			workflow.outcome.errors.push('Please enter team.');
			return workflow.emit('response');
		}

		if (!/^[a-zA-Z0-9 ]+$/.test(req.body.homeTeam)){
			workflow.outcome.errors.push('Only use letters, numbers');
			return workflow.emit('response');
		}

		if (!req.body.awayTeam) {
			workflow.outcome.errors.push('Please enter team.');
			return workflow.emit('response');
		}

		if (!/^[a-zA-Z0-9 ]+$/.test(req.body.awayTeam)){
			workflow.outcome.errors.push('Only use letters, numbers');
			return workflow.emit('response');
		}

		if (!req.body.competition) {
			workflow.outcome.errors.push('Select a league');
			return workflow.emit('response');
		}

		workflow.emit('addFixture');
	});

	workflow.on('addFixture', function() {
		var fieldsToSet = {
			homeTeam: req.body.homeTeam,
			awayTeam:req.body.awayTeam,
			competition:req.body.competition,
			date:req.body.date
		};

		req.app.db.models.Fixture.create(fieldsToSet, function(err, fixture){
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.record = fixture;
			return workflow.emit('response');
		});
	});

	workflow.emit('validate');
}

exports.read = function(req, res, next) {
	var async = require('async');

	async.parallel({
		leagues: function(cb){
			req.app.db.models.League.find().lean().exec(function(err, results){
				cb(err,results);
			});
		},
		teams: function(cb){
			req.app.db.models.Team.find().lean().exec(function(err, results){
				cb(err,results);
			});
		},
		fixture: function(cb){
			req.app.db.models.Fixture.findById(req.params.id, function(err, fixture){
				cb(err, fixture);
			})
		}
	},function(err, results){
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.header("Cache-Control", "no-cache, no-store, must-revalidate");
			res.send(results);
		} else {
			res.render('admin/fixtures/edit', { data: { results: JSON.stringify(results) } });
		}
	});
};

exports.update = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res);

	workflow.on('validate', function(){
		if (!req.body.homeTeam) {
			workflow.outcome.errfor.homeTeam = 'required';
		} else if (!/^[a-zA-Z0-9 ]+$/.test(req.body.homeTeam)) {
			workflow.outcome.errfor.homeTeam = 'only use letters and numbers';
		}

		if (!req.body.awayTeam) {
			workflow.outcome.errfor.awayTeam = 'required';
		} else if (!/^[a-zA-Z0-9 ]+$/.test(req.body.awayTeam)) {
			workflow.outcome.errfor.awayTeam = 'only use letters and numbers';
		}

		if (!req.body.competition) {
			workflow.outcome.errfor.competition = 'required';
		} else if (!/^[a-zA-Z0-9 ]+$/.test(req.body.competition)) {
			workflow.outcome.errfor.competition = 'only use letters and numbers';
		}

		if (!req.body.date) {
			workflow.outcome.errfor.date = 'required';
		}

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}

		workflow.emit('updateFixture');
	});

	workflow.on('updateFixture', function(){
		var fieldsToSet = {
			homeTeam: req.body.homeTeam,
			awayTeam: req.body.awayTeam,
			competition: req.body.competition,
			date: req.body.date
		};

		req.app.db.models.Fixture.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, fixture) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.fixture = fixture;
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
		req.app.db.models.Fixture.findByIdAndRemove(req.params.id, function(err, team) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.emit('response');
		});
	});

	workflow.emit('validate');
};
