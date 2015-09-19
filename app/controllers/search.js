'use strict';

exports.search = function(req, res, next) {
	var search_term = req.query.q ? req.query.q : '';
	
	if (search_term) {
		var solr = require('solr-client');
		var client = solr.createClient({port:8080});
		//var query = client.createQuery().q(search_term);
		var query = 'q='+search_term;
		var request = client.search(query, function(err, results) {
			if (err) {
				return next(err);
			}
			
			res.send(results.response);
		});
		
		request.setTimeout(200, function() {
			console.log('search timeout');
		});
	}
};
