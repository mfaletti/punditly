'use strict';

exports.find = function(req, res, next){
	req.query.username = req.query.username ? req.query.username : '';
	req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	req.query.sort = req.query.sort ? req.query.sort : '_id';

	var filters = {};

	if (req.query.username) {
    filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  }

	if (req.query.is_active) {
    filters.is_active = req.query.is_active;
  }

	if (req.query.roles && req.query.roles === 'admin') {
		filters.roles = {$in: [req.query.roles]};
	}

  req.app.db.models.User.pagedFind({
  	filters: filters,
  	keys: 'username email is_active',
  	limit: req.query.limit,
  	page: req.query.page,
  	sort: req.query.sort
  }, function(err, results) {
  	if (err) {
  		return next(err);
  	}

  	if (req.xhr) {
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      results.filters = req.query;
      res.send(results);
    } else {
      results.filters = req.query;
      res.render('admin/users/index', { data: { results: JSON.stringify(results) } });
    }
  });
};

exports.create = function(req, res, next){
	var workflow = req.app.util.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.body.username) {
			workflow.outcome.errors.push('Please enter a username.');
			return workflow.emit('response');
		}

		if (!/^[a-zA-Z0-9\_]+$/.test(req.body.username)){
			workflow.outcome.errors.push('Only use letters, numbers, _');
			return workflow.emit('response');
		}

		workflow.emit('duplicateUsernameCheck');
	});

	workflow.on('duplicateUsernameCheck', function(){
		req.app.db.models.User.findOne({username:req.body.username}, function(err, user){
			if (err) {
				return workflow.emit('exception', err);
			}

			if (user) {
				workflow.outcome.errors.push('That username is already taken.');
				return workflow.emit('response');
			}

			workflow.emit('createUser');
		});
	});

	workflow.on('createUser', function(){
		var fieldsToSet = {
			username: req.body.username,
		};
		req.app.db.models.User.create(fieldsToSet, function(err, user){
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.record = user;
			return workflow.emit('response');
		});
	});

	workflow.emit('validate');
};

exports.read = function(req, res, next) {
	req.app.db.models.User.findById(req.params.id, function(err, user){
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.send(user);
		} else {
			res.render('admin/users/edit', { data: { record: escape(JSON.stringify(user)) } });
		}
	});
};

exports.update = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res);

	workflow.on('validate', function(){
		if (!req.body.is_active) {
			req.body.is_active = 'false';
		}

		if (!req.body.username) {
			workflow.outcome.errfor.username = 'required';
		} else if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
			workflow.outcome.errfor.username = 'only use letters, numbers, _';
		}

		if (!req.body.email) {
			workflow.outcome.errfor.email = 'required';
		} else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
			workflow.outcome.errfor.email = 'invalid email format';
		}

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}

		workflow.emit('duplicateUsernameCheck');
	});

	workflow.on('duplicateUsernameCheck', function() {
		req.app.db.models.User.findOne({username: req.body.username, _id: { $ne: req.params.id }}, function(err, user) {
			if (err) {
				return workflow.emit('exception', err);
			}

			if (user) {
				workflow.outcome.errfor.username = 'username already taken';
				return workflow.emit('response');
			}

			workflow.emit('duplicateEmailCheck');
		});
	});

	workflow.on('duplicateEmailCheck', function(){
		req.app.db.models.User.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.params.id } }, function(err, user){
			if (err) {
				return workflow.emit('exception', err);
			}

			if (user) {
				workflow.outcome.errfor.email = 'email already taken';
				return workflow.emit('response');
			}

			workflow.emit('updateUser');
		});
	});

	workflow.on('updateUser', function(){
		var fieldsToSet = {
			is_active: req.body.is_active,
			username: req.body.username,
			email: req.body.email.toLowerCase(),
			search: [
				req.body.username,
				req.body.email
			]
		};

		req.app.db.models.User.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, user) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.user = user;
			workflow.emit('response');
		});
	});

	workflow.emit('validate');
};

exports.password = function(req, res, next) {
	var workflow = req.app.util.workflow(req, res);

	workflow.on('validate', function(){
		if (!req.body.newPassword) {
			workflow.outcome.errfor.newPassword = 'required';
		}

		if (req.body.newPassword !== req.body.confirm) {
			workflow.outcome.errors.push('Passwords do not match.');
		}

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}

		workflow.emit('updateUser');
	});

	workflow.on('updateUser', function(){
		req.app.db.models.User.encryptPassword(req.body.newPassword, function(err, hash) {
			if (err) {
				return workflow.emit('exception', err);
			}

			var fieldsToSet = {passwordHash: hash};
			req.app.db.models.User.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, user){
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.user = user;
				workflow.outcome.newPassword = '';
				workflow.outcome.confirm = '',
				workflow.emit('response');
			});
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

		if (req.user._id === req.params.id) {
			workflow.outcome.errors.push('You can\'t delete yourself');
			return workflow.emit('response');
		}

		workflow.emit('deleteUser');
	});

	workflow.on('deleteUser', function(err) {
		req.app.db.models.User.findByIdAndRemove(req.params.id, function(err, user) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.emit('response');
		});
	});

	workflow.emit('validate');
};