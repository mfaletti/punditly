'use strict';

exports = module.exports = function(app, mongoose) {
	var leagueSchema = new mongoose.Schema({
		name : String,
		country: String
	});
	
	app.db.model('League', leagueSchema, 'leagues');
};