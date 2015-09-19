module.exports = function(app) {
	var User = require('../models/user');
	app.get('/api/users/:id', function(req, res){
		var id = req.param('id');
		User.find({_id:id}, function(err,person){
			if (err) throw err;
			res.send(person);
		});
	});
	
	/**
	 * TODO: set limit for number of records returned.
	 */
	app.get('/api/users', function(req, res){
		User.find({}, function(err, persons){
			if (err) throw err;
			res.json(persons);
		});
	});
	
	app.get('/api/users/:id/comments')
}