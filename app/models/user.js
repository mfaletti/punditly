'use strict'

exports = module.exports = function(app, mongoose) {
	var userSchema = new mongoose.Schema({
		name : {type:String,default:null},
		username: {type: String, unique: true},
		url: {type:String,default:null},
		passwordHash : {type:String,trim:true},
		email:{type:String, unique: true},
		bio: {type:String,default:null},
		created_at: {type: Date, index: true, default: Date.now},
		updated_at: {type: Date, index: true},
		location: {type:String,default:null},
		is_private: {type:Boolean,default:false},
		is_active: {type:Boolean, default:true},
		is_verified: {type:Boolean, default:false},
		profile_image_url: {type:String,default:''},
		followers_count: {type:Number,default:0},
		following_count: {type:Number,default:0},
		phone: {type:String,default:null},
		roles: {type: Array, default: ['user']},
		following:[String]
	});

	userSchema.methods.is = function(role) {
		if (this.roles.indexOf(role) != -1) {
			return true
		}

		return false;
	};

	userSchema.statics.encryptPassword = function(password, done) {
		var bcrypt = require('bcryptjs');
		bcrypt.hash(password, 10, function(err, hash){
			done(err, hash);
		});
	};

	userSchema.statics.validatePassword = function(password, hash, done){
		var bcrypt = require('bcryptjs');
		bcrypt.compare(password, hash, function(err, res){
			done(err, res);
		});
	};

	userSchema.plugin(require('../plugins/pagedFind'));
	app.db.model('User', userSchema, 'users');
};