(function(app){
	'use strict';
	
	app._SearchResult = Backbone.Model.extend({
		defaults: {
			_id: undefined,
			name: '___',
			url: '___',
			type: 'result'
		}
	});
}(pd || {}));