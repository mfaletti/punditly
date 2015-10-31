'use strict';

var jwt = require('jsonwebtoken');

var getReturnUrl = function(req) {
  var returnUrl ='/';
  if (req.session.returnUrl) {
    returnUrl = req.session.returnUrl;
    delete req.session.returnUrl;
  }
  return returnUrl;
};

exports.init = function(req, res){
	if (req.isAuthenticated()) {
		res.redirect(getReturnUrl(req));
	} else {
	res.render('auth/index');
	}
};

exports.login = function(req, res){
	var workflow = req.app.util.workflow(req, res);
	
	workflow.on('validate', function(){
		if (!req.body.username) {
			workflow.outcome.errfor.username = 'required';
		}
		
		if (!req.body.password) {
			workflow.outcome.errfor.password = 'required';
		}
		
		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}
		
		workflow.emit('abuseFilter');
	});
	
	workflow.on('abuseFilter', function(){
		var getIpCount = function(done){
			var conditions = {ip:req.ip};
			req.app.db.models.LoginAttempt.count(conditions, function(err, count){
				if (err){
					return done(err);
				}
				
				done(null, count);
			});
		};
		
		var getIpUserCount = function(done){
			var conditions = { ip: req.ip, user: req.body.username };
			req.app.db.models.LoginAttempt.count(conditions, function(err, count) {
				if (err) {
					return done(err);
				}
				
				done(null, count);
			});
		};
		
		var asyncFinally = function(err, results){
			if (err){
				return workflow.emit('exception', err);
			}
			
			if (results.ip >= req.app.config.loginAttempts.forIp || results.ipUser >= req.app.config.loginAttempts.forIpAndUser) {
				workflow.outcome.errors.push('You\'ve reached the maximum number of login attempts. Please try again later.');
				return workflow.emit('response');
			} else {
				workflow.emit('attemptLogin');
			}
		};
		
		require('async').parallel({ ip: getIpCount, ipUser: getIpUserCount }, asyncFinally);
	});
	
	workflow.on('attemptLogin', function(){
		req._passport.instance.authenticate('local', function(err, user, info){
			if (err) {
				return workflow.emit('exception', err);
			}
			
			if (!user) {
				var fieldsToSet = { ip: req.ip, user: req.body.username };
				req.app.db.models.LoginAttempt.create(fieldsToSet, function(err, doc) {
					if (err){
						return workflow.emit('exception', err);
					}
					
					workflow.outcome.errors.push('Username and password combination not found or your account is inactive.');
					return workflow.emit('response');
				})
			} else {

				// drop jwt cookie
				var payload = {
          sub: user._id,
          scope: user.roles
        };

        var token = jwt.sign(payload, req.app.config.jwt_secret,{
          issuer: 'www.punditly.com',
          audience: 'www.punditly.com',
          expiresIn: 60*60*24*30*6
        });

        res.cookie('AUTH_TOKEN', token, {httpOnly: true});

				req.login(user, function(){
					if (err) {
						return workflow.emit('exception', err);
					}
					workflow.emit('response');
				});
			}
		})(req, res);
	});
	
	workflow.emit('validate');
};