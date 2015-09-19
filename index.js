'use strict';

var
	config = require('./app/config/config'),
	express = require('express'),
	flash = require('connect-flash'),
	app = express(),
	mongoose = require('mongoose'),
	passport = require('passport'),
	engine = require('ejs-locals'),
	fs = require('fs');

app.config = config;

// setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', function(err){
	console.log('mongo connection error: ' + err);
});
app.db.once('connected', function () {
  //and... we have a data store
});

// Bootstrap models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
	require(models_path+'/'+file)(app, mongoose);
});

//setup the session store
//app.sessionStore = new mongoStore({ url: config.mongodb.uri });

// configure some environment variables
app.disable('x-powered-by');
app.set('env', config.env);
app.set('port', config.port);
app.set('views', __dirname + '/app/views');
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('project-name', config.projectName);
app.set('company-name', config.companyName);
app.set('system-email', config.systemEmail);
app.set('crypto-key', config.cryptoKey);
app.set('require-account-verification', config.requireAccountVerification);

//smtp settings
app.set('smtp-from-name', config.smtp.from.name);
app.set('smtp-from-address', config.smtp.from.address);
app.set('smtp-credentials', config.smtp.credentials);

//twitter settings
app.set('twitter-oauth-key', config.oauth.twitter.key);
app.set('twitter-oauth-secret', config.oauth.twitter.secret);

//facebook settings
app.set('facebook-oauth-key', config.oauth.facebook.key);
app.set('facebook-oauth-secret', config.oauth.facebook.secret);

//google settings
app.set('google-oauth-key', config.oauth.google.key);
app.set('google-oauth-secret', config.oauth.google.secret);

 //middleware
app.use(express.logger('dev'));
//app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.use(express['static'](__dirname + '/public'));
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({
  secret: config.cryptoKey
  //store: app.sessionStore
}));
app.use(flash());
//app.use(express.cookieSession({key:config.cryptoKey}));
app.use(passport.initialize());
app.use(passport.session());

//response locals
app.use(function(req, res, next) {
  res.locals.user = {};
  //res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
  res.locals.user.username = req.user && req.user.username;
  next();
});

app.use(app.router);

//config express in dev environment
if (app.get('env') === 'dev') {
  app.use(express.errorHandler());
}

//setup passport
require('./app/config/passport')(app, passport);

//route requests
require('./app/routes')(app, passport);

app.util = {};
app.util.workflow = require('./app/util/workflow');

var io = require('socket.io').listen(app.listen(app.get('port'))).set('log level', 1);

io.set('transports', ['websocket'/*,'xhr-polling'/*,'jsonp-polling'*/]);
io.sockets.on('connection', function (client) {
    client.emit('message', { message: 'welcome to the chat' });
    client.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});
