'use strict';

exports = module.exports = function(app, mongoose) {
	var fixtureSchema = new mongoose.Schema({
		date: {type: Date, index: true},
		competition: {type: String, default:''},
		location: {type:String,default:''},
		status: {type: String, index:true, default:'scheduled'},
		homeTeam: String,
		awayTeam: String,
		homeScore: {type: Number, default:0},
		awayScore: {type: Number, default:0},
		events: {type: Object, default: null}
	});
	
	fixtureSchema.plugin(require('../plugins/pagedFind'));
	app.db.model('Fixture', fixtureSchema, 'fixtures');
};