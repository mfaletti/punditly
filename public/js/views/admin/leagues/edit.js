/* edit.js */

(function(app) {
	'use strict';

	var League = Backbone.Model.extend({
		idAttribute: '_id',
		url: function(){
			return '/admin/leagues/'+ this.id +'/';
		}
	});

	var Identity = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors: [],
			errfor: {},
			name: '',
			country: ''
		},
		url: function() {
			return '/admin/leagues/'+ app.mainView.model.id +'/';
		},
		parse: function(response) {
			if (response.league) {
				app.mainView.model.set(response.league);
				delete response.league;
			}

			return response;
		}
	});

	var IdentityView = Backbone.View.extend({
		el: '#identity',
		template: _.template( $('#tmpl-identity').html() ),
		events: {
			'click .btn-update': 'update'
		},
		initialize: function() {
			this.model = new Identity();
			this.syncUp();
			this.listenTo(app.mainView.model, 'change', this.syncUp);
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		syncUp: function() {
			this.model.set({
				_id: app.mainView.model.id,
				name: app.mainView.model.get('name'),
				country: app.mainView.model.get('country')
			});
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));

			for (var key in this.model.attributes) {
				if (this.model.attributes.hasOwnProperty(key)) {
					this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
				}
			}
		},
		update: function() {
			this.model.save({
				name: this.$el.find('[name="name"]').val(),
				country: this.$el.find('[name="country"]').val()
			});
		}
	})

	var HeaderView = Backbone.View.extend({
		el: "#header",
		template: _.template( $('#tmpl-header').html() ),
		initialize: function() {
			this.model = app.mainView.model;
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function(){
			this.$el.html(this.template(this.model.attributes));
		}
	});

	var Delete = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors:[],
			errfor: {}
		},
		url: function(){
			return '/admin/leagues/'+ app.mainView.model.id +'/';
		}
	});

	var DeleteView = Backbone.View.extend({
		el: '#delete',
		template: _.template( $('#tmpl-delete').html() ),
		events: {
			'click .btn-delete': 'delete',
		},
		initialize: function() {
			this.model = new Delete({ _id: app.mainView.model.id });
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));
		},
		delete: function() {
			if (confirm('Are you sure?')) {
				this.model.destroy ({
					success: function(model, response) {
						if (response.success) {
							location.href = '/admin/leagues';
						} else {
							app.deleteView.model.set(response);
						}
					}
				});
			}
		}
	});

	app.MainView = Backbone.View.extend({
		el: '.page .container',
		initialize: function() {
			app.mainView = this;
			this.model = new League( JSON.parse( unescape($('#data-record').html())) );

			app.headerView = new HeaderView();
			app.identityView = new IdentityView();
			app.deleteView = new DeleteView();
		}
	});

	$(document).ready(function(){
		app.mainView = new app.MainView();
	});
}(window.pd || {}));