'use strict'

var ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/login/');
}

function ensureAdmin(req, res, next) {
  if (req.user.is('admin')) {
    return next();
  }
  res.redirect('/');
}

exports = module.exports = function(app, passport){
	app.get('/', require('./controllers/index').init);

	// login/out
	app.get('/login', require('./controllers/auth/index').init);
	app.post('/login', require('./controllers/auth/index').login);

	//admin
  app.all('/admin*', ensureAuthenticated);
  app.all('/admin*', ensureAdmin);
  app.get('/admin', require('./controllers/admin/index').init);

  //admin > users
  app.get('/admin/users', require('./controllers/admin/users').find);
  app.post('/admin/users', require('./controllers/admin/users').create);
  app.get('/admin/users/:id', require('./controllers/admin/users').read);
  app.put('/admin/users/:id', require('./controllers/admin/users').update);
	app.put('/admin/users/:id/password', require('./controllers/admin/users').password);
	app.delete('/admin/users/:id', require('./controllers/admin/users').delete);

	// admin > teams
	app.get('/admin/teams', require('./controllers/admin/teams').find);
	app.post('/admin/teams', require('./controllers/admin/teams').create);
	app.get('/admin/teams/:id', require('./controllers/admin/teams').read);
	app.put('/admin/teams/:id', require('./controllers/admin/teams').update);
	app.delete('/admin/teams/:id', require('./controllers/admin/teams').delete);

	//admin > fixtures
	app.get('/admin/fixtures', require('./controllers/admin/fixtures').find);
	app.post('/admin/fixtures', require('./controllers/admin/fixtures').create);
	app.get('/admin/fixtures/new', require('./controllers/admin/fixtures').new);
	app.get('/admin/fixtures/:id', require('./controllers/admin/fixtures').read);
	app.put('/admin/fixtures/:id', require('./controllers/admin/fixtures').update);
	app.delete('/admin/fixtures/:id', require('./controllers/admin/fixtures').delete);

	// admin > leagues
	app.get('/admin/leagues', require('./controllers/admin/leagues').find);
	app.post('/admin/leagues', require('./controllers/admin/leagues').create);
	app.get('/admin/leagues/:id', require('./controllers/admin/leagues').read);
	app.put('/admin/leagues/:id', require('./controllers/admin/leagues').update);
	app.get('/admin/leagues/:id/teams', require('./controllers/admin/leagues').getTeams);
	app.delete('/admin/leagues/:id', require('./controllers/admin/leagues').delete);

	// solr search
	app.get('/search', require('./controllers/search').search);
};