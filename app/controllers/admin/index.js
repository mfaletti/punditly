'use strict';

exports.init = function(req, res, next){
	var
	collections = ['users', 'teams', 'games'],
	tasks = [],
	sigma = {};

	collections.forEach(function(el, i, arr){
		tasks.push(function(done){
			req.app.db.collection(el).count({}, function(err, count){
				if (err) {
					return done(err, null);
				}

				sigma[el] = count;
				done(null, el);
			});
		});
	});

	var asyncFinally = function(err, results) {
    if (err) {
      return next(err);
    }

    res.render('admin/index', sigma);
  };

  require('async').parallel(tasks, asyncFinally);
};