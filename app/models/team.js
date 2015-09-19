'use strict';

exports = module.exports = function(app, mongoose) {
	var teamSchema = new mongoose.Schema({
		name : String,
		park: String,
		logo: String,
		country: String,
		league: String
	});

	teamSchema.plugin(require('../plugins/pagedFind'));
	app.db.model('Team', teamSchema, 'teams');
};